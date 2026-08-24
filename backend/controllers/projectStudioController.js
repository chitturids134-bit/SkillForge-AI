import {
  generateProjectIdeasService,
  getUserProjectsService,
  saveUserProjectService,
  updateProjectProgressService,
  addProjectNoteService,
  toggleProjectBookmarkService,
} from '../services/projectStudioService.js';

// @desc    Generate AI project ideas
// @route   GET /api/projects/ideas
// @access  Private
export const generateIdeas = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const ideas = await generateProjectIdeasService(category, difficulty);
    res.status(200).json({
      status: 'success',
      ideas,
    });
  } catch (error) {
    console.error('GenerateIdeas Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate project ideas',
    });
  }
};

// @desc    Get user projects
// @route   GET /api/projects/me
// @access  Private
export const getUserProjects = async (req, res) => {
  try {
    const projects = await getUserProjectsService(req.user.id);
    res.status(200).json({
      status: 'success',
      projects,
    });
  } catch (error) {
    console.error('GetUserProjects Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch user projects',
    });
  }
};

// @desc    Save new project to studio
// @route   POST /api/projects
// @access  Private
export const saveProject = async (req, res) => {
  try {
    const project = await saveUserProjectService(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      project,
    });
  } catch (error) {
    console.error('SaveProject Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save project',
    });
  }
};

// @desc    Update project progress & status
// @route   PUT /api/projects/:id/progress
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { progressPercentage, status, githubUrl } = req.body;
    const project = await updateProjectProgressService(
      req.user.id,
      req.params.id,
      progressPercentage,
      status,
      githubUrl
    );
    res.status(200).json({
      status: 'success',
      project,
    });
  } catch (error) {
    console.error('UpdateProgress Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update project progress',
    });
  }
};

// @desc    Add note to project
// @route   POST /api/projects/:id/notes
// @access  Private
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ status: 'error', message: 'Note text is required' });
    }
    const project = await addProjectNoteService(req.user.id, req.params.id, text);
    res.status(200).json({
      status: 'success',
      project,
    });
  } catch (error) {
    console.error('AddNote Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add project note',
    });
  }
};

// @desc    Toggle project bookmark
// @route   POST /api/projects/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const project = await toggleProjectBookmarkService(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      project,
    });
  } catch (error) {
    console.error('ToggleBookmark Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to toggle bookmark',
    });
  }
};
