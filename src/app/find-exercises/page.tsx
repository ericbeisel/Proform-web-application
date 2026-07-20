"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Star, Loader2, Dumbbell } from "lucide-react";
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

const LIMIT = 21;

export default function FindExercisesPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<SearchableExercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state — same shape/options as the "Search all exercises" modal on
  // /workout/athenaWorkout, so both surfaces stay in sync with the backend.
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
    if (showFavorites) {
      loadFavoritesView();
    } else {
      fetchExercises(query);
    }
  }, [showFavorites]);

  useEffect(() => {
    if (showFilter && !dropdownOptions) {
      getDropdownOptions().then(setDropdownOptions).catch(() => {});
    }
  }, [showFilter]);

  useEffect(() => {
    if (!showFavorites) fetchExercises(query);
  }, [filters]);

  const fetchExercises = async (q: string) => {
    setLoading(true);
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
    } catch {
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

  const loadFavoritesView = async () => {
    setLoading(true);
    try {
      const res = await searchExercises({ favoritesOnly: true });
      setExercises(res.exercises);
      setTotal(res.total);
      const ids = res.exercises.map((f) => String(f.exercise_uuid || f.exercise_id || f.id));
      setFavoriteIds(new Set(ids));
    } catch {
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
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
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Purple header */}
      <div className="bg-purple-600 px-4 pb-5 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-purple-500/60 flex items-center justify-center text-white hover:bg-purple-500 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="flex-1 text-center text-white font-bold text-lg tracking-tight">
            Find Exercises:
          </h1>

          <div className="w-9 h-9 flex-shrink-0" aria-hidden="true" />
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-white/70 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0 ${showFilter ? "bg-purple-900" : "border-2 border-white/40 hover:bg-white/10"}`}
            aria-label="Toggle filters"
          >
            <Filter size={15} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="px-4 pt-4 pb-1">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-3">
              {filterFields.map(({ label, key, opts }) => (
                <div key={key} className="min-w-0">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">
                    {label}
                  </p>
                  <select
                    value={filters[key]}
                    onChange={(e) => setFilter(key, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-2 py-2 text-[12px] text-gray-700 bg-white outline-none focus:border-purple-400 appearance-none"
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
        </div>
      )}

      {/* Favorites toggle */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setShowFavorites((v) => !v)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
              showFavorites ? "bg-purple-600 border-purple-600" : "border-gray-300"
            }`}
          >
            {showFavorites && <span className="text-white text-[10px] font-black">✓</span>}
          </div>
          <span className="text-[13px] font-medium text-gray-700">Show Favorites</span>
        </label>
        {!loading && <p className="text-[13px] text-gray-400">{total} found</p>}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        <Star size={16} className="text-amber-400 fill-amber-400" />
        <span className="font-bold text-gray-900 text-sm">
          Choose an exercise:
        </span>
        <Star size={16} className="text-amber-400 fill-amber-400" />
      </div>

      {/* Exercise grid */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={28} className="animate-spin text-purple-400" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {showFavorites ? "No favorites yet" : "No exercises found"}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {exercises.map((ex) => {
              const exId = ex.exercise_uuid || ex.exercise_id || ex.id;
              const isFav = favoriteIds.has(String(exId));
              const gifUrl = resolveMedia(ex.demo_gif || ex.demoGif);
              const name = ex.name || ex.exercise_name || "";
              return (
                <button
                  key={exId}
                  onClick={() => {
                    console.log("[find-exercises] selected exercise id:", exId, "| name:", name, "| raw:", ex);
                    router.push(`/exercise-details?id=${encodeURIComponent(String(exId))}&name=${encodeURIComponent(name)}`);
                  }}
                  className="relative flex flex-col items-center text-center p-2 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all active:scale-95"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(ex); }}
                    className="absolute top-2 right-2 p-1 z-10"
                    aria-label="Toggle favorite"
                  >
                    <Star size={16} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  </button>

                  <div className="w-full h-28 sm:h-32 flex items-center justify-center mb-2 overflow-hidden">
                    {gifUrl ? (
                      <img src={gifUrl} alt={name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Dumbbell size={22} className="text-purple-500" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-gray-900 leading-tight uppercase">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-purple-600 text-white text-[13px] font-bold rounded-full hover:bg-purple-700 transition flex items-center gap-2"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
