"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Menu, Search, Trash2, Plus, Loader2, Dumbbell, User, X } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";
import { deleteExerciseLog, getExerciseLogs, type ExerciseLogEntry, type ExerciseLogSet } from "@/api/workouts/route";
import { coachApi } from "@/api/coach/route";

const LIMIT = 10;

function formatLoggedAt(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return `${datePart} ${timePart}`;
}

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

export default function GlobalExerciseLogPage() {
  const router = useRouter();

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  // Load Coach Profile Info
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
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Load all players' logs (without username filter)
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

  const removeLog = async (id: number) => {
    if (deletingId) return;
    setConfirmId(null);
    setDeletingId(id);
    const previous = logs;
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteExerciseLog(id);
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setLogs(previous);
      setError(err instanceof Error ? err.message : "Failed to delete exercise log.");
    } finally {
      setDeletingId(null);
    }
  };

  // Add Log Flow (Choose Player Modal)
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");

  const handleOpenAddLog = async () => {
    setPlayerModalOpen(true);
    setLoadingPlayers(true);
    try {
      const coachTeams = await coachApi.getCoachTeams();
      const allPlayers: any[] = [];
      const seenIds = new Set<number>();
      for (const t of coachTeams) {
        const teamPlayers = await coachApi.getTeamPlayers({ team_id: t.id });
        const playerList = Array.isArray(teamPlayers) ? teamPlayers : (teamPlayers?.players || []);
        for (const p of playerList) {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            allPlayers.push(p);
          }
        }
      }
      setPlayers(allPlayers);
    } catch (err) {
      console.error("Failed to load players list:", err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    (p.name || "").toLowerCase().includes(playerSearch.toLowerCase()) ||
    (p.username || "").toLowerCase().includes(playerSearch.toLowerCase())
  );

  const visibleLogs = logs.filter((log) =>
    log.exercise_title.toLowerCase().includes(search.trim().toLowerCase()) ||
    (log.user?.name || "").toLowerCase().includes(search.trim().toLowerCase()) ||
    (log.user?.username || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  const confirmTarget = logs.find((l) => l.id === confirmId) ?? null;

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
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#F59E0B] uppercase leading-none truncate">
                Dashboard
              </p>
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                All Players Exercise Logs
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Search + Add */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Exercise or Player"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f5f7] pl-9 pr-3 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>
              <button
                onClick={handleOpenAddLog}
                className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] transition shrink-0"
                title="Log Exercise for Player"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>

            {/* Exercise list */}
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 size={26} className="animate-spin text-[#8B5CF6]" />
                </div>
              ) : error ? (
                <p className="text-sm text-red-400 text-center py-10">{error}</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400 px-1">{total} logs recorded</p>

                  {visibleLogs.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-10">
                      {search ? "No logs found matching search" : "No exercise logs recorded yet"}
                    </p>
                  )}

                  {visibleLogs.map((log) => {
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Delete button */}
                          <button
                            onClick={() => setConfirmId(log.id)}
                            disabled={deletingId === log.id}
                            className="flex-shrink-0 mt-2 text-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors p-1"
                            aria-label="Delete exercise log"
                          >
                            <Trash2 size={16} />
                          </button>

                          {/* Exercise icon / photo */}
                          <div className="w-11 h-11 rounded-xl bg-[#8B5CF6] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {photo ? (
                              <img src={photo} alt={log.exercise_title} className="w-full h-full object-cover" />
                            ) : (
                              <Dumbbell size={20} className="text-white" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Player Header */}
                            {log.user && (
                              <div className="flex items-center gap-1.5 mb-1 bg-purple-50 px-2 py-0.5 rounded-lg w-fit">
                                <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center text-[8px] font-bold text-purple-700 overflow-hidden">
                                  {log.user.image ? (
                                    <img src={log.user.image} alt={log.user.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={8} />
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-purple-700">
                                  {log.user.name || `@${log.user.username}`}
                                </span>
                              </div>
                            )}

                            {/* Exercise title */}
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                                {log.exercise_title}
                              </p>
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

                        <div className="text-[10px] text-gray-400 text-right self-end sm:self-center shrink-0">
                          {formatLoggedAt(log.logged_at)}
                        </div>
                      </div>
                    );
                  })}

                  {page < totalPages && (
                    <div className="pt-2 flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-6 py-2.5 bg-[#8B5CF6] text-white text-[13px] font-bold rounded-full hover:bg-[#7C3AED] transition flex items-center gap-2"
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
        </div>
      </div>

      {/* Choose Player Modal */}
      {playerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlayerModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Select Player:</h2>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Player..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full h-9 rounded-lg bg-[#f5f5f7] pl-8 pr-3 text-xs outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>
            </div>

            {/* Players List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
              {loadingPlayers ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
                </div>
              ) : filteredPlayers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No players found</p>
              ) : (
                filteredPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setPlayerModalOpen(false);
                      router.push(`/coach/players/${player.username}/exercise-log/find-exercises`);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-purple-50/50 hover:border-purple-200 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold shrink-0 overflow-hidden">
                      {player.profile_picture ? (
                        <img src={player.profile_picture} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        (player.name || player.username || "P")[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {player.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        @{player.username}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-gray-900 mb-1.5">Delete exercise log?</h2>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the log for{" "}
              <span className="font-semibold text-gray-700">{confirmTarget.exercise_title}</span>. This can&apos;t be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeLog(confirmTarget.id)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
