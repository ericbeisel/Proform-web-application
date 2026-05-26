"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Search, RotateCcw, Filter, Star, Loader2 } from "lucide-react";
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

interface Props {
  onClose: () => void;
  onSelect?: (exercise: SearchableExercise) => void;
}

export default function SearchExercisesModal({ onClose, onSelect }: Props) {
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

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions | null>(null);
  const [filters, setFilters] = useState({
    supplemental: "", resistance: "", intensity: "",
    muscle: "", type: "", location: "", max: "",
  });

  // Load favorites on mount
  useEffect(() => {
    getFavoriteExercises()
      .then((favs) => {
        console.log("[fav] favorites response:", favs);
        const ids = favs.map((f) => String(f.exercise_uuid || f.exercise_id || f.id));
        setFavoriteIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  // Search whenever query or showFavorites changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchExercises(query);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // When toggling showFavorites, if on, show favorites; if off, re-search
  useEffect(() => {
    if (showFavorites) {
      loadFavoritesView();
    } else {
      fetchExercises(query);
    }
  }, [showFavorites]);

  // Load dropdown options when filter panel opens
  useEffect(() => {
    if (showFilter && !dropdownOptions) {
      getDropdownOptions()
        .then((opts) => {
          console.log("[dropdown] full response:", opts);
          console.log("[dropdown] supplemental:", opts?.supplemental);
          console.log("[dropdown] resistance:", opts?.resistance);
          console.log("[dropdown] intensities:", opts?.intensities);
          console.log("[dropdown] muscleGroups:", opts?.muscleGroups);
          console.log("[dropdown] type:", opts?.type);
          console.log("[dropdown] exerciseLocation:", opts?.exerciseLocation);
          console.log("[dropdown] loadMeter:", opts?.loadMeter);
          console.log("[dropdown] opmRecords:", opts?.opmRecords);
          setDropdownOptions(opts);
        })
        .catch((err) => console.error("[dropdown] failed:", err));
    }
  }, [showFilter]);

  // Re-search when filters change
  useEffect(() => {
    if (!showFavorites) fetchExercises(query);
  }, [filters]);

  const LIMIT = 20;

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

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ supplemental: "", resistance: "", intensity: "", muscle: "", type: "", location: "", max: "" });

  const loadFavoritesView = async () => {
    setLoading(true);
    try {
      const res = await searchExercises({ favoritesOnly: true });
      console.log("[favorites] search favoritesOnly response:", res.total, res.exercises);
      setExercises(res.exercises);
      setTotal(res.total);
      const ids = res.exercises.map((f) => String(f.exercise_uuid || f.exercise_id || f.id));
      setFavoriteIds(new Set(ids));
    } catch (err) {
      console.error("[favorites] Failed to fetch favorites:", err);
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (ex: SearchableExercise) => {
    // Always prefer exercise_uuid (full UUID), fallback to exercise_id, then numeric id
    const exId = String(ex.exercise_uuid || ex.exercise_id || ex.id);
    console.log("[fav] toggling — exercise_uuid:", ex.exercise_uuid, "| exercise_id:", ex.exercise_id, "| using:", exId);
    if (togglingId) return;
    setTogglingId(exId);
    const isFav = favoriteIds.has(exId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(exId) : next.add(exId);
      return next;
    });
    try {
      if (isFav) {
        await removeFavoriteExercise(exId);
        console.log("[fav] removed:", exId);
      } else {
        await addFavoriteExercise(exId);
        console.log("[fav] added:", exId);
      }
    } catch (err) {
      console.error("[fav] toggle failed:", err);
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(exId) : next.delete(exId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const displayedExercises = exercises;

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[16px] font-black text-gray-900">Search all exercises:</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Exercises"
            className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 placeholder-gray-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => { setQuery(""); fetchExercises(""); }}
          className="w-10 h-10 rounded-full border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 transition"
        >
          <RotateCcw size={15} className="text-purple-600" />
        </button>
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${showFilter ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          <Filter size={15} className="text-white" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {[
              {
                label: "By Supplemental", key: "supplemental" as const,
                opts: dropdownOptions?.supplemental?.map((o) => ({ value: o, label: o })),
              },
              {
                label: "By Resistance", key: "resistance" as const,
                opts: dropdownOptions?.resistance?.map((o) => ({ value: o, label: o })),
              },
              {
                label: "By Intensity", key: "intensity" as const,
                opts: dropdownOptions?.intensities?.map((o) => ({ value: String(o), label: String(o) })),
              },
              {
                label: "By Muscle", key: "muscle" as const,
                opts: dropdownOptions?.muscleGroups?.map((o) => ({ value: o, label: o })),
              },
              {
                label: "By Type", key: "type" as const,
                opts: dropdownOptions?.type?.map((o) => ({ value: o, label: o })),
              },
              {
                label: "By Location", key: "location" as const,
                opts: dropdownOptions?.exerciseLocation?.map((o) => ({
                  value: String(o.id ?? o.title ?? o.name ?? ""),
                  label: o.title || o.name || String(o.id),
                })),
              },
              {
                label: "Filter by Max (OPM Record)", key: "max" as const,
                opts: dropdownOptions?.opmRecords?.map((o) => ({ value: o, label: o })),
              },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {label} <span className="text-red-400">*</span>
                </p>
                <select
                  value={filters[key]}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 bg-white outline-none focus:border-purple-400 appearance-none"
                >
                  <option value="">Select</option>
                  {opts?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="w-full text-[12px] font-bold text-red-400 hover:text-red-500 transition pt-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="px-4 pb-3 flex items-center justify-between">
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
        <button
          onClick={() => router.push("/location/addLocation?returnTo=/workout/athenaWorkout")}
          className="bg-purple-600 text-white text-[12px] font-bold px-4 py-2 rounded-full hover:bg-purple-700 transition"
        >
          Create Location
        </button>
      </div>

      {/* Results heading */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-[15px] font-black text-gray-900">Choose an exercise:</p>
        {!loading && (
          <p className="text-[13px] text-gray-400">{total} found</p>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={28} className="animate-spin text-purple-400" />
          </div>
        ) : displayedExercises.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-[13px]">
            {showFavorites ? "No favorites yet" : "No exercises found"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {displayedExercises.map((ex) => {
              const exId = ex.exercise_uuid || ex.exercise_id || ex.id;
              const isFav = favoriteIds.has(String(exId));
              const gifUrl = resolveMedia(ex.demo_gif || ex.demoGif);
              const name = ex.name || ex.exercise_name || "";
              return (
                <button
                  key={exId}
                  onClick={() => onSelect?.(ex)}
                  className="bg-white border border-gray-200 rounded-2xl p-3 text-left hover:border-purple-300 hover:shadow-sm transition relative"
                >
                  {/* Star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(ex); }}
                    className="absolute top-2 right-2 p-1"
                  >
                    <Star
                      size={16}
                      className={isFav ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  </button>

                  <p className="text-[11px] font-black text-gray-800 uppercase leading-tight mb-2 pr-6">
                    {name}
                  </p>

                  <div className="w-full h-28 flex items-center justify-center mb-1 overflow-hidden">
                    {gifUrl ? (
                      <img src={gifUrl} alt={name} className="h-full object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="pt-2 pb-2 flex justify-center">
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

      </div>{/* end scrollable body */}
      </div>{/* end popup card */}
    </div>
  );
}
