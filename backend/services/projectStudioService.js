import ProjectStudio from '../models/ProjectStudio.js';

export const generateProjectIdeasService = async (category = 'Full Stack', difficulty = 'Intermediate') => {
  return [
    {
      title: 'AI Resume & Portfolio Analyzer Engine',
      description: 'Build an automated ATS resume scoring tool with real-time feedback and public portfolio page.',
      difficulty,
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
      estimatedDuration: '2 Weeks',
      learningOutcomes: ['REST API Design', 'State Management', 'Full Stack Deployment'],
      progressPercentage: 0,
      status: 'Idea'
    },
    {
      title: 'Real-time Collaborative Code & Whiteboard Studio',
      description: 'Interactive developer sandbox with live multi-user editing and syntax highlighting.',
      difficulty,
      techStack: ['React', 'WebSockets', 'Node.js', 'Monaco Editor'],
      estimatedDuration: '3 Weeks',
      learningOutcomes: ['Real-time Synchronization', 'Socket Architecture', 'Canvas Rendering'],
      progressPercentage: 0,
      status: 'Idea'
    }
  ];
};

export const getUserProjectsService = async (userId) => {
  return await ProjectStudio.find({ user: userId }).sort({ updatedAt: -1 });
};

export const saveUserProjectService = async (userId, projectData) => {
  return await ProjectStudio.create({
    user: userId,
    ...projectData
  });
};

export const updateProjectProgressService = async (userId, projectId, progressPercentage, status, githubUrl) => {
  const project = await ProjectStudio.findOne({ _id: projectId, user: userId });
  if (!project) {
    throw new Error('Project not found');
  }

  if (progressPercentage !== undefined) project.progressPercentage = progressPercentage;
  if (status) project.status = status;
  if (githubUrl !== undefined) project.githubUrl = githubUrl;

  await project.save();
  return project;
};

export const addProjectNoteService = async (userId, projectId, noteText) => {
  const project = await ProjectStudio.findOne({ _id: projectId, user: userId });
  if (!project) {
    throw new Error('Project not found');
  }

  project.notes.push({ text: noteText });
  await project.save();
  return project;
};

export const toggleProjectBookmarkService = async (userId, projectId) => {
  const project = await ProjectStudio.findOne({ _id: projectId, user: userId });
  if (!project) {
    throw new Error('Project not found');
  }

  project.bookmarked = !project.bookmarked;
  await project.save();
  return project;
};
