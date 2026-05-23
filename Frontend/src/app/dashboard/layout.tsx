"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import { useAuthStore } from "../../store/auth.store";

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
    <>
      {/* Mobile block message */}
      <div className="lg:hidden flex flex-col items-center justify-center min-h-screen bg-gray-950 px-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">ComplyGuy</h1>
        <p className="text-gray-400 text-sm mb-2">
          ComplyGuy is optimised for desktop use.
        </p>
        <p className="text-gray-500 text-xs">
          Please open this on a laptop or desktop for the best experience.
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex min-h-screen bg-gray-950">
        <aside style={{ width: "256px", flexShrink: 0 }}>
          <div
            style={{
              position: "fixed",
              width: "256px",
              height: "100vh",
              top: 0,
              left: 0,
              zIndex: 40,
            }}
          >
            <Sidebar />
          </div>
        </aside>
        <main style={{ flex: 1, padding: "32px", minHeight: "100vh" }}>
          {children}
        </main>
      </div>
    </>
  );
}
