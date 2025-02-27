import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working',
    endpoints: {
      candidates: '/api/candidates',
      jobs: '/api/jobs',
      matching: '/api/jobs/[jobId]/match'
    }
  });
}