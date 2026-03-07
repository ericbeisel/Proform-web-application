"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardData,
  type DashboardResponse,
} from "@/api/auth/dashboard/route";
import { clearAuthSession } from "@/lib/auth/session";
import AppBottomNav from "@/components/navigation/AppBottomNav";

import DashboardHeader from "./components/DashboardHeader";
import Banner from "./components/Banner";
import ItineraryCard from "./components/ItineraryCard";
import ForYouCard from "./components/ForYouCard";
import AccountabilityTools from "./components/AccountabilityTools";
import StandardsCard from "./components/StandardsCard";
import LiveSessionsCard from "./components/LiveSessionsCard";
import DailyTodoCard from "./components/DailyTodoCard";
import ChallengesCard from "./components/ChallengesCard";
import WeeklyTargets from "./components/WeeklyTargets";
import QuickActions from "./components/QuickActions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const response = await getDashboardData();
        if (!cancelled) {
          setData(response);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard.";
        if (!cancelled) {
          const normalizedMessage = message.toLowerCase();
          const isAuthError =
            normalizedMessage.includes("invalid credential") ||
            normalizedMessage.includes("unauthorized") ||
            normalizedMessage.includes("token");

          if (isAuthError) {
            clearAuthSession();
            router.replace("/auth/login");
            return;
          }

          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const userData = useMemo(
    () => (isRecord(data?.user) ? data.user : {}),
    [data],
  );

  const details = useMemo(() => {
    const rootDetails = isRecord(data?.OtherDetail) ? data.OtherDetail : {};
    const userDetails = isRecord(userData.OtherDetail)
      ? (userData.OtherDetail as Record<string, unknown>)
      : {};

    return { ...rootDetails, ...userDetails };
  }, [data, userData]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-[#6202AC]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0eff4] text-[#1a1825] antialiased pb-20">
      <DashboardHeader activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="p-7 px-8 flex flex-col gap-6">
        <Banner />

        <div className="grid grid-cols-[280px_1fr_280px] gap-5">
          <ItineraryCard />

          <div className="space-y-5">
            <ForYouCard />
            <AccountabilityTools />
            <StandardsCard />
          </div>

          <div className="space-y-5">
            <LiveSessionsCard />
            <DailyTodoCard />
            <ChallengesCard />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <WeeklyTargets />
          <QuickActions />
        </div>
      </main>
      <AppBottomNav />
    </div>
  );
}
