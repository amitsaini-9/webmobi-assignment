import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings } from '@/lib/utils/embeddings';
import { pineconeIndex } from '@/lib/database/pinecone';
import { JobData, JobMetadata } from '@/types/job';

export async function POST(request: NextRequest) {
  try {
    const jobData: JobData = await request.json();

    const textForEmbedding = `
      Title: ${jobData.title}
      Company: ${jobData.company}
      Description: ${jobData.description}
      Requirements: ${jobData.requirements.join('\n')}
      Skills: ${jobData.skills.join(', ')}
      Experience: ${jobData.experience}
    `.trim();

    const embeddings = await generateEmbeddings(textForEmbedding);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metadata: JobMetadata = {
      type: 'job',
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      requirements: jobData.requirements.join('|||'),
      skills: jobData.skills.join(','),
      experience: jobData.experience,
      createdAt: new Date().toISOString()
    };

    await pineconeIndex.upsert([{
      id: jobId,
      values: embeddings,
      metadata
    }]);

    return NextResponse.json({
      success: true,
      message: 'Job description stored successfully',
      jobId
    });

  } catch (error) {
    console.error('Error storing job description:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store job description'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const queryResponse = await pineconeIndex.query({
      vector: Array(1536).fill(0),
      topK: 1000,
      includeMetadata: true,
      filter: { type: { $eq: 'job' } }
    });

    const jobs = queryResponse.matches?.map(match => {
      const metadata = match.metadata as JobMetadata;

      return {
        id: match.id,
        score: match.score || 0,
        metadata: {
          type: 'job',
          title: metadata?.title || '',
          company: metadata?.company || '',
          description: metadata?.description || '',
          requirements: metadata?.requirements || '',
          skills: metadata?.skills || '',
          experience: metadata?.experience || '',
          createdAt: metadata?.createdAt || new Date().toISOString()
        }
      };
    }) || [];

    const sortedJobs = [...jobs].sort((a, b) => {
      return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      jobs: sortedJobs
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs'
      },
      { status: 500 }
    );
  }
}