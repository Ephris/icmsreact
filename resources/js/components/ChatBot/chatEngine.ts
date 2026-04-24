// ChatBot Engine - Pattern matching and response generation

import { knowledgeBase, getPopularQuestions } from './chatKnowledge';
import { ChatMessage, KnowledgeEntry, MatchResult, QuickAction } from './types';

// Generate unique message ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Normalize text for matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Calculate word similarity using Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity score between two strings (0-1)
function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

// Check if a word matches a keyword (exact or fuzzy)
function wordMatchesKeyword(word: string, keyword: string): boolean {
  // Exact match
  if (word === keyword) return true;
  
  // Word contains keyword or vice versa
  if (word.includes(keyword) || keyword.includes(word)) return true;
  
  // Fuzzy match for longer words (allow typos)
  if (word.length >= 4 && keyword.length >= 4) {
    const similarity = calculateSimilarity(word, keyword);
    return similarity >= 0.75; // 75% similarity threshold
  }
  
  return false;
}

// Find matching entries for user input
export function findMatches(userInput: string): MatchResult[] {
  const normalizedInput = normalizeText(userInput);
  const inputWords = normalizedInput.split(' ').filter(w => w.length > 1);
  
  const results: MatchResult[] = [];
  
  for (const entry of knowledgeBase) {
    // Skip fallback entry unless no other matches
    if (entry.id === 'fallback-unknown') continue;
    
    let score = 0;
    const matchedKeywords: string[] = [];
    
    // Check each keyword
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      
      // Check if the keyword phrase is in the input
      if (normalizedInput.includes(normalizedKeyword)) {
        score += 10; // High score for phrase match
        matchedKeywords.push(keyword);
        continue;
      }
      
      // Check individual words
      const keywordWords = normalizedKeyword.split(' ');
      for (const inputWord of inputWords) {
        for (const keywordWord of keywordWords) {
          if (wordMatchesKeyword(inputWord, keywordWord)) {
            score += 3;
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
          }
        }
      }
    }
    
    // Boost by priority
    if (entry.priority) {
      score += entry.priority / 20;
    }
    
    // Only include if there's a meaningful match
    if (score > 0 && matchedKeywords.length > 0) {
      results.push({
        entry,
        score,
        matchedKeywords,
      });
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

// Get the best response for user input
export function getBestResponse(userInput: string): KnowledgeEntry {
  const matches = findMatches(userInput);
  
  if (matches.length > 0) {
    return matches[0].entry;
  }
  
  // Return fallback if no matches
  const fallback = knowledgeBase.find(e => e.id === 'fallback-unknown');
  return fallback || {
    id: 'default-fallback',
    category: 'support',
    keywords: [],
    question: 'Unknown',
    answer: "I'm not sure I understand. Could you please rephrase your question?",
    quickActions: [
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    ],
  };
}

// Create a bot message from knowledge entry
export function createBotMessage(entry: KnowledgeEntry, isTyping = false): ChatMessage {
  if (isTyping) {
    return {
      id: generateMessageId(),
      sender: 'bot',
      content: '',
      type: 'typing',
      timestamp: new Date(),
    };
  }
  
  return {
    id: generateMessageId(),
    sender: 'bot',
    content: entry.answer,
    type: entry.quickActions ? 'quick_actions' : 'text',
    timestamp: new Date(),
    quickActions: entry.quickActions,
    links: entry.links,
  };
}

// Create a user message
export function createUserMessage(content: string): ChatMessage {
  return {
    id: generateMessageId(),
    sender: 'user',
    content,
    type: 'text',
    timestamp: new Date(),
  };
}

// Get welcome message
export function getWelcomeMessage(userName?: string): ChatMessage {
  const greeting = userName ? `Hi ${userName}! 👋` : 'Hi there! 👋';
  
  return {
    id: generateMessageId(),
    sender: 'bot',
    content: `${greeting} I'm the ICMS Assistant. I can help you with:\n\n• Information about ICMS\n• How to apply for internships\n• Navigating the platform\n• Technical support\n\nHow can I assist you today?`,
    type: 'quick_actions',
    timestamp: new Date(),
    quickActions: [
      { id: 'what-is-icms', label: '❓ What is ICMS?', action: 'ask:What is ICMS?' },
      { id: 'how-apply', label: '📝 How to Apply', action: 'ask:How do I apply for an internship?' },
      { id: 'browse', label: '🔍 Browse Internships', action: 'navigate:/#latest-internship-opportunities' },
      { id: 'help', label: '🆘 Get Help', action: 'navigate:/help/overview' },
    ],
  };
}

// Parse quick action
export function parseQuickAction(action: string): { type: 'navigate' | 'ask'; value: string } {
  if (action.startsWith('navigate:')) {
    return { type: 'navigate', value: action.replace('navigate:', '') };
  }
  if (action.startsWith('ask:')) {
    return { type: 'ask', value: action.replace('ask:', '') };
  }
  return { type: 'ask', value: action };
}

// Get suggested questions based on category
export function getSuggestedQuestions(category?: string): QuickAction[] {
  const popular = getPopularQuestions();
  
  return popular.slice(0, 4).map(entry => ({
    id: entry.id,
    label: entry.question,
    action: `ask:${entry.question}`,
  }));
}

