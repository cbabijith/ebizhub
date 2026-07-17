import React from "react";

interface StatusBadgeProps {
  status: "active" | "inactive" | "suspended" | "pending" | "verified" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";

  switch (status) {
    case "active":
    case "verified":
      colorClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case "pending":
      colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
      break;
    case "suspended":
    case "rejected":
      colorClass = "bg-red-50 text-red-700 border-red-200";
      break;
    case "inactive":
      colorClass = "bg-gray-50 text-gray-600 border-gray-200";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {status}
    </span>
  );
}
