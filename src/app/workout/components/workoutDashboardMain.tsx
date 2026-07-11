"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Check, Calendar, Loader2, RefreshCw, Settings, X, Dumbbell, Flame, Sparkles, Droplet, ChevronRight } from "lucide-react";
import { getActivityWorkoutQueue, getProgramTags } from "@/api/programs/route";
import { preferenceApi } from "@/api/preferences/route";

// Maps this page's workoutType dropdown value to the matching weekly-target
// field — mirrors mobile's per-category target lookup (target_supplement_week
// etc.) in useDashboard/useActivityStats.
const WORKOUT_TYPE_TO_TARGET_FIELD: Record<string, "workout" | "conditioning" | "supplement"> = {
  "Workout": "workout",
  "Field Workout": "conditioning",
  "Supplemental": "supplement",
};

interface ActivityWorkoutQueueItem {
  id: string;
  title: string;
  workout_title: string;
  day: string;
  week: string;
  program_name: string;
  completed: boolean;
  muscles_used: string;
  cover_photo: string;
  order: number;
  micro_order: number;
  created_date: string;
  updated_date: string;
  type: string;
  queue_name: string;
  group: string;
  member_id: string;
  owner: string | null;
  completion_id: string | null;
  session_id: string | null;
  queue_id: string | null;
  created_date_2: string;
  team_id: string | null;
  archive: boolean;
  activity_id: number;
  activity_name: string;
  activity_time: string;
  activity_day: string;
  activity_status: number;
  completed_activity: boolean;
}

interface Session {
  id: string;
  day: string;
  title: string;
  programName: string;
  week: string;
  calories: number;
  completed: boolean;
  activityTime?: string;
  activityDay?: string;
  muscles_used?: string;
  cover_photo?: string;
  type?: string;
  programCode?: string;
}

export default function WorkoutDashboard() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const [workouts, setWorkouts] = useState<ActivityWorkoutQueueItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState(searchParams.get("tab") || "Workout");
  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>({});
  const [weeklyTargets, setWeeklyTargets] = useState<{ workout: number; supplement: number; conditioning: number } | null>(null);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);

  // Weekly targets rarely change — fetch once, independent of workoutType.
  useEffect(() => {
    preferenceApi.getWeeklyTarget()
      .then((target) => setWeeklyTargets({
        workout: target.workout ?? 0,
        supplement: target.supplement ?? 0,
        conditioning: target.conditioning ?? 0,
      }))
      .catch(() => setWeeklyTargets(null));
  }, []);

  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getActivityWorkoutQueue(workoutType);
        const workoutsArray = Array.isArray(response) ? response : [];
        setWorkouts(workoutsArray);
      } catch (err: any) {
        console.error("Error fetching workouts:", err);
        setError(err.message || "Failed to fetch workouts");
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [workoutType]);

  // Map to sessions with new fields
  useEffect(() => {
    const mappedSessions: Session[] = workouts.map((workout) => ({
      id: workout.id,
      day: workout.day || workout.activity_day || "",
      title: workout.workout_title || workout.title,
      programName: workout.program_name,
      week: workout.week,
      calories: 0,
      completed: workout.completed || workout.completed_activity || false,
      activityTime: workout.activity_time,
      activityDay: workout.activity_day,
      muscles_used: workout.muscles_used,
      cover_photo: workout.cover_photo,
      type: workout.type,
      programCode: workout.title,
    }));

    setSessions(mappedSessions);

    const uniqueCodes = [...new Set(mappedSessions.map((s) => s.programCode).filter(Boolean))] as string[];
    Promise.all(
      uniqueCodes.map((code) =>
        getProgramTags(code)
          .then((tags) => ({ code, tags }))
          .catch(() => ({ code, tags: [] as string[] }))
      )
    ).then((results) => {
      const map: Record<string, string[]> = {};
      results.forEach(({ code, tags }) => { map[code] = tags; });
      setTagsMap(map);
    });
  }, [workouts]);

  const completedSessions = sessions.filter((s) => s.completed).length;
  const targetField = WORKOUT_TYPE_TO_TARGET_FIELD[workoutType];
  const weeklyTarget = weeklyTargets && targetField ? weeklyTargets[targetField] : null;

  const handleSessionClick = (session: Session) => {
    const code = session.programCode?.toLowerCase()?.trim();
    const workoutKey = encodeURIComponent(session.title);
    if (!code) return;
    localStorage.removeItem("workoutProgramId");
    localStorage.setItem("workoutProgramCode", code);
    localStorage.setItem("workoutTitle", session.title);
    localStorage.setItem("workoutProgramName", session.programName || "");
    router.push(`/workout/detail?code=${code}&workoutKey=${workoutKey}&programName=${encodeURIComponent(session.programName || "")}`);
  };

  const completeActivity = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, completed: true } : s))
    );
    setWorkouts((prev) =>
      prev.map((w) => (w.id === sessionId ? { ...w, completed: true, completed_activity: true } : w))
    );
  };

  // Helper to format time (08:30:00 → 8:30 AM)
  const formatTime = (time: string | undefined): string => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      {/* Top Bar - Responsive with original sizes */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3.5">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">
                {workoutType === "Workout" ? "Workout Queue" :
                 workoutType === "Field Workout" ? "Field Workout Queue" :
                 "Supplemental Queue"}
              </h1>
              <button
                onClick={() => router.push("/preferences?openWeeklyTargets=true")}
                className="text-[10px] sm:text-xs text-[#999] m-0 hover:text-[#7c3aed] hover:underline transition-colors text-left"
              >
                <span className="font-bold text-[#7c3aed]">{completedSessions}</span>
                /{weeklyTarget ?? sessions.length} sessions completed
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {/* Settings Icon */}
            <div className="relative flex flex-col items-center group">
              <div 
               
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <Settings size={18} className="text-[#7c3aed]" />
              </div>
            </div>

            {/* Refresh/Spinning Arrow Icon */}
            <div className="relative flex flex-col items-center group">
              <div 
               
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw size={18} className="text-[#7c3aed]" />
              </div>
            </div>

            {/* Calendar Icon */}
            <div className="relative flex flex-col items-center group">
              <div onClick={() => router.push("/itinerary/itinerary-page")} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <Calendar size={18} className="text-[#7c3aed]" />
              </div>
            </div>

            {/* Dropdown Select */}
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="bg-gray-50 border border-[#e8e8f0] text-gray-700 text-xs sm:text-sm rounded-lg px-3 py-1.5 sm:py-2 font-semibold outline-none cursor-pointer"
            >
              <option value="Workout">Workout</option>
              <option value="Field Workout">Field Workout</option>
              <option value="Supplemental">Supplemental</option>
            </select>

            {/* Edit Queue Button + Plus Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push("/workout")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                  <path d="M4 20h16" />
                </svg>
                Edit Queue
              </button>

              <button
                onClick={() => setShowQuickLogModal(true)}
                className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white p-1.5 sm:p-2 cursor-pointer flex items-center justify-center shadow-sm hover:opacity-90 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* No Workouts Message */}
      {!error && sessions.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
                <Calendar size={32} className="text-[#7c3aed]" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No workouts scheduled
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              Add {workoutType === "Workout" ? "workout" : 
                   workoutType === "Field Workout" ? "field workout" : 
                   "supplemental"} to your weekly schedule
            </p>
            
            <button
              onClick={() => router.push("/programs/all-programs")}
              className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm"
            >
              <Plus size={16} />
              Find Workout
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Responsive Grid with original card sizes */}
      {sessions.length > 0 && (
        <div className="p-4 sm:p-5 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
            <div>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-[#7c3aed]">{sessions.length}</span> total {workoutType}{sessions.length !== 1 ? '(s)' : ''} on your schedule this week
              </p>
            </div>
            
            <button 
              onClick={() => router.push(`/workout/edit-schedule?type=${workoutType}`)}
              className="bg-blue-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                <path d="M4 20h16" />
              </svg>
              Edit Schedule
            </button>
          </div>

          {/* Responsive Grid - Cards keep original size, grid adjusts columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  session.completed ? "opacity-75" : ""
                }`}
                style={{
                  backgroundImage: session.cover_photo ? `url(${session.cover_photo})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "220px",
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                
                {/* Content */}
                <div className="relative p-4 sm:p-5 flex flex-col h-full min-h-[220px]">
                  {/* Top Row - Type Badge */}
                  <div className="flex justify-end">
                    <div className="px-3 py-1.5 rounded-lg bg-green-600/80 backdrop-blur-sm text-white text-xs font-medium whitespace-nowrap border border-green-400/30">
                      {session.type || "Workout"}
                    </div>
                  </div>
                  
                  {/* Middle Content */}
                  <div className="flex-1 mt-2">
                    <p className="text-xs mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      <span className="text-blue-400 text-xs">
                        By {session.activityDay || session.day} @ {formatTime(session.activityTime)}
                      </span>
                    </p>

                    {session.programName && (
                      <p className="text-[11px] text-purple-400 font-medium mb-0.5 line-clamp-1 uppercase tracking-wide">
                        {session.programName}
                      </p>
                    )}

                    <p className="font-bold text-base sm:text-lg text-white m-0 mb-1 line-clamp-2">
                      {session.title}
                    </p>
    {session.programCode && tagsMap[session.programCode]?.length > 0 && (() => {
                      const BADGE_MAP: Record<string, string> = { UES: "Bench", LES: "Squat", CCS: "Clean", HHP: "Deadlift" };
                      const badges = tagsMap[session.programCode]
                        .map((tag) => BADGE_MAP[tag.replace("$", "").toUpperCase()])
                        .filter(Boolean) as string[];
                      if (!badges.length) return null;
                      return (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {badges.map((name) => (
                            <span
                              key={name}
                              className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-semibold backdrop-blur-sm"
                            >
                              ${name}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                    {session.muscles_used && (
                      <p className="text-xs text-white flex items-center gap-1.5 mt-1 line-clamp-1">
                        {session.muscles_used}
                      </p>
                    )}

                
                  </div>
                  
                  {/* Bottom Row - Checkbox */}
                  <div className="flex justify-end mt-2">
                    <label className="relative flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={session.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (!session.completed) {
                            completeActivity(session.id);
                          }
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-white/50 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all peer-checked:bg-green-500 peer-checked:border-green-500 peer-hover:border-white/80">
                        {session.completed && <Check size={12} className="text-white" />}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Log bottom sheet — mirrors mobile's SupplementalWorkoutsScreen
          "+" button: purely a UI router into one of four logging flows, no
          API call of its own. */}
      {showQuickLogModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setShowQuickLogModal(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Log Activity</h3>
              <button
                onClick={() => setShowQuickLogModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={15} className="text-gray-600" />
              </button>
            </div>

            <div className="p-3">
              {[
                {
                  key: "workout",
                  label: "Workout",
                  sub: "Log from your workout queue",
                  icon: Dumbbell,
                  color: "bg-violet-50 text-[#6d28d9]",
                  onSelect: () => {
                    setShowQuickLogModal(false);
                    setWorkoutType("Workout");
                  },
                },
                {
                  key: "cardio",
                  label: "Cardio",
                  sub: "Quick log a cardio session",
                  icon: Flame,
                  color: "bg-red-50 text-red-500",
                  onSelect: () => {
                    setShowQuickLogModal(false);
                    router.push("/todays-focus-cardio/cardio-entry");
                  },
                },
                {
                  key: "recovery",
                  label: "Recovery",
                  sub: "Log a recovery session",
                  icon: Sparkles,
                  color: "bg-purple-50 text-purple-600",
                  onSelect: () => {
                    setShowQuickLogModal(false);
                    router.push("/recovery/suggestedRecovery");
                  },
                },
                {
                  key: "hydrate",
                  label: "Hydrate",
                  sub: "Log your water intake",
                  icon: Droplet,
                  color: "bg-sky-50 text-sky-500",
                  onSelect: () => {
                    setShowQuickLogModal(false);
                    router.push("/hydration/submitHydration");
                  },
                },
              ].map(({ key, label, sub, icon: Icon, color, onSelect }) => (
                <button
                  key={key}
                  onClick={onSelect}
                  className="w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl hover:bg-gray-50 transition text-left"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900">{label}</p>
                    <p className="text-[12px] text-gray-400">{sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}