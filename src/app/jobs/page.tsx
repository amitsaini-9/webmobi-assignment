"use client";

import JobDescriptionForm from "@/components/forms/JobDescriptionForm";
import { Job } from "@/types/job";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/jobs");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      const typedJobs: Job[] = data.jobs.map((job: any) => ({
        id: job.id,
        score: job.score || 0,
        metadata: {
          title: job.metadata?.title || "",
          company: job.metadata?.company || "",
          description: job.metadata?.description || "",
          requirements: job.metadata?.requirements || "",
          skills: job.metadata?.skills || "",
          experience: job.metadata?.experience || "",
          createdAt: job.metadata?.createdAt || new Date().toISOString(),
          type: "job",
        },
      }));

      const sortedJobs = [...typedJobs].sort((a, b) => {
        const dateA = new Date(a.metadata.createdAt).getTime();
        const dateB = new Date(b.metadata.createdAt).getTime();
        return dateB - dateA;
      });

      setJobs(sortedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "Post New Job"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <JobDescriptionForm
              onSuccess={() => {
                setShowForm(false);
                fetchJobs();
              }}
            />
          </div>
        )}

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
            <h2 className="font-semibold mb-2">Error Loading Jobs</h2>
            <p>{error}</p>
            <button
              onClick={fetchJobs}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No jobs posted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.metadata.title}
                    </h2>
                    <p className="text-gray-600">{job.metadata.company}</p>
                  </div>
                  <Link
                    href={`/jobs/${job.id}/match`}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100"
                  >
                    Find Matches
                  </Link>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.metadata.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Experience Required:
                  </p>
                  <p className="text-sm text-gray-600">
                    {job.metadata.experience}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Description:
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {job.metadata.description}
                  </p>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Posted: {formatDate(job.metadata.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
