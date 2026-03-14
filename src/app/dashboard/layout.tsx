"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar />
      </aside>
      <main className="flex-1 min-h-screen" style={{ marginLeft: "256px" }}>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
