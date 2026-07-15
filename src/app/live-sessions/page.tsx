"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Play, ChevronDown } from "lucide-react";
import { getAllSessions, LiveSession } from "@/api/dashboard/route";

const FILTER_OPTIONS = ["All Session", "Open Session", "Close Session"];

const FILTER_STATUS: Record<string, boolean | undefined> = {
  "All Session": undefined,
  "Open Session": false,
  "Close Session": true,
};

function openSession(session: LiveSession, router: ReturnType<typeof useRouter>) {
  // Previously set workoutProgramCode to session.title (a display name, not
  // the program code), which made getProgramOverview query the wrong/
  // unresolvable program — silently failing and leaving whatever purchase
  // state was already in memory from a previously-viewed program. Routing
  // via ?sessionId= instead reuses viewWorkoutSession's own proven session
  // resolution (getWorkoutSessionById -> workout_code/program_id), the same
  // path shared-session links already rely on.
  router.push(`/workout/viewWorkoutSession?sessionId=${session.id}`);
}

export default function LiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Session");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    console.log("[LiveSessions] fetching — page:", page, "filter:", filter, "status:", FILTER_STATUS[filter]);
    setLoading(true);
    getAllSessions({ page, status: FILTER_STATUS[filter] })
      .then((res) => {
        setSessions(res.sessions || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="min-h-screen bg-[#f0eff4] text-[#1a1825]">

      {/* Header */}
      <div className="relative bg-white px-4 sm:px-5 py-4 flex items-center gap-1.5 sm:gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f0eff4] flex items-center justify-center text-gray-500 hover:bg-[#e8e6f0] transition shrink-0"
        >
          <ArrowLeft size={16} className="sm:hidden" />
          <ArrowLeft size={18} className="hidden sm:block" />
        </button>
        <div className="flex-1 min-w-0 pr-14 sm:pr-0">
          <h1 className="font-black text-sm sm:text-lg text-[#1a1825] leading-none truncate">Live Sessions</h1>
          <p className="text-[11px] sm:text-[12px] text-gray-400 mt-0.5 truncate">{totalCount} sessions total</p>
        </div>
        <button
          onClick={() => router.push("/feed/main-feed")}
          className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity"
          title="Go to Feed"
        >
          <img src="/images/proform-logo.jpg" alt="Proform" className="h-7 sm:h-8 w-auto rounded-md" />
        </button>
      </div>

      {/* Filter + Pagination bar */}
      <div className="bg-white border-b border-[#e8e6f0] px-5 py-3 flex items-center justify-between sticky top-[69px] z-10">
        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm"
          >
            {filter}
            <ChevronDown size={14} />
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#e8e6f0] overflow-hidden z-20 min-w-[160px]">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setFilter(opt); setShowFilterMenu(false); setPage(1); }}
                    className={`w-full text-left px-4 py-3 text-[13px] font-medium hover:bg-[#f7f6fb] transition ${
                      filter === opt ? "text-[#6c5ce7] font-bold bg-[#f7f6fb]" : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f0eff4] hover:bg-[#e8e6f0] disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-semibold text-gray-600 whitespace-nowrap">
            {page} Page out of {totalPages} Page
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f0eff4] hover:bg-[#e8e6f0] disabled:opacity-30 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 sm:p-5 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              </div>
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm mt-4">
            <p className="text-gray-400 text-sm font-medium">No sessions found.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => openSession(session, router)}
              className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                {session.programImage ? (
                  <img
                    src={session.programImage}
                    alt={session.programName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md tracking-wide">
                    WORKOUT
                  </span>
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-500 px-2 py-0.5 rounded-md">
                    #{session.shortId}
                  </span>
                </div>

                <p className="text-[13px] font-bold text-[#1a1825] leading-snug mb-0.5">
                  {session.programName}
                </p>

                <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
                  {session.workoutName}
                </p>

                <p className="text-[11px] text-gray-400">
                  Started: {session.startedAt}
                </p>

                {session.locationName && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-orange-400 flex-shrink-0" />
                    <span className="text-[11px] text-orange-400 font-medium">
                      Location: {session.locationName}
                    </span>
                  </div>
                )}
              </div>

              {/* Rounds + play */}
              <div className="flex flex-col items-center justify-between flex-shrink-0 pl-1">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">
                    Rounds
                  </p>
                  <p className="text-sm font-black text-[#1a1825]">
                    {session.status}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openSession(session, router); }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center hover:opacity-90 transition shadow-md"
                >
                  <Play size={14} fill="white" className="text-white ml-0.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
