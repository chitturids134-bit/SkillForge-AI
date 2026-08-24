/**
 * ATS Resume Analyzer Service
 * Evaluates resumes against typical applicant tracking system heuristics
 */

export const calculateATSScore = (resume) => {
  if (!resume) {
    return {
      score: 0,
      grade: 'Needs Improvement',
      strengths: [],
      missingSections: ['Personal Info', 'Summary', 'Skills', 'Education', 'Projects', 'Experience', 'Certifications'],
      suggestions: ['Please create a resume to begin analysis.'],
      sectionScores: {
        personalInfo: 0,
        summary: 0,
        skills: 0,
        education: 0,
        projects: 0,
        experience: 0,
        certifications: 0,
        links: 0
      },
      categories: {
        formatting: 0,
        keywords: 0,
        content: 0
      }
    };
  }

  const personalInfo = resume.personalInfo || {};
  const education = resume.education || [];
  const skills = resume.skills || [];
  const projects = resume.projects || [];
  const experience = resume.experience || [];
  const certifications = resume.certifications || [];

  let personalInfoScore = 0;
  let summaryScore = 0;
  let skillsScore = 0;
  let educationScore = 0;
  let projectsScore = 0;
  let experienceScore = 0;
  let certificationsScore = 0;
  let linksScore = 0;

  const strengths = [];
  const missingSections = [];
  const suggestions = [];

  // 1. Personal Information (Max 15)
  if (personalInfo.fullName && personalInfo.fullName.trim() !== '') personalInfoScore += 5;
  if (personalInfo.email && personalInfo.email.trim() !== '') personalInfoScore += 5;
  if (personalInfo.phone && personalInfo.phone.trim() !== '') personalInfoScore += 5;

  if (personalInfoScore === 15) {
    strengths.push('Complete contact info: Name, Email, and Phone number are available.');
  } else {
    suggestions.push('Complete all contact information (FullName, Email, Phone) inside Personal Details.');
  }

  // 2. Professional Summary (Max 10)
  const summaryText = personalInfo.summary || '';
  if (summaryText.trim() !== '') {
    if (summaryText.trim().length >= 100) {
      summaryScore = 10;
      strengths.push('Strong summary: Detailed and comprehensive profile statement.');
    } else if (summaryText.trim().length >= 30) {
      summaryScore = 5;
      suggestions.push('Expand your professional summary to be more detailed (aim for 100+ characters).');
    } else {
      summaryScore = 3;
      suggestions.push('Expand your professional summary (currently too short).');
    }
  } else {
    missingSections.push('Professional Summary');
    suggestions.push('Add a professional summary statement introducing your expertise.');
  }

  // 3. Skills (Max 15)
  const uniqueSkills = new Set(skills.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim()).filter(Boolean));
  const duplicateFound = skills.length !== uniqueSkills.size;
  const uniqueCount = uniqueSkills.size;

  if (uniqueCount >= 5) {
    skillsScore = 15;
    strengths.push(`Rich skillset: Evaluated ${uniqueCount} unique technical skills.`);
  } else if (uniqueCount > 0) {
    skillsScore = Math.min(15, uniqueCount * 3);
    suggestions.push(`List at least 5 distinct skills (currently listed: ${uniqueCount}).`);
  } else {
    missingSections.push('Skills');
    suggestions.push('Add key skills to your resume.');
  }

  if (duplicateFound) {
    suggestions.push('Remove duplicate skills from your skills list.');
  }

  // 4. Education (Max 10)
  if (education.length > 0) {
    educationScore = 10;
    strengths.push('Academic qualifications: Detailed education entries are present.');
  } else {
    missingSections.push('Education');
    suggestions.push('Add your education history (degree, field of study, school).');
  }

  // 5. Projects (Max 20)
  if (projects.length > 0) {
    let projectDetailScore = 0;
    projects.forEach((proj, idx) => {
      if (idx >= 2) return;
      let projScore = 0;
      if (proj.title && proj.title.trim() !== '') projScore += 2;
      if (proj.description && proj.description.trim().length > 20) projScore += 3;
      else if (proj.title) suggestions.push(`Add project description details for '${proj.title}'.`);

      if (proj.technologies && proj.technologies.length > 0) projScore += 2;
      else if (proj.title) suggestions.push(`Specify technical stack or tools used in project '${proj.title}'.`);

      if (proj.githubUrl && proj.githubUrl.trim() !== '') projScore += 1.5;
      else if (proj.title) suggestions.push(`Add GitHub repository link for '${proj.title}'.`);

      if (proj.liveUrl && proj.liveUrl.trim() !== '') projScore += 1.5;
      else if (proj.title) suggestions.push(`Add live prototype demo link for '${proj.title}'.`);

      projectDetailScore += projScore;
    });

    projectsScore = Math.min(20, projects.length === 1 ? projectDetailScore * 2 : projectDetailScore);
    strengths.push(`Project portfolio: Added ${projects.length} project entry/entries.`);
  } else {
    missingSections.push('Projects');
    suggestions.push('Add hands-on project details to show technical capabilities.');
  }

  // 6. Experience (Max 15)
  if (experience.length > 0) {
    experienceScore = 15;
    strengths.push(`Work History: Listed ${experience.length} professional experience entries.`);
  } else {
    missingSections.push('Experience');
    suggestions.push('Add work experience or internship logs.');
  }

  // 7. Certifications (Max 10)
  if (certifications.length > 0) {
    certificationsScore = 10;
    strengths.push(`Certificates: Listed ${certifications.length} professional training certifications.`);
  } else {
    missingSections.push('Certifications');
    suggestions.push('Add professional certificates or training badges.');
  }

  // 8. Professional Links (Max 5)
  if (personalInfo.githubUrl && personalInfo.githubUrl.trim() !== '') linksScore += 1.5;
  else suggestions.push('Add your GitHub profile link to your personal details.');

  if (personalInfo.linkedinUrl && personalInfo.linkedinUrl.trim() !== '') linksScore += 1.5;
  else suggestions.push('Add your LinkedIn profile link to your personal details.');

  if (personalInfo.portfolioUrl && personalInfo.portfolioUrl.trim() !== '') linksScore += 2;
  else suggestions.push('Add a personal portfolio website link to showcase work.');

  if (linksScore === 5) {
    strengths.push('Linked portfolios: Standard professional links (GitHub, LinkedIn, Portfolio) are complete.');
  }

  const totalScore = Math.min(100, Math.round(
    personalInfoScore +
    summaryScore +
    skillsScore +
    educationScore +
    projectsScore +
    experienceScore +
    certificationsScore +
    linksScore
  ));

  let grade = 'Needs Improvement';
  if (totalScore >= 90) {
    grade = 'Excellent';
  } else if (totalScore >= 75) {
    grade = 'Good';
  } else if (totalScore >= 60) {
    grade = 'Average';
  }

  const categories = {
    formatting: Math.min(100, Math.round((personalInfoScore + linksScore) * 5)),
    keywords: Math.min(100, Math.round(skillsScore * 6.6)),
    content: Math.min(100, Math.round((summaryScore + projectsScore + experienceScore) * 2.2))
  };

  return {
    score: totalScore,
    grade,
    strengths,
    missingSections,
    suggestions,
    sectionScores: {
      personalInfo: personalInfoScore,
      summary: summaryScore,
      skills: skillsScore,
      education: educationScore,
      projects: Math.round(projectsScore),
      experience: experienceScore,
      certifications: certificationsScore,
      links: Math.round(linksScore)
    },
    categories
  };
};

export const analyzeResume = calculateATSScore;

export default calculateATSScore;
