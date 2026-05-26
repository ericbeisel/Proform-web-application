"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getTodayActivities, TodayActivity } from "@/api/dashboard/route";

const DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function formatTime(raw: string): string {
  const [h, m] = raw.replace(/^0+/, "").split(":").map(Number);
  const hour = isNaN(h) ? 0 : h;
  const minute = isNaN(m) ? 0 : m;
  const ampm = hour < 12 ? "am" : "pm";
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function dotColor(type: string): string {
  const t = type.toLowerCase();
  if (t === "cardio") return "bg-red-400";
  if (t === "workout") return "bg-blue-400";
  if (t === "supplemental") return "bg-green-400";
  return "bg-purple-400";
}

function getActivityPath(act: TodayActivity): string {
  const t = act.type.toLowerCase();
  if (t === "cardio") return "/todays-focus-cardio/cardio-entry";
  if (t === "workout") return `/workout/detail?code=${encodeURIComponent(act.title)}&workoutKey=${encodeURIComponent(act.workout_title)}`;
  if (t === "supplemental") return `/workout/detail?code=${encodeURIComponent(act.title)}&workoutKey=${encodeURIComponent(act.workout_title)}`;
  return "/recovery/suggestedRecovery";
}

export default function DailyTodoCard() {
  const router = useRouter();
  const todayIdx = new Date().getDay();
  const [dayIdx, setDayIdx] = useState(todayIdx);
  const [activities, setActivities] = useState<TodayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTodayActivities(DAYS[dayIdx])
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [dayIdx]);

  const dayLabel = DAYS[dayIdx].charAt(0).toUpperCase() + DAYS[dayIdx].slice(1);

  return (
    <div className="bg-[#fffde7] rounded-2xl p-4 shadow border border-[#f0e89a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800">{dayLabel}</h3>
        <button
          onClick={() => router.push("/itinerary")}
          className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition"
        >
          <ChevronRight size={14} className="text-amber-500" />
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-[12px] text-gray-400 py-4">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-center text-[12px] text-gray-400 py-4">No activities for {dayLabel}</div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              onClick={() => router.push(getActivityPath(act))}
              className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor(act.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 truncate">
                  {act.type}: {act.workout_title}
                </p>
                <p className="text-[11px] text-gray-400">
                  Before {formatTime(act.activity_time)}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Overdue banner */}
      <div
        onClick={() => router.push("/player-progress")}
        className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center text-[12px] font-semibold text-red-500 cursor-pointer hover:bg-red-100 transition"
      >
        Player Card overdue... Tap to Submit.
      </div>
    </div>
  );
}
