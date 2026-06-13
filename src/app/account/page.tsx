"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  LogOut,
  Monitor,
  Settings,
  User,
  Users,
  Shield,
  Rss,
} from "lucide-react";
import { clearAuthSession } from "@/lib/auth/session";
import { invalidateDashboardCache } from "@/api/dashboard/route";

// Type for the user data we expect from localStorage or API
interface StoredUser {
  name?: string;
  role?: number | string;
  role_id?: number | string;
  [key: string]: unknown; // allow extra fields
}

type MenuItem = {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  href?: string;
  isHighlight?: boolean;
  adminOnly?: boolean; // New property for admin-only items
};

const MAIN_MENU: MenuItem[] = [
  { label: "My Profile", icon: User, href: "/profile" },
  { label: "My Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { label: "My Itinerary", icon: Calendar, href: "/itinerary/itinerary-page" },

  // ✅ NEW OPTION
  { label: "Admin Itinerary", icon: Calendar, href: "/admin-itinerary" },

  { label: "My Metrics", icon: Activity, href: "/metrics" },
  { label: "My Teams", icon: Users, href: "/team/teams" },
  { label: "My Preferences", icon: Settings, href: "/preferences" },
  { label: "Payments", icon: CreditCard },
  { label: "Connect TV", icon: Monitor, isHighlight: true },
  { label: "Feed", icon: Rss, href: "/feed/main-feed" },
  {
    label: "Admin Player Status",
    icon: Shield,
    href: "/admin-player-card-status",
    adminOnly: true,
  },
];

type ToolItem = {
  label: string;
  href: string;
  adminOnly?: boolean; // New property for admin-only tools
};

const TOOL_ITEMS: ToolItem[] = [
  { label: "Create Workout", href: "/itinerary/schedule" },
  { label: "Log an Exercise", href: "/itinerary/queue" },
  { label: "Cardio", href: "#" },
  { label: "Feed", href: "/feed/main-feed" },
  { label: "Macros", href: "#" },
  { label: "Hydration", href: "#" },
  { label: "Recovery", href: "#" },
  { label: "Player Cards", href: "/player-cards" }, // This will be conditionally routed based on role
  {
    label: "admin player status",
    href: "/admin-player-card-status",
    adminOnly: true,
  },
  { label: "Find Courses", href: "#" },
  { label: "Join Challenges", href: "#" },
  { label: "Weekly Reports", href: "#" },
  { label: "Search Programs", href: "/programs" },
  { label: "Location", href: "/location" },
  { label: "More Options", href: "#" },
  // Admin-only tool
  {
    label: "Admin Dashboard",
    adminOnly: true,
    href: "",
  },
];

export default function AccountPage() {
  const router = useRouter();

  const [roleId, setRoleId] = useState(1);
  const [accountName, setAccountName] = useState("Account");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredUser | null;

        if (parsed?.name && typeof parsed.name === "string") {
          setAccountName(parsed.name.trim());
        }

        const localRole = parsed?.role ?? parsed?.role_id;
        if (localRole !== undefined && localRole !== null) {
          const roleNum = Number(localRole) || 1;
          setRoleId(roleNum);
          setIsAdmin(roleNum === 3);
        }
      }
    } catch {
      // silent fail - keep defaults
    }

    // Fetch fresh data from API
    async function fetchProfile() {
      try {
        const { getDashboardData } = await import("@/api/auth/dashboard/route");
        const dashboard = await getDashboardData();
        const user = dashboard?.user as StoredUser | undefined;

        if (user?.name && typeof user.name === "string") {
          setAccountName(user.name.trim());
        }

        const apiRole = user?.role ?? user?.role_id;
        if (apiRole !== undefined && apiRole !== null) {
          const roleNum = Number(apiRole) || 1;
          setRoleId(roleNum);
          setIsAdmin(roleNum === 3);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard role:", err);
      }
    }

    void fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Optional: Call backend logout API if you have one
      // await logoutApi();   // ← uncomment if you create this

      // Clear everything locally
      invalidateDashboardCache();
      clearAuthSession();

      // Also clear user data from localStorage
      localStorage.removeItem("user");

      console.log("✅ Logout successful. Redirecting to login...");

      // Use replace + small delay for reliability
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if something fails, force redirect
      router.replace("/auth/login");
    }
  };

  // Filter main menu items based on admin status
  const filteredMainMenu = MAIN_MENU.filter((item) => {
    // If item is adminOnly and user is not admin, hide it
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  // Filter tool items based on admin status
  const filteredToolItems = TOOL_ITEMS.filter((item) => {
    // If item is adminOnly and user is not admin, hide it
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-8 md:pb-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md">
              <User size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                {accountName}
              </h1>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium shadow-sm">
                  🪙
                </div>
                <span className="text-base font-semibold text-gray-700">
                  25 Points
                </span>
                {isAdmin && (
                  <span className="ml-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Menu */}
        <section className="pt-8 pb-10">
          <h2 className="mb-5 text-xl md:text-2xl font-bold text-gray-900">
            Main Menu
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredMainMenu.map((item) => {
              const Icon = item.icon;
              const isHighlighted = item.isHighlight;

              const content = (
                <div
                  className={`
                      group flex h-20 items-center justify-between rounded-xl border px-5 transition-all duration-200
                      ${
                        isHighlighted
                          ? "border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200/30 hover:shadow-purple-300/40"
                          : "border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 hover:shadow-md"
                      }
                    `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                          flex h-10 w-10 items-center justify-center rounded-lg transition-colors
                          ${isHighlighted ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}
                        `}
                    >
                      <Icon
                        size={20}
                        className={
                          isHighlighted ? "text-white" : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-base font-semibold">
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={20}
                    className={
                      isHighlighted
                        ? "text-white/80"
                        : "text-gray-400 group-hover:text-gray-600"
                    }
                  />
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className="block">
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="cursor-not-allowed opacity-70"
                  title="Coming soon"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {/* Tools */}
        <section className="pb-10">
          <h2 className="mb-5 text-xl md:text-2xl font-bold text-gray-900">
            Tools
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredToolItems.map((tool) => {
              const href = tool.href;

              const content = (
                <div
                  className={`
                      flex h-14 items-center rounded-xl border px-5 text-left text-base font-medium transition-all
                      ${
                        href && href !== "#"
                          ? "border-gray-200 bg-white text-gray-800 hover:border-purple-200 hover:bg-purple-50/60 hover:text-purple-700"
                          : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-75"
                      }
                    `}
                >
                  {tool.label}
                </div>
              );

              if (href && href !== "#") {
                return (
                  <Link key={tool.label} href={href} className="block">
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={tool.label}
                  className="cursor-not-allowed"
                  title="Coming soon"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer actions */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push("/coach/coach-onboarding")}
              className="h-14 rounded-xl bg-cyan-600 text-base md:text-lg font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Coach Login
            </button>

            <button
              type="button"
              className="h-14 rounded-xl bg-purple-700 text-base md:text-lg font-semibold text-white shadow-sm transition-colors hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Creator
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-14 items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-base md:text-lg font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              <LogOut size={18} className="text-gray-700" />
              Log Out
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
