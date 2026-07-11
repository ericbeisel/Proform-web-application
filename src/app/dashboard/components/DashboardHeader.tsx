"use client";

import { User, LogOut, Menu, X, ArrowRightLeft, Rss, ChevronRight, Calendar, Activity, Users, Tv, Play, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session";
import { invalidateDashboardCache, getLiveSessions } from "@/api/dashboard/route";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  userName?: string;
  unreadNotificationsCount?: number;
  pfPoints?: number;
};

export default function DashboardHeader({
  userName,
  unreadNotificationsCount = 0,
  pfPoints = 0,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [liveSessionsCount, setLiveSessionsCount] = useState(0);

  useEffect(() => {
    getLiveSessions({ limit: 1 })
      .then((res) => setLiveSessionsCount(res.totalCount || 0))
      .catch(() => setLiveSessionsCount(0));
  }, []);

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
    { label: "Teams",     icon: Users,        href: "/team/teams" },
  ];

  const isNavItemActive = (href: string | null): boolean => {
    if (!href) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e6f0]">
      <div className="h-16 relative flex items-center px-4 sm:px-6 lg:px-8">

        {/* Left: Desktop Navigation */}
        <div className="hidden md:flex gap-1 bg-[#f7f6fb] rounded-[10px] p-1">
          {navItems.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              onClick={() => { if (href) router.push(href); }}
              className={`
                flex items-center gap-1.5 px-3 lg:px-4 py-1.5 text-[12px] lg:text-[13px] font-medium rounded-[7px]
                transition-all duration-150
                ${
                  isNavItemActive(href)
                    ? "bg-white text-[#6c5ce7] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-[#8b879e] hover:bg-white hover:text-[#6c5ce7] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)] active:bg-white active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Left: mobile-only compact Watch/Live/Points (desktop nav above is untouched) */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => setShowComingSoon(true)}
            className="w-7 h-7 rounded-full bg-[#6c5ce7] flex items-center justify-center text-white hover:opacity-90 transition-all"
          >
            <Tv size={13} />
          </button>
          <button
            onClick={() => router.push("/live-sessions")}
            className="relative w-7 h-7 rounded-full bg-[#00c896] flex items-center justify-center text-white hover:opacity-90 transition-all"
          >
            <Play size={13} fill="currentColor" />
            {liveSessionsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                {liveSessionsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/points")}
            className="flex items-center px-1.5 h-7 rounded-full bg-[#ffb020] text-white text-[9px] font-bold hover:opacity-90 transition-all whitespace-nowrap"
          >
            {pfPoints.toLocaleString()} pts
          </button>
        </div>

        {/* Center: Logo — absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 bg-white">
          <img
            src="/images/proform-logo.jpg"
            alt="Proform"
            onClick={() => router.push("/feed/main-feed")}
            className="h-8 w-auto cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1 sm:gap-3">

          {/* Mobile-only compact Calendar/Notifications, right of the logo (desktop row below is untouched) */}
          <div className="flex sm:hidden items-center gap-1 mr-1">
            <button
              onClick={() => router.push("/checklist")}
              className="relative w-7 h-7 rounded-full bg-[#f1eefe] flex items-center justify-center text-[#6c5ce7] hover:bg-[#e6e0fd] transition-all"
            >
              <Calendar size={13} />
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                9
              </span>
            </button>
            <button
              onClick={() => router.push("/notifications")}
              className="relative w-7 h-7 rounded-full bg-[#f1eefe] flex items-center justify-center text-[#6c5ce7] hover:bg-[#e6e0fd] transition-all"
            >
              <Bell size={13} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Highlights / Watch */}
          <button
            onClick={() => setShowComingSoon(true)}
            className="hidden sm:flex w-9 h-9 rounded-full bg-[#6c5ce7] items-center justify-center text-white hover:opacity-90 transition-all"
          >
            <Tv size={16} />
          </button>

          {/* Live Sessions */}
          <button
            onClick={() => router.push("/live-sessions")}
            className="hidden sm:flex relative w-9 h-9 rounded-full bg-[#00c896] items-center justify-center text-white hover:opacity-90 transition-all"
          >
            <Play size={16} fill="currentColor" />
            {liveSessionsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {liveSessionsCount}
              </span>
            )}
          </button>

          {/* Points */}
          <button
            onClick={() => router.push("/points")}
            className="hidden sm:flex items-center px-3 h-9 rounded-full bg-[#ffb020] text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            {pfPoints.toLocaleString()} pts
          </button>

          {/* Analytics */}
          {/* <button className="hidden sm:flex w-9 h-9 rounded-[10px] border border-[#e8e6f0] bg-white items-center justify-center text-[#8b879e] hover:border-[#a29bfe] hover:text-[#6c5ce7] transition-all">
            <BarChart2 size={18} />
          </button> */}

  <button
    onClick={() => router.push("/coach/coach-onboarding")}
    className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-gradient-to-r from-[#6c5ce7] to-[#8e7dff] text-white hover:opacity-90 transition-all text-sm font-medium shadow-sm"
  >
    <ArrowRightLeft size={15} />
    Switch to Coach
  </button>
          {/* Logout Button - Desktop */}
          {/* <button
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
          </button> */}

          {/* Calendar */}
          <button
            onClick={() => router.push("/checklist")}
            className="hidden sm:flex relative w-9 h-9 rounded-full bg-[#f1eefe] items-center justify-center text-[#6c5ce7] hover:bg-[#e6e0fd] transition-all"
          >
            <Calendar size={16} />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              9
            </span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => router.push("/notifications")}
            className="hidden sm:flex relative w-9 h-9 rounded-full bg-[#f1eefe] items-center justify-center text-[#6c5ce7] hover:bg-[#e6e0fd] transition-all"
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
              </span>
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
                setMobileMenuOpen(false);
                if (href) router.push(href);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                ${
                  isNavItemActive(href)
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

      {/* Coming Soon popup */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowComingSoon(false)}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f1eefe] flex items-center justify-center">
              <Tv size={28} className="text-[#6c5ce7]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-5">Coming Soon!</h2>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-[#6c5ce7] hover:bg-[#5b4bd4] text-white font-semibold py-3 rounded-xl mt-6 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}