"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, Trash2, Dumbbell, Loader2 } from "lucide-react";
import { getExerciseLogs, type ExerciseLogEntry, type ExerciseLogSet } from "@/api/workouts/route";

const LIMIT = 10;

function formatLoggedAt(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return `${datePart} ${timePart}`;
}

// Sets can carry reps, a timed/range value, and/or a weight — shape varies by unit_type,
// so build a short human label instead of assuming one fixed field combination.
function formatSetLabel(s: ExerciseLogSet): string {
  const parts: string[] = [];

  if (s.unit_type === "range" && s.value != null && s.value_secondary != null) {
    parts.push(`${s.value}-${s.value_secondary} reps`);
  } else if ((s.unit_type === "reps" || s.unit_type === "amrp") && s.reps != null) {
    parts.push(`${s.reps} reps`);
  } else if (s.unit_type === "sec" && s.value != null) {
    parts.push(`${s.value} sec`);
  } else if (s.unit_type === "meters" && s.value != null) {
    parts.push(`${s.value} m`);
  } else if (s.value != null) {
    parts.push(`${s.value}${s.value_secondary != null ? `-${s.value_secondary}` : ""} ${s.unit_type}`);
  } else if (s.reps != null) {
    parts.push(`${s.reps} reps`);
  }

  const unit = s.measurement && s.measurement !== "resistant" ? s.measurement : "";
  if (s.weight_1 != null && s.weight_2 != null && s.weight_2 !== s.weight_1) {
    parts.push(`${s.weight_1}-${s.weight_2}${unit}`.trim());
  } else if (s.weight_1) {
    parts.push(`${s.weight_1}${unit}`.trim());
  }

  return parts.length ? parts.join(" @ ") : `Set ${s.set_number}`;
}

export default function ExerciseLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getExerciseLogs({ page: 1, limit: LIMIT })
      .then((res) => {
        setLogs(res.data);
        setTotal(res.meta.total);
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load exercise logs."))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getExerciseLogs({ page: nextPage, limit: LIMIT });
      setLogs((prev) => [...prev, ...res.data]);
      setTotal(res.meta.total);
      setPage(res.meta.page);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more exercise logs.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Filters only the logs already loaded — the backend list endpoint has no free-text
  // search param, only an exerciseId filter, so this can't search the whole history.
  const filtered = logs.filter((log) =>
    log.exercise_title.toLowerCase().includes(search.toLowerCase()),
  );

  // TODO(backend): no endpoint yet to delete an exercise log — local-only for now.
  const remove = (id: number) => setLogs((prev) => prev.filter((l) => l.id !== id));

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Purple header */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pb-6 pt-4">
        {/* Avatar above title */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-400/60 border-2 border-white/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        </div>

        {/* Back + title row */}
        <div className="flex items-center mb-5">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white transition-colors p-1 -ml-1"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-white font-bold text-lg tracking-tight pr-6">
            Individual Exercise Log
          </h1>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-white/60 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Exercise"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => router.push("/find-exercises")}
            className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md transition-colors"
            aria-label="Add exercise"
          >
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={26} className="animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        ) : (
          <>
            {!loading && (
              <p className="text-xs text-gray-400 px-1">{total} logged</p>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                {search ? "No exercises found" : "No exercise logs yet"}
              </div>
            )}

            {filtered.map((log) => {
              const completedCount = log.sets.filter((s) => s.completed).length;
              const totalSets = log.sets.length;
              const dotColor =
                totalSets > 0 && completedCount === totalSets
                  ? "bg-emerald-500"
                  : completedCount > 0
                  ? "bg-amber-500"
                  : "bg-gray-300";
              const photo = log.photos[0];

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => remove(log.id)}
                    className="flex-shrink-0 mt-0.5 text-red-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Delete exercise log"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Exercise icon / photo */}
                  <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={log.exercise_title} className="w-full h-full object-cover" />
                    ) : (
                      <Dumbbell size={20} className="text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name + logged date */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {log.exercise_title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        Logged:<br />
                        {formatLoggedAt(log.logged_at)}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-gray-500 italic mb-2">{log.notes}</p>
                    )}

                    {/* Set pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {log.sets.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 font-medium"
                        >
                          Set {s.set_number}: {formatSetLabel(s)}
                        </span>
                      ))}
                      {log.sets.length === 0 && (
                        <span className="text-[11px] text-gray-400">No sets recorded</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                      <span className="text-xs text-gray-600">
                        {totalSets > 0 ? `${completedCount}/${totalSets} sets completed` : "No sets"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {page < totalPages && (
              <div className="pt-2 flex justify-center">
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
          </>
        )}
      </div>
    </div>
  );
}
