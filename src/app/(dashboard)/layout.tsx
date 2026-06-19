"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import AuthProvider from "@/components/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f2f5f8]">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className={`min-h-screen transition-all duration-300 pt-[72px] pb-24 px-3 sm:px-4 md:px-6 lg:px-8 md:pt-6  
            ${collapsed ? "md:ml-20" : "md:ml-64"}
        `}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
