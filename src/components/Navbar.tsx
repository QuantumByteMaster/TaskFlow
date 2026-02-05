"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout, showToast } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
      showToast("Logout failed", "error");
    }
  };

  const navLinks = [
    { href: "/workspace", label: "Home" },
    { href: "/personal", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/dashboard", label: "Tasks" },
    { href: "/kanban", label: "Board" },
    { href: "/links", label: "Links" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 bg-white/80 dark:bg-black/80 border-slate-200/60 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/workspace" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
              <svg className="w-4 h-4 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">TaskFlow</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User & Theme Toggle */}
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-white/10">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-medium text-sm group-hover:ring-2 ring-slate-400 dark:ring-white/30 transition-all overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {user?.name || 'User'}
              </span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 dark:text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
