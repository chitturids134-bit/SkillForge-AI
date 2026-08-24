/**
 * SkillForge AI - Server-Side AI Structured Output Validator
 * 
 * Validates AI-generated structured evaluation JSON schemas to ensure
 * malformed, incomplete, or corrupted AI responses are rejected before
 * database persistence.
 */

export class StructuredOutputValidationError extends Error {
  constructor(message, validationErrors = []) {
    super(message);
    this.name = 'StructuredOutputValidationError';
    this.validationErrors = validationErrors;
    this.statusCode = 422;
  }
}

/**
 * Validates an AI evaluation payload against the required schema.
 * 
 * Required Schema Structure:
 * {
 *   overallScore: Number (0-100),
 *   categories: { technical: Number, communication: Number, problemSolving: Number },
 *   strengths: Array<String>,
 *   weaknesses: Array<String>,
 *   recommendation: String,
 *   summary: String
 * }
 */
export function validateAiEvaluationSchema(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    throw new StructuredOutputValidationError('AI Evaluation payload must be a valid JSON object.', ['Payload is null or not an object.']);
  }

  // 1. Validate overallScore
  if (typeof payload.overallScore !== 'number' || payload.overallScore < 0 || payload.overallScore > 100) {
    errors.push('overallScore must be a number between 0 and 100.');
  }

  // 2. Validate categories subdocument
  if (!payload.categories || typeof payload.categories !== 'object') {
    errors.push('categories subdocument is required.');
  } else {
    const { technical, communication, problemSolving } = payload.categories;
    if (typeof technical !== 'number' || technical < 0 || technical > 100) {
      errors.push('categories.technical must be a number between 0 and 100.');
    }
    if (typeof communication !== 'number' || communication < 0 || communication > 100) {
      errors.push('categories.communication must be a number between 0 and 100.');
    }
    if (typeof problemSolving !== 'number' || problemSolving < 0 || problemSolving > 100) {
      errors.push('categories.problemSolving must be a number between 0 and 100.');
    }
  }

  // 3. Validate strengths
  if (!Array.isArray(payload.strengths)) {
    errors.push('strengths must be an array of strings.');
  } else if (payload.strengths.some(item => typeof item !== 'string')) {
    errors.push('all items in strengths array must be strings.');
  }

  // 4. Validate weaknesses
  if (!Array.isArray(payload.weaknesses)) {
    errors.push('weaknesses must be an array of strings.');
  } else if (payload.weaknesses.some(item => typeof item !== 'string')) {
    errors.push('all items in weaknesses array must be strings.');
  }

  // 5. Validate recommendation & summary
  if (typeof payload.recommendation !== 'string' || !payload.recommendation.trim()) {
    errors.push('recommendation must be a non-empty string.');
  }

  if (typeof payload.summary !== 'string' || !payload.summary.trim()) {
    errors.push('summary must be a non-empty string.');
  }

  if (errors.length > 0) {
    console.error('[AI STRUCTURED OUTPUT VALIDATOR FAILURE]', {
      errorCount: errors.length,
      errors
    });
    throw new StructuredOutputValidationError('AI Evaluation payload failed server-side schema validation.', errors);
  }

  return {
    valid: true,
    data: {
      overallScore: Math.round(payload.overallScore),
      categories: {
        technical: Math.round(payload.categories.technical),
        communication: Math.round(payload.categories.communication),
        problemSolving: Math.round(payload.categories.problemSolving)
      },
      strengths: payload.strengths.map(s => s.trim()).filter(Boolean),
      weaknesses: payload.weaknesses.map(w => w.trim()).filter(Boolean),
      recommendation: payload.recommendation.trim(),
      summary: payload.summary.trim()
    }
  };
}
