"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileText,
  ClipboardList,
  Bot,
  Bell,
  LogOut,
  ChevronRight,
  Building2,
  Sun,
  Moon,
  Users,
  CalendarDays,
  Plug
} from "lucide-react";

// navItems must be OUTSIDE component — this is correct
const navItems = [
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/compliance", label: "Compliance", icon: Shield },
  { href: "/dashboard/risks", label: "Risks", icon: AlertTriangle },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/audit", label: "Audit Logs", icon: ClipboardList },
  { href: "/dashboard/ai-chat", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // useTheme MUST be inside the component function ✅
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 h-full bg-gray-950 border-r border-gray-800/60 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">
              ComplyGuy
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Compliance Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => onClose?.()}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${active
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                  }`}
              >
                <Icon
                  className={`shrink-0 ${active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}
                  size={18}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400/60" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-150 text-sm"
        >
          {theme === "dark" ? (
            <>
              <Sun size={16} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-800/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900/60 mb-1">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 text-sm"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </motion.button>
      </div>
    </div>
  );
}
