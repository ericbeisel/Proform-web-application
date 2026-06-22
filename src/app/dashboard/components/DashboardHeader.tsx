"use client";

import { BarChart2, User, LogOut, Menu, X, ArrowRightLeft, Rss, ChevronRight, Calendar, Activity, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import Link from "next/link";
import { useState } from "react";

type Props = {
  activeNav: string;
  setActiveNav: (value: string) => void;
  userName?: string;
};

export default function DashboardHeader({
  activeNav,
  setActiveNav,
  userName,
}: Props) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Clear auth session and stale dashboard cache
      invalidateDashboardCache();
      clearAuthSession();

      // Also clear user data from localStorage (important!)
      localStorage.removeItem("user");

      console.log("✅ Logout successful - Redirecting to login");

      // Small delay for better UX and to ensure storage is cleared
      await new Promise((resolve) => setTimeout(resolve, 300));

      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Force redirect even if something fails
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { label: "Feed",      icon: Rss,          href: "/feed/main-feed" },
    { label: "Next",      icon: ChevronRight, href: null },
    { label: "Itinerary", icon: Calendar,     href: "/itinerary/itinerary-page" },
    { label: "Metrics",   icon: Activity,     href: "/metrics" },
    { label: "Teams",     icon: Users,        href: "/team-dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e6f0]">
      <div className="h-16 relative flex items-center px-4 sm:px-6 lg:px-8">

        {/* Left: Desktop Navigation */}
        <div className="hidden md:flex gap-1 bg-[#f7f6fb] rounded-[10px] p-1">
          {navItems.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              onClick={() => { setActiveNav(label); if (href) router.push(href); }}
              className={`
                flex items-center gap-1.5 px-3 lg:px-4 py-1.5 text-[12px] lg:text-[13px] font-medium rounded-[7px]
                transition-all duration-150
                ${
                  activeNav === label
                    ? "bg-white text-[#6c5ce7] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-[#8b879e] hover:text-[#6c5ce7]"
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Center: Logo — absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img
            src="/images/proform-logo.jpg"
            alt="Proform"
            onClick={() => router.push("/feed/main-feed")}
            className="h-8 w-auto cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Analytics */}
          <button className="hidden sm:flex w-9 h-9 rounded-[10px] border border-[#e8e6f0] bg-white items-center justify-center text-[#8b879e] hover:border-[#a29bfe] hover:text-[#6c5ce7] transition-all">
            <BarChart2 size={18} />
          </button>

  <button
    onClick={() => router.push("/coach/coach-onboarding")}
    className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-gradient-to-r from-[#6c5ce7] to-[#8e7dff] text-white hover:opacity-90 transition-all text-sm font-medium shadow-sm"
  >
    <ArrowRightLeft size={15} />
    Switch to Coach
  </button>
          {/* Logout Button - Desktop */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="hidden sm:flex items-center gap-1 px-3 h-9 rounded-[10px] border border-[#e8e6f0] text-[#8b879e] hover:border-red-300 hover:text-red-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Logging out...
              </span>
            ) : (
              <>
                <LogOut size={16} />
                Logout
              </>
            )}
          </button>

          {/* Avatar */}
          <Link href="/account">
            <div
              title="Go to Account"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fd7b4d] to-[#fdcb6e] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform active:scale-95"
            >
              {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6f0] bg-white px-4 py-3 space-y-2">
          {navItems.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              onClick={() => {
                setActiveNav(label);
                setMobileMenuOpen(false);
                if (href) router.push(href);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                ${
                  activeNav === label
                    ? "bg-purple-50 text-[#6c5ce7]"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={16} />
                Logout
              </>
            )}
          </button>
        </div>
      )}
    </header>
  );
}