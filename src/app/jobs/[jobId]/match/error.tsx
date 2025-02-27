"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="font-semibold mb-2">Error Loading Matches</h2>
          <p>{error.message}</p>
          <button
            onClick={reset}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
