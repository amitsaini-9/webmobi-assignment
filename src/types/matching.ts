import { Candidate } from "@/types/candidate";


export interface Match {
  candidate: Candidate;
  score: number;
  matchDetails: MatchDetails;
}
export interface MatchDetails {
  skillsMatch: string[];
  missingSkills: string[];
  experienceMatch: string;
  overallFit: string;
  scores: {
    skillsScore: number;
    experienceScore: number;
    overallScore: number;
  };
}
export interface CandidateMetadata {
  name: string;
  email: string;
  skills: string;
  experience: string;
  education: string;
}
export interface MatchResult {
  candidate: Candidate;
  score: number;
  matchDetails: {
    skillsMatch: string[];
    missingSkills: string[];
    experienceMatch: string;
    overallFit: string;
  };
}
export interface MatchAnalysis {
  skillsMatch: string[];
  missingSkills: string[];
  experienceMatch: string;
  overallFit: string;
  scores: {
    skillsScore: number;
    experienceScore: number;
    overallScore: number;
  };
}
