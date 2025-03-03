import { RecordMetadata } from "@pinecone-database/pinecone";


export interface Job {
  id: string;
  metadata: JobMetadata;
  score: number;

}
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

export interface JobData {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
}

export interface JobMetadata extends RecordMetadata {
  type: 'job';
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills: string;
  experience: string;
  createdAt: string;
}
export interface JobDescriptionFormProps {
  onSuccess?: () => void;
}