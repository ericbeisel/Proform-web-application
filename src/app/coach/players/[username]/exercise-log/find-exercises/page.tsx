"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Menu, ChevronDown, Search, Star, Gem, Loader2 } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";
import {
  SearchableExercise,
  DropdownOptions,
  getAllExercises,
  searchExercises,
  getFavoriteExercises,
  addFavoriteExercise,
  removeFavoriteExercise,
  getDropdownOptions,
} from "@/api/workouts/route";

function resolveMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("wix:image://")) {
    const hash = url.replace("wix:image://v1/", "").split("/")[0];
    return `https://static.wixstatic.com/media/${hash}`;
  }
  return url;
}

const LIMIT = 20;

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

  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<SearchableExercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state — same shape/options as the player-facing /find-exercises page and
  // the "Search all exercises" modal on /workout/athenaWorkout, so all three surfaces
  // stay in sync with the backend.
  const [showFilter, setShowFilter] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions | null>(null);
  const [filters, setFilters] = useState({
    supplemental: "", resistance: "", intensity: "",
    muscle: "", type: "", location: "", max: "",
  });

  useEffect(() => {
    getFavoriteExercises()
      .then((favs) => {
        const ids = favs.map((f) => String(f.exercise_uuid || f.exercise_id || f.id));
        setFavoriteIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchExercises(query);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    if (showFilter && !dropdownOptions) {
      getDropdownOptions().then(setDropdownOptions).catch(() => {});
    }
  }, [showFilter]);

  useEffect(() => {
    fetchExercises(query);
  }, [filters]);

  const fetchExercises = async (q: string) => {
    setLoading(true);
    setError("");
    setPage(1);
    try {
      const hasFilters = Object.values(filters).some(Boolean);
      let res: { exercises: SearchableExercise[]; total: number };
      if (!q && !hasFilters) {
        res = await getAllExercises({ page: 1, limit: LIMIT });
      } else {
        res = await searchExercises({ q, ...filters, page: 1 });
      }
      setExercises(res.exercises);
      setTotal(res.total);
      setHasMore(res.exercises.length === LIMIT && res.exercises.length < res.total);
    } catch (err) {
      console.error("[coach find-exercises] fetchExercises failed — filters:", filters, "| query:", q, "| error:", err);
      setError(err instanceof Error ? err.message : "Failed to load exercises.");
      setExercises([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const hasFilters = Object.values(filters).some(Boolean);
      let res: { exercises: SearchableExercise[]; total: number };
      if (!query && !hasFilters) {
        res = await getAllExercises({ page: nextPage, limit: LIMIT });
      } else {
        res = await searchExercises({ q: query, ...filters, page: nextPage });
      }
      setExercises((prev) => [...prev, ...res.exercises]);
      setTotal(res.total);
      setPage(nextPage);
      setHasMore(res.exercises.length === LIMIT && exercises.length + res.exercises.length < res.total);
    } catch {
      // keep existing results
    } finally {
      setLoadingMore(false);
    }
  };

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ supplemental: "", resistance: "", intensity: "", muscle: "", type: "", location: "", max: "" });

  const toggleFavorite = async (ex: SearchableExercise) => {
    const exId = String(ex.exercise_uuid || ex.exercise_id || ex.id);
    if (togglingId) return;
    setTogglingId(exId);
    const isFav = favoriteIds.has(exId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(exId) : next.add(exId);
      return next;
    });
    try {
      if (isFav) await removeFavoriteExercise(exId);
      else await addFavoriteExercise(exId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(exId) : next.delete(exId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filterFields = [
    { label: "By Supplemental", key: "supplemental" as const, opts: dropdownOptions?.supplemental?.map((o) => ({ value: o, label: o })) },
    { label: "By Resistance", key: "resistance" as const, opts: dropdownOptions?.resistance?.map((o) => ({ value: o, label: o })) },
    { label: "By Intensity", key: "intensity" as const, opts: dropdownOptions?.intensities?.map((o) => ({ value: String(o), label: String(o) })) },
    { label: "By Muscle", key: "muscle" as const, opts: dropdownOptions?.muscleGroups?.map((o) => ({ value: o, label: o })) },
    { label: "By Type", key: "type" as const, opts: dropdownOptions?.type?.map((o) => ({ value: o, label: o })) },
    {
      label: "By Location", key: "location" as const,
      opts: dropdownOptions?.exerciseLocation?.map((o) => ({
        value: String(o.id ?? o.title ?? o.name ?? ""),
        label: o.title || o.name || String(o.id),
      })),
    },
    { label: "Filter by Max (OPM Record)", key: "max" as const, opts: dropdownOptions?.opmRecords?.map((o) => ({ value: o, label: o })) },
  ];

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
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Search panel */}
            <div className="relative bg-gradient-to-br from-[#f5f0ff] to-[#f5f5f7] rounded-2xl p-5 sm:p-6 mb-6">
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full border flex items-center justify-center transition-all ${showFilter ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white border-gray-200 text-[#8B5CF6] hover:bg-gray-100 hover:border-[#8B5CF6]/40"}`}
                aria-label="Toggle filters"
              >
                <ChevronDown size={16} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
              </button>

              <h2 className="text-lg sm:text-xl font-bold text-[#222] text-center mb-4">Find Exercises:</h2>
              <div className="relative w-full max-w-xl mx-auto">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Exercises"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full block h-11 rounded-xl bg-white border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#8B5CF6] shadow-sm transition"
                />
              </div>
            </div>

            {/* Filter panel */}
            {showFilter && (
              <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filterFields.map(({ label, key, opts }) => (
                    <div key={key} className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 truncate">
                        {label}
                      </p>
                      <select
                        value={filters[key]}
                        onChange={(e) => setFilter(key, e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-white outline-none focus:border-[#8B5CF6] appearance-none transition"
                      >
                        <option value="">Select</option>
                        {opts?.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {Object.values(filters).some(Boolean) && (
                  <button
                    onClick={clearFilters}
                    className="w-full text-[12px] font-bold text-red-400 hover:text-red-500 transition mt-3"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-5">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-[#222]">Choose an exercise:</h3>
              <Star size={16} className="text-amber-400 fill-amber-400" />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center mb-4">{error}</p>
            )}

            {/* Exercise grid */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 size={26} className="animate-spin text-[#8B5CF6]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {exercises.map((ex) => {
                  const exId = ex.exercise_uuid || ex.exercise_id || ex.id;
                  const isFav = favoriteIds.has(String(exId));
                  const gifUrl = resolveMedia(ex.demo_gif || ex.demoGif);
                  const name = ex.name || ex.exercise_name || "";
                  return (
                    <button
                      key={exId}
                      onClick={() => {
                        const params = new URLSearchParams({ id: String(exId), name });
                        router.push(`/coach/players/${username}/exercise-log/find-exercises/exercise-details?${params.toString()}`);
                      }}
                      className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#8B5CF6]/30 hover:-translate-y-0.5 transition-all text-center"
                    >
                      <span
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(ex); }}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-amber-400 hover:scale-110 transition"
                      >
                        <Star size={15} fill={isFav ? "currentColor" : "none"} />
                      </span>

                      <div className="w-full h-32 sm:h-36 flex items-center justify-center overflow-hidden">
                        {gifUrl ? (
                          <img src={gifUrl} alt={name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-[#f5f0ff] flex items-center justify-center group-hover:bg-[#ece1ff] transition-colors">
                            <Gem size={30} className="text-[#8B5CF6]" fill="#8B5CF6" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-[#222] leading-tight uppercase">
                        {name}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && exercises.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">No exercises found.</p>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-400">Filtered Exercises: {total}</p>
              {hasMore && !loading && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#8B5CF6] hover:underline"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
