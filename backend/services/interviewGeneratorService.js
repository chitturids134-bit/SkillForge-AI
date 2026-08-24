import Profile from '../models/Profile.js';

const FALLBACK_BANK = {
  Technical: {
    Beginner: [
      { question: 'What is a REST API, and what are the standard HTTP methods used to interact with resources?', expectedTopics: ['HTTP methods', 'JSON', 'Endpoints', 'Statelessness'] },
      { question: 'Explain the difference between SQL and NoSQL databases, giving examples of when to use each.', expectedTopics: ['Relational schema', 'Document store', 'ACID vs BASE', 'Scaling'] },
      { question: 'What is asynchronous programming in JavaScript? Explain callbacks, Promises, and async/await.', expectedTopics: ['Event Loop', 'Promises', 'Async/Await', 'Non-blocking I/O'] },
      { question: 'Explain authentication vs authorization. How does JWT (JSON Web Token) authentication work?', expectedTopics: ['Identity', 'Permissions', 'JWT signature', 'Tokens'] },
      { question: 'What is Git version control, and what is the difference between git fetch and git pull?', expectedTopics: ['Repositories', 'Commits', 'Remote branches', 'Merging'] }
    ],
    Intermediate: [
      { question: 'Explain how database indexing works under the hood. What are B-trees and the trade-offs of indexing?', expectedTopics: ['B-Tree', 'Lookup complexity', 'Write overhead', 'Primary vs Secondary index'] },
      { question: 'Describe how React Reconciliation and the Virtual DOM work to optimize UI render cycles.', expectedTopics: ['Diffing algorithm', 'Virtual DOM', 'Key prop', 'Re-rendering'] },
      { question: 'How do you handle password storage securely on the backend? Explain salting and bcrypt hashing.', expectedTopics: ['Bcrypt', 'Salt', 'Rainbow tables', 'One-way hash'] },
      { question: 'What is CORS (Cross-Origin Resource Sharing)? How do browser security origins and headers work?', expectedTopics: ['Same-origin policy', 'Preflight OPTIONS', 'Headers', 'Middleware'] },
      { question: 'Explain the concept of middleware in web servers (Express/Node.js). Give an example of custom middleware.', expectedTopics: ['req/res cycle', 'next()', 'Error handling', 'Interceptors'] }
    ],
    Advanced: [
      { question: 'How would you architect a real-time web application handling 100,000 concurrent WebSocket connections?', expectedTopics: ['WebSockets', 'Horizontal scaling', 'Redis Pub/Sub', 'Load balancing', 'Connection pooling'] },
      { question: 'Compare database Sharding, Replication, and Partitioning for high-throughput enterprise applications.', expectedTopics: ['Horizontal partitioning', 'Master-slave replication', 'Consistency models', 'CAP Theorem'] },
      { question: 'How do you prevent security vulnerabilities like XSS, CSRF, SQL/NoSQL Injection, and Rate Limiting attacks?', expectedTopics: ['Sanitization', 'CSRF Tokens', 'Prepared statements', 'Rate limiters', 'Helmet'] },
      { question: 'Explain Microservices architecture tradeoffs versus a Monolithic setup. How do service meshes manage traffic?', expectedTopics: ['Service discovery', 'Circuit breakers', 'Network latency', 'Distributed tracing'] },
      { question: 'Describe garbage collection and memory leak debugging strategies in Node.js runtime environments.', expectedTopics: ['V8 heap', 'Mark-and-sweep', 'Event listener leaks', 'Heap snapshots'] }
    ]
  },
  HR: {
    Beginner: [
      { question: 'Tell me about yourself, your educational background, and why you are interested in this career path.', expectedTopics: ['Background', 'Interests', 'Career progression', 'Enthusiasm'] },
      { question: 'What are your core technical strengths, and what is one skill area you are actively working to improve?', expectedTopics: ['Self-awareness', 'Growth mindset', 'Active learning'] },
      { question: 'Where do you see yourself professionally in the next three to five years?', expectedTopics: ['Ambition', 'Goal setting', 'Long-term planning'] },
      { question: 'What type of work environment and management style enables you to perform at your best?', expectedTopics: ['Collaboration', 'Communication', 'Autonomy'] },
      { question: 'Why are you interested in joining our organization specifically?', expectedTopics: ['Company research', 'Alignment', 'Culture fit'] }
    ],
    Intermediate: [
      { question: 'How do you handle constructive criticism and feedback from peers or senior leaders?', expectedTopics: ['Receptiveness', 'Adaptability', 'Professionalism'] },
      { question: 'Describe a situation where you had to balance competing priorities and tight deadlines.', expectedTopics: ['Prioritization', 'Time management', 'Communication'] },
      { question: 'How do you keep your technical skills updated in a rapidly evolving tech industry?', expectedTopics: ['Continuous learning', 'Side projects', 'Industry blogs'] },
      { question: 'Describe how you handle disagreements with a manager or team member regarding a decision.', expectedTopics: ['Diplomacy', 'Active listening', 'Resolution'] },
      { question: 'What motivates you most at work—financial incentives, learning opportunities, or team recognition?', expectedTopics: ['Core drivers', 'Alignment', 'Values'] }
    ],
    Advanced: [
      { question: 'Tell me about a major technical or project decision that did not go as planned. What did you learn?', expectedTopics: ['Resilience', 'Accountability', 'Post-mortem analysis'] },
      { question: 'How do you foster an inclusive, collaborative culture when leading or mentoring junior developers?', expectedTopics: ['Leadership', 'Inclusivity', 'Knowledge sharing'] },
      { question: 'How do you manage stress and maintain high output during intense release cycles or production incidents?', expectedTopics: ['Stress management', 'Focus', 'Team support'] },
      { question: 'Describe a scenario where you led a technical initiative under extreme ambiguity without clear requirements.', expectedTopics: ['Ownership', 'Problem decomposition', 'Stakeholder alignment'] },
      { question: 'What legacy or long-term impact do you aim to create in your next technical leadership role?', expectedTopics: ['Vision', 'Mentorship', 'Architectural standards'] }
    ]
  },
  Behavioral: {
    Beginner: [
      { question: 'Describe a situation where you faced a challenging technical bug. How did you diagnose and solve it?', expectedTopics: ['Situation', 'Task', 'Action', 'Result', 'Debugging'] },
      { question: 'Tell me about a time you had to learn a completely new framework or tool quickly for a assignment.', expectedTopics: ['Adaptability', 'Resourcefulness', 'Quick learning'] },
      { question: 'Describe a successful team project experience. What was your specific role and contribution?', expectedTopics: ['Teamwork', 'Role clarity', 'Outcome'] },
      { question: 'Tell me about a time you made a mistake during development. How did you handle it?', expectedTopics: ['Accountability', 'Remediation', 'Prevention'] },
      { question: 'Describe a scenario where you explained a technical concept to a non-technical stakeholder.', expectedTopics: ['Clarity', 'Empathy', 'Communication'] }
    ],
    Intermediate: [
      { question: 'Describe a situation where you had a conflict with a teammate on code architecture. How was it resolved using the STAR framework?', expectedTopics: ['STAR method', 'Conflict resolution', 'Data-driven discussion'] },
      { question: 'Tell me about a project where scope changed drastically halfway through. How did you adapt your plan?', expectedTopics: ['Agile mindset', 'Pivot execution', 'Stakeholder communication'] },
      { question: 'Describe a time you noticed a major flaw or inefficiency in a codebase. What proactive steps did you take?', expectedTopics: ['Initiative', 'Refactoring', 'Impact metrics'] },
      { question: 'Tell me about a time you had to deliver a critical task under tight time pressure with missing details.', expectedTopics: ['Decision making', 'Risk mitigation', 'Delivery'] },
      { question: 'Describe a scenario where you persuaded your team or manager to adopt a new tool or architecture.', expectedTopics: ['Persuasion', 'Trade-off analysis', 'POC proof'] }
    ],
    Advanced: [
      { question: 'Using the STAR framework, detail a high-stakes production outage or system breakdown you spearheaded resolving.', expectedTopics: ['STAR Framework', 'Incident command', 'Root Cause Analysis', 'Resilience'] },
      { question: 'Tell me about a time you turned around an underperforming project or unaligned team to deliver success.', expectedTopics: ['Leadership', 'Turnaround strategy', 'Measurable results'] },
      { question: 'Describe a situation where you had to compromise on technical debt to meet a crucial business launch window.', expectedTopics: ['Pragmatism', 'Tech debt management', 'Business alignment'] },
      { question: 'Tell me about a time you championed code quality, testing standards, or automated CI/CD across your organization.', expectedTopics: ['Culture change', 'Automation', 'Quality metrics'] },
      { question: 'Describe a complex multi-team initiative you led. How did you handle cross-team dependencies and friction?', expectedTopics: ['Cross-functional leadership', 'Dependency mapping', 'Executive updates'] }
    ]
  }
};

/**
 * Profile-aware Question Generation Service
 */
export const generateInterviewQuestions = async (userId, category, difficulty = 'Intermediate', questionCount = 5) => {
  let userProfile = null;
  try {
    userProfile = await Profile.findOne({ user: userId }).populate('user', 'name email role');
  } catch (err) {
    console.error('Profile retrieval error in interview generator:', err.message);
  }

  const categoryKey = ['Technical', 'HR', 'Behavioral'].includes(category) ? category : 'Technical';
  const diffKey = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty) ? difficulty : 'Intermediate';

  // Get base bank pool
  let bankPool = FALLBACK_BANK[categoryKey]?.[diffKey] || FALLBACK_BANK.Technical.Intermediate;

  // Build customized question list if profile available
  const questionsList = [];
  const userSkills = userProfile?.skills?.map(s => (typeof s === 'string' ? s : s.name)) || [];
  const userRole = userProfile?.headline || userProfile?.user?.role || 'Software Engineer';
  const userProjects = userProfile?.projects || [];

  if (categoryKey === 'Technical' && userSkills.length > 0) {
    // Tailor technical questions dynamically based on skills
    const primarySkill = userSkills[0] || 'JavaScript';
    const secondarySkill = userSkills[1] || 'React';
    const databaseSkill = userSkills.find(s => ['MongoDB', 'PostgreSQL', 'SQL', 'Redis', 'Database'].some(db => s.toLowerCase().includes(db.toLowerCase()))) || 'Database';

    const customizedTechnical = [
      {
        question: `As a ${userRole}, explain core design patterns and architecture when building applications using ${primarySkill} and ${secondarySkill}.`,
        expectedTopics: [primarySkill, secondarySkill, 'Architecture', 'Design patterns'],
      },
      {
        question: `Describe how you approach query performance, schema design, and scaling with ${databaseSkill}.`,
        expectedTopics: [databaseSkill, 'Indexing', 'Schema design', 'Query optimization'],
      },
      userProjects.length > 0
        ? {
            question: `In your project "${userProjects[0].title || 'Portfolio Project'}", how did you structure state management, API integration, and key technical challenges?`,
            expectedTopics: [userProjects[0].title, 'State management', 'API integration', 'Trade-offs'],
          }
        : {
            question: `Explain how state management, API data fetching, and caching interact in your development workflow.`,
            expectedTopics: ['State management', 'Caching', 'API integration'],
          },
      {
        question: `How do you handle error boundaries, logging, and exception handling across ${primarySkill} frontend and backend services?`,
        expectedTopics: ['Error handling', 'Logging', 'Middleware', 'Monitoring'],
      },
      {
        question: `Explain security mechanisms you implement (JWT authentication, CORS, CSRF, input validation) for production applications.`,
        expectedTopics: ['Authentication', 'CORS', 'Security best practices', 'Sanitization'],
      },
    ];

    for (let i = 0; i < Math.min(questionCount, customizedTechnical.length); i++) {
      questionsList.push(customizedTechnical[i]);
    }
  }

  // Fill remaining questions from bank pool
  let bankIndex = 0;
  while (questionsList.length < questionCount) {
    const item = bankPool[bankIndex % bankPool.length];
    // Avoid duplicate question text
    if (!questionsList.some(q => q.question === item.question)) {
      questionsList.push(item);
    }
    bankIndex++;
    if (bankIndex > 20) break; // safety guard
  }

  // Return mapped schema array
  return questionsList.slice(0, questionCount).map((q) => ({
    question: q.question,
    category: categoryKey,
    expectedTopics: q.expectedTopics || ['Core concepts', 'Problem solving'],
    answer: '',
    score: 0,
    feedback: '',
    strengths: [],
    improvements: [],
  }));
};
