// src/lib/database/pineconeUtils.ts
import { pineconeIndex } from './pinecone';
import { RecordMetadata } from '@pinecone-database/pinecone';
import { Candidate, CandidateMetadata } from '@/types/candidate';

const EMBEDDING_DIMENSION = 1536;

function validateEmbeddings(embeddings: number[]) {
  if (!Array.isArray(embeddings)) {
    throw new Error('Embeddings must be an array');
  }
  if (embeddings.length !== EMBEDDING_DIMENSION) {
    throw new Error(`Invalid embedding dimension: got ${embeddings.length}, expected ${EMBEDDING_DIMENSION}`);
  }
  if (!embeddings.every(value => typeof value === 'number' && !isNaN(value))) {
    throw new Error('All embedding values must be valid numbers');
  }
}

function sanitizeMetadata(metadata: CandidateMetadata): RecordMetadata {
  return {
    type: 'candidate',
    name: String(metadata.name || ''),
    email: String(metadata.email || ''),
    linkedinUrl: String(metadata.linkedinUrl || ''),
    skills: metadata.skills.join(','),
    experience: String(metadata.experience || ''),
    education: String(metadata.education || ''),
    resumeText: String(metadata.resumeText || ''),
    analysis: String(metadata.analysis || ''),
  };
}

function sanitizePartialMetadata(metadata: Partial<CandidateMetadata>): RecordMetadata {
  const sanitized: RecordMetadata = {
    type: 'candidate'
  };

  if (metadata.name !== undefined) sanitized.name = String(metadata.name);
  if (metadata.email !== undefined) sanitized.email = String(metadata.email);
  if (metadata.linkedinUrl !== undefined) sanitized.linkedinUrl = String(metadata.linkedinUrl);
  if (metadata.skills !== undefined) sanitized.skills = metadata.skills.join(',');
  if (metadata.experience !== undefined) sanitized.experience = String(metadata.experience);
  if (metadata.education !== undefined) sanitized.education = String(metadata.education);
  if (metadata.resumeText !== undefined) sanitized.resumeText = String(metadata.resumeText);
  if (metadata.analysis !== undefined) sanitized.analysis = String(metadata.analysis);

  return sanitized;
}

export async function upsertCandidate(
  id: string,
  embeddings: number[],
  metadata: CandidateMetadata
) {
  try {
    validateEmbeddings(embeddings);
    const sanitizedMetadata = sanitizeMetadata(metadata);

    await pineconeIndex.upsert([{
      id,
      values: embeddings,
      metadata: sanitizedMetadata
    }]);

    return { success: true, id };
  } catch (error) {
    console.error('Error upserting candidate:', error);
    throw error;
  }
}

export async function getCandidates(): Promise<Candidate[]> {
  try {
    const queryResponse = await pineconeIndex.query({
      vector: Array(EMBEDDING_DIMENSION).fill(0),
      topK: 10000,
      includeMetadata: true,
      filter: { type: { $eq: 'candidate' } }
    });

    return queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: {
        type: 'candidate',
        name: String(match.metadata?.name || ''),
        email: String(match.metadata?.email || ''),
        linkedinUrl: String(match.metadata?.linkedinUrl || ''),
        skills: (match.metadata?.skills as string)?.split(',') || [],
        experience: String(match.metadata?.experience || ''),
        education: String(match.metadata?.education || ''),
        resumeText: String(match.metadata?.resumeText || ''),
        analysis: String(match.metadata?.analysis || '')
      }
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
}

export async function updateCandidate(
  id: string,
  embeddings: number[],
  metadata: Partial<CandidateMetadata>
) {
  try {
    validateEmbeddings(embeddings);

    const sanitizedMetadata = sanitizePartialMetadata(metadata);

    await pineconeIndex.upsert([{
      id,
      values: embeddings,
      metadata: sanitizedMetadata
    }]);

    return { success: true, id };
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
}

export async function deleteCandidate(id: string) {
  try {
    await pineconeIndex.deleteOne(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
}

export async function testPineconeConnection() {
  try {
    const stats = await pineconeIndex.describeIndexStats();
    return { success: true, stats };
  } catch (error) {
    console.error('Error testing connection:', error);
    throw error;
  }
}

export async function validateIndexDimension() {
  try {
    const stats = await pineconeIndex.describeIndexStats();
    const indexDimension = stats.dimension;

    if (indexDimension !== EMBEDDING_DIMENSION) {
      throw new Error(`Index dimension mismatch: expected ${EMBEDDING_DIMENSION}, got ${indexDimension}`);
    }

    return { success: true, dimension: indexDimension };
  } catch (error) {
    console.error('Error validating index dimension:', error);
    throw error;
  }
}