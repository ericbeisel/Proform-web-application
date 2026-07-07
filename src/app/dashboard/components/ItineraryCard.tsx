"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItinerary, ItineraryWorkout } from "@/api/itinerary/route";
import PerformanceStatsCard from "./PerformanceStatsCard";

interface Props {
  weeklyStats?: {
    load: number;
    str: number;
    cal: number;
    pwr: number;
  };
}

export default function ItineraryCard({ weeklyStats }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ItineraryWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItinerary()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (type: string) =>
    data.filter((w) => w.type?.toLowerCase() === type).length;

  const completed = (type: string) =>
    data.filter(
      (w) => w.type?.toLowerCase() === type && (w.completed_activity || w.completed)
    ).length;

  const totalCount = data.length;
  const totalCompleted = data.filter((w) => w.completed_activity || w.completed).length;
  const pct = totalCount > 0 ? Math.round((totalCompleted / totalCount) * 100) : 0;

  const categories = [
    { key: "workout",      label: "Workout" },
    { key: "supplemental", label: "Supplemental" },
    { key: "conditioning", label: "Conditioning" },
    { key: "cardio",       label: "Cardio" },
  ];

  return (
    <div
      onClick={() => router.push("/itinerary/itinerary-page")}
      className="h-full flex flex-col bg-[#1c1929] rounded-2xl p-5 shadow-[0_2px_12px_rgba(108,92,231,0.07)] border border-transparent cursor-pointer hover:border-purple-700/40 transition-all"
    >
      <div className="text-white/50 text-[11px] uppercase tracking-wider">
        Itinerary
      </div>
      <div className="text-white/45 text-xs mt-0.5">Activity this week</div>

      {loading ? (
        <div className="mt-4 text-white/30 text-sm">Loading...</div>
      ) : (
        <>
          <div className="text-[#fd7b4d] font-black text-7xl leading-none mt-3">
            {totalCount}
          </div>
          <div className="text-[#fd7b4d] text-xl font-bold mt-1">
            {pct}
            <span className="text-sm opacity-60 ml-1">%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categories.map(({ key, label }) => (
              <div key={key} className="bg-white/6 rounded-lg p-2.5 text-center">
                <div className="text-white text-xl font-bold">
                  {completed(key)}/{count(key)}
                </div>
                <div className="text-white/40 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex-1" onClick={(e) => e.stopPropagation()}>
            <PerformanceStatsCard
              load={weeklyStats?.load ?? 0}
              str={weeklyStats?.str ?? 0}
              cal={weeklyStats?.cal ?? 0}
              pwr={weeklyStats?.pwr ?? 0}
            />
          </div>
        </>
      )}
    </div>
  );
}
