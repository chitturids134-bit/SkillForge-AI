// Dashboard mock data constants for modular and clean structure

export const MOCK_WEEKLY_DATA = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 4 },
  { day: 'Wed', hours: 3.5 },
  { day: 'Thu', hours: 5 },
  { day: 'Fri', hours: 3 },
  { day: 'Sat', hours: 6 },
  { day: 'Sun', hours: 4.5 },
];

export const MOCK_SKILLS_DATA = [
  { skill: 'Frontend', level: 85 },
  { skill: 'Backend', level: 75 },
  { skill: 'Database', level: 70 },
  { skill: 'DevOps', level: 50 },
  { skill: 'Testing', level: 60 },
];

export const MOCK_AI_RECOMMENDATIONS = [
  {
    id: 1,
    title: 'Strengthen System Design Foundations',
    description: 'Based on your backend skill ratings, we recommend taking a System Design micro-assessment.',
    type: 'Assessment',
    priority: 'High',
  },
  {
    id: 2,
    title: 'Boost React Performance Tuning',
    description: 'Add advanced rendering optimization projects to showcase high-level skills on your profile.',
    type: 'Project',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Refine Behavioral Interview Pitch',
    description: 'Your interview readiness score can be improved by practicing key STAR method questions.',
    type: 'Interview',
    priority: 'High',
  },
];

export const DEFAULT_STATS = {
  skillsCount: 0, // Dynamic from profile
  projectsCount: 3,
  resumeScore: 82,
  interviewReadiness: 65,
};
