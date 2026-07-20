"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Menu, ChevronDown, ChevronRight, Star, Gem } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

// TODO(backend): no endpoint exists yet to search the full exercise catalog for a coach
// adding an exercise to a player's log. Dummy placeholder list (10 shown here out of a
// dummy "901" total) until a real catalog search API is added.
interface FindableExercise {
  id: number;
  name: string;
  equipment: string;
  hasPhoto: boolean;
}

const DUMMY_EXERCISES: FindableExercise[] = [
  { id: 1, name: "1/2 KNEELING TOTAL LUNGE COMPLEX", equipment: "", hasPhoto: false },
  { id: 2, name: "1/2-KNEELING SL HIP-OPENERS", equipment: "", hasPhoto: false },
  { id: 3, name: "ROLL-OUT", equipment: "AB-WHEEL", hasPhoto: true },
  { id: 4, name: "STANDING SL KICKBACKS", equipment: "ANKLE-WEIGHTS", hasPhoto: false },
  { id: 5, name: "RUN (MAX EFF.)", equipment: "ARC/ELLIPTICAL", hasPhoto: true },
  { id: 6, name: "RUN (50% EFF.)", equipment: "ARC/ELLIPTICAL", hasPhoto: true },
  { id: 7, name: "BUILD-UP (60-80-95)", equipment: "ARC/ELLIPTICAL", hasPhoto: true },
  { id: 8, name: "TEMPO RUN (5s/10s)", equipment: "ARC/ELLIPTICAL", hasPhoto: true },
  { id: 9, name: "RUN (80% EFF.)", equipment: "ARC/ELLIPTICAL", hasPhoto: true },
  { id: 10, name: "ASSISTED VERTICAL JUMP", equipment: "", hasPhoto: true },
];

function stub(label: string) {
  alert(`${label} — coming soon (backend endpoint pending).`);
}

export default function FindExercisesPage() {
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
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const visibleExercises = DUMMY_EXERCISES.filter((e) =>
    `${e.equipment} ${e.name}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
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
              onClick={() => router.push(`/coach/players/${username}/exercise-log`)}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#F59E0B] uppercase leading-none truncate">
                Master Profile
              </p>
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                Find Exercises
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Search panel */}
            <div className="relative bg-[#f5f5f7] rounded-2xl p-5 sm:p-6 mb-6">
              <button
                onClick={() => stub("Show Filters")}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ChevronDown size={16} className="text-[#8B5CF6]" />
              </button>

              <h2 className="text-lg sm:text-xl font-bold text-[#222] text-center mb-4">Find Exercises:</h2>
              <input
                type="text"
                placeholder="Search Exercises"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xl mx-auto block h-11 rounded-xl bg-white border border-gray-200 px-4 text-sm outline-none focus:border-[#8B5CF6] transition"
              />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#222] text-center mb-5">Choose an exercise:</h3>

            {/* Exercise grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
              {visibleExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    const params = new URLSearchParams({
                      name: ex.name,
                      equipment: ex.equipment,
                      hasPhoto: ex.hasPhoto ? "1" : "0",
                    });
                    router.push(`/coach/players/${username}/exercise-log/find-exercises/exercise-details?${params.toString()}`);
                  }}
                  className="relative flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[#f5f5f7] transition text-center"
                >
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(ex.id);
                    }}
                    className="absolute top-0 right-0 text-amber-400 hover:scale-110 transition"
                  >
                    <Star size={16} fill={favorites.has(ex.id) ? "currentColor" : "none"} />
                  </span>

                  <div className="w-16 h-16 flex items-center justify-center">
                    {ex.hasPhoto ? (
                      <div className="w-14 h-14 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-2xl">🏃</div>
                    ) : (
                      <Gem size={32} className="text-[#8B5CF6]" fill="#8B5CF6" />
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-[#222] leading-tight uppercase">
                    {ex.equipment ? `${ex.equipment} ${ex.name}` : ex.name}
                  </p>
                </button>
              ))}
            </div>

            {visibleExercises.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">No exercises found.</p>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-400">Filtered Exercises: 901</p>
              <button
                onClick={() => stub("Next Page")}
                className="flex items-center gap-1 text-sm font-semibold text-[#8B5CF6] hover:underline"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
