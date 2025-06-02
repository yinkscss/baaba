import React, { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FaqSection } from '../../components/ui/faq-section';
import { PlaceholdersAndVanishInput } from '../../components/ui/placeholders-and-vanish-input';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from '../../components/ui/chat-bubble';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

// Mock AI responses
const AI_RESPONSES: Record<string, string> = {
  'default': "Hello! I'm your AI Legal Assistant specializing in Nigerian tenancy law. How can I help you today?",
  'rent': "In Nigeria, landlords typically can't increase rent during an active lease term unless specified in the agreement. For yearly leases, they must provide at least 3 months notice before renewal. The Lagos Tenancy Law of 2011 specifically requires landlords to give written notice of any rent increase.",
  'deposit': "Security deposits in Nigeria are typically 1-2 months' rent. Landlords must return this deposit within 30 days of lease termination, minus any legitimate deductions for damages beyond normal wear and tear. Always document the property condition before moving in with photos and a signed inspection form.",
  'eviction': "For eviction in Nigeria, landlords must provide proper notice: 7 days for weekly tenants, 1 month for monthly tenants, 3 months for yearly tenants, and 6 months for biennial tenants. They must obtain a court order before forcibly evicting you. Self-help evictions (changing locks, removing belongings, disconnecting utilities) are illegal."
};

const LegalAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: AI_RESPONSES['default'],
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let responseContent = AI_RESPONSES['default'];
      
      // Check for keywords in the message to provide relevant responses
      const lowerCaseMsg = inputMessage.toLowerCase();
      if (lowerCaseMsg.includes('rent increase') || lowerCaseMsg.includes('raise rent')) {
        responseContent = AI_RESPONSES['rent'];
      } else if (lowerCaseMsg.includes('deposit') || lowerCaseMsg.includes('security')) {
        responseContent = AI_RESPONSES['deposit'];
      } else if (lowerCaseMsg.includes('evict') || lowerCaseMsg.includes('kick out')) {
        responseContent = AI_RESPONSES['eviction'];
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const faqItems = [
    {
      question: "What are my rights regarding rent increases?",
      answer: AI_RESPONSES['rent']
    },
    {
      question: "How do security deposits work in Nigeria?",
      answer: AI_RESPONSES['deposit']
    },
    {
      question: "What is the eviction process in Nigeria?",
      answer: AI_RESPONSES['eviction']
    }
  ];

  const placeholders = [
    "Ask about rent increases...",
    "How do security deposits work?",
    "What are my rights as a tenant?",
    "Can my landlord evict me without notice?",
    "What should be in my lease agreement?"
  ];

  return (
    <div className="container mx-auto px-4 pb-12 pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">AI Legal Assistant</h1>
          <p className="text-text-secondary">
            Get expert advice on Nigerian tenancy law and resolve housing disputes with our AI legal assistant.
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
        <div className="mb-6 h-96 overflow-y-auto rounded-md border border-nav bg-card p-4">
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

        {/* Input Area */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(e) => setInputMessage(e.target.value)}
          onSubmit={handleSendMessage}
        />

        <div className="mt-4 text-center text-xs text-text-muted">
          <p>
            This AI provides general legal information based on Nigerian tenancy law, 
            but should not be considered as formal legal advice. For specific legal issues, 
            consult with a qualified lawyer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistantPage;