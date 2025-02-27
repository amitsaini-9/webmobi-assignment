import { pineconeIndex } from '@/lib/database/pinecone';
import { analyzeMatch } from '@/lib/utils/matchAnalysis';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    if (!params?.jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    const jobId = params.jobId;
    console.log("Fetching job:", jobId);

    let jobVector;
    try {
      jobVector = await pineconeIndex.fetch([jobId]);
    } catch (error) {
      console.error("Error fetching job:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch job" },
        { status: 500 }
      );
    }

    if (!jobVector.records || !jobVector.records[jobId]) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const jobRecord = jobVector.records[jobId];
    const jobData = jobRecord.metadata;
    const jobValues = jobRecord.values;

    if (!jobValues) {
      return NextResponse.json(
        { success: false, error: "Job vector values not found" },
        { status: 404 }
      );
    }

    console.log("Finding matching candidates...");

    const queryResponse = await pineconeIndex.query({
      vector: jobValues,
      topK: 10,
      includeMetadata: true,
      filter: { type: { $eq: "candidate" } },
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({
        success: true,
        job: {
          id: jobId,
          metadata: jobData,
        },
        matches: [],
      });
    }

    console.log(`Found ${queryResponse.matches.length} potential matches`);

    const matches = await Promise.all(
      queryResponse.matches.map(async (match) => {
        try {
          const analysis = await analyzeMatch(jobData, match.metadata);
          return {
            candidate: {
              id: match.id,
              metadata: match.metadata || {},
            },
            score: match.score || 0,
            matchDetails: analysis,
          };
        } catch (error) {
          console.error(`Error analyzing match ${match.id}:`, error);
          return null;
        }
      })
    );

    const validMatches = matches
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort((a, b) => {
        const scoreA = a.matchDetails.scores?.overallScore || 0;
        const scoreB = b.matchDetails.scores?.overallScore || 0;
        return scoreB - scoreA;
      });

    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        metadata: jobData,
      },
      matches: validMatches.map((match) => ({
        ...match,
        score: match.matchDetails.scores?.overallScore || 0,
      })),
    });
  } catch (error) {
    console.error("Error matching candidates:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to match candidates",
      },
      { status: 500 }
    );
  }
}