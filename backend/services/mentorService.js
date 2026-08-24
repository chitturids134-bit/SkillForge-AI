import MentorChat from '../models/MentorChat.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import CareerRoadmap from '../models/CareerRoadmap.js';
import Resume from '../models/Resume.js';

export const getPromptTemplatesService = () => {
  return [
    {
      id: 'template_greeting',
      icon: '👋',
      title: 'Greeting & Support Overview',
      prompt: 'hi'
    },
    {
      id: 'template_week_plan',
      icon: '📅',
      title: '7-Day Learning Plan',
      prompt: 'create a week plan'
    },
    {
      id: 'template_learning_topics',
      icon: '📚',
      title: 'Prioritized Study Topics',
      prompt: 'which topics should I learn?'
    },
    {
      id: 'template_project_ideas',
      icon: '🚀',
      title: 'Portfolio Project Ideas',
      prompt: 'suggest some projects'
    },
    {
      id: 'template_technical_explanation',
      icon: '💡',
      title: 'Technical Explanation',
      prompt: 'what is REST API?'
    },
    {
      id: 'template_interview_prep',
      icon: '🎤',
      title: 'Interview Preparation',
      prompt: 'help me prepare for interview'
    },
    {
      id: 'template_resume_guidance',
      icon: '📝',
      title: 'Resume & ATS Guidance',
      prompt: 'how can I improve my resume?'
    }
  ];
};

export const getChatSessionsService = async (userId) => {
  let sessions = await MentorChat.find({ user: userId, isArchived: false }).sort({ updatedAt: -1 });
  if (sessions.length === 0) {
    const defaultSession = await MentorChat.create({
      user: userId,
      sessionId: "session_" + Date.now(),
      title: 'SkillForge AI Mentor Session',
      messages: [
        {
          sender: 'assistant',
          text: "Hi! 👋 I'm your SkillForge AI Mentor.\n\nI can help you with:\n• Learning plans & 7-day study schedules\n• Career roadmaps & track progression\n• Resume & ATS score optimization\n• Technical interview preparation\n• Portfolio project recommendations\n• Technical concepts & architectural explanations\n\nWhat would you like to work on today?",
          timestamp: new Date()
        }
      ]
    });
    sessions = [defaultSession];
  }
  return sessions;
};

// Intent Classification Helper
function detectIntent(message, contextMemory = {}) {
  const msg = message.toLowerCase().trim();

  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(msg) && msg.length < 20) {
    return 'GREETING';
  }
  if (msg.includes('week plan') || msg.includes('weekly plan') || msg.includes('7 day') || msg.includes('schedule for this week') || msg.includes('plan my week')) {
    return 'WEEK_PLAN';
  }
  if (msg.includes('which topics') || msg.includes('what topics') || msg.includes('what should i learn') || msg.includes('technologies should i learn') || msg.includes('what to study')) {
    return 'LEARNING_TOPICS';
  }
  if (msg.includes('career') || msg.includes('become a') || msg.includes('frontend or backend') || msg.includes('path for me')) {
    return 'CAREER_GUIDANCE';
  }
  if (msg.includes('resume') || msg.includes('ats') || msg.includes('cv')) {
    return 'RESUME';
  }
  if (msg.includes('interview') || msg.includes('mock interview') || msg.includes('interview questions')) {
    return 'INTERVIEW';
  }
  if (msg.includes('project') || msg.includes('portfolio') || msg.includes('build')) {
    return 'PROJECTS';
  }
  if (msg.includes('skills') || msg.includes('skill set') || msg.includes('skills do i need')) {
    return 'SKILLS';
  }
  if (msg.includes('roadmap') || msg.includes('milestones') || msg.includes('learning path')) {
    return 'ROADMAP';
  }
  if (msg.includes('what is') || msg.includes('explain') || msg.includes('how does') || msg.includes('difference between')) {
    return 'EXPLANATION';
  }

  return 'UNKNOWN';
}

// Extract targeted role from text or user context
function extractTargetRole(msg, history = [], userProfile = {}) {
  const combined = (msg + ' ' + history.map(h => h.text).join(' ')).toLowerCase();
  
  if (combined.includes('backend') || combined.includes('microservices') || userProfile.careerPath === 'backend-microservices-lead') {
    return 'Backend Microservices Lead';
  }
  if (combined.includes('frontend') || userProfile.careerPath === 'frontend-specialist') {
    return 'Frontend Specialist';
  }
  if (combined.includes('cloud') || combined.includes('devops') || userProfile.careerPath === 'cloud-architect') {
    return 'Cloud Architect';
  }
  if (combined.includes('ai') || combined.includes('full stack') || userProfile.careerPath === 'full-stack-ai-engineer') {
    return 'Full Stack AI Engineer';
  }

  return userProfile.targetRole || userProfile.role || 'Full Stack AI Engineer';
}

// Call Google Gemini API (if available)
async function callGeminiAPI(systemPrompt, userPrompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('AQ.Ab8RN6')) {
    return null;
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
    
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I will act as the SkillForge AI Mentor, providing personalized, intent-focused technical and career advice." }] }
    ];

    history.forEach(m => {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      });
    });

    contents.push({ role: 'user', parts: [{ text: userPrompt }] });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (err) {
    console.error('Gemini API Error:', err.message);
  }
  return null;
}

// Generate Dynamic Context-Aware Response
function generateDynamicResponse(intent, userMessageText, userProfile, targetRole, history) {
  const userName = userProfile.name || 'Developer';

  switch (intent) {
    case 'GREETING':
      return "Hi " + userName + "! 👋 I'm your SkillForge AI Mentor.\n\nI can help you with:\n• Learning plans & 7-day study schedules\n• Career roadmaps & track progression\n• Resume & ATS score optimization\n• Technical interview preparation\n• Portfolio project recommendations\n• Technical concepts & architectural explanations\n\nWhat would you like to work on today?";

    case 'WEEK_PLAN':
      if (targetRole.includes('Backend')) {
        return "📅 **Your 7-Day Backend Microservices Study Plan** (Target: " + targetRole + ")\n\n" +
"**Day 1: Node.js Core & Asynchronous Event Loop**\n" +
"• Topic: Async/Await, Event Emitter, Stream I/O\n" +
"• Learning Goal: Understand non-blocking execution & file streaming\n" +
"• Practice Task: Build an event-driven file processor script\n\n" +
"**Day 2: Express.js REST API Architecture**\n" +
"• Topic: Middleware chaining, Routing, Error Handlers\n" +
"• Learning Goal: Design RESTful API endpoints with standard response wrappers\n" +
"• Practice Task: Create CRUD API endpoints for user authentication\n\n" +
"**Day 3: MongoDB Schemas & Indexing**\n" +
"• Topic: Mongoose Schemas, Compound Indexes, Query Aggregation\n" +
"• Learning Goal: Optimize database queries and prevent N+1 query bottlenecks\n" +
"• Practice Task: Write complex MongoDB aggregation pipeline for user analytics\n\n" +
"**Day 4: JWT Authentication & Security**\n" +
"• Topic: JWT Signing, Refresh Tokens, Password Hashing (bcrypt)\n" +
"• Learning Goal: Secure server routes against unauthorized access\n" +
"• Practice Task: Implement Auth Middleware with role-based access control\n\n" +
"**Day 5: Caching & Performance Optimization**\n" +
"• Topic: Redis Caching, Invalidation Strategies, Rate Limiting\n" +
"• Learning Goal: Cache frequent database queries and enforce rate limits\n" +
"• Practice Task: Integrate Redis cache layer into Express endpoints\n\n" +
"**Day 6: Message Queues & Microservices**\n" +
"• Topic: RabbitMQ / Redis PubSub, Event-Driven Architecture\n" +
"• Learning Goal: Decouple server processing into background workers\n" +
"• Practice Task: Build asynchronous email notification worker service\n\n" +
"**Day 7: Code Review, Testing & Weekly Assessment**\n" +
"• Topic: Jest Integration Tests & Skill Assessment\n" +
"• Learning Goal: Validate API functionality and measure weekly progress\n" +
"• Practice Task: Complete Node.js & Microservices Skill Assessment on SkillForge AI";
      } else if (targetRole.includes('Frontend')) {
        return "📅 **Your 7-Day Frontend Specialist Study Plan** (Target: " + targetRole + ")\n\n" +
"**Day 1: Modern JavaScript ES6+ & Async Patterns**\n" +
"• Topic: Promises, Async/Await, Closures, Modules\n" +
"• Learning Goal: Master advanced JS state manipulation\n" +
"• Practice Task: Build an async data-fetching utility with retry logic\n\n" +
"**Day 2: React 19 State & Custom Hooks**\n" +
"• Topic: React 19 state hooks, useMemo, useCallback\n" +
"• Learning Goal: Eliminate unnecessary re-renders in complex UI components\n" +
"• Practice Task: Create custom 'useDebounce' and 'useFetch' hooks\n\n" +
"**Day 3: Responsive CSS Glassmorphic Architecture**\n" +
"• Topic: CSS Grid, Flexbox, Design Tokens, Dark Mode UI\n" +
"• Learning Goal: Construct pixel-perfect SaaS responsive layouts\n" +
"• Practice Task: Build a responsive dashboard layout component\n\n" +
"**Day 4: Global State & TanStack Query**\n" +
"• Topic: Zustand / Redux Toolkit, Server State Caching\n" +
"• Learning Goal: Synchronize server API data with client state\n" +
"• Practice Task: Wire real-time API data fetching with caching\n\n" +
"**Day 5: Web Accessibility (WCAG) & Performance**\n" +
"• Topic: ARIA tags, Core Web Vitals, Code-Splitting with 'React.lazy'\n" +
"• Learning Goal: Achieve 90+ Lighthouse performance & accessibility scores\n" +
"• Practice Task: Refactor image loading & bundle chunking\n\n" +
"**Day 6: Automated Testing with Jest & RTL**\n" +
"• Topic: React Testing Library, Component Unit Tests, Mocking APIs\n" +
"• Learning Goal: Write reliable UI tests for interactive components\n" +
"• Practice Task: Write unit tests for form submission & validation\n\n" +
"**Day 7: Weekly Portfolio Synthesis & Assessment**\n" +
"• Topic: SkillForge AI Assessment & Review\n" +
"• Learning Goal: Verify frontend mastery and earn verified badges\n" +
"• Practice Task: Complete React 19 Skill Assessment on SkillForge AI";
      } else {
        return "📅 **Your 7-Day Full-Stack AI Engineer Study Plan** (Target: " + targetRole + ")\n\n" +
"**Day 1: Full-Stack React 19 & Node.js Core**\n" +
"• Topic: Express REST API integration with React 19 UI\n" +
"• Learning Goal: Establish end-to-end client-server data flow\n" +
"• Practice Task: Build user authentication flow with JWT tokens\n\n" +
"**Day 2: MongoDB Data Modeling**\n" +
"• Topic: Mongoose Models, Schemas, Relationships\n" +
"• Learning Goal: Structure scalable data persistence layer\n" +
"• Practice Task: Create User, Profile, and Assessment schemas\n\n" +
"**Day 3: AI LLM API Integration**\n" +
"• Topic: Gemini API / OpenAI API SDK, Prompt Construction\n" +
"• Learning Goal: Generate dynamic structured text content via AI\n" +
"• Practice Task: Build AI career recommendation endpoint\n\n" +
"**Day 4: Vector Embeddings & Semantic Search**\n" +
"• Topic: Text Embeddings, Qdrant Vector DB, Similarity Scoring\n" +
"• Learning Goal: Perform semantic retrieval for candidate profiles\n" +
"• Practice Task: Implement vector embedding search for job matches\n\n" +
"**Day 5: Real-Time Communication with WebSockets**\n" +
"• Topic: Socket.io, Bi-Directional Event Handlers\n" +
"• Learning Goal: Enable real-time instant messaging and notifications\n" +
"• Practice Task: Create live chat feature between recruiters and candidates\n\n" +
"**Day 6: Cloud Deployment & Containerization**\n" +
"• Topic: Docker Containerization, Nginx Reverse Proxy\n" +
"• Learning Goal: Package app into production containers\n" +
"• Practice Task: Write Dockerfile and docker-compose.yml for app stack\n\n" +
"**Day 7: Portfolio Project Synthesis & Skill Assessment**\n" +
"• Topic: Full-Stack Integration & Evaluation\n" +
"• Learning Goal: Validate engineering mastery\n" +
"• Practice Task: Complete Full Stack AI Skill Assessment on SkillForge AI";
      }

    case 'LEARNING_TOPICS':
      return "Based on your target role (**" + targetRole + "**), here is your prioritized technical topic list:\n\n" +
"1. **" + (targetRole.includes('Backend') ? 'Node.js & Event Loop' : targetRole.includes('Frontend') ? 'React 19 State Architecture' : 'React 19 & Full-Stack Node.js') + "**\n" +
"   • *Why it matters*: Forms the core foundation for building scalable client-server applications.\n\n" +
"2. **" + (targetRole.includes('Backend') ? 'Express.js REST APIs & Middleware' : targetRole.includes('Frontend') ? 'JavaScript ES6+ & Asynchronous Control' : 'RESTful API Design & Express') + "**\n" +
"   • *Why it matters*: Enables seamless data transmission, validation, and endpoint routing.\n\n" +
"3. **" + (targetRole.includes('Backend') ? 'MongoDB Aggregations & Database Indexing' : targetRole.includes('Frontend') ? 'State Management (Zustand / Redux)' : 'MongoDB Mongoose Data Modeling') + "**\n" +
"   • *Why it matters*: Critical for high-performance database reads and complex query aggregations.\n\n" +
"4. **" + (targetRole.includes('Backend') ? 'JWT Authentication & Security Middleware' : targetRole.includes('Frontend') ? 'Responsive CSS Design Systems & Glassmorphism' : 'AI LLM API Integration & Prompt Engineering') + "**\n" +
"   • *Why it matters*: Protects user data and ensures role-based access security across endpoints.\n\n" +
"5. **" + (targetRole.includes('Backend') ? 'Redis Caching & Rate Limiting' : targetRole.includes('Frontend') ? 'API Integration with TanStack Query' : 'Vector Embeddings & Semantic Search') + "**\n" +
"   • *Why it matters*: Prevents server overload, improves response latency, and enables semantic search.\n\n" +
"6. **" + (targetRole.includes('Backend') ? 'Microservices & Message Queues (RabbitMQ)' : targetRole.includes('Frontend') ? 'Web Accessibility (WCAG ARIA) & Core Web Vitals' : 'Docker Containerization & CI/CD Pipelines') + "**\n" +
"   • *Why it matters*: Essential for scaling applications across production cloud environments.\n\n" +
"Would you like a deep dive into any of these specific topics or a 7-day study plan?";

    case 'CAREER_GUIDANCE':
      return "💡 **SkillForge AI Career Guidance** (Track: **" + targetRole + "**)\n\n" +
"Transitioning into a successful **" + targetRole + "** requires mastering both technical engineering depth and production-ready portfolio execution.\n\n" +
"### Recommended Career Progression Roadmap:\n" +
"1. **Master Core Engineering Principles**: Build a rock-solid understanding of architecture patterns, asynchronous execution, and clean code principles.\n" +
"2. **Build Production-Grade Projects**: Shift from simple demo apps to multi-tenant, full-stack applications with real authentication, database persistence, and API security.\n" +
"3. **Earn Verified Skill Badges**: Complete SkillForge AI Skill Assessments to validate your mastery and display verified badges on your profile for recruiters.\n" +
"4. **Optimize Resume for ATS**: Ensure your resume highlights quantifiable technical impacts (e.g., 'Reduced response latency by 35%').\n\n" +
"How can I help you take your next step today? We can design a weekly plan, review your resume, or practice interview questions!";

    case 'RESUME':
      return "📝 **SkillForge AI Resume & ATS Optimization Guide**\n\n" +
"To achieve an ATS score above **90%** and attract top recruiters:\n\n" +
"1. **Highlight Quantifiable Accomplishments**:\n" +
"   • *Instead of*: 'Built Node.js APIs.'\n" +
"   • *Use*: 'Designed 12 RESTful microservices in Node.js & Express, reducing API response times by 35% and supporting 10,000+ daily active requests.'\n\n" +
"2. **Align Core Technical Keywords**:\n" +
"   • Ensure your resume explicitly includes target keywords: 'React 19', 'Node.js', 'MongoDB', 'Express API', 'JWT Auth', 'System Design', 'Docker'.\n\n" +
"3. **Format for ATS Scanners**:\n" +
"   • Use clean single-column layouts, standard section headers ('Work Experience', 'Projects', 'Skills', 'Education'), and standard PDF format.\n\n" +
"💡 *Tip*: You can use **SkillForge Resume Studio** ('/resume') to automatically format and audit your resume against target job requirements!";

    case 'INTERVIEW':
      return "🎤 **SkillForge AI Technical Interview Preparation Strategy**\n\n" +
"To excel in technical interviews for **" + targetRole + "**:\n\n" +
"### 1. Behavioral & Project Questions (STAR Method)\n" +
"• **S**ituation: Describe the project context.\n" +
"• **T**ask: State the technical problem or challenge.\n" +
"• **A**ction: Detail the exact technical decisions, tools, and code you implemented.\n" +
"• **R**esult: Quantify the outcome (e.g., 'Achieved 99.9% uptime').\n\n" +
"### 2. Core System Design & Architecture Concepts\n" +
"• Caching strategies (Redis Cache-Aside vs Write-Through)\n" +
"• Database Indexing & Query Optimization\n" +
"• Authentication (JWT vs Session Tokens)\n" +
"• Microservices vs Monolith trade-offs\n\n" +
"💡 *Practice Now*: Head over to **SkillForge AI Interview Prep** ('/interview') to start an interactive mock interview with instant AI evaluation!";

    case 'PROJECTS':
      return "🚀 **Recommended Portfolio Projects** (Track: **" + targetRole + "**)\n\n" +
"1. **AI-Powered ATS Resume Builder & Analyzer**\n" +
"   • **Difficulty**: Advanced\n" +
"   • **Key Skills**: React 19, Node.js, Express, MongoDB, Gemini AI API\n" +
"   • **What to Build**: Interactive resume builder with live preview, PDF export, and real-time ATS match scoring.\n" +
"   • **Why it's Valuable**: Demonstrates full-stack integration and practical AI text processing.\n\n" +
"2. **Distributed Microservices Job Matching Engine**\n" +
"   • **Difficulty**: Advanced\n" +
"   • **Key Skills**: Node.js, Redis, RabbitMQ, MongoDB Aggregations\n" +
"   • **What to Build**: Event-driven backend service matching developer skills against recruiter job postings.\n" +
"   • **Why it's Valuable**: Proves proficiency in asynchronous event queues and scalable system design.\n\n" +
"3. **Real-Time Technical Interview Platform**\n" +
"   • **Difficulty**: Expert\n" +
"   • **Key Skills**: React 19, Socket.io, Speech Recognition, Node.js\n" +
"   • **What to Build**: Interactive interview room with live question streaming and automated evaluation feedback.\n" +
"   • **Why it's Valuable**: Highlights real-time WebSocket communication and complex frontend-backend state management.";

    case 'EXPLANATION':
      if (userMessageText.toLowerCase().includes('rest api')) {
        return "💡 **Understanding REST API Architecture**\n\n" +
"A **REST API** (Representational State Transfer Application Programming Interface) is an architectural style that allows client applications (like React) to communicate with backend servers (like Node.js / Express) over HTTP.\n\n" +
"### Core HTTP Methods:\n" +
"• **GET**: Retrieve resource data from server (e.g., 'GET /api/users')\n" +
"• **POST**: Create a new resource on server (e.g., 'POST /api/users/register')\n" +
"• **PUT / PATCH**: Update an existing resource (e.g., 'PUT /api/profile')\n" +
"• **DELETE**: Remove a resource from server (e.g., 'DELETE /api/jobs/123')\n\n" +
"### Example Express.js REST Endpoint:\n" +
"app.get('/api/jobs', async (req, res) => {\n" +
"  const jobs = await Job.find({ status: 'active' });\n" +
"  res.json({ success: true, count: jobs.length, data: jobs });\n" +
"});\n\n" +
"Would you like to explore how to secure REST APIs using JWT authentication or connect them to a MongoDB database?";
      }

      return "💡 **Technical Explanation: " + userMessageText + "**\n\n" +
"Understanding key technical concepts requires breaking down the core principles, practical use cases, and code implementation.\n\n" +
"### Key Aspects:\n" +
"1. **Core Concept**: Solves specific software engineering requirements efficiently.\n" +
"2. **Architecture Impact**: Enhances performance, modularity, and maintainability.\n" +
"3. **Production Implementation**: Integrates cleanly into full-stack web applications.\n\n" +
"Would you like a code example or a step-by-step tutorial on this concept?";

    default:
      return "I'm here to help you advance as a **" + targetRole + "**!\n\n" +
"I can assist with:\n" +
"• **Learning Plans**: 'create a week plan'\n" +
"• **Topic Priorities**: 'which topics should I learn?'\n" +
"• **Portfolio Projects**: 'suggest some projects'\n" +
"• **Technical Explanations**: 'what is REST API?'\n" +
"• **Interview Preparation**: 'help me prepare for interview'\n" +
"• **Resume Guidance**: 'how can I improve my resume?'\n\n" +
"What specific area would you like to work on right now?";
  }
}

export const sendMessageToMentorService = async (userId, sessionId, userMessageText) => {
  // Fetch user profile and context
  const [userRecord, profileRecord, roadmapRecord, resumeRecord] = await Promise.all([
    User.findById(userId).select('name email role'),
    Profile.findOne({ user: userId }),
    CareerRoadmap.findOne({ user: userId }),
    Resume.findOne({ user: userId })
  ]);

  const userProfile = {
    name: userRecord?.name || 'Developer',
    role: userRecord?.role || 'developer',
    targetRole: profileRecord?.targetRole || 'Full Stack AI Engineer',
    skills: profileRecord?.skills?.map(s => typeof s === 'string' ? s : s.name) || ['React', 'Node.js', 'MongoDB'],
    careerPath: roadmapRecord?.selectedPath || 'full-stack-ai-engineer',
    hasResume: Boolean(resumeRecord)
  };

  // Find or create session
  let session = await MentorChat.findOne({ sessionId, user: userId });
  if (!session) {
    session = new MentorChat({
      user: userId,
      sessionId: sessionId || "session_" + Date.now(),
      title: userMessageText.slice(0, 30) + '...',
      messages: []
    });
  }

  // Push user message
  session.messages.push({
    sender: 'user',
    text: userMessageText,
    timestamp: new Date()
  });

  // Recent history (last 8 messages)
  const recentHistory = session.messages.slice(-9, -1);
  const targetRole = extractTargetRole(userMessageText, recentHistory, userProfile);
  const intent = detectIntent(userMessageText, session.contextMemory || {});

  // Try Gemini AI API if configured
  const systemPrompt = "You are SkillForge AI Mentor, an expert software engineering career and technical mentor.\n" +
"Target Developer Profile: Name: " + userProfile.name + ", Role: " + userProfile.role + ", Active Target Path: " + targetRole + ", Skills: " + userProfile.skills.join(', ') + ".\n" +
"User Intent: " + intent + ".\n" +
"Provide a clear, readable, nicely formatted response using markdown bullet points, short paragraphs, and bold text. Do not give generic fallback advice. Respond directly to the user's specific request.";

  let aiReplyText = await callGeminiAPI(systemPrompt, userMessageText, recentHistory);

  // If Gemini API is offline/unconfigured, generate dynamic intent-focused response
  if (!aiReplyText) {
    aiReplyText = generateDynamicResponse(intent, userMessageText, userProfile, targetRole, recentHistory);
  }

  // Update session context memory
  session.contextMemory = {
    userRole: targetRole,
    targetSkills: userProfile.skills,
    lastTopic: intent
  };

  session.messages.push({
    sender: 'assistant',
    text: aiReplyText,
    timestamp: new Date(),
    structuredContent: {
      suggestedActions: [
        { label: 'View Career Roadmap', action: '/roadmap' },
        { label: 'Skill Assessments', action: '/assessments' },
        { label: 'AI Interview Prep', action: '/interview' }
      ]
    }
  });

  await session.save();
  return session;
};

export const clearChatSessionService = async (userId, sessionId) => {
  const session = await MentorChat.findOne({ sessionId, user: userId });
  if (session) {
    session.messages = [
      {
        sender: 'assistant',
        text: "Chat history cleared. Hi! 👋 I'm your SkillForge AI Mentor. How can I help advance your software engineering career today?",
        timestamp: new Date()
      }
    ];
    await session.save();
  }
  return session;
};
