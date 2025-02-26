// src/types/job.ts
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  createdAt: string;
}