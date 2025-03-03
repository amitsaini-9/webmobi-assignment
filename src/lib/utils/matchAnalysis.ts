import { MatchAnalysis } from '@/types/matching';
import { generateGeminiResponse } from './gemini';
import { RecordMetadata } from '@pinecone-database/pinecone';


export async function analyzeMatch(
  jobData: RecordMetadata | undefined,
  candidateData: RecordMetadata | undefined
): Promise<MatchAnalysis> {
  try {
    if (!jobData || !candidateData) {
      return {
        skillsMatch: [],
        missingSkills: [],
        experienceMatch: 'No data available for comparison',
        overallFit: 'Unable to analyze due to missing data',
        scores: {
          skillsScore: 0,
          experienceScore: 0,
          overallScore: 0
        }
      };
    }

    const jobSkills = (jobData.skills as string || '').split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const candidateSkills = (candidateData.skills as string || '').split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const skillsMatch = jobSkills.filter(skill =>
      candidateSkills.includes(skill)
    );

    const missingSkills = jobSkills.filter(skill =>
      !candidateSkills.includes(skill)
    );

    const skillsScore = jobSkills.length > 0 ? skillsMatch.length / jobSkills.length : 0;

    const experienceScore = calculateExperienceScore(
      jobData.experience as string || '',
      candidateData.experience as string || ''
    );

    const prompt = `
      Analyze this job-candidate match:

      Job Requirements:
      Title: ${jobData.title || 'Not specified'}
      Required Skills: ${jobData.skills || 'Not specified'}
      Required Experience: ${jobData.experience || 'Not specified'}
      
      Candidate Profile:
      Skills: ${candidateData.skills || 'Not specified'}
      Experience: ${candidateData.experience || 'Not specified'}
      Education: ${candidateData.education || 'Not specified'}

      Provide a brief analysis focusing on:
      1. Experience match assessment (1-2 sentences)
      2. Overall fit evaluation (2-3 sentences)
      
      Keep the response concise and actionable.
    `;

    const analysis = await generateGeminiResponse(prompt);

    // Calculate overall score
    const overallScore = (skillsScore + experienceScore) / 2;

    return {
      skillsMatch,
      missingSkills,
      experienceMatch: evaluateExperience(
        jobData.experience as string || '',
        candidateData.experience as string || ''
      ),
      overallFit: analysis,
      scores: {
        skillsScore,
        experienceScore,
        overallScore
      }
    };
  } catch (error) {
    console.error('Error analyzing match:', error);
    return {
      skillsMatch: [],
      missingSkills: [],
      experienceMatch: 'Error analyzing experience match',
      overallFit: 'Error performing analysis',
      scores: {
        skillsScore: 0,
        experienceScore: 0,
        overallScore: 0
      }
    };
  }
}

function evaluateExperience(requiredExp: string, candidateExp: string): string {
  if (!requiredExp || !candidateExp) {
    return 'Experience information not available';
  }
  return `Experience evaluation: ${candidateExp} vs Required: ${requiredExp}`;
}

function calculateExperienceScore(requiredExp: string, candidateExp: string): number {
  if (!requiredExp || !candidateExp) {
    return 0;
  }

  const requiredYears = extractYears(requiredExp);
  const candidateYears = extractYears(candidateExp);

  if (candidateYears >= requiredYears) return 1;
  return candidateYears / requiredYears;
}

function extractYears(text: string): number {
  const yearMatch = text.match(/(\d+)(?=\s*(?:year|yr)s?)/i);
  return yearMatch ? parseInt(yearMatch[1]) : 0;
}