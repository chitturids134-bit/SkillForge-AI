import CareerRoadmap from '../models/CareerRoadmap.js';

const ROADMAP_DATA = {
  'full-stack-ai-engineer': {
    id: 'full-stack-ai-engineer',
    title: 'Full Stack AI Engineer',
    badge: 'AI & FULL STACK',
    description: 'Master end-to-end full stack web architecture integrated with modern AI LLMs, vector search, and production cloud infrastructure.',
    milestones: [
      {
        id: 1,
        phase: 'Milestone 1',
        title: 'Frontend Fundamentals & React 19',
        description: 'Build modern responsive UIs with HTML5, CSS Glassmorphism, JavaScript ES6+, and React 19 State Architecture.',
        duration: '3-4 Weeks',
        skills: ['React 19', 'JavaScript ES6+', 'CSS Glassmorphism', 'Vite & Git'],
        project: 'Personal Portfolio & Interactive Dashboard'
      },
      {
        id: 2,
        phase: 'Milestone 2',
        title: 'Core Backend & Node.js REST APIs',
        description: 'Design robust server APIs using Node.js, Express, MongoDB Mongoose, and JWT Token Authentication.',
        duration: '4 Weeks',
        skills: ['Node.js', 'Express API', 'MongoDB Mongoose', 'JWT Auth'],
        project: 'Multi-Tenant Auth & E-Commerce API Engine'
      },
      {
        id: 3,
        phase: 'Milestone 3',
        title: 'AI/ML Integration & Vector DBs',
        description: 'Connect LLM APIs, generate vector embeddings, and implement semantic retrieval with Qdrant and LangChain.',
        duration: '4-5 Weeks',
        skills: ['Gemini API', 'Vector Embeddings', 'Qdrant/Pinecone', 'LangChain'],
        project: 'AI Resume Analyzer & Intelligent QA System'
      },
      {
        id: 4,
        phase: 'Milestone 4',
        title: 'Full-Stack AI Production Applications',
        description: 'Synthesize full-stack web applications featuring real-time AI interview evaluations and automated scoring.',
        duration: '4 Weeks',
        skills: ['Full Stack Integration', 'Real-time WebSockets', 'AI Scoring', 'ATS Optimization'],
        project: 'AI Interview Practice Platform'
      },
      {
        id: 5,
        phase: 'Milestone 5',
        title: 'Cloud Deployment & System Scaling',
        description: 'Package apps with Docker containers, configure CI/CD pipelines, and deploy on production cloud servers.',
        duration: '3-4 Weeks',
        skills: ['Docker & Containerization', 'AWS/GCP Cloud', 'GitHub Actions CI/CD', 'Nginx'],
        project: 'Production Multi-Region AI SaaS Deployment'
      }
    ],
    skills: [
      { name: 'React 19', category: 'Frontend', level: 'Advanced' },
      { name: 'Node.js & Express', category: 'Backend', level: 'Advanced' },
      { name: 'MongoDB', category: 'Database', level: 'Intermediate' },
      { name: 'REST APIs & JWT', category: 'Security', level: 'Advanced' },
      { name: 'Gemini AI API', category: 'AI/ML', level: 'Advanced' },
      { name: 'Vector Embeddings', category: 'AI/ML', level: 'Intermediate' }
    ],
    projects: [
      { title: 'AI Resume Analyzer', desc: 'Analyzes user resume metrics against ATS criteria.', difficulty: 'Intermediate' },
      { title: 'AI Interview Platform', desc: 'Mock interview engine with real-time AI audio evaluation.', difficulty: 'Advanced' },
      { title: 'Candidate Recommendation System', desc: 'Matches developers with recruiter job openings.', difficulty: 'Advanced' },
      { title: 'AI Career Assistant', desc: 'Conversational agent providing personalized career advice.', difficulty: 'Intermediate' }
    ]
  },

  'frontend-specialist': {
    id: 'frontend-specialist',
    title: 'Frontend Specialist',
    badge: 'UI / UX & CLIENT ENGINE',
    description: 'Master advanced browser architectures, responsive CSS design systems, React performance optimization, and accessible UIs.',
    milestones: [
      {
        id: 1,
        phase: 'Milestone 1',
        title: 'HTML5, CSS Architecture & Modern JS',
        description: 'Master semantic HTML5, CSS Grid, Flexbox, responsive design tokens, and ES6+ JavaScript fundamentals.',
        duration: '3 Weeks',
        skills: ['HTML5/CSS3', 'JavaScript ES6+', 'CSS Grid & Flexbox', 'DOM Manipulation'],
        project: 'Pixel-Perfect SaaS Landing Page & Design System'
      },
      {
        id: 2,
        phase: 'Milestone 2',
        title: 'React 19 & Component Architecture',
        description: 'Build modular React applications with state hooks, context providers, custom hooks, and reusable UI components.',
        duration: '4 Weeks',
        skills: ['React 19', 'React Hooks', 'Context API', 'Component Architecture'],
        project: 'Interactive Task & Workflow Board App'
      },
      {
        id: 3,
        phase: 'Milestone 3',
        title: 'State Management & API Integration',
        description: 'Manage complex application state using Redux Toolkit/Zustand, TanStack Query, and REST/GraphQL API clients.',
        duration: '4 Weeks',
        skills: ['State Management', 'TanStack Query', 'Axios & REST', 'GraphQL Basics'],
        project: 'Real-time Stock & Crypto Analytics Dashboard'
      },
      {
        id: 4,
        phase: 'Milestone 4',
        title: 'Frontend Performance & Accessibility',
        description: 'Optimize Core Web Vitals, code-splitting, lazy loading, ARIA accessibility compliance, and browser caching.',
        duration: '3 Weeks',
        skills: ['Core Web Vitals', 'Code Splitting', 'WCAG ARIA', 'Lighthouse 100/100'],
        project: 'High-Performance ATS Resume Builder UI'
      },
      {
        id: 5,
        phase: 'Milestone 5',
        title: 'Advanced Testing & Production Build',
        description: 'Implement automated unit testing with Jest/React Testing Library, Cypress E2E tests, and production Vite builds.',
        duration: '3 Weeks',
        skills: ['Jest & RTL', 'Cypress E2E', 'Vite Bundling', 'CI/CD Deployment'],
        project: 'Production-Grade Developer Portfolio Suite'
      }
    ],
    skills: [
      { name: 'HTML5 & CSS Architecture', category: 'Core UI', level: 'Advanced' },
      { name: 'JavaScript ES6+', category: 'Core JS', level: 'Advanced' },
      { name: 'React 19 & Next.js', category: 'Framework', level: 'Advanced' },
      { name: 'State Management (Zustand/Redux)', category: 'State', level: 'Advanced' },
      { name: 'API Integration (TanStack Query)', category: 'Data Fetching', level: 'Advanced' },
      { name: 'Accessibility & Web Vitals', category: 'Performance', level: 'Intermediate' }
    ],
    projects: [
      { title: 'ATS Resume Builder UI', desc: 'Interactive resume workspace with live visual rendering.', difficulty: 'Advanced' },
      { title: 'Analytics Dashboard', desc: 'Real-time metrics dashboard with interactive charts.', difficulty: 'Intermediate' },
      { title: 'Interview Practice UI', desc: 'Responsive mock interview room with step-by-step guidance.', difficulty: 'Advanced' }
    ]
  },

  'backend-microservices-lead': {
    id: 'backend-microservices-lead',
    title: 'Backend Microservices Lead',
    badge: 'SERVER & DISTRIBUTED SYSTEMS',
    description: 'Design scalable distributed backend systems, event-driven microservices, high-throughput MongoDB databases, and secure APIs.',
    milestones: [
      {
        id: 1,
        phase: 'Milestone 1',
        title: 'Node.js Server Fundamentals & Async I/O',
        description: 'Master Node.js event loop, asynchronous non-blocking I/O, Express.js middleware, and RESTful API conventions.',
        duration: '3 Weeks',
        skills: ['Node.js Core', 'Express.js Framework', 'Async/Await & Streams', 'REST API Design'],
        project: 'High-Throughput E-Commerce REST Engine'
      },
      {
        id: 2,
        phase: 'Milestone 2',
        title: 'Database Architecture & MongoDB Optimization',
        description: 'Design MongoDB schemas, indexing strategies, aggregation pipelines, transactions, and Mongoose ODM integration.',
        duration: '4 Weeks',
        skills: ['MongoDB Schemas', 'Indexing & Aggregations', 'ACID Transactions', 'Mongoose ODM'],
        project: 'Multi-Tenant Data Management Service'
      },
      {
        id: 3,
        phase: 'Milestone 3',
        title: 'Authentication, Security & Gateway Protocols',
        description: 'Implement JWT authentication, OAuth 2.0, rate limiting, CORS policies, password hashing, and API gateway routing.',
        duration: '3 Weeks',
        skills: ['JWT Auth', 'OAuth 2.0', 'Rate Limiting', 'API Gateway Router'],
        project: 'Centralized Identity & Access Management Service'
      },
      {
        id: 4,
        phase: 'Milestone 4',
        title: 'Microservices & Event-Driven Systems',
        description: 'Decompose monolithic APIs into decoupled microservices communicating via RabbitMQ/Kafka queues and Redis caching.',
        duration: '4 Weeks',
        skills: ['Microservices', 'Message Queues (RabbitMQ)', 'Redis Caching', 'Event-Driven Architecture'],
        project: 'Distributed Recruitment Job Match Platform'
      },
      {
        id: 5,
        phase: 'Milestone 5',
        title: 'Distributed Monitoring & Resilience',
        description: 'Implement Docker containerization, Kubernetes orchestrations, Prometheus metrics, and distributed tracing with Jaeger.',
        duration: '4 Weeks',
        skills: ['Docker & K8s', 'Prometheus & Grafana', 'Distributed Tracing', 'Fault Tolerance'],
        project: 'Enterprise Microservices Platform Infrastructure'
      }
    ],
    skills: [
      { name: 'Node.js & Express', category: 'Core Server', level: 'Advanced' },
      { name: 'MongoDB & Aggregations', category: 'Database', level: 'Advanced' },
      { name: 'Authentication & Security', category: 'Security', level: 'Advanced' },
      { name: 'Microservices Architecture', category: 'Architecture', level: 'Advanced' },
      { name: 'API Gateway & Redis Caching', category: 'Performance', level: 'Advanced' },
      { name: 'Docker & Distributed Systems', category: 'DevOps', level: 'Intermediate' }
    ],
    projects: [
      { title: 'Recruitment API Engine', desc: 'Multi-tenant RESTful API serving recruiters and job candidates.', difficulty: 'Advanced' },
      { title: 'Microservices Job Platform', desc: 'Decoupled job matching engine built with RabbitMQ event queues.', difficulty: 'Advanced' },
      { title: 'Messaging Service', desc: 'Real-time messaging microservice with Redis Pub/Sub backplane.', difficulty: 'Intermediate' }
    ]
  },

  'cloud-architect': {
    id: 'cloud-architect',
    title: 'Cloud Architect',
    badge: 'CLOUD & DEVOPS INFRASTRUCTURE',
    description: 'Design multi-cloud infrastructure, automated CI/CD pipelines, containerized Kubernetes clusters, and cloud security frameworks.',
    milestones: [
      {
        id: 1,
        phase: 'Milestone 1',
        title: 'Cloud Fundamentals & Linux System Admin',
        description: 'Master Linux command line, Bash scripting, SSH security, networking protocols (DNS/TCP/IP), and cloud concepts.',
        duration: '3 Weeks',
        skills: ['Linux Admin', 'Bash Scripting', 'Networking (TCP/IP/DNS)', 'SSH & Firewalls'],
        project: 'Automated Linux Server Provisioning Scripts'
      },
      {
        id: 2,
        phase: 'Milestone 2',
        title: 'Containerization & Docker Orchestration',
        description: 'Build Docker container images, multi-stage builds, Docker Compose environments, and Nginx reverse proxies.',
        duration: '3 Weeks',
        skills: ['Docker', 'Multi-Stage Builds', 'Docker Compose', 'Nginx Reverse Proxy'],
        project: 'Containerized Microservices Local Stack'
      },
      {
        id: 3,
        phase: 'Milestone 3',
        title: 'AWS / Cloud Core Services & Infrastructure as Code',
        description: 'Provision AWS EC2, S3, VPC networks, IAM roles, and automate infrastructure deployments using Terraform.',
        duration: '4 Weeks',
        skills: ['AWS EC2/S3/VPC', 'IAM & Cloud Security', 'Infrastructure as Code (Terraform)', 'CloudWatch'],
        project: 'Automated Multi-Tier AWS Infrastructure Deployment'
      },
      {
        id: 4,
        phase: 'Milestone 4',
        title: 'Automated CI/CD Pipelines & Testing',
        description: 'Construct automated GitHub Actions workflows for continuous integration, automated unit testing, and deployment.',
        duration: '3 Weeks',
        skills: ['GitHub Actions CI/CD', 'Automated Testing Pipelines', 'Docker Hub Registry', 'Blue-Green Deployments'],
        project: 'End-to-End Automated CI/CD Pipeline Suite'
      },
      {
        id: 5,
        phase: 'Milestone 5',
        title: 'Kubernetes Orchestration & Security Auditing',
        description: 'Manage production Kubernetes clusters, Helm charts, load balancers, SSL certificates, and zero-downtime rollouts.',
        duration: '4 Weeks',
        skills: ['Kubernetes (K8s)', 'Helm Charts', 'Ingress Controllers', 'Cloud Security Auditing'],
        project: 'Production Scalable Kubernetes Cloud Application'
      }
    ],
    skills: [
      { name: 'Cloud Fundamentals (AWS/GCP)', category: 'Cloud Core', level: 'Advanced' },
      { name: 'Linux Administration & Bash', category: 'OS & Systems', level: 'Advanced' },
      { name: 'Docker & Containerization', category: 'Containers', level: 'Advanced' },
      { name: 'CI/CD Pipelines (GitHub Actions)', category: 'Automation', level: 'Advanced' },
      { name: 'Kubernetes Orchestration', category: 'Orchestration', level: 'Intermediate' },
      { name: 'Cloud Security & IaC (Terraform)', category: 'Security', level: 'Intermediate' }
    ],
    projects: [
      { title: 'Containerized AI Platform', desc: 'Dockerized multi-container AI application stack.', difficulty: 'Advanced' },
      { title: 'CI/CD Deployment Project', desc: 'Automated GitHub Actions pipeline with zero-downtime deployments.', difficulty: 'Intermediate' },
      { title: 'Scalable Cloud Application', desc: 'Kubernetes cluster deployment with auto-scaling and load balancing.', difficulty: 'Advanced' }
    ]
  }
};

// GET /api/career-roadmap
export const getRoadmap = async (req, res) => {
  try {
    let userRoadmap = await CareerRoadmap.findOne({ user: req.user._id });

    if (!userRoadmap) {
      userRoadmap = await CareerRoadmap.create({
        user: req.user._id,
        selectedPath: 'full-stack-ai-engineer',
        milestonesProgress: {}
      });
    }

    const currentPathId = userRoadmap.selectedPath || 'full-stack-ai-engineer';
    const pathConfig = ROADMAP_DATA[currentPathId] || ROADMAP_DATA['full-stack-ai-engineer'];

    // Get stored milestone status array for active path
    const storedMilestonesMap = userRoadmap.milestonesProgress || new Map();
    const storedStatusArray = storedMilestonesMap.get ? storedMilestonesMap.get(currentPathId) : storedMilestonesMap[currentPathId] || [];

    const statusMap = {};
    if (Array.isArray(storedStatusArray)) {
      storedStatusArray.forEach(m => {
        statusMap[m.milestoneId] = m.status;
      });
    }

    // Merge status with milestone templates
    let completedCount = 0;
    const mergedMilestones = pathConfig.milestones.map(m => {
      const status = statusMap[m.id] || 'Not Started';
      if (status === 'Completed') completedCount++;
      return {
        ...m,
        status: status,
        progress: status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0
      };
    });

    const overallProgress = Math.round((completedCount / pathConfig.milestones.length) * 100);

    return res.json({
      success: true,
      selectedPath: currentPathId,
      pathDetails: pathConfig,
      milestones: mergedMilestones,
      overallProgress: overallProgress,
      completedMilestonesCount: completedCount,
      totalMilestonesCount: pathConfig.milestones.length,
      availablePaths: Object.values(ROADMAP_DATA).map(p => ({
        id: p.id,
        title: p.title,
        badge: p.badge,
        description: p.description
      }))
    });
  } catch (error) {
    console.error('Get Career Roadmap error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving career roadmap' });
  }
};

// PUT /api/career-roadmap/select
export const selectCareerPath = async (req, res) => {
  try {
    const { careerPath } = req.body;
    if (!careerPath || !ROADMAP_DATA[careerPath]) {
      return res.status(400).json({ success: false, message: 'Invalid career path specified' });
    }

    let userRoadmap = await CareerRoadmap.findOne({ user: req.user._id });
    if (!userRoadmap) {
      userRoadmap = new CareerRoadmap({
        user: req.user._id,
        selectedPath: careerPath,
        milestonesProgress: {}
      });
    } else {
      userRoadmap.selectedPath = careerPath;
    }

    await userRoadmap.save();

    return getRoadmap(req, res);
  } catch (error) {
    console.error('Select Career Path error:', error);
    return res.status(500).json({ success: false, message: 'Server error selecting career path' });
  }
};

// PUT /api/career-roadmap/milestone
export const updateMilestone = async (req, res) => {
  try {
    const { careerPath, milestoneId, status } = req.body;

    if (!careerPath || !ROADMAP_DATA[careerPath]) {
      return res.status(400).json({ success: false, message: 'Invalid career path' });
    }

    if (!milestoneId || !['Not Started', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid milestoneId or status' });
    }

    let userRoadmap = await CareerRoadmap.findOne({ user: req.user._id });
    if (!userRoadmap) {
      userRoadmap = new CareerRoadmap({
        user: req.user._id,
        selectedPath: careerPath,
        milestonesProgress: new Map()
      });
    }

    // Update milestones map
    const pathMilestones = userRoadmap.milestonesProgress.get(careerPath) || [];

    const existingIdx = pathMilestones.findIndex(m => m.milestoneId === Number(milestoneId));
    if (existingIdx >= 0) {
      pathMilestones[existingIdx].status = status;
      if (status === 'Completed') {
        pathMilestones[existingIdx].completedAt = new Date();
      }
    } else {
      pathMilestones.push({
        milestoneId: Number(milestoneId),
        status: status,
        completedAt: status === 'Completed' ? new Date() : null
      });
    }

    userRoadmap.milestonesProgress.set(careerPath, pathMilestones);
    userRoadmap.markModified('milestonesProgress');
    await userRoadmap.save();

    return getRoadmap(req, res);
  } catch (error) {
    console.error('Update Milestone error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating milestone status' });
  }
};
