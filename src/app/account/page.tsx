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
} from "lucide-react";
import { clearAuthSession } from "@/lib/auth/session";

type MenuItem = {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  href?: string;
  isHighlight?: boolean;
};

const MAIN_MENU: MenuItem[] = [
  { label: "My Profile", icon: User },
  { label: "My Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { label: "My Itinerary", icon: Calendar, href: "/itinerary/itinerary-page" },
  { label: "My Metrics", icon: Activity, href: "/itinerary/all-activity" },
  { label: "My Teams", icon: Users, href: "/team/teams" },
  { label: "My Preferences", icon: Settings, href: "/preferences" },
  { label: "Payments", icon: CreditCard },
  { label: "Connect TV", icon: Monitor, isHighlight: true },
];

type ToolItem = {
  label: string;
  href: string;
};

const TOOL_ITEMS: ToolItem[] = [
  { label: "Create Workout", href: "/itinerary/schedule" },
  { label: "Log an Exercise", href: "/itinerary/queue" },
  { label: "Cardio", href: "#" },
  { label: "Macros", href: "#" },
  { label: "Hydration", href: "#" },
  { label: "Recovery", href: "#" },
  { label: "Player Cards", href: "/player-cards" },
  { label: "Find Courses", href: "#" },
  { label: "Join Challenges", href: "#" },
  { label: "Weekly Reports", href: "#" },
  { label: "Search Programs", href: "/programs" },
  { label: "More Options", href: "#" },
];

export default function AccountPage() {
  const router = useRouter();

  const [roleId, setRoleId] = useState(1);
  const [accountName, setAccountName] = useState("Account");

  useEffect(() => {
    // Hydrate from localStorage only after mount to avoid SSR/CSR mismatch.
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          name?: string;
          role?: number | string;
          role_id?: number | string;
        };
        if (parsed?.name?.trim()) {
          setAccountName(parsed.name.trim());
        }
        const localRole = parsed?.role ?? parsed?.role_id;
        if (localRole !== undefined && localRole !== null) {
          setRoleId(Number(localRole) || 1);
        }
      }
    } catch {
      // Ignore corrupted local storage and keep defaults.
    }

    async function fetchProfile() {
      try {
        const { getDashboardData } = await import("@/api/auth/dashboard/route");
        const dashboard = await getDashboardData();
        const user = dashboard?.user as
          | { name?: string; role?: number | string; role_id?: number | string }
          | undefined;
        if (user?.name?.trim()) {
          setAccountName(user.name.trim());
        }
        const apiRole = user?.role ?? user?.role_id;
        if (apiRole !== undefined && apiRole !== null) {
          setRoleId(Number(apiRole) || 1);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard role:", err);
      }
    }

    void fetchProfile();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] p-4 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex items-start border-b border-[#d8dce2] px-0 py-7 md:px-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#6d28d9] text-white shadow-md">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-none text-[#16181b]">
                {accountName}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-[#5b11b9]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4be2a] text-sm">
                  🪙
                </span>
                : 25 Pts
              </p>
            </div>
          </div>
        </header>

        <section className="px-0 py-8 md:px-0">
          <h2 className="mb-4 text-2xl font-bold text-[#141517]">Main Menu</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MAIN_MENU.map((item) => {
              const Icon = item.icon;
              const card = (
                <div
                  className={`flex h-[82px] items-center justify-between rounded-[18px] border px-5 ${
                    item.isHighlight
                      ? "border-[#6a1cd4] bg-gradient-to-r from-[#5f0ec4] to-[#7d34ef] text-white"
                      : "border-[#d1d5dc] bg-[#f8f9fb] text-[#17191c]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        item.isHighlight ? "bg-white/15" : "bg-[#eef0f3]"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          item.isHighlight ? "text-white" : "text-[#667085]"
                        }
                      />
                    </div>
                    <span className="text-lg font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={20}
                    className={
                      item.isHighlight ? "text-white" : "text-[#667085]"
                    }
                  />
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className="block">
                    {card}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  className="cursor-not-allowed opacity-80"
                  title="Coming soon"
                >
                  {card}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-0 pb-8 md:px-0">
          <h2 className="mb-4 text-2xl font-bold text-[#141517]">Tools</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOOL_ITEMS.map((tool) => {
              let href = tool.href;
              if (tool.label === "Player Cards") {
                href = roleId === 3 ? "/admin-player-cards" : "/player-cards";
              }

              const button = (
                <button
                  type="button"
                  className="h-12 w-full rounded-xl border border-[#d2d6dc] bg-[#f8f9fb] px-4 text-left text-base font-medium text-[#1e2023] hover:bg-[#f1f3f6]"
                >
                  {tool.label}
                </button>
              );

              if (href && href !== "#") {
                return (
                  <Link key={tool.label} href={href} className="block">
                    {button}
                  </Link>
                );
              }

              return (
                <div
                  key={tool.label}
                  className="cursor-not-allowed opacity-80"
                  title="Coming soon"
                >
                  {button}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="grid grid-cols-1 gap-3 border-t border-[#d8dce2] px-0 py-6 md:grid-cols-3 md:px-0">
          <button
            type="button"
            className="h-12 rounded-xl bg-[#14a9c6] text-lg font-semibold text-white shadow-sm hover:bg-[#1298b2]"
          >
            Coach Login
          </button>
          <button
            type="button"
            className="h-12 rounded-xl bg-[#6202AC] text-lg font-semibold text-white shadow-sm hover:bg-[#500ba6]"
          >
            Creator
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d2d6dc] bg-[#f8f9fb] text-lg font-semibold text-[#667085] hover:bg-[#f1f3f6]"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </footer>
      </div>
    </main>
  );
}
