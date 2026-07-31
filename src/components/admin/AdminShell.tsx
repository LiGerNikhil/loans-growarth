"use client";

import { useState, ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface UserInfo {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface AdminShellProps {
  user: UserInfo;
  children: ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-soft">
      <AdminSidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
