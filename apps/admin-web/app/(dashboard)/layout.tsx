"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../lib/auth/auth-provider";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Checking auth session...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== "admin") {
    return null; // redirecting
  }

  return <>{children}</>;
}
