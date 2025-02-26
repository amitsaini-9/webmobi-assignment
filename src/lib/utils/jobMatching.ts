// src/lib/utils/jobMatching.ts
import { pineconeIndex } from '../database/pinecone';
import { generateEmbeddings } from './embeddings';
import { ScoredPineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';

export async function findMatchingCandidates(jobDescription: string): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
  try {
    // Generate embeddings for job description
    const jobEmbeddings = await generateEmbeddings(jobDescription);

    // Query Pinecone for similar vectors
    const queryResponse = await pineconeIndex.query({
      vector: jobEmbeddings,
      topK: 5,
      includeMetadata: true
    });

    return queryResponse.matches;
  } catch (error) {
    console.error('Error matching candidates:', error);
    throw error;
  }
}