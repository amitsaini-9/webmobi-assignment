// src/lib/utils/embeddings.ts
import { NextResponse } from 'next/server';

const EMBEDDING_DIMENSION = 1536;
const MAX_ANALYSIS_LENGTH = 500; // Add maximum length constant
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    console.log('Generating embeddings using Gemini...');

    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
                Analyze this candidate profile briefly (max 500 words):
                ${text}

                Provide a concise analysis of:
                1. Key technical skills (2-3 sentences)
                2. Experience highlights (2-3 sentences)
                3. Educational relevance (1-2 sentences)
                4. Overall potential (1-2 sentences)

                Keep the analysis focused and under 500 words.
              `
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    const analysis = result.candidates[0].content.parts[0].text;

    // Convert analysis to vector
    const vector = new Array(EMBEDDING_DIMENSION).fill(0);
    const textEncoder = new TextEncoder();
    const encoded = textEncoder.encode(analysis);

    // Fill vector with normalized values
    for (let i = 0; i < encoded.length && i < EMBEDDING_DIMENSION; i++) {
      vector[i] = encoded[i] / 255;
    }

    // Fill remaining positions with deterministic values
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }

    for (let i = encoded.length; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = (Math.sin(hash + i) + 1) / 2;
    }

    console.log('Embeddings generated successfully');
    return vector;

  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeCandidate(candidateData: {
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
  resumeText?: string;
}) {
  try {
    const text = `
      Candidate Name: ${candidateData.name}
      Email: ${candidateData.email}
      Skills: ${candidateData.skills.join(', ')}
      Experience: ${candidateData.experience}
      Education: ${candidateData.education}
      ${candidateData.resumeText ? `Additional Information: ${candidateData.resumeText}` : ''}
    `;

    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
                Provide a concise analysis of this candidate (maximum 500 words):
                ${text}

                Structure the analysis as follows (keep each section brief):
                1. Technical Skills Summary (2-3 key points)
                2. Experience Overview (2-3 sentences)
                3. Education Relevance (1-2 sentences)
                4. Key Strengths (2-3 points)
                5. Quick Recommendation (1-2 sentences)

                Keep the entire analysis under 500 words and focus on the most important points.
              `
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    let analysis = result.candidates[0].content.parts[0].text;


    if (analysis.length > MAX_ANALYSIS_LENGTH) {
      analysis = analysis.substring(0, MAX_ANALYSIS_LENGTH);
      const lastPeriod = analysis.lastIndexOf('.');
      if (lastPeriod > 0) {
        analysis = analysis.substring(0, lastPeriod + 1);
      }
    }

    return analysis;

  } catch (error) {
    console.error('Error analyzing candidate:', error);
    throw new Error(`Failed to analyze candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}