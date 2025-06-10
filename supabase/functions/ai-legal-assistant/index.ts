import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface DappierRequest {
  messages: ChatMessage[]
  model?: string
  max_tokens?: number
  temperature?: number
}

interface DappierResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const { message, conversationHistory = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Dappier API key from environment variables
    const dappierApiKey = Deno.env.get('DAPPIER_API_KEY')
    if (!dappierApiKey) {
      console.error('DAPPIER_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'AI service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the conversation context with system prompt
    const systemPrompt = `You are a legal assistant specializing in Nigerian tenancy law. You provide accurate, helpful advice about tenant rights, landlord obligations, lease agreements, and housing disputes in Nigeria. 

Key areas you help with:
- Tenant rights and landlord obligations under Nigerian law
- Rent increases and payment disputes
- Security deposits and refunds
- Eviction procedures and tenant protections
- Lease agreement terms and conditions
- Property maintenance and repair responsibilities
- Dispute resolution and legal remedies

Always provide practical, actionable advice while noting when users should consult with a qualified lawyer for complex legal matters. Be concise but thorough in your responses.`

    // Build the messages array for Dappier API
    const messages: ChatMessage[] = [
      { role: 'assistant', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Prepare the request to Dappier API
    const dappierRequest: DappierRequest = {
      messages,
      model: 'gpt-4', // You may need to adjust this based on Dappier's available models
      max_tokens: 1000,
      temperature: 0.7
    }

    // Make the request to Dappier API
    const dappierResponse = await fetch('https://api.dappier.com/app/datamodelconversation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dappierApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dappierRequest)
    })

    if (!dappierResponse.ok) {
      const errorText = await dappierResponse.text()
      console.error('Dappier API error:', errorText)
      
      // Return a fallback response
      return new Response(
        JSON.stringify({ 
          response: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our support team for assistance with your legal question.",
          error: 'AI service temporarily unavailable'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const dappierData: DappierResponse = await dappierResponse.json()

    // Extract the AI response
    const aiResponse = dappierData.choices?.[0]?.message?.content || 
      "I apologize, but I couldn't generate a response. Please try rephrasing your question."

    // Return the response
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in AI legal assistant function:', error)
    
    // Return a user-friendly error response
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our support team for assistance with your legal question.",
        error: 'Internal server error'
      }),
      { 
        status: 200, // Return 200 to avoid breaking the UI
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})