"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Bell, RefreshCw, ListChecks } from "lucide-react";
import { getMissedActivities, MissedActivity as MissedActivityItem } from "@/api/itinerary/route";

const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime12(time24: string): string {
  if (!time24) return time24;
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export default function MissedActivity() {
  const router = useRouter();
  const [missed, setMissed] = useState<MissedActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getMissedActivities()
      .then(setMissed)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDisplayTitle = (item: MissedActivityItem) =>
    item.type === "CustomActivity"
      ? item.name
      : `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}: ${item.name}`;

  const getDisplayTime = (item: MissedActivityItem) => {
    const dayName = DAYS_LONG[item.day] ?? `Day ${item.day}`;
    return item.time ? `Before ${dayName} @ ${formatTime12(item.time)}` : `Before ${dayName}`;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-[22px] font-extrabold text-gray-900">
            Missed Activity
          </h1>
        </div>
        <button
          onClick={() => router.push("/itinerary/itinerary-page")}
          className="flex items-center gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex-shrink-0"
        >
          <ListChecks size={13} />
          Itinerary
        </button>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-[1100px] mx-auto">

        {/* Summary Card */}
        <div className="flex items-start gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6">
          <div className="w-11 h-11 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">
              {loading ? "Fetching missed activities..." : `${missed.length} Missed Activities`}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Complete or reschedule these activities to stay on track with your fitness goals
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw size={28} className="text-purple-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm font-semibold text-gray-700">Failed to load</p>
            <p className="text-xs text-gray-500 text-center">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && missed.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-16">
            All caught up! No missed activities this week.
          </p>
        )}

        {/* List */}
        {!loading && !error && missed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {missed.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-2xl px-5 py-4"
                style={{ borderColor: item.colour || "#FEE5E5" }}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.colour || "#F04C4C" }}
                    />
                    <p className="text-[14px] font-bold text-gray-900 truncate">
                      {getDisplayTitle(item)}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full tracking-wide flex-shrink-0"
                    style={{ backgroundColor: item.colour || "#F04C4C" }}
                  >
                    MISSED
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-5">
                  <Clock size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {getDisplayTime(item)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
