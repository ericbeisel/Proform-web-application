"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Dumbbell, Check, X, BarChart2, Loader2, Route, Calendar1Icon, Calendar, CheckCircle } from "lucide-react";
import { getWorkoutQueue } from "@/api/programs/route";

// Define the actual API response type based on your data
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
}

interface Session {
  id: string;
  day: string;
  title: string;
  programName: string;
  week: string;
  calories: number;
  completed: boolean;
}

export default function WorkoutDashboard() {
  const router = useRouter();

  const [goalCalories, setGoalCalories] = useState(4000);
  const [workouts, setWorkouts] = useState<WorkoutQueueItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [workoutType, setWorkoutType] = useState("Workout");
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState("");

  // Fetch workouts from API
// 1️⃣ FETCH DATA (runs once or when API param changes)
// 1️⃣ FETCH DATA - runs when workoutType changes
useEffect(() => {
  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const response = await getWorkoutQueue(workoutType); // ← Use workoutType dynamically

      let workoutsArray: WorkoutQueueItem[] = [];

      if (Array.isArray(response)) {
        workoutsArray = response;
      }

      setWorkouts(workoutsArray);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchWorkouts();
}, [workoutType]); // ← Add workoutType as dependency

// 2️⃣ MAP to sessions - runs when workouts changes
useEffect(() => {
  const mappedSessions: Session[] = workouts.map((workout) => ({
    id: workout.id,
    day: workout.day || "",
    title: workout.workout_title || workout.title,
    programName: workout.program_name,
    week: workout.week,
    calories: 0,
    completed: workout.completed || false,
  }));

  setSessions(mappedSessions);
}, [workouts]); // ← Only depends on workouts now
  
  const scheduledCalories = sessions.reduce((sum, s) => sum + s.calories, 0);
  const completedSessions = sessions.filter((s) => s.completed).length;
  const completedCalories = sessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.calories, 0);
  const remainingCalories = goalCalories - completedCalories;
  const progressPct = Math.min((completedCalories / goalCalories) * 100, 100);

  const handleSessionClick = (sessionId: string) => {
    router.push(`/workout/detail?id=${sessionId}`);
  };

  const completeActivity = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, completed: true } : s)),
    );
    setWorkouts((prev) =>
      prev.map((w) => (w.id === sessionId ? { ...w, completed: true } : w)),
    );
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const handleContinue = () => {
    const parsed = parseInt(newGoalValue);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalCalories(parsed);
    }
    setShowEditGoal(false);
    setNewGoalValue("");
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

  const filteredWorkouts = workouts.filter(
  (w) => w.type === workoutType
);

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      {/* Top Bar */}


<div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
  <div className="flex items-center gap-2 sm:gap-3.5">
    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center font-extrabold text-base sm:text-lg text-white flex-shrink-0">
      4
    </div>
    <div>
      <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">Workout Goal</h1>
      <p className="text-[10px] sm:text-xs text-[#999] m-0">
        {completedSessions}/{sessions.length} sessions completed • Track your weekly progress
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2 sm:gap-4">
    {/* Itinerary Icon */}
    <div className="relative flex flex-col items-center group">
      <div 
        onClick={() => router.push("/itinerary/itinerary-page")}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <Calendar size={20} className="text-[#7c3aed] group-hover:scale-110 transition-transform" />
      </div>
      <div className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-20">
        <div className="w-2 h-2 bg-gray-800 rotate-45 -mb-1"></div>
        <span className="relative z-10 p-2 text-[10px] text-white whitespace-nowrap bg-gray-800 shadow-lg rounded-md font-medium">
          View Itinerary
        </span>
      </div>
    </div>

    {/* Workout Icon */}
    <div className="relative flex flex-col items-center group">
      <div 
        onClick={() => router.push("/workouts")}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <Dumbbell size={20} className="text-[#7c3aed] group-hover:scale-110 transition-transform" />
      </div>
      <div className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-20">
        <div className="w-2 h-2 bg-gray-800 rotate-45 -mb-1"></div>
        <span className="relative z-10 p-2 text-[10px] text-white whitespace-nowrap bg-gray-800 shadow-lg rounded-md font-medium">
          Workouts
        </span>
      </div>
    </div>

    {/* Dropdown Menu */}
<select
  value={workoutType}
  onChange={(e) => setWorkoutType(e.target.value)}
  className="bg-gray-50 border border-[#e8e8f0] text-gray-700 text-xs sm:text-sm rounded-lg px-3 py-2 font-semibold outline-none cursor-pointer"
>
  <option value="Workout">Workout</option>
  <option value="Field Workout">Field Workout</option>
  <option value="Supplemental">Supplemental</option>
</select>

    {/* Completed Button */}
    <button className="bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap hover:bg-emerald-100 transition-all">
      <CheckCircle size={16} /> <span className="hidden xs:inline">Completed</span>
    </button>

    {/* Add Button */}
    <button className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white px-3 sm:px-5 py-2 sm:py-2.5 cursor-pointer flex items-center gap-1.5 font-semibold text-xs sm:text-sm whitespace-nowrap shadow-sm hover:opacity-90 transition-all">
      <Plus size={16} /> <span className="hidden xs:inline">Add</span> Session
    </button>
  </div>
</div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* No Workouts Message */}
      {!error && sessions.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-blue-600">No workouts in your queue yet.</p>
            <p className="text-sm text-blue-500 mt-1">Add a program to get started!</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {sessions.length > 0 && (
        <div className="p-4 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 lg:gap-7 max-w-6xl mx-auto">
          {/* Left: Progress Overview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 order-2 lg:order-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base text-[#1a1a2e] m-0">Progress Overview</h2>
              <button
                onClick={() => setShowEditGoal(true)}
                className="bg-transparent border-none cursor-pointer text-[#bbb] p-2 rounded-lg flex items-center"
              >
                <Pencil size={15} />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-4xl sm:text-5xl font-extrabold text-green-500 leading-none">
                {completedCalories.toLocaleString()}
              </span>
              <span className="text-3xl sm:text-4xl text-[#ccc] font-light">/</span>
              <span className="text-4xl sm:text-5xl font-extrabold text-[#7c3aed] leading-none">
                {goalCalories.toLocaleString()}
              </span>
            </div>
            <div className="flex mb-4 text-xs">
              <span className="text-green-500 font-semibold min-w-[90px]">Completed</span>
              <span className="text-[#7c3aed] font-semibold ml-[30px]">Goal</span>
            </div>

            <div className="mb-1.5">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#aaa] mb-5">
              <span>
                <span className="text-orange-500 font-semibold">{scheduledCalories.toLocaleString()}</span> scheduled
              </span>
              <span>
                <span className="text-green-500 font-semibold">{Math.round(progressPct)}%</span> complete
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-xs text-[#888] font-medium mb-1.5">Sessions Left</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] m-0">
                  {sessions.length - completedSessions}
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-[#888] font-medium mb-1.5">Remaining</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-orange-500 m-0">
                  {remainingCalories.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Workout Sessions */}
          <div className="order-1 lg:order-2">
            <h2 className="font-bold text-base text-[#1a1a2e] mb-4">Workout Sessions</h2>
            <div className="flex flex-col gap-2.5">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`rounded-xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all ${
                    session.completed ? "bg-[#1e3a2e] border border-green-500/20" : "bg-[#1e1e2e]"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                        session.completed
                          ? "border-green-500 bg-green-500/10"
                          : "border-[#7c3aed] bg-[#3b3b88]/20"
                      }`}
                    >
                      {session.completed && (
                        <Check size={14} className="text-green-500" strokeWidth={2.5} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-white m-0">
                        {session.title}
                      </p>
                      <p className="text-xs text-[#888] mt-1 mb-2">
                        {session.programName} • {session.week} • {session.day}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeActivity(session.id);
                      }}
                      className={`p-2 rounded-lg font-medium text-sm ${
                        session.completed
                          ? "bg-green-600/20 text-green-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {session.completed ? "Done" : "Complete"}
                    </button>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="bg-[#2a2a3e] border-none rounded-lg text-[#888] cursor-pointer p-2 sm:p-2.5 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
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
                <div className="relative">
                  <input
                    type="number"
                    value={goalCalories}
                    readOnly
                    className="w-full p-4 pr-12 border border-gray-200 rounded-xl text-lg sm:text-xl font-bold text-[#1a1a2e] bg-gray-50 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                    <button className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs">▲</button>
                    <button className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs">▼</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">
                  <Dumbbell size={14} className="text-orange-500" /> New Goal Per Week (kcal)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g., 4000"
                    className="w-full p-4 pr-12 border border-gray-200 rounded-xl text-lg sm:text-xl font-bold text-[#1a1a2e] bg-white outline-none focus:border-[#7c3aed]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                    <button
                      onClick={() => setNewGoalValue((v) => String((parseInt(v) || 0) + 500))}
                      className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() =>
                        setNewGoalValue((v) => String(Math.max(0, (parseInt(v) || 0) - 500)))
                      }
                      className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
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