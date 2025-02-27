"use client";

import { Candidate } from "@/types/candidate";
import { JobDescription } from "@/types/job";
import { useEffect, useState } from "react";

interface MatchResult {
  candidate: Candidate;
  score: number;
  matchDetails: {
    skillsMatch: string[];
    missingSkills: string[];
    experienceMatch: string;
    overallFit: string;
  };
}

export default function JobMatcher() {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobDescription[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleJobSelect = async (jobId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedJob(jobId);

      const response = await fetch(`/api/jobs/match/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to match candidates");
      }

      setMatchResults(data.matches);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">Match Candidates to Jobs</h2>

      {/* Job Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Job Description
        </label>
        <select
          value={selectedJob}
          onChange={(e) => handleJobSelect(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a job...</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding matches...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {matchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Matching Candidates</h3>
          {matchResults.map((result) => (
            <div
              key={result.candidate.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {result.candidate.metadata.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {result.candidate.metadata.email}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                  {(result.score * 100).toFixed(1)}% Match
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Matching Skills:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.matchDetails.skillsMatch.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {result.matchDetails.missingSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Missing Skills:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.matchDetails.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience Match: </span>
                  {result.matchDetails.experienceMatch}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Overall Assessment: </span>
                  {result.matchDetails.overallFit}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
