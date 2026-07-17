"use client";

import React from "react";
import DashboardLayout from "../layout-wrapper";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
