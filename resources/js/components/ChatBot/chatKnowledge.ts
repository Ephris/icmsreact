// ChatBot Knowledge Base - Comprehensive Q&A data for ICMS

import { KnowledgeEntry, QuickAction } from './types';

// Common quick actions used across multiple responses
export const commonQuickActions: Record<string, QuickAction[]> = {
  getStarted: [
    { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
    { id: 'browse', label: '🔍 Browse Internships', action: 'navigate:/#latest-internship-opportunities' },
    { id: 'overview', label: '📖 Learn More', action: 'navigate:/help/overview' },
  ],
  support: [
    { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    { id: 'rules', label: '📋 View Rules', action: 'navigate:/help/rules' },
    { id: 'overview', label: '📖 System Overview', action: 'navigate:/help/overview' },
  ],
  navigation: [
    { id: 'home', label: '🏠 Home', action: 'navigate:/' },
    { id: 'dashboard', label: '📊 Dashboard', action: 'navigate:/dashboard' },
    { id: 'help', label: '❓ Help Center', action: 'navigate:/help/overview' },
  ],
};

// Knowledge base entries
export const knowledgeBase: KnowledgeEntry[] = [
  // ============== GREETINGS ==============
  {
    id: 'greeting-hello',
    category: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo'],
    question: 'Hello!',
    answer: "Hello! 👋 Welcome to ICMS - the Internship and Career Management System. I'm here to help you with any questions about internships, navigating the platform, or getting support. How can I assist you today?",
    quickActions: [
      { id: 'what-is-icms', label: '❓ What is ICMS?', action: 'ask:What is ICMS?' },
      { id: 'how-to-apply', label: '📝 How to Apply', action: 'ask:How do I apply for an internship?' },
      { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
    ],
    priority: 100,
  },
  {
    id: 'greeting-thanks',
    category: 'greeting',
    keywords: ['thank', 'thanks', 'thank you', 'thx', 'appreciate', 'helpful', 'great'],
    question: 'Thank you',
    answer: "You're welcome! 😊 I'm happy to help. Is there anything else you'd like to know about ICMS?",
    quickActions: [
      { id: 'more-help', label: '🔍 Explore More', action: 'ask:What else can you help with?' },
      { id: 'contact', label: '📧 Contact Team', action: 'navigate:/help/contact' },
    ],
    priority: 90,
  },
  {
    id: 'greeting-bye',
    category: 'greeting',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close', 'done'],
    question: 'Goodbye',
    answer: "Goodbye! 👋 Feel free to come back anytime if you have more questions. Good luck with your internship and career journey!",
    priority: 90,
  },

  // ============== FAQs ==============
  {
    id: 'faq-what-is-icms',
    category: 'faq',
    keywords: ['what', 'icms', 'about', 'system', 'platform', 'explain', 'describe', 'purpose', 'meaning'],
    question: 'What is ICMS?',
    answer: "ICMS (Internship and Career Management System) is a comprehensive platform designed to streamline the internship process. It connects:\n\n• **Students** seeking valuable internship experiences\n• **Companies** looking for talented interns\n• **Educational Institutions** managing academic requirements\n\nThe platform facilitates applications, tracking, communication, and evaluation throughout the entire internship and career journey.",
    quickActions: [
      { id: 'who-can-use', label: '👥 Who Can Use It?', action: 'ask:Who can use ICMS?' },
      { id: 'how-works', label: '⚙️ How It Works', action: 'ask:How does ICMS work?' },
    ],
    links: [
      { label: 'Learn More', url: '/help/overview' },
    ],
    priority: 95,
  },
  {
    id: 'faq-who-can-use',
    category: 'faq',
    keywords: ['who', 'can', 'use', 'users', 'roles', 'types', 'people', 'audience'],
    question: 'Who can use ICMS?',
    answer: "ICMS serves multiple user roles:\n\n👨‍🎓 **Students** - Browse and apply for internships, track applications\n🏢 **Company Admins** - Post opportunities, manage applications\n👨‍💼 **Supervisors** - Mentor interns, approve documents\n🎓 **Faculty Advisors** - Guide students academically\n📋 **Coordinators** - Manage workflows and communications\n🏛️ **Department Heads** - Oversee departmental activities",
    quickActions: [
      { id: 'student-guide', label: '👨‍🎓 Student Guide', action: 'ask:How do students use ICMS?' },
      { id: 'company-guide', label: '🏢 Company Guide', action: 'ask:How do companies use ICMS?' },
    ],
    priority: 90,
  },
  {
    id: 'faq-how-apply',
    category: 'faq',
    keywords: ['apply', 'application', 'internship', 'submit', 'how', 'process', 'steps', 'procedure'],
    question: 'How do I apply for an internship?',
    answer: "Here's how to apply for an internship:\n\n1️⃣ **Login** to your account\n2️⃣ **Complete Your Profile** - Add your education, skills, and resume\n3️⃣ **Browse Opportunities** - Search available internships\n4️⃣ **Submit Application** - Click 'Apply' and attach required documents\n5️⃣ **Track Status** - Monitor your application progress in the dashboard\n\nYou'll receive notifications at each stage of the review process!",
    quickActions: [
      { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
      { id: 'browse', label: '🔍 Browse Internships', action: 'navigate:/#latest-internship-opportunities' },
    ],
    priority: 95,
  },
  {
    id: 'faq-track-status',
    category: 'faq',
    keywords: ['track', 'status', 'application', 'progress', 'where', 'check', 'monitor', 'update'],
    question: 'How do I track my application status?',
    answer: "You can track your application status through your dashboard:\n\n📊 **Dashboard** → **My Applications**\n\nStatus stages include:\n• ⏳ Pending - Awaiting review\n• 📝 Under Review - Being evaluated\n• ✅ Accepted - Congratulations!\n• ❌ Rejected - Try other opportunities\n\nYou'll also receive email notifications for important updates.",
    quickActions: [
      { id: 'dashboard', label: '📊 Go to Dashboard', action: 'navigate:/dashboard' },
      { id: 'notifications', label: '🔔 Check Notifications', action: 'navigate:/dashboard' },
    ],
    priority: 85,
  },
  {
    id: 'faq-requirements',
    category: 'faq',
    keywords: ['requirements', 'documents', 'need', 'required', 'upload', 'submit', 'papers', 'files'],
    question: 'What documents do I need?',
    answer: "Common required documents include:\n\n📄 **Resume/CV** - Updated with your latest experience\n📸 **Profile Photo** - Professional headshot\n📜 **Transcripts** - Academic records\n✉️ **Cover Letter** - For specific applications\n📋 **Recommendation Letters** - If requested\n\nDocument requirements may vary by internship posting. Check each listing for specific requirements.",
    quickActions: [
      { id: 'profile', label: '👤 Update Profile', action: 'navigate:/dashboard' },
      { id: 'browse', label: '🔍 View Requirements', action: 'navigate:/#latest-internship-opportunities' },
    ],
    priority: 80,
  },
  {
    id: 'faq-deadline',
    category: 'faq',
    keywords: ['deadline', 'date', 'when', 'due', 'last', 'expire', 'close', 'time'],
    question: 'What are the application deadlines?',
    answer: "Application deadlines vary by internship posting. Each listing displays:\n\n📅 **Application Deadline** - Last date to submit\n📆 **Start Date** - When the internship begins\n⏰ **Duration** - Length of the internship\n\nCheck individual postings for specific dates. We recommend applying early as some positions fill quickly!",
    quickActions: [
      { id: 'browse', label: '🔍 View Open Positions', action: 'navigate:/#latest-internship-opportunities' },
    ],
    priority: 75,
  },
  {
    id: 'faq-companies',
    category: 'faq',
    keywords: ['companies', 'company', 'employers', 'partners', 'organizations', 'hiring', 'who'],
    question: 'Which companies are hiring?',
    answer: "ICMS partners with various organizations including:\n\n🏢 **Technology Companies** - Software, IT services\n🏥 **Healthcare Organizations** - Hospitals, clinics\n🏦 **Financial Institutions** - Banks, accounting firms\n🏭 **Manufacturing** - Industrial companies\n📚 **Educational Institutions** - Schools, universities\n\nBrowse our partner companies section to see current opportunities!",
    quickActions: [
      { id: 'partners', label: '🤝 View Partners', action: 'navigate:/#our-partner-companies' },
      { id: 'browse', label: '🔍 Browse Internships', action: 'navigate:/#latest-internship-opportunities' },
    ],
    priority: 80,
  },

  // ============== NAVIGATION ==============
  {
    id: 'nav-dashboard',
    category: 'navigation',
    keywords: ['dashboard', 'home', 'main', 'page', 'overview', 'start', 'begin'],
    question: 'Where is my dashboard?',
    answer: "Your dashboard is your central hub in ICMS. Here's how to access it:\n\n1️⃣ **Login** to your account\n2️⃣ Click on **Dashboard** in the navigation\n\nFrom your dashboard you can:\n• View application status\n• Check notifications\n• Access messages\n• Manage your profile",
    quickActions: [
      { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
      { id: 'dashboard', label: '📊 Go to Dashboard', action: 'navigate:/dashboard' },
    ],
    priority: 85,
  },
  {
    id: 'nav-internships',
    category: 'navigation',
    keywords: ['find', 'search', 'internship', 'opportunity', 'job', 'position', 'listing', 'browse', 'explore'],
    question: 'How do I find internships?',
    answer: "Finding internships is easy! Here are the steps:\n\n🔍 **Option 1:** Use the search bar on the homepage\n📋 **Option 2:** Browse the 'Latest Internship Opportunities' section\n🏷️ **Option 3:** Filter by category, location, or company\n\nYou can also set up alerts to be notified of new postings!",
    quickActions: [
      { id: 'browse', label: '🔍 Browse Now', action: 'navigate:/#latest-internship-opportunities' },
      { id: 'home', label: '🏠 Go to Homepage', action: 'navigate:/' },
    ],
    priority: 90,
  },
  {
    id: 'nav-profile',
    category: 'navigation',
    keywords: ['profile', 'account', 'settings', 'edit', 'update', 'personal', 'information', 'details'],
    question: 'How do I update my profile?',
    answer: "To update your profile:\n\n1️⃣ **Login** to your account\n2️⃣ Click your **profile picture** or name\n3️⃣ Select **Settings** or **Profile**\n4️⃣ Edit your information and **Save**\n\nKeep your profile updated for better matching with opportunities!",
    quickActions: [
      { id: 'settings', label: '⚙️ Account Settings', action: 'navigate:/settings/profile' },
      { id: 'dashboard', label: '📊 Dashboard', action: 'navigate:/dashboard' },
    ],
    priority: 80,
  },
  {
    id: 'nav-messages',
    category: 'navigation',
    keywords: ['message', 'chat', 'communicate', 'contact', 'inbox', 'conversation', 'talk', 'write'],
    question: 'How do I send messages?',
    answer: "ICMS has a built-in messaging system:\n\n💬 **Dashboard** → **Messages/Inbox**\n\nYou can communicate with:\n• Company supervisors\n• Faculty advisors\n• Coordinators\n• Support team\n\nAll conversations are securely stored in your inbox.",
    quickActions: [
      { id: 'dashboard', label: '📊 Go to Dashboard', action: 'navigate:/dashboard' },
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    ],
    priority: 75,
  },
  {
    id: 'nav-help',
    category: 'navigation',
    keywords: ['help', 'guide', 'tutorial', 'how', 'learn', 'documentation', 'manual', 'instructions'],
    question: 'Where can I find help?',
    answer: "We have several help resources:\n\n📖 **System Overview** - Complete platform guide\n📋 **Rules & Guidelines** - Platform policies\n📧 **Contact Us** - Reach our support team\n🤖 **This Chatbot** - I'm always here to help!\n\nBrowse our help section for detailed guides.",
    quickActions: [
      { id: 'overview', label: '📖 Overview', action: 'navigate:/help/overview' },
      { id: 'rules', label: '📋 Rules', action: 'navigate:/help/rules' },
      { id: 'contact', label: '📧 Contact', action: 'navigate:/help/contact' },
    ],
    priority: 85,
  },

  // ============== SUPPORT ==============
  {
    id: 'support-bug',
    category: 'support',
    keywords: ['bug', 'error', 'problem', 'issue', 'broken', 'not working', 'crash', 'glitch', 'fix'],
    question: 'How do I report a bug?',
    answer: "Found a bug? Here's how to report it:\n\n🐛 **Option 1:** Contact our support team directly\n📧 **Option 2:** Email skatephi@gmail.com\n📝 **Include these details:**\n• What you were trying to do\n• What went wrong\n• Screenshots if possible\n• Browser/device information\n\nWe appreciate your help in improving ICMS!",
    quickActions: [
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
      { id: 'email', label: '✉️ Email Team', action: 'navigate:mailto:skatephi@gmail.com' },
    ],
    priority: 85,
  },
  {
    id: 'support-account',
    category: 'support',
    keywords: ['account', 'login', 'password', 'forgot', 'reset', 'locked', 'access', 'cannot', 'unable'],
    question: "I can't access my account",
    answer: "Having trouble accessing your account? Try these steps:\n\n🔐 **Forgot Password:**\n1. Click 'Forgot Password' on login page\n2. Enter your email\n3. Check inbox for reset link\n\n🔒 **Account Locked:**\nContact support if your account is locked.\n\n❌ **Other Issues:**\nReach out to our support team for help.",
    quickActions: [
      { id: 'login', label: '🔑 Go to Login', action: 'navigate:/login' },
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    ],
    priority: 90,
  },
  {
    id: 'support-technical',
    category: 'support',
    keywords: ['technical', 'slow', 'loading', 'page', 'display', 'render', 'performance', 'browser'],
    question: 'Technical issues',
    answer: "For technical issues, try these solutions:\n\n🔄 **Basic Fixes:**\n• Refresh the page (Ctrl+F5)\n• Clear browser cache\n• Try a different browser\n• Check internet connection\n\n📱 **Mobile Issues:**\n• Update your browser app\n• Try the desktop version\n\nIf problems persist, contact our support team with details.",
    quickActions: [
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    ],
    priority: 80,
  },
  {
    id: 'support-feedback',
    category: 'support',
    keywords: ['feedback', 'suggestion', 'improve', 'feature', 'request', 'idea', 'recommend'],
    question: 'How can I give feedback?',
    answer: "We love hearing from our users! 💝\n\n📝 **Share Feedback:**\n• Contact our development team\n• Email your suggestions\n• Use the contact form\n\nYour feedback helps us improve ICMS for everyone!",
    quickActions: [
      { id: 'contact', label: '📧 Contact Team', action: 'navigate:/help/contact' },
    ],
    priority: 70,
  },
  {
    id: 'support-contact-human',
    category: 'support',
    keywords: ['human', 'real', 'person', 'agent', 'staff', 'team', 'developer', 'support', 'speak'],
    question: 'I want to talk to a real person',
    answer: "Of course! Here's how to reach our team:\n\n📧 **Email:** skatephi@gmail.com\n📞 **Phone:** +251 911 123 456\n📍 **Location:** Ambo University Hachalu Hundesa Campus\n\nOur team typically responds within 24-48 hours during business days.",
    quickActions: [
      { id: 'contact', label: '📧 Contact Page', action: 'navigate:/help/contact' },
      { id: 'email', label: '✉️ Send Email', action: 'navigate:mailto:skatephi@gmail.com' },
    ],
    priority: 85,
  },

  // ============== ROLE-SPECIFIC ==============
  {
    id: 'role-student',
    category: 'faq',
    keywords: ['student', 'intern', 'applicant', 'learner', 'undergraduate', 'graduate'],
    question: 'How do students use ICMS?',
    answer: "As a student, you can:\n\n📝 **Apply** - Browse and apply for internships\n📊 **Track** - Monitor application status\n📤 **Submit** - Upload required documents\n💬 **Communicate** - Message supervisors and advisors\n📋 **Report** - Submit progress reports\n⭐ **Evaluate** - Rate your internship experience",
    quickActions: [
      { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
      { id: 'browse', label: '🔍 Browse Internships', action: 'navigate:/#latest-internship-opportunities' },
    ],
    priority: 85,
  },
  {
    id: 'role-company',
    category: 'faq',
    keywords: ['company', 'employer', 'business', 'organization', 'post', 'hire', 'recruit'],
    question: 'How do companies use ICMS?',
    answer: "Companies can use ICMS to:\n\n📢 **Post** - Create internship opportunities\n👀 **Review** - Evaluate student applications\n👨‍💼 **Assign** - Designate supervisors\n📊 **Track** - Monitor intern progress\n📝 **Evaluate** - Provide performance feedback\n🤝 **Connect** - Build university partnerships",
    quickActions: [
      { id: 'login', label: '🔑 Login', action: 'navigate:/login' },
      { id: 'overview', label: '📖 Learn More', action: 'navigate:/help/overview' },
    ],
    priority: 85,
  },

  // ============== FALLBACK ==============
  {
    id: 'fallback-unknown',
    category: 'support',
    keywords: [],
    question: "I don't understand",
    answer: "I'm not sure I understood that. Could you try rephrasing your question? 🤔\n\nHere are some things I can help you with:\n• Information about ICMS\n• How to apply for internships\n• Navigating the platform\n• Technical support\n\nOr you can contact our support team directly!",
    quickActions: [
      { id: 'what-is-icms', label: '❓ What is ICMS?', action: 'ask:What is ICMS?' },
      { id: 'how-apply', label: '📝 How to Apply', action: 'ask:How do I apply?' },
      { id: 'contact', label: '📧 Contact Support', action: 'navigate:/help/contact' },
    ],
    priority: 0,
  },
];

// Get entry by ID
export function getEntryById(id: string): KnowledgeEntry | undefined {
  return knowledgeBase.find(entry => entry.id === id);
}

// Get entries by category
export function getEntriesByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return knowledgeBase.filter(entry => entry.category === category);
}

// Get popular/common questions
export function getPopularQuestions(): KnowledgeEntry[] {
  return knowledgeBase
    .filter(entry => entry.priority && entry.priority >= 85)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 6);
}
