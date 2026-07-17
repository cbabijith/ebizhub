import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-6xl font-extrabold text-red-600">403</h1>
        <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500">
          You do not have administrative privileges to access this dashboard.
        </p>
        <div>
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
