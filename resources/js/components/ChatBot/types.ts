// ChatBot Types

export type MessageSender = 'user' | 'bot';

export type MessageType = 'text' | 'quick_actions' | 'link' | 'typing';

export type KnowledgeCategory = 'faq' | 'navigation' | 'support' | 'greeting';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  type: MessageType;
  timestamp: Date;
  quickActions?: QuickAction[];
  links?: ChatLink[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

export interface ChatLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  keywords: string[];
  question: string;
  answer: string;
  quickActions?: QuickAction[];
  links?: ChatLink[];
  followUp?: string[];
  priority?: number;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  activeCategory: KnowledgeCategory | 'all';
}

export interface MatchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string[];
}

export interface ChatBotProps {
  position?: 'bottom-right' | 'bottom-left';
  initialMessage?: string;
  userName?: string;
  userRole?: string;
}

