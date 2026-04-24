// Individual Chat Message Component

import React from 'react';
import { Link } from '@inertiajs/react';
import { ChatMessage as ChatMessageType, QuickAction, ChatLink } from './types';
import { parseQuickAction } from './chatEngine';
import { ExternalLink, Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickAction?: (action: QuickAction) => void;
}

export function ChatMessage({ message, onQuickAction }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  const isTyping = message.type === 'typing';

  // Render typing indicator
  if (isTyping) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Format message content with markdown-like syntax
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        formattedLine = `<span class="text-indigo-500 dark:text-indigo-400">•</span> ${line.slice(2)}`;
      }
      
      // Numbered items
      const numberedMatch = line.match(/^(\d+️⃣|\d+\.) (.+)/);
      if (numberedMatch) {
        formattedLine = `<span class="text-indigo-500 dark:text-indigo-400">${numberedMatch[1]}</span> ${numberedMatch[2]}`;
      }
      
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  // Render link
  const renderLink = (link: ChatLink, index: number) => {
    if (link.external || link.url.startsWith('mailto:') || link.url.startsWith('http')) {
      return (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          {link.label}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    
    return (
      <Link
        key={index}
        href={link.url}
        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
      >
        {link.label}
      </Link>
    );
  };

  return (
    <div className={`flex items-start gap-3 mb-4 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
        isBot 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[85%] ${isBot ? '' : 'text-right'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-gray-100 dark:bg-gray-700 rounded-tl-sm text-gray-800 dark:text-gray-100'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-tr-sm text-white'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Links */}
        {message.links && message.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.links.map((link, i) => renderLink(link, i))}
          </div>
        )}

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 shadow-sm hover:shadow"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-gray-400 dark:text-gray-500 ${isBot ? '' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

