// Main ChatBot Component - Professional floating chatbot

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { MessageCircle, X, Send, Minimize2, Maximize2, RotateCcw, ChevronDown } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import {
  ChatMessage as ChatMessageType,
  ChatBotProps,
  ChatState,
  QuickAction,
} from './types';
import {
  createUserMessage,
  createBotMessage,
  getBestResponse,
  getWelcomeMessage,
  parseQuickAction,
  generateMessageId,
} from './chatEngine';

export function ChatBot({ 
  position = 'bottom-right', 
  initialMessage,
  userName,
  userRole 
}: ChatBotProps) {
  // State
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    activeCategory: 'all',
  });
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Position classes
  const positionClasses = position === 'bottom-right' 
    ? 'right-6 bottom-6' 
    : 'left-6 bottom-6';

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  }, []);

  // Handle scroll to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  // Initialize chat with welcome message
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      const welcomeMsg = getWelcomeMessage(userName);
      setState(prev => ({
        ...prev,
        messages: [welcomeMsg],
      }));
    }
  }, [state.isOpen, state.messages.length, userName]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (state.messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [state.messages, showScrollButton, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (state.isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.isOpen, isMinimized]);

  // Toggle chat open/closed
  const toggleChat = () => {
    if (!state.isOpen) {
      setHasUnread(false);
    }
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    setIsMinimized(false);
  };

  // Simulate typing delay
  const simulateTyping = async (callback: () => void) => {
    setState(prev => ({ ...prev, isTyping: true }));
    
    // Random delay between 500-1500ms
    const delay = 500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setState(prev => ({ ...prev, isTyping: false }));
    callback();
  };

  // Process user input and generate response
  const processInput = async (userInput: string) => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage = createUserMessage(userInput);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    setInputValue('');

    // Get response and simulate typing
    const response = getBestResponse(userInput);
    
    await simulateTyping(() => {
      const botMessage = createBotMessage(response);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processInput(inputValue);
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    const { type, value } = parseQuickAction(action.action);
    
    if (type === 'navigate') {
      // Handle navigation
      if (value.startsWith('mailto:')) {
        window.location.href = value;
      } else if (value.startsWith('http')) {
        window.open(value, '_blank');
      } else {
        router.visit(value);
        setState(prev => ({ ...prev, isOpen: false }));
      }
    } else if (type === 'ask') {
      // Process as a question
      processInput(value);
    }
  };

  // Reset conversation
  const resetConversation = () => {
    const welcomeMsg = getWelcomeMessage(userName);
    setState(prev => ({
      ...prev,
      messages: [welcomeMsg],
    }));
    setInputValue('');
    scrollToBottom(false);
  };

  return (
    <>
      {/* Chat Window */}
      {state.isOpen && (
        <div
          className={`fixed ${positionClasses} z-50 transition-all duration-300 ease-out ${
            isMinimized ? 'w-72' : 'w-[380px]'
          }`}
          style={{ 
            marginBottom: '70px',
            maxHeight: isMinimized ? '48px' : 'calc(100vh - 180px)',
          }}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? 'h-12' : 'h-[500px] max-h-[calc(100vh-180px)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">ICMS Assistant</h3>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetConversation}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 scroll-smooth"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {state.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                  
                  {/* Typing Indicator */}
                  {state.isTyping && (
                    <ChatMessage
                      message={{
                        id: 'typing',
                        sender: 'bot',
                        content: '',
                        type: 'typing',
                        timestamp: new Date(),
                      }}
                    />
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                  <button
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-20 right-4 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 animate-bounce"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      disabled={state.isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || state.isTyping}
                      className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                    Powered by ICMS • <a href="/help/contact" className="hover:text-indigo-500 transition-colors">Contact Support</a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${positionClasses} z-50 group`}
        aria-label="Open chat"
      >
        <div className={`relative w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${
          state.isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-25" />
          
          {/* Icon */}
          <MessageCircle className="w-6 h-6 text-white relative z-10" />
          
          {/* Unread badge */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              1
            </span>
          )}
        </div>
        
        {/* Tooltip */}
        <span className={`absolute ${position === 'bottom-right' ? 'right-16' : 'left-16'} top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg ${
          state.isOpen ? 'hidden' : ''
        }`}>
          Need help? Chat with us!
          <span className={`absolute top-1/2 -translate-y-1/2 ${position === 'bottom-right' ? '-right-1.5' : '-left-1.5'} w-3 h-3 bg-gray-900 dark:bg-gray-700 rotate-45`} />
        </span>
      </button>
    </>
  );
}

export default ChatBot;

