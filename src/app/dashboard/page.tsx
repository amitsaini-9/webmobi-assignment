"use client";

import { Candidate } from "@/types/candidate";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/candidates");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch candidates");
      }

      setCandidates(data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Candidate Dashboard
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="border p-4 rounded-lg shadow animate-pulse bg-white"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Candidate Dashboard
        </h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="font-semibold mb-2">Error Loading Candidates</h2>
          <p>{error}</p>
          <button
            onClick={fetchCandidates}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Candidate Dashboard
      </h1>

      {candidates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No candidates found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate: Candidate) => (
            <div
              key={candidate.id}
              className="border rounded-lg p-4 shadow bg-white"
            >
              <h2 className="font-semibold text-lg text-gray-900">
                {candidate.metadata.name}
              </h2>
              <p className="text-gray-600">{candidate.metadata.email}</p>

              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Skills:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.metadata.skills.map(
                    (skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Experience:</p>
                <p className="text-sm text-gray-600">
                  {candidate.metadata.experience}
                </p>
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Analysis:</p>
                <div className="relative">
                  <p
                    className={`text-sm text-gray-600 ${
                      expandedAnalysis !== candidate.id ? "line-clamp-3" : ""
                    }`}
                  >
                    {candidate.metadata.analysis}
                  </p>
                  {candidate.metadata.analysis &&
                    candidate.metadata.analysis.length > 150 && (
                      <button
                        onClick={() =>
                          setExpandedAnalysis(
                            expandedAnalysis === candidate.id
                              ? null
                              : candidate.id
                          )
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                      >
                        {expandedAnalysis === candidate.id ? (
                          <>
                            Show less
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Show more
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <a
                  href={candidate.metadata.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  View LinkedIn Profile
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
