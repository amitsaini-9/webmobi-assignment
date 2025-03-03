"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { JobDescriptionFormProps } from "@/types/job";

const jobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(50, "Please provide a detailed job description"),
  requirements: z.string().min(10, "Please list the job requirements"),
  skills: z.string().min(2, "Please enter required skills"),
  experience: z.string().min(2, "Please specify required experience"),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function JobDescriptionForm({
  onSuccess,
}: JobDescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          skills: data.skills.split(",").map((skill) => skill.trim()),
          requirements: data.requirements
            .split("\n")
            .filter((req) => req.trim()),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit job description");
      }

      setSubmitSuccess(true);
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 space-y-6 text-black"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Post New Job Description
      </h1>

      {/* Job Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Job Title
        </label>
        <input
          type="text"
          id="title"
          {...register("title")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700"
        >
          Company Name
        </label>
        <input
          type="text"
          id="company"
          {...register("company")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.company && (
          <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Job Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="At least 50 characters"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Requirements */}
      <div>
        <label
          htmlFor="requirements"
          className="block text-sm font-medium text-gray-700"
        >
          Requirements (one per line)
        </label>
        <textarea
          id="requirements"
          {...register("requirements")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">
            {errors.requirements.message}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <label
          htmlFor="skills"
          className="block text-sm font-medium text-gray-700"
        >
          Required Skills (comma-separated)
        </label>
        <input
          type="text"
          id="skills"
          {...register("skills")}
          placeholder="e.g., React, Node.js, TypeScript"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.skills && (
          <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
        )}
      </div>

      {/* Experience */}
      <div>
        <label
          htmlFor="experience"
          className="block text-sm font-medium text-gray-700"
        >
          Required Experience
        </label>
        <input
          type="text"
          id="experience"
          {...register("experience")}
          placeholder="e.g., 3+ years"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.experience && (
          <p className="mt-1 text-sm text-red-600">
            {errors.experience.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Posting..." : "Post Job Description"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          Job description posted successfully!
        </div>
      )}
      {submitError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
    </form>
  );
}
