"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MatchDetails {
  skillsMatch: string[];
  missingSkills: string[];
  experienceMatch: string;
  overallFit: string;
  scores: {
    skillsScore: number;
    experienceScore: number;
    overallScore: number;
  };
}

interface Candidate {
  id: string;
  metadata: {
    name: string;
    email: string;
    skills: string;
    experience: string;
    education: string;
  };
}

interface Match {
  candidate: Candidate;
  score: number;
  matchDetails: MatchDetails;
}

interface Job {
  id: string;
  metadata: {
    title: string;
    company: string;
    description: string;
    skills: string;
    experience: string;
    createdAt: string;
  };
}

export default function JobMatchPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [jobId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/jobs/${jobId}/match`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setJob(data.job);
      setMatches(data.matches);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="mb-8">
          <Link
            href="/jobs"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Jobs
          </Link>

          {job && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {job.metadata.title}
              </h1>
              <p className="text-gray-600">{job.metadata.company}</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-700">
                    Required Skills:
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.metadata.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-700">
                    Experience Required:
                  </h2>
                  <p className="text-sm text-gray-600">
                    {job.metadata.experience}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Matches Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h2 className="font-semibold mb-2">Error Loading Matches</h2>
            <p>{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No matching candidates found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.candidate.id}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {match.candidate.metadata.name}
                    </h2>
                    <p className="text-gray-600">
                      {match.candidate.metadata.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500">
                        Match Score
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(match.matchDetails.scores.overallScore * 100).toFixed(
                          0
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Matching Skills:
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {match.matchDetails.skillsMatch.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Missing Skills:
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {match.matchDetails.missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Experience Match:
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {match.matchDetails.experienceMatch}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Overall Assessment:
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {match.matchDetails.overallFit}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Skills Match
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(match.matchDetails.scores.skillsScore * 100).toFixed(0)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Experience Match
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(
                        match.matchDetails.scores.experienceScore * 100
                      ).toFixed(0)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Overall Score
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(match.matchDetails.scores.overallScore * 100).toFixed(
                        0
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
