/**
 * Rule-based & Deterministic Answer Evaluation Service
 * Evaluates candidate responses based on completeness, word count, expected topics, and STAR framework criteria.
 */
export const evaluateAnswerService = async (category, difficulty, questionObj, answerText) => {
  const trimmedAnswer = (answerText || '').trim();
  if (!trimmedAnswer) {
    return {
      score: 0,
      feedback: 'No answer was provided for this question.',
      strengths: [],
      improvements: ['Please provide a comprehensive response before submitting.']
    };
  }

  const words = trimmedAnswer.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const lowerAnswer = trimmedAnswer.toLowerCase();

  // 1. Keyword Topic Matching
  const expectedTopics = questionObj?.expectedTopics || [];
  let topicMatches = 0;
  expectedTopics.forEach(topic => {
    if (lowerAnswer.includes(topic.toLowerCase())) {
      topicMatches++;
    }
  });

  const topicRatio = expectedTopics.length > 0 ? topicMatches / expectedTopics.length : 0.5;

  // 2. STAR Method Analysis (for Behavioral / HR)
  const starKeywords = ['situation', 'task', 'action', 'result', 'impact', 'challenge', 'outcome', 'resolved', 'led'];
  let starCount = 0;
  starKeywords.forEach(kw => {
    if (lowerAnswer.includes(kw)) starCount++;
  });

  // 3. Score Calculation (0 - 100)
  let baseScore = 50;

  // Length scoring
  if (wordCount >= 100) baseScore += 25;
  else if (wordCount >= 50) baseScore += 18;
  else if (wordCount >= 25) baseScore += 10;
  else baseScore -= 15;

  // Topic relevance scoring
  baseScore += Math.round(topicRatio * 20);

  // STAR / Structural depth scoring
  if (category === 'Behavioral' || category === 'HR') {
    baseScore += Math.min(15, starCount * 4);
  } else {
    // Technical depth keywords
    const techKeywords = ['architecture', 'performance', 'security', 'scale', 'optimize', 'database', 'api', 'state', 'component', 'testing'];
    let techCount = 0;
    techKeywords.forEach(kw => {
      if (lowerAnswer.includes(kw)) techCount++;
    });
    baseScore += Math.min(15, techCount * 3);
  }

  // Difficulty adjustment
  if (difficulty === 'Advanced' && wordCount < 40) baseScore -= 10;
  if (difficulty === 'Beginner' && wordCount >= 30) baseScore += 5;

  const finalScore = Math.min(100, Math.max(10, Math.round(baseScore)));

  // 4. Construct Feedback, Strengths & Improvements
  const strengths = [];
  const improvements = [];
  let feedback = '';

  if (finalScore >= 85) {
    feedback = 'Excellent answer! You demonstrated strong technical depth, clear structural breakdown, and addressed key concepts effectively.';
    strengths.push('Comprehensive elaboration with relevant terminologies.');
    if (topicMatches > 0) strengths.push(`Covered essential topics: ${expectedTopics.slice(0, 3).join(', ')}.`);
    strengths.push('Clear, professional communication tone.');
  } else if (finalScore >= 70) {
    feedback = 'Good response! You hit important concepts, though further elaboration and real-world examples would elevate your score.';
    strengths.push('Solid foundational understanding of the core question.');
    if (wordCount >= 40) strengths.push('Good answer length and articulation.');
    improvements.push('Elaborate on real-world engineering trade-offs or production edge cases.');
    if (expectedTopics.length > topicMatches) {
      improvements.push(`Include concepts like: ${expectedTopics.filter(t => !lowerAnswer.includes(t.toLowerCase())).slice(0, 2).join(', ')}.`);
    }
  } else if (finalScore >= 50) {
    feedback = 'Fair attempt. Your answer touches on the subject but lacks sufficient depth, structure, or technical specifics.';
    strengths.push('Attempted to answer the prompt directly.');
    improvements.push('Increase response length by providing detailed examples or architecture diagrams in text.');
    if (category === 'Behavioral') {
      improvements.push('Use the STAR methodology: Situation, Task, Action, Result.');
    } else {
      improvements.push('Explain underlying mechanics (e.g. async event loop, database indexing, or state flow).');
    }
  } else {
    feedback = 'Needs Improvement. The response is too brief or lacks key technical concepts needed for an engineering interview.';
    improvements.push('Provide a structured response with at least 50+ words.');
    improvements.push(`Focus on core topics such as: ${expectedTopics.slice(0, 3).join(', ')}.`);
  }

  return {
    score: finalScore,
    feedback,
    strengths: strengths.length > 0 ? strengths : ['Attempted practice response.'],
    improvements: improvements.length > 0 ? improvements : ['Elaborate further using structured examples.']
  };
};
