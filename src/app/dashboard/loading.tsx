// src/app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      <div className="grid gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="border p-4 rounded-lg shadow animate-pulse">
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
