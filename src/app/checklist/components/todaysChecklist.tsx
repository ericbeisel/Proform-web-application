"use client";

import { useState, useEffect } from "react";
import { Calendar, Settings, X, Plus, Clock, AlertCircle, Loader2, ListChecks } from "lucide-react";
import AddActivityModal from "./addActivityModal";
import { useRouter } from "next/navigation";
import { getTodayActivities, getSuggestions, type TodayActivity, type Suggestion } from "@/api/checklist/route";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ── Unified card item ── */
interface ChecklistItem {
  id: string;
  displayTitle: string;
  type: string;        // "Workout" | "Supplemental" | "Suggestion" | …
  time: string;
  overdue: boolean;
  isWorkout: boolean;
  dayText?: string;
  dotColor?: string;
  workoutCode?: string;
  workoutKey?: string;
  apiCompleted?: boolean;
  typeLink?: string;
}

const TYPE_BADGE: Record<string, string> = {
  Workout:      "bg-blue-100 text-blue-600",
  Supplemental: "bg-green-100 text-green-600",
  Suggestion:   "bg-gray-100 text-gray-500",
  Cardio:       "bg-orange-100 text-orange-500",
  Recovery:     "bg-purple-100 text-purple-600",
  Hydration:    "bg-cyan-100 text-cyan-600",
};

const TYPE_RING: Record<string, string> = {
  Workout:      "border-blue-400",
  Supplemental: "border-green-400",
  Suggestion:   "border-gray-500",
  Cardio:       "border-orange-400",
  Recovery:     "border-purple-400",
  Hydration:    "border-cyan-400",
};

const TYPE_DOT: Record<string, string> = {
  Workout:      "bg-blue-500",
  Supplemental: "bg-green-500",
  Suggestion:   "bg-gray-400",
  Cardio:       "bg-orange-500",
  Recovery:     "bg-purple-500",
  Hydration:    "bg-cyan-500",
};

function formatTime(t: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

function isOverdue(t: string): boolean {
  if (!t) return false;
  const [hStr, mStr] = t.split(":");
  const slot = new Date();
  slot.setHours(parseInt(hStr, 10), parseInt(mStr ?? "0", 10), 0, 0);
  return new Date() > slot;
}

function activityToItem(a: TodayActivity): ChecklistItem {
  const over = !a.completed && isOverdue(a.activity_time);
  return {
    id: a.id,
    displayTitle: `${a.type}: ${a.workout_title}`,
    type: a.type,
    time: a.activity_time ? `Before ${formatTime(a.activity_time)}` : "",
    overdue: over,
    isWorkout: a.type === "Workout" || a.type === "Supplemental",
    workoutCode: a.title,
    workoutKey: a.workout_title,
    apiCompleted: a.completed,
  };
}

function suggestionToItem(s: Suggestion): ChecklistItem {
  const displayTitle = (s.name ?? s.title ?? s.description ?? "Suggestion") as string;
  const t = (s.time ?? "") as string;
  return {
    id: `sug-${s.id}`,
    displayTitle,
    type: "Suggestion",
    time: t ? `Before ${formatTime(t)}` : "",
    overdue: t ? isOverdue(t) : false,
    isWorkout: false,
    dayText: (s.DayText ?? "") as string,
    dotColor: (s.colour ?? "") as string,
    apiCompleted: s.completed === true,
    typeLink: (s.typeLink ?? "") as string,
  };
}

export default function TodaysChecklist() {
  const router = useRouter();
  const today = DAYS[new Date().getDay()];

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideSuggested, setHideSuggested] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const memberId = (() => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) return String(JSON.parse(raw)?.id ?? "");
      } catch { /* ignore */ }
      return "";
    })();

    Promise.allSettled([
      getTodayActivities(today),
      memberId ? getSuggestions(memberId) : Promise.resolve([] as Suggestion[]),
    ]).then(([actRes, sugRes]) => {
      const acts: ChecklistItem[] =
        actRes.status === "fulfilled"
          ? (actRes.value.activities ?? []).map(activityToItem)
          : [];
      const sugs: ChecklistItem[] =
        sugRes.status === "fulfilled"
          ? (sugRes.value as Suggestion[]).map(suggestionToItem)
          : [];
      const all = [...acts, ...sugs];
      // sort by raw time value so suggestions appear in chronological order
      all.sort((a, b) => {
        const toMins = (t: string) => {
          const [h, m] = t.replace("Before ", "").split(":");
          return parseInt(h, 10) * 60 + parseInt(m, 10);
        };
        const ta = a.time ? toMins(a.time) : 9999;
        const tb = b.time ? toMins(b.time) : 9999;
        return ta - tb;
      });
      setItems(all);
      setCompleted(new Set(all.filter((i) => i.apiCompleted).map((i) => i.id)));
      console.log("[checklist] list refreshed —", all.length, "items:", all.map((i) => i.displayTitle));
    }).catch(() => setError("Failed to load activities."))
      .finally(() => setLoading(false));
  }, [today, refreshKey]);


  const nonSuggestionCount = items.filter((i) => i.type !== "Suggestion").length;
  const showSuggestions = !hideSuggested && nonSuggestionCount < 10;
  const visible = items.filter((i) => i.type !== "Suggestion" || showSuggestions);
  const total = visible.length;
  const doneCount = [...completed].filter((id) => visible.find((i) => i.id === id)).length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const overdueCount = visible.filter((i) => i.overdue && i.type !== "Suggestion" && !completed.has(i.id)).length;

  return (
    <div
      className="min-h-screen bg-gray-100 w-full"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-white w-full overflow-hidden">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Daily Progress</p>
              <p className="text-2xl font-extrabold text-gray-900 leading-tight">{progress}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/itinerary/itinerary-page")}
              className="flex items-center gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
            >
              <ListChecks size={13} />
              Itinerary
            </button>
            {overdueCount > 0 && (
              <button
                onClick={() => router.push("/checklist/missed-activity")}
                className="flex items-center gap-1 border border-red-200 bg-red-50 text-red-500 text-[11px] font-semibold px-2.5 py-1.5 rounded-full"
              >
                <AlertCircle size={12} />
                {overdueCount} Missed
              </button>
            )}
            <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
              <Settings size={17} />
            </button>
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Title + Hide Suggested ── */}
        <div className="px-4 pt-5 pb-2">
          <h1 className="text-2xl font-extrabold text-gray-900">Today's Checklist</h1>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">{doneCount} of {total} completed</p>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
              <input
                type="checkbox"
                checked={hideSuggested}
                onChange={() => setHideSuggested(!hideSuggested)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-purple-600"
              />
              Hide Suggested
            </label>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="px-4 pb-4">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-4 pb-6">
          {/* ── Day header ── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">{today}</h2>
            <button
              onClick={() => setShowAdd(true)}
              className="w-10 h-10 rounded-full bg-purple-700 hover:bg-purple-800 flex items-center justify-center text-white shadow-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* ── Activity list ── */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={26} className="animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500 text-sm">{error}</div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No activities scheduled for today.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((item) => {
                const done = completed.has(item.id);
                const ring = TYPE_RING[item.type] ?? "border-gray-300";
                const dot  = TYPE_DOT[item.type]  ?? "bg-gray-400";
                const badge = TYPE_BADGE[item.type] ?? "bg-gray-100 text-gray-500";

                const customDotStyle = item.dotColor ? { backgroundColor: item.dotColor } : undefined;
                const customRingStyle = item.dotColor ? { borderColor: item.dotColor } : undefined;
                const subText = done && item.dayText ? item.dayText : item.time;
                const subTextIcon = done && item.dayText ? null : (item.time ? <Clock size={11} className="text-gray-400 flex-shrink-0" /> : null);

                const isMealSuggestion =
                  item.type === "Suggestion" &&
                  (item.typeLink?.toLowerCase() === "meal" ||
                    item.displayTitle.toLowerCase().includes("meal"));

                const isHydrationSuggestion =
                  item.type === "Suggestion" &&
                  (item.typeLink?.toLowerCase() === "hydration" ||
                    item.displayTitle.toLowerCase().includes("hydration"));

                const isRecoverySuggestion =
                  item.type === "Suggestion" &&
                  (item.typeLink?.toLowerCase() === "recovery" ||
                    item.displayTitle.toLowerCase().includes("recovery"));

                const handleCardClick = () => {
                  if (isMealSuggestion) {
                    router.push("/micros");
                    return;
                  }
                  if (isHydrationSuggestion) {
                    router.push("/hydration/hydrationDashboard");
                    return;
                  }
                  if (isRecoverySuggestion) {
                    router.push("/recovery/recovery-dashboard");
                    return;
                  }
                  if (item.type === "Cardio") {
                    router.push("/todays-focus-cardio/cardio-entry");
                    return;
                  }
                  if (item.type === "Hydration") {
                    router.push("/hydration/hydrationDashboard");
                    return;
                  }
                  if (item.type === "Recovery") {
                    router.push("/recovery/recovery-dashboard");
                    return;
                  }
                  if (item.isWorkout) {
                    router.push(`/workout/detail?code=${encodeURIComponent(item.workoutCode ?? "")}&workoutKey=${encodeURIComponent(item.workoutKey ?? "")}`);
                    return;
                  }
                  // Suggestion (no matching action) — nothing to do on click.
                };

                return (
                  <div
                    key={item.id}
                    onClick={handleCardClick}
                    className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                      item.overdue && item.type !== "Suggestion" && !done
                        ? "border-red-300 bg-white"
                        : done && item.type === "Suggestion"
                        ? "border-dashed border-gray-300 bg-gray-50"
                        : done
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge}`}>
                        {item.type}
                      </span>
                      {item.overdue && !done && item.type !== "Suggestion" && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-500">
                          Overdue
                        </span>
                      )}
                    </div>

                    {/* Content row */}
                    <div className="flex items-center gap-3">
                      {/* Circle toggle */}
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.dotColor ? "" : ring} ${done ? "bg-opacity-10" : "bg-white"}`}
                        style={customRingStyle}
                      >
                        {done && (
                          item.dotColor
                            ? <div className="w-4 h-4 rounded-full" style={customDotStyle} />
                            : <div className={`w-4 h-4 rounded-full ${dot}`} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-bold leading-tight ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {item.displayTitle}
                        </p>
                        {subText && (
                          <div className="flex items-center gap-1 mt-1">
                            {subTextIcon}
                            <span className="text-xs text-gray-400">{subText}</span>
                          </div>
                        )}
                      </div>

                      {/* Start button (workouts only) */}
                      {item.isWorkout && !done && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/workout/detail?code=${encodeURIComponent(item.workoutCode ?? "")}&workoutKey=${encodeURIComponent(item.workoutKey ?? "")}`);
                          }}
                          className="flex-shrink-0 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── View Week ── */}
          <button
            onClick={() => router.push("/checklist/weekly-agenda")}
            className="mt-5 w-full border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Calendar size={17} />
            View Week
          </button>
        </div>
      </div>

      {showAdd && (
        <AddActivityModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); setRefreshKey((k) => k + 1); }}
          day={today}
        />
      )}
    </div>
  );
}
