export interface MatchDetails {
  skillsMatch: string[];
  missingSkills: string[];
  experienceMatch: string;
  overallFit: string;
}

export interface CandidateMetadata {
  name: string;
  email: string;
  skills: string;
  experience: string;
  education: string;
}

export interface MatchResult {
  candidate: {
    id: string;
    metadata: CandidateMetadata;
  };
  score: number;
  matchDetails: MatchDetails;
}