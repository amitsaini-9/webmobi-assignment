// src/app/api/jobs/[jobId]/match/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pineconeIndex } from '@/lib/database/pinecone';
import { analyzeMatch } from '@/lib/utils/matchAnalysis';
import { RecordMetadata } from '@pinecone-database/pinecone';

export async function GET(
  request: NextRequest,
  context: { params: { jobId: string } }
) {
  try {
    // Get the jobId from context
    const jobId = context.params.jobId;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching job:', jobId);

    // Create a reference to store job data
    let jobVector;
    try {
      jobVector = await pineconeIndex.fetch([jobId]);
    } catch (error) {
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    if (!jobVector.records || !jobVector.records[jobId]) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobRecord = jobVector.records[jobId];
    const jobData = jobRecord.metadata;
    const jobValues = jobRecord.values;

    if (!jobValues) {
      return NextResponse.json(
        { success: false, error: 'Job vector values not found' },
        { status: 404 }
      );
    }

    console.log('Finding matching candidates...');

    // Query for matching candidates
    const queryResponse = await pineconeIndex.query({
      vector: jobValues,
      topK: 10,
      includeMetadata: true,
      filter: { type: { $eq: 'candidate' } }
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({
        success: true,
        job: {
          id: jobId,
          metadata: jobData
        },
        matches: []
      });
    }

    console.log(`Found ${queryResponse.matches.length} potential matches`);

    // Analyze matches
    const matches = await Promise.all(
      queryResponse.matches.map(async (match) => {
        try {
          const analysis = await analyzeMatch(jobData, match.metadata);
          return {
            candidate: {
              id: match.id,
              metadata: match.metadata || {}
            },
            score: match.score || 0,
            matchDetails: analysis
          };
        } catch (error) {
          console.error(`Error analyzing match ${match.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null results and sort by score
    const validMatches = matches
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort((a, b) => {
        // Use the analysis scores for sorting
        const scoreA = a.matchDetails.scores.overallScore;
        const scoreB = b.matchDetails.scores.overallScore;
        return scoreB - scoreA;
      });

    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        metadata: jobData
      },
      matches: validMatches.map(match => ({
        ...match,
        score: match.matchDetails.scores.overallScore // Update the score
      }))
    });

  } catch (error) {
    console.error('Error matching candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to match candidates'
      },
      { status: 500 }
    );
  }
}