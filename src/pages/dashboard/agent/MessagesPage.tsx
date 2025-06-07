import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Send, Plus, User, 
  Clock, Check, CheckCheck, Phone, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useConversations, useMessages } from '../../../hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '../../../types/dashboard';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading: conversationsLoading } = useConversations(user?.id || '');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    data: messages, 
    isLoading: messagesLoading,
    sendMessage,
    markAsRead
  } = useMessages(selectedConversation?.id || '');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      markAsRead.mutate(user.id);
    }
  }, [selectedConversation, user, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage.mutateAsync({
        content: newMessage.trim(),
        senderId: user.id
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== user?.id)?.user;
  };

  const filteredConversations = conversations?.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant.firstName.toLowerCase().includes(searchLower) ||
      otherParticipant.lastName.toLowerCase().includes(searchLower) ||
      otherParticipant.email.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower)
    );
  });

  if (conversationsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6">
      {/* Conversations List */}
      <div className="w-1/3 min-w-[300px]">
        <Card className="h-full border border-nav">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              {filteredConversations?.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                if (!otherParticipant) return null;

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`cursor-pointer border-b border-nav p-4 transition-colors hover:bg-nav/50 ${
                      selectedConversation?.id === conversation.id ? 'bg-nav/30' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        {otherParticipant.profileImage ? (
                          <img
                            src={otherParticipant.profileImage}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
                            <User className="h-5 w-5 text-accent-blue" />
                          </div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-blue text-xs font-medium text-background">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-text-primary truncate">
                            {otherParticipant.firstName} {otherParticipant.lastName}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-text-muted">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary capitalize">
                          {otherParticipant.role}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-text-muted truncate">
                            {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredConversations?.length === 0 && (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                  <p className="text-text-secondary">No conversations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedConversation ? (
          <Card className="h-full border border-nav">
            {/* Chat Header */}
            <CardHeader className="border-b border-nav pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    if (!otherParticipant) return null;

                    return (
                      <>
                        {otherParticipant.profileImage ? (
                          <img
                            src={otherParticipant.profileImage}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
                            <User className="h-5 w-5 text-accent-blue" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-text-primary">
                            {otherParticipant.firstName} {otherParticipant.lastName}
                          </h3>
                          <p className="text-sm text-text-secondary capitalize">
                            {otherParticipant.role}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex flex-col h-[calc(100%-8rem)] p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-blue border-r-transparent"></div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages?.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === user?.id
                              ? 'bg-accent-blue text-background'
                              : 'bg-nav text-text-primary'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`mt-1 flex items-center justify-end space-x-1 text-xs ${
                            message.senderId === user?.id ? 'text-background/70' : 'text-text-muted'
                          }`}>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.senderId === user?.id && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-nav p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sendMessage.isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendMessage.isLoading}
                    isLoading={sendMessage.isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full border border-nav">
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-text-muted" />
                <h3 className="mb-2 text-lg font-medium text-text-primary">
                  Select a conversation
                </h3>
                <p className="text-text-secondary">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;