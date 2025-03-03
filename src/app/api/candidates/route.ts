import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings, analyzeCandidate } from '@/lib/utils/embeddings';
import { upsertCandidate, getCandidates } from '@/lib/database/pineconeUtils';
import { CandidateMetadata } from '@/types/candidate';

export async function GET() {
  try {
    console.log('Fetching candidates...');
    const candidates = await getCandidates();

    return NextResponse.json({
      success: true,
      candidates
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch candidates'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const candidateData: CandidateMetadata = {
      type: 'candidate',
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      linkedinUrl: formData.get('linkedinUrl') as string,
      skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
      experience: formData.get('experience') as string,
      education: formData.get('education') as string,
      resumeText: '',
      analysis: ''
    };

    console.log('Generating embeddings...');
    const embeddings =  await generateEmbeddings(JSON.stringify(candidateData));
    console.log('Embeddings generated successfully');

    console.log('Analyzing candidate...');
    candidateData.analysis = await analyzeCandidate(candidateData);
    console.log('Analysis complete');

    const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await upsertCandidate(candidateId, embeddings, candidateData);

    return NextResponse.json({
      success: true,
      message: 'Candidate processed successfully',
      candidateId,
      analysis: candidateData.analysis
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500 }
    );
  }
}