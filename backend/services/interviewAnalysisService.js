/**
 * Rule-based Interview Analysis Service
 * Evaluates answer completeness, response word counts, and keywords to generate a complete report.
 */
export const analyzeInterview = (category, difficulty, questions) => {
  const totalCount = questions.length;
  const answeredCount = questions.filter(q => q.answer && q.answer.trim() !== '').length;
  
  // 1. Completion Percentage
  const completionPercentage = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // 2. Average Word Length of Answered Questions
  let totalWords = 0;
  let hasProblemSolvingKeywords = 0;
  
  const problemKeywords = ['resolve', 'solution', 'challenge', 'result', 'impact', 'star', 'team', 'design', 'debug', 'fix', 'scale', 'optimize'];

  questions.forEach(q => {
    if (q.answer && q.answer.trim() !== '') {
      const words = q.answer.trim().split(/\s+/).filter(w => w.length > 0).length;
      totalWords += words;

      // Check keywords
      const ansLower = q.answer.toLowerCase();
      problemKeywords.forEach(kw => {
        if (ansLower.includes(kw)) {
          hasProblemSolvingKeywords++;
        }
      });
    }
  });

  const avgWords = answeredCount > 0 ? Math.round(totalWords / answeredCount) : 0;

  // 3. Section Scores (0-100)
  // Technical Score: Influenced heavily by category and completion
  let technicalScore = 0;
  if (category === 'Technical') {
    technicalScore = Math.round(completionPercentage * 0.7 + Math.min(30, avgWords * 0.5));
  } else {
    technicalScore = Math.round(completionPercentage * 0.5 + 30);
  }
  technicalScore = Math.min(100, Math.max(0, technicalScore));

  // Communication Score: Influenced by response lengths
  let communicationScore = Math.min(100, Math.max(10, Math.round(completionPercentage * 0.4 + Math.min(60, avgWords * 1.2))));

  // Confidence Score: Influenced by completion rate and length consistency
  let confidenceScore = Math.min(100, Math.max(10, Math.round(completionPercentage * 0.8 + (avgWords > 25 ? 20 : 5))));

  // Problem Solving Score: Influenced by keyword presence and completion
  let problemSolvingScore = Math.min(100, Math.max(10, Math.round(completionPercentage * 0.6 + Math.min(40, hasProblemSolvingKeywords * 8))));

  // Overall Score: Average of section scores
  const overallScore = Math.round((technicalScore + communicationScore + confidenceScore + problemSolvingScore) / 4);

  // 4. Interview Readiness Level
  let readinessLevel = 'Beginner';
  if (overallScore >= 90) readinessLevel = 'Excellent';
  else if (overallScore >= 75) readinessLevel = 'Very Good';
  else if (overallScore >= 60) readinessLevel = 'Good';
  else if (overallScore >= 40) readinessLevel = 'Needs Improvement';

  // 5. Strengths, Weaknesses, and Suggestions
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  // Evaluate Completion
  if (completionPercentage === 100) {
    strengths.push('Completed all questions in the practice session.');
  } else if (completionPercentage >= 70) {
    strengths.push('Attempted a high ratio of the questions.');
    weaknesses.push('Left a few questions unanswered.');
    suggestions.push('Try to provide at least a brief outline for skipped questions.');
  } else {
    weaknesses.push('Low completion percentage limits validation of skill level.');
    suggestions.push('Complete all questions to fully demonstrate your capabilities.');
  }

  // Evaluate Response Length
  if (avgWords >= 60) {
    strengths.push('Responses are detailed and establish key technical context.');
  } else if (avgWords >= 25) {
    strengths.push('Responses are clear and straight to the point.');
    suggestions.push('Elaborate further on your structural decisions using the STAR framework.');
  } else {
    weaknesses.push('Brief responses lack required depth.');
    suggestions.push('Increase response length by including examples, architectures, or scenarios.');
  }

  // Evaluate Keyword/Structural depth
  if (hasProblemSolvingKeywords >= 4) {
    strengths.push('Showcases structured analytical terminology (resolutions, results, scaling).');
  } else {
    weaknesses.push('Responses could benefit from more structured problem-solving terminologies.');
    suggestions.push('Include mentions of impact, bottlenecks, and teamwork in your HR and behavioral descriptions.');
  }

  // General default cards if arrays are too short
  if (strengths.length === 0) strengths.push('Willingness to practice and undergo assessment.');
  if (weaknesses.length === 0) weaknesses.push('Response elaboration consistency.');
  if (suggestions.length === 0) suggestions.push('Utilize the STAR method: Situation, Task, Action, Result.');

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    readinessLevel,
    strengths,
    weaknesses,
    suggestions
  };
};
