"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Play } from "lucide-react";
import { getLiveSessions, LiveSession } from "@/api/dashboard/route";

function openSession(session: LiveSession, router: ReturnType<typeof useRouter>) {
  localStorage.setItem("workoutProgramCode", session.title);
  localStorage.setItem("workoutTitle", session.programName);
  localStorage.setItem("workoutName", session.workoutName);
  router.push("/workout/viewWorkoutSession");
}

export default function LiveSessionsCard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveSessions({ limit: 2 })
      .then((res) => {
        setSessions(res.sessions || []);
        setTotalCount(res.totalCount || 0);
      })
      .catch(() => {
        setSessions([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-3 text-[#1a1825]">Live Sessions:</h3>

      {loading ? (
        <div className="text-center text-[12px] text-gray-400 py-6">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#f7f6fb] rounded-xl p-6 text-center my-3">
          <p className="text-sm text-[#8b879e]">
            No sessions started yet.
            <br />
            Your live sessions will show here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} onClick={() => openSession(session, router)} className="bg-[#f7f6fb] rounded-xl p-3 flex gap-3 cursor-pointer hover:bg-[#eeecf8] transition">
              {/* Cover image */}
              <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                {session.programImage ? (
                  <img
                    src={session.programImage}
                    alt={session.programName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-400" />
                )}
              </div>

              {/* Middle content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    WORKOUT
                  </span>
                  <span className="text-[10px] font-semibold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                    #{session.shortId}
                  </span>
                </div>

                <p className="text-[12px] font-bold text-[#1a1825] leading-tight line-clamp-2">
                  {session.programName}
                </p>

                <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                  {session.workoutName}
                </p>

                <p className="text-[10px] text-gray-400 mt-0.5">
                  Started: {session.startedAt}
                </p>

                {session.locationName && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} className="text-orange-500 flex-shrink-0" />
                    <span className="text-[10px] text-orange-500 font-medium">
                      Location: {session.locationName}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: rounds + play */}
              <div className="flex flex-col items-center justify-between flex-shrink-0">
                <div className="text-center">
                  <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">
                    Rounds
                  </p>
                  <p className="text-[13px] font-bold text-[#1a1825]">
                    {session.status}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openSession(session, router); }}
                  className="w-8 h-8 rounded-full bg-[#6c5ce7] flex items-center justify-center hover:bg-[#5a4dd0] transition"
                >
                  <Play size={14} fill="white" className="text-white ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/live-sessions")}
        className="w-full mt-3 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-[10px] py-2.5 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
      >
        View All ({totalCount}) <span>→</span>
      </button>
    </div>
  );
}
