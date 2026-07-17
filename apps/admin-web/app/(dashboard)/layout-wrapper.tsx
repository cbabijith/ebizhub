"use client";

import React from "react";
import AdminShell from "../../components/layout/admin-shell";
import ProtectedLayout from "./layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <AdminShell>{children}</AdminShell>
    </ProtectedLayout>
  );
}
