export const RESUME_TEMPLATES = [
  {
    id: 'silicon-valley-ai',
    title: 'Silicon Valley AI Specialist',
    tag: 'POPULAR',
    rating: '4.9',
    atsScore: 95,
    category: 'Technology',
    desc: 'Minimalist tech layout optimized for AI Engineers, ML Specialists & Full Stack Developers.',
    recommendedFor: ['AI Engineers', 'Full Stack Developers', 'Machine Learning Engineers'],
    accentColor: '#8B5CF6',
    layout: 'modern-tech',
  },
  {
    id: 'executive-lead',
    title: 'Executive Engineering Lead',
    tag: 'ATS OPTIMIZED',
    rating: '4.8',
    atsScore: 92,
    category: 'Leadership',
    desc: 'Clean single-column format tailored for Senior Developers, Tech Leads & Engineering Managers.',
    recommendedFor: ['Engineering Managers', 'Tech Leads', 'Principal Architects'],
    accentColor: '#3B82F6',
    layout: 'executive',
  },
  {
    id: 'modern-creative',
    title: 'Modern Creative Developer',
    tag: 'TRENDING',
    rating: '4.9',
    atsScore: 90,
    category: 'Creative',
    desc: 'Vibrant dual-accent design perfect for Frontend Engineers, UI/UX Engineers & Product Designers.',
    recommendedFor: ['Frontend Developers', 'UI/UX Engineers', 'Product Designers'],
    accentColor: '#EC4899',
    layout: 'creative',
  },
  {
    id: 'faang-standard',
    title: 'FAANG Standard ATS',
    tag: 'HIGH SCORE',
    rating: '5.0',
    atsScore: 98,
    category: 'ATS Standard',
    desc: 'Strict ATS compliance design guaranteed to score 90+ on major enterprise resume parsers.',
    recommendedFor: ['Systems Engineers', 'Backend Engineers', 'DevOps Specialists'],
    accentColor: '#10B981',
    layout: 'classic-ats',
  },
];

export const SAMPLE_PREVIEW_DATA = {
  personalInfo: {
    fullName: 'Alex Morgan',
    headline: 'Senior Full-Stack & AI Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    address: 'San Francisco, CA',
    githubUrl: 'github.com/alexmorgan',
    linkedinUrl: 'linkedin.com/in/alexmorgan',
    portfolioUrl: 'alexmorgan.dev',
    summary: 'Accomplished Full-Stack Engineer with 6+ years building high-scalability web applications and AI-driven microservices. Expertise in React, Node.js, TypeScript, and LLM integrations. Proven track record leading engineering teams to deliver enterprise SaaS solutions.'
  },
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'GraphQL', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'TailwindCSS', 'CI/CD'],
  experience: [
    {
      company: 'TechCorp Solutions',
      role: 'Senior Full-Stack Engineer',
      location: 'San Francisco, CA',
      startMonthYear: 'Jan 2023',
      endMonthYear: 'Present',
      current: true,
      description: 'Architected and launched real-time analytics dashboard servicing 200k+ daily active users. Reduced API latencies by 42% through Redis caching and query optimizations.'
    },
    {
      company: 'InnovateX Labs',
      role: 'Software Engineer',
      location: 'Austin, TX',
      startMonthYear: 'Jun 2020',
      endMonthYear: 'Dec 2022',
      current: false,
      description: 'Developed microservices backend in Node.js and TypeScript. Integrated payment webhooks and automated automated CI/CD pipeline deployments on AWS EKS.'
    }
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      fieldOfStudy: 'Computer Science',
      startYear: '2016',
      endYear: '2020',
      gpa: '3.8 / 4.0'
    }
  ],
  projects: [
    {
      title: 'SkillForge AI Platform',
      technologies: 'React, Node.js, MongoDB, OpenAI API',
      description: 'End-to-end AI career growth platform offering resume optimization, interview prep, and roadmap generation.'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2023'
    }
  ]
};
