"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Menu, Search, Clock, Trash2, Eye, Plus } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

// TODO(backend): no endpoint exists yet for a coach to view/manage a specific player's
// individual exercise log. Dummy placeholders matching the design until a real
// per-player exercise-log API is added.
interface ExerciseLogEntry {
  id: number;
  name: string;
  equipment: string;
  repsTime: string;
  sets: string;
  weight?: string;
  createdAt: string;
  setSummary: string;
}

function buildDummyExercises(): ExerciseLogEntry[] {
  const today = new Date().toLocaleDateString();
  return [
    {
      id: 1,
      name: "BUILD-UP (60-80-95)",
      equipment: "ARC/ELLIPTICAL",
      repsTime: "15",
      sets: "1x",
      weight: "10lbs",
      createdAt: `${today} 12:19 pm`,
      setSummary: "Set 1: 10 reps (12)",
    },
    {
      id: 2,
      name: "ROLL-OUT",
      equipment: "AB-WHEEL",
      repsTime: "12-15",
      sets: "1x",
      createdAt: `${today} 12:01 pm`,
      setSummary: "Set 1: 10 reps (20)",
    },
  ];
}

function stub(label: string) {
  alert(`${label} — coming soon (backend endpoint pending).`);
}

export default function ExerciseLogPage() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "");
    const tokenPayload = getTokenPayload();
    const coachUsername = (user?.username as string | undefined) ?? tokenPayload?.username;
    if (coachUsername) {
      profileApi.getProfileByUsername(coachUsername).then((p) => {
        if (p?.image) setProfilePicture(p.image);
        if (!user?.name) {
          const display = p?.name || p?.username || coachUsername;
          if (display) setUserInitial((display as string)[0]?.toUpperCase() ?? "");
        }
      }).catch(() => {});
    } else if (tokenPayload?.email) {
      setUserInitial(tokenPayload.email[0]?.toUpperCase() ?? "");
    }
  }, []);

  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<ExerciseLogEntry[]>(buildDummyExercises);

  const visibleExercises = exercises.filter((e) =>
    `${e.name} ${e.equipment}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function removeExercise(id: number) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex overflow-x-hidden">
      <CoachSidebar
        profilePicture={profilePicture}
        userInitial={userInitial}
        onSwitchToPlayer={() => router.replace("/team/teams")}
        onLogOut={handleLogOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="md:ml-[220px] flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <Menu size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => router.push(`/coach/players/${username}`)}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#F59E0B] uppercase leading-none truncate">
                Master Profile
              </p>
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                Individual Exercise Log
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Search + Add */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Exercise"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f5f7] pl-9 pr-3 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>
              <button
                onClick={() => router.push(`/coach/players/${username}/exercise-log/find-exercises`)}
                className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] transition shrink-0"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>

            {/* Exercise list */}
            <div className="flex flex-col gap-3">
              {visibleExercises.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No exercises found.</p>
              ) : (
                visibleExercises.map((ex) => (
                  <div key={ex.id} className="bg-[#fafafa] border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => stub("Exercise History")} className="text-[#8B5CF6] hover:opacity-70 transition">
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => removeExercise(ex.id)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-[#8B5CF6] hover:bg-gray-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-[#10B981] text-right">Created : {ex.createdAt}</p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="flex flex-col items-center gap-1 shrink-0 w-28">
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 text-2xl font-bold">
                          🏋
                        </div>
                        <p className="text-[11px] font-bold text-[#222] text-center leading-tight uppercase">
                          {ex.name}
                          <br />
                          {ex.equipment}
                        </p>
                      </div>

                      <div className="flex-1 min-w-[220px] grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400">Reps/Time</p>
                          <p className="text-sm font-bold text-[#222]">{ex.repsTime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400">Sets</p>
                          <p className="text-sm font-bold text-[#222]">{ex.sets}</p>
                        </div>
                        {ex.weight && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400">Weight/Resistance</p>
                            <p className="text-sm font-bold text-[#222]">{ex.weight}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => stub("Toggle Visibility")} className="text-[#8B5CF6] hover:opacity-70 transition">
                        <Eye size={16} />
                      </button>
                      <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
                        {ex.setSummary}
                      </span>
                      <button
                        onClick={() => stub("Add Set")}
                        className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-[#8B5CF6] hover:bg-gray-50 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
