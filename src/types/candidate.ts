// src/types/candidate.ts
// First, create a types file to share interfaces across components
import { RecordMetadata } from '@pinecone-database/pinecone';

export interface CandidateMetadata extends RecordMetadata {
  name: string;
  email: string;
  linkedinUrl: string;
  skills: string[];
  experience: string;
  education: string;
  analysis: string;
  resumeText: string;
}

export interface Candidate {
  id: string;
  score: number;
  metadata: CandidateMetadata;
}

export interface MatchedCandidate {
  score: number;
  candidate: CandidateMetadata;
}