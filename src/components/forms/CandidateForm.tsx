"use client";
// src/components/forms/CandidateForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "../Navigation";

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL"),
  skills: z.string().min(2, "Please enter your skills"),
  experience: z
    .string()
    .min(10, "Please provide more details about your experience"),
  education: z
    .string()
    .min(10, "Please provide more details about your education"),
  resume: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Please upload a resume")
    .refine(
      (files) => files?.[0]?.type === "application/pdf",
      "Only PDF files are allowed"
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function CandidateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("linkedinUrl", data.linkedinUrl);
      formData.append("skills", data.skills);
      formData.append("experience", data.experience);
      formData.append("education", data.education);
      if (data.resume[0]) {
        formData.append("resume", data.resume[0]);
      }

      console.log("Submitting form data..."); // Debug log

      const response = await fetch("/api/candidates", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status); // Debug log
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      ); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to submit application: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response type from server");
      }

      const result = await response.json();
      console.log("Server response:", result); // Debug log

      if (result.success) {
        setSubmitSuccess(true);
        setSuccessMessage(
          `Application submitted successfully! ID: ${result.candidateId}`
        );
        reset();
        console.log("Form submitted successfully");
      } else {
        throw new Error(result.error || "Failed to submit application");
      }

      setSubmitSuccess(true);
      reset();
      console.log("Form submitted successfully");
    } catch (error) {
      console.error("Form submission error:", error);
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
      className="max-w-2xl mx-auto p-6 space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Candidate Application Form
      </h1>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* LinkedIn URL Field */}
      <div>
        <label
          htmlFor="linkedinUrl"
          className="block text-sm font-medium text-gray-700"
        >
          LinkedIn URL
        </label>
        <input
          type="url"
          id="linkedinUrl"
          {...register("linkedinUrl")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.linkedinUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.linkedinUrl.message}
          </p>
        )}
      </div>

      {/* Skills Field */}
      <div>
        <label
          htmlFor="skills"
          className="block text-sm font-medium text-gray-700"
        >
          Skills (comma-separated)
        </label>
        <input
          type="text"
          id="skills"
          {...register("skills")}
          placeholder="e.g., JavaScript, React, Node.js"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.skills && (
          <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
        )}
      </div>

      {/* Experience Field */}
      <div>
        <label
          htmlFor="experience"
          className="block text-sm font-medium text-gray-700"
        >
          Professional Experience
        </label>
        <textarea
          id="experience"
          {...register("experience")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.experience && (
          <p className="mt-1 text-sm text-red-600">
            {errors.experience.message}
          </p>
        )}
      </div>

      {/* Education Field */}
      <div>
        <label
          htmlFor="education"
          className="block text-sm font-medium text-gray-700"
        >
          Education
        </label>
        <textarea
          id="education"
          {...register("education")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
        />
        {errors.education && (
          <p className="mt-1 text-sm text-red-600">
            {errors.education.message}
          </p>
        )}
      </div>

      {/* Resume Upload Field */}
      <div>
        <label
          htmlFor="resume"
          className="block text-sm font-medium text-gray-700"
        >
          Resume (PDF only)
        </label>
        <input
          type="file"
          id="resume"
          accept=".pdf"
          {...register("resume")}
          className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
        />
        {errors.resume && (
          <p className="mt-1 text-sm text-red-600">{errors.resume.message}</p>
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
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          {successMessage}
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
