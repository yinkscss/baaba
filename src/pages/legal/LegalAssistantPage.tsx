import React, { useState, useRef, useEffect } from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FaqSection } from '../../components/ui/faq-section';
import { PlaceholdersAndVanishInput } from '../../components/ui/placeholders-and-vanish-input';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from '../../components/ui/chat-bubble';
import { TextShimmer } from '../../components/ui/text-shimmer';
import { supabase } from '../../lib/supabase';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const LegalAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Legal Assistant specializing in Nigerian tenancy law. I can help you understand your rights as a tenant, landlord obligations, lease agreements, and housing disputes. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('ai-legal-assistant', {
        body: {
          message: currentInput,
          conversationHistory
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get AI response');
      }

      const aiResponse = data?.response || "I apologize, but I couldn't process your request. Please try again.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Error calling AI legal assistant:', err);
      setError('Failed to get AI response. Please try again.');
      
      // Add an error message to the chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our support team for assistance with your legal question.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const faqItems = [
    {
      question: "What are my rights regarding rent increases?",
      answer: "In Nigeria, landlords typically cannot increase rent during an active lease term unless specifically stated in the lease agreement. For yearly leases, landlords must provide adequate notice (usually 3-6 months) before lease renewal and any rent increase. The increase should be reasonable and in line with market rates."
    },
    {
      question: "How do security deposits work in Nigeria?",
      answer: "Security deposits in Nigeria are typically 1-2 months' rent, paid upfront along with the first year's rent. Landlords must return this deposit within 30 days of lease termination, minus any legitimate deductions for damages beyond normal wear and tear. Always document the property's condition at move-in and move-out."
    },
    {
      question: "What is the eviction process in Nigeria?",
      answer: "For eviction in Nigeria, landlords must provide proper notice (usually 3-6 months for yearly tenancies) and obtain a court order before forcibly evicting tenants. Self-help evictions (changing locks, removing belongings, disconnecting utilities) are illegal. Tenants have the right to contest evictions in court."
    },
    {
      question: "What should be included in my lease agreement?",
      answer: "A proper lease agreement should include: property description, rent amount and payment terms, lease duration, security deposit details, maintenance responsibilities, utility arrangements, termination clauses, and both parties' rights and obligations. Always read and understand all terms before signing."
    }
  ];

  const placeholders = [
    "Ask about rent increases...",
    "How do security deposits work?",
    "What are my rights as a tenant?",
    "Can my landlord evict me without notice?",
    "What should be in my lease agreement?",
    "Help with a housing dispute...",
    "Landlord won't fix maintenance issues...",
    "Questions about utility bills..."
  ];

  return (
    <div className="container mx-auto px-4 pb-12 pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <TextShimmer
            as="h1"
            duration={2}
            className="mb-4 text-3xl font-bold md:text-4xl [--base-color:theme(colors.accent-blue)] [--base-gradient-color:theme(colors.accent-green)]"
          >
            AI Legal Assistant
          </TextShimmer>
          <p className="text-text-secondary">
            Get expert advice on Nigerian tenancy law and resolve housing disputes with our AI legal assistant powered by advanced language models.
          </p>
        </div>

        <FaqSection
          title="Common Legal Questions"
          description="Find answers to frequently asked questions about Nigerian tenancy law"
          items={faqItems}
          contactInfo={{
            title: "Need More Help?",
            description: "Our legal team is here to assist you with more complex issues",
            buttonText: "Contact Legal Team",
            onContact: () => console.log("Contact legal team clicked")
          }}
          className="mb-8"
        />

        {/* Chat Container */}
        <div ref={chatContainerRef} className="mb-6 h-96 overflow-y-auto rounded-md border border-nav bg-card p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBubble variant={message.type === 'user' ? 'sent' : 'received'}>
                    <ChatBubbleAvatar
                      src={message.type === 'user' 
                        ? "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                        : "https://images.pexels.com/photos/1082962/pexels-photo-1082962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      }
                      fallback={message.type === 'user' ? 'US' : 'AI'}
                    />
                    <div className="flex-1">
                      <ChatBubbleMessage variant={message.type === 'user' ? 'sent' : 'received'}>
                        {message.content}
                      </ChatBubbleMessage>
                      {message.type === 'ai' && (
                        <ChatBubbleActionWrapper>
                          <ChatBubbleAction
                            icon={<Copy size={14} />}
                            onClick={() => copyToClipboard(message.content)}
                          />
                          <ChatBubbleAction
                            icon={<ThumbsUp size={14} />}
                            onClick={() => console.log('Helpful')}
                          />
                          <ChatBubbleAction
                            icon={<ThumbsDown size={14} />}
                            onClick={() => console.log('Not helpful')}
                          />
                        </ChatBubbleActionWrapper>
                      )}
                    </div>
                  </ChatBubble>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  src="https://images.pexels.com/photos/1082962/pexels-photo-1082962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-error-DEFAULT/10 p-4 text-error-DEFAULT">
            {error}
          </div>
        )}

        {/* Input Area */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(e) => setInputMessage(e.target.value)}
          onSubmit={handleSendMessage}
        />

        <div className="mt-4 text-center text-xs text-text-muted">
          <p>
            This AI provides legal information based on Nigerian tenancy law, 
            but should not be considered as formal legal advice. For specific legal issues, 
            consult with a qualified lawyer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistantPage;