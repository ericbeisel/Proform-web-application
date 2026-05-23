"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, Dumbbell, Check, X, BarChart2, Loader2,
  Calendar, CheckCircle, ArrowUp, ArrowDown
} from "lucide-react";
import { getWorkoutQueue, reorderWorkoutQueue, deleteFromQueue } from "@/api/programs/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkoutQueueItem {
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
}

interface Activity {
  id: number;
  name: string;
  type: string;
  user_id: number;
  day: string;
  recurring: string;
  status: number;
  time: string;
  completed_activity: boolean;
  workout_preferences_type: number;
  remove: boolean;
  day_number: number;
  created_at: string;
  updated_at: string;
}

interface WorkoutQueueResponse {
  workouts: WorkoutQueueItem[];
  activities: Activity[];
}

interface Session {
  id: string;
  day: string;
  title: string;
  programName: string;
  week: string;
  calories: number;
  completed: boolean;
  muscles_used?: string;
  cover_photo?: string;
  activityTime?: string;
  activityDay?: string;
  group?: string;
  order?: number;
  programCode?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkoutDashboard() {
  const router = useRouter();

  const [goalCalories, setGoalCalories] = useState(4000);
  const [workouts, setWorkouts] = useState<WorkoutQueueItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState("Workout");
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatTime = (time: string | undefined): string => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const getWorkoutTitle = () => {
    switch (workoutType) {
      case "Workout":        return "Workout Queue";
      case "Field Workout":  return "Field Workout Queue";
      case "Supplemental":   return "Supplemental Queue";
      default:               return "Workout Queue";
    }
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await getWorkoutQueue(workoutType);

      if (response && typeof response === "object" && "workouts" in response && "activities" in response) {
        const q = response as unknown as WorkoutQueueResponse;
        setWorkouts(q.workouts || []);
        setActivities(q.activities || []);
      } else if (Array.isArray(response)) {
        setWorkouts(response);
        setActivities([]);
      } else if (response && typeof response === "object" && "workouts" in response) {
        setWorkouts((response as any).workouts || []);
        setActivities([]);
      } else {
        setWorkouts([]);
        setActivities([]);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching workouts:", err);
      setError(err.message || "Failed to fetch workouts");
      setWorkouts([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, [workoutType]);

  // ── Derived sessions ───────────────────────────────────────────────────────

  useEffect(() => {
    const mapped: Session[] = workouts.map((workout, index) => {
      const matchingActivity =
        activities[index] ||
        activities.find((a) => a.day.toLowerCase() === workout.day?.toLowerCase());

      return {
        id: workout.id,
        day: workout.day || matchingActivity?.day || "",
        title: workout.workout_title || workout.title,
        programName: workout.program_name,
        week: workout.week,
        calories: 0,
        completed: matchingActivity?.completed_activity || workout.completed || false,
        muscles_used: workout.muscles_used,
        cover_photo: workout.cover_photo,
        activityTime: matchingActivity?.time,
        activityDay: matchingActivity?.day,
        group: workout.group,
        order: workout.order || index + 1,
        programCode: workout.title,
      };
    });

    setSessions(mapped);
  }, [workouts, activities]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const completedSessions  = sessions.filter((s) => s.completed).length;
  const completedCalories  = sessions.filter((s) => s.completed).reduce((sum, s) => sum + s.calories, 0);
  const remainingCalories  = goalCalories - completedCalories;
  const progressPct        = Math.min((completedCalories / goalCalories) * 100, 100);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newItems = [...sessions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSessions(newItems);

    try {
      await reorderWorkoutQueue(workoutType, newItems.map((s) => s.id));
    } catch (err) {
      console.error("Failed to persist new order:", err);
    }
  };

  const handleSessionClick = (session: Session) => {
    const code = session.programCode?.toLowerCase()?.trim();
    if (!code) return;
    localStorage.removeItem("workoutProgramId");
    localStorage.setItem("workoutProgramCode", code);
    localStorage.setItem("workoutTitle", session.title);
    router.push(`/workout/detail?code=${code}&workoutKey=${encodeURIComponent(session.title)}`);
  };

  const completeActivity = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, completed: true } : s));
    setWorkouts((prev) => prev.map((w) => w.id === sessionId ? { ...w, completed: true } : w));
  };

  const deleteSession = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    setDeleteConfirm(null);
    try {
      await deleteFromQueue(id);
    } catch (err) {
      console.error("Failed to delete from queue:", err);
    }
  };

  const handleContinue = () => {
    const parsed = parseInt(newGoalValue);
    if (!isNaN(parsed) && parsed > 0) setGoalCalories(parsed);
    setShowEditGoal(false);
    setNewGoalValue("");
  };

  // ── Loading state ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white px-3 sm:px-6 lg:px-7 py-3 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10 gap-2">

        {/* Left: avatar + title */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-extrabold text-[#7c3aed] m-0 truncate">
              {getWorkoutTitle()}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0 hidden xs:block sm:block">
              {completedSessions}/{sessions.length} sessions · Track progress
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

          {/* Calendar icon */}
          <div
            onClick={() => router.push("/itinerary/itinerary-page")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Calendar size={20} className="text-[#7c3aed]" />
          </div>

          {/* Dumbbell icon */}
          <div
            onClick={() => router.push("/workout/main")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Dumbbell size={20} className="text-[#7c3aed]" />
          </div>

          {/* Workout type select */}
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="bg-gray-50 border border-[#e8e8f0] text-gray-700 text-xs sm:text-sm rounded-lg px-3 py-2 font-semibold outline-none cursor-pointer h-9 sm:h-10"
          >
            <option value="Workout">Workout</option>
            <option value="Field Workout">Field Workout</option>
            <option value="Supplemental">Supplemental</option>
          </select>

          {/* Completed button */}
          <button className="bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap hover:bg-emerald-100 transition-all h-9 sm:h-10">
            <CheckCircle size={16} />
            <span className="inline">Completed</span>
          </button>
        </div>
      </div>

      {/* ── Schedule strip ────────────────────────────────────────────────── */}
      {activities.length > 0 && (
        <div className="bg-white px-3 sm:px-6 lg:px-7 py-2 border-b border-[#e8e8f0] overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold text-purple-600">
                    {activity.day?.substring(0, 2)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{formatTime(activity.time)}</p>
                {index < activities.length - 1 && <span className="text-gray-300 text-xs">•</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!error && sessions.length === 0 && (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-blue-600">No workouts in your queue yet.</p>
            <p className="text-sm text-blue-500 mt-1">Add a program to get started!</p>
          </div>
        </div>
      )}

      {/* ── Session list ──────────────────────────────────────────────────── */}
      {sessions.length > 0 && (
        <div className="p-3 sm:p-5 lg:p-7 max-w-6xl mx-auto">
          {isReordering && (
            <div className="flex items-center gap-2 text-xs text-purple-600 mb-3">
              <Loader2 size={14} className="animate-spin" />
              <span>Updating order…</span>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:gap-2.5">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session)}
                className={`rounded-xl p-3 sm:p-5 flex items-stretch gap-2 sm:gap-3 cursor-pointer transition-all ${
                  session.completed
                    ? "bg-[#1e3a2e] border border-green-500/20"
                    : "bg-[#1e1e2e]"
                }`}
              >
                {/* ── Reorder arrows ── */}
                <div className="flex flex-col justify-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReorder(index, "up"); }}
                    disabled={index === 0 || isReordering}
                    className={`p-1 hover:bg-white/10 rounded-full transition-colors ${
                      index === 0 || isReordering ? "opacity-0 pointer-events-none" : ""
                    }`}
                  >
                    <ArrowUp size={14} className="text-purple-400" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReorder(index, "down"); }}
                    disabled={index === sessions.length - 1 || isReordering}
                    className={`p-1 hover:bg-white/10 rounded-full transition-colors ${
                      index === sessions.length - 1 || isReordering ? "opacity-0 pointer-events-none" : ""
                    }`}
                  >
                    <ArrowDown size={14} className="text-purple-400" />
                  </button>
                </div>

                {/* ── Cover photo ── */}
                {session.cover_photo && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0 self-center">
                    <img
                      src={session.cover_photo}
                      alt={session.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* ── Main content ── */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-sm sm:text-base text-white truncate">
                    {session.title}
                  </p>

                  {session.activityTime && (
                    <p className="text-xs text-blue-400 mt-0.5">
                      {session.activityDay || session.day} @ {formatTime(session.activityTime)}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                       {session.group && (
                      <span className="text-xs text-gray-400">{session.group}</span>
                    )}
                    {session.day && (
                      <span className="text-xs text-gray-400">{session.day}</span>
                    )}
                 
                  </div>

                  {session.muscles_used && (
                    <p className="text-xs text-purple-400 mt-0.5 truncate">{session.muscles_used}</p>
                  )}

                  {/* Stat pills — hidden on very small screens to save space */}
                  <div className="hidden xs:flex sm:flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {["$5-5s", "$5-15", "$3RY8"].map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Right-side controls ── */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0 justify-between">

                  {/* Order badge + type badge — stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-600/80 text-white text-[10px] sm:text-xs font-medium whitespace-nowrap">
                      {index + 1}/{sessions.length}
                    </span>
                    <span className="hidden sm:inline px-3 py-1.5 rounded-lg bg-[#2a2a3e] text-white text-xs font-medium whitespace-nowrap">
                      {workoutType}
                    </span>
                  </div>

                  {/* Checkbox + delete */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <label
                      className="relative flex items-center cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={session.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (!session.completed) completeActivity(session.id);
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-white/50 bg-white/10 flex items-center justify-center transition-all peer-checked:bg-green-500 peer-checked:border-green-500">
                        {session.completed && <Check size={12} className="text-white" />}
                      </div>
                    </label>

                    <button
                      onClick={(e) => deleteSession(session.id, session.title, e)}
                      className="bg-[#2a2a3e] border-none rounded-lg text-[#888] cursor-pointer p-1.5 sm:p-2 flex items-center justify-center hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-[360px] shadow-2xl"
          >
            <h2 className="text-[18px] font-black text-gray-900 mb-2">Remove from Queue?</h2>
            <p className="text-[13px] text-gray-500 mb-6 leading-snug">
              Are you sure you want to remove &quot;{deleteConfirm.title}&quot; from your queue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Goal Modal ───────────────────────────────────────────────── */}
      {showEditGoal && (
        <div
          onClick={() => setShowEditGoal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[540px] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowEditGoal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a2e] mb-2 leading-tight">
              Update Weekly Workout Goal
            </h2>
            <p className="text-sm text-[#999] mb-6 leading-relaxed">
              Enter your new weekly workout calorie burn target or effort goal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">
                  <Dumbbell size={14} className="text-orange-500" /> Current Goal (kcal)*
                </label>
                <input
                  type="number"
                  value={goalCalories}
                  readOnly
                  className="w-full p-4 border border-gray-200 rounded-xl text-xl font-bold text-[#1a1a2e] bg-gray-50 outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">
                  <Dumbbell size={14} className="text-orange-500" /> New Goal Per Week (kcal)*
                </label>
                <input
                  type="number"
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g., 4000"
                  className="w-full p-4 border border-gray-200 rounded-xl text-xl font-bold text-[#1a1a2e] bg-white outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <BarChart2 size={18} className="text-[#7c3aed] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
                <span className="font-semibold">Tracking Tip:</span> Consistency matters more than intensity — aim for progressive overload.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-full text-white py-4 font-bold text-sm sm:text-base cursor-pointer hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}