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
  src: {
    query: string
  }
}

interface DappierResponse {
  results?: any
  response?: string
  data?: any
  error?: string
  answer?: string
  text?: string
  content?: string
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

    // Build context from conversation history and current message
    const systemContext = `You are a legal assistant specializing in Nigerian tenancy law. You provide accurate, helpful advice about tenant rights, landlord obligations, lease agreements, and housing disputes in Nigeria.

Key areas you help with:
- Tenant rights and landlord obligations under Nigerian law
- Rent increases and payment disputes
- Security deposits and refunds
- Eviction procedures and tenant protections
- Lease agreement terms and conditions
- Property maintenance and repair responsibilities
- Dispute resolution and legal remedies

Always provide practical, actionable advice while noting when users should consult with a qualified lawyer for complex legal matters.`

    // Build the query string with context
    let queryString = systemContext + '\n\n'
    
    // Add conversation history for context (last 3 exchanges to keep it manageable)
    const recentHistory = conversationHistory.slice(-6) // Last 3 user-assistant pairs
    if (recentHistory.length > 0) {
      queryString += 'Previous conversation:\n'
      recentHistory.forEach((msg: ChatMessage) => {
        queryString += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
      })
      queryString += '\n'
    }
    
    // Add current question
    queryString += `Current question: ${message}`

    console.log('Sending query to Dappier:', queryString.substring(0, 200) + '...')

    // Prepare the request to Dappier API with the correct structure
    const dappierRequest: DappierRequest = {
      src: {
        query: queryString
      }
    }

    console.log('Dappier request structure:', JSON.stringify(dappierRequest, null, 2))

    // Make the request to Dappier API using the endpoint from your example
    const dappierResponse = await fetch('https://api.dappier.com/app/datamodel/dm_01jwet98pxe1mbkdrwdfm6cm62', {
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
    console.log('Dappier response:', JSON.stringify(dappierData, null, 2))

    // Extract the AI response - handle the 'results' field properly
    let aiResponse = ''
    
    // First, check if 'results' field exists and handle it
    if (dappierData.hasOwnProperty('results')) {
      if (dappierData.results === null) {
        console.log('Dappier returned null results - no specific information found')
        aiResponse = "I apologize, but I couldn't find specific information to answer your question. Could you please rephrase your question or provide more details? For complex legal matters, I recommend consulting with a qualified Nigerian lawyer who specializes in tenancy law."
      } else if (dappierData.results) {
        // If results is not null, try to extract content from it
        if (typeof dappierData.results === 'string') {
          aiResponse = dappierData.results
        } else if (typeof dappierData.results === 'object') {
          // Check common response keys in the results object
          aiResponse = dappierData.results.answer || 
                      dappierData.results.response || 
                      dappierData.results.text || 
                      dappierData.results.content ||
                      JSON.stringify(dappierData.results)
        }
      }
    }
    
    // Fallback to other possible response fields if results didn't provide a response
    if (!aiResponse) {
      if (dappierData.response) {
        aiResponse = dappierData.response
      } else if (dappierData.answer) {
        aiResponse = dappierData.answer
      } else if (dappierData.text) {
        aiResponse = dappierData.text
      } else if (dappierData.content) {
        aiResponse = dappierData.content
      } else if (dappierData.data) {
        if (typeof dappierData.data === 'string') {
          aiResponse = dappierData.data
        } else if (dappierData.data.response) {
          aiResponse = dappierData.data.response
        } else if (dappierData.data.answer) {
          aiResponse = dappierData.data.answer
        } else if (dappierData.data.text) {
          aiResponse = dappierData.data.text
        } else if (dappierData.data.content) {
          aiResponse = dappierData.data.content
        }
      }
    }

    // Final fallback if no response was extracted
    if (!aiResponse) {
      console.log('Could not extract response from Dappier data:', dappierData)
      aiResponse = "I apologize, but I couldn't generate a proper response to your question. Please try rephrasing your question or ask about a specific aspect of Nigerian tenancy law. For urgent legal matters, please consult with a qualified lawyer."
    }

    // Ensure the response is a string and not empty
    if (typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      aiResponse = "I apologize, but I couldn't provide a meaningful response. Please try asking your question in a different way, or contact our support team for assistance."
    }

    // Return the response
    return new Response(
      JSON.stringify({ 
        response: aiResponse.trim(),
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