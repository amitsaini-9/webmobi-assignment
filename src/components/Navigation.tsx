import Link from "next/link";

// src/components/Navigation.tsx
export default function Navigation() {
  return (
    <nav className="bg-white shadow text-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center h-16">
          <div className="flex justify-evenly items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              Home
            </Link>
            <Link href="/dashboard" className="ml-8">
              Dashboard
            </Link>
            <Link href="/jobs" className="ml-8">
              Job Matching
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
