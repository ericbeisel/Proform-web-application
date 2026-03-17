"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAdminPlayerCardList, PlayerCardDetail } from "@/api/player-card/route";

interface AdminListItem {
  id: number;
  name: string;
  handle: string;
  status: string;
  date: string;
  isPlaceholder: boolean;
  scanImage: string | null;
}

function normalizeDate(input: string | undefined): string {
  if (!input) return "N/A";
  return input.split(" ")[0] || input;
}

function normalizeStatus(input: string | undefined): string {
  if (!input) return "Pending";
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export default function AdminPlayerCards() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coachName, setCoachName] = useState("Coach");
  const [players, setPlayers] = useState<AdminListItem[]>([]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminPlayerCardList();

        // ✅ FIX: Safely handle response
        if (response?.name) {
          setCoachName(`Coach ${response.name}`);
        }

        // ✅ FIX: Ensure data is an array before mapping
        const dataArray = Array.isArray(response?.data) ? response.data : [];
        
        const mapped = dataArray.map((item: PlayerCardDetail) => ({
          id: item.id,
          name: item.name || normalizeDate(item.date) || "User",
          handle: item.status?.toLowerCase() === "reject" ? "Rejected card" : "",
          status: normalizeStatus(item.status),
          date: normalizeDate(item.date),
          isPlaceholder: !item.inBodyScans,
          scanImage: item.inBodyScans || item.progressImage || null,
        }));

        setPlayers(mapped);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load admin player cards.");
        setPlayers([]); // ✅ Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    void fetchList();
  }, []);

  const hasData = useMemo(() => players.length > 0, [players]);

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-5 py-6 md:p-10 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">
              Admin
            </h1>
            <p className="text-gray-400 text-xs font-medium">{coachName}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-[#1a1c1e] mb-6 tracking-tight">
          Progress Timeline
        </h2>

        {loading && (
          <div className="py-8 text-center text-sm font-semibold text-gray-500">
            Loading admin player cards...
          </div>
        )}

        {!loading && error && (
          <div className="mb-4 rounded-xl border border-[#f1c8c1] bg-[#fff2f0] px-4 py-3 text-sm font-semibold text-[#c0392b]">
            {error}
          </div>
        )}

        {!loading && !hasData && !error && (
          <div className="py-8 text-center text-sm font-semibold text-gray-500">
            No player cards found.
          </div>
        )}

        <div className="space-y-4">
          {players.map((player) => {
            const cardInner = (
              <div
                className={`group border border-gray-50 bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 ${player.isPlaceholder ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md ${player.isPlaceholder ? "bg-purple-100 shadow-none" : "bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] shadow-purple-500/10"}`}
                  >
                    #{player.id}
                  </div>

                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                    {player.isPlaceholder ? (
                      <span className="text-xl">📅</span>
                    ) : (
                      <img
                        src={player.scanImage || "/images/svg.png"}
                        alt="Scan"
                        className="w-full h-full object-cover grayscale opacity-60"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-base font-bold ${player.isPlaceholder ? "text-gray-400" : "text-[#1a1c1e]"}`}
                        >
                          {player.name}
                        </p>
                        {player.handle && (
                          <span
                            className={`text-xs font-bold ${player.isPlaceholder ? "text-gray-300 italic" : "text-gray-500"}`}
                          >
                            {player.handle}
                          </span>
                        )}
                      </div>
                      <span
                        className={`w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          player.status === "Complete"
                            ? "bg-[#e6f9f6] text-[#00daba]"
                            : player.status === "Reject"
                              ? "bg-[#fff1f0] text-[#ef4444]"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {player.status}
                      </span>
                    </div>
                  </div>
                </div>

                {!player.isPlaceholder && (
                  <div className="pl-4">
                    <div className="p-2 rounded-xl group-hover:bg-purple-50 text-gray-300 group-hover:text-[#6d28d9] transition-all cursor-pointer">
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                )}
              </div>
            );

            if (player.isPlaceholder) {
              return <div key={player.id}>{cardInner}</div>;
            }

            return (
              <Link
                key={player.id}
                href={`/admin-player-cards/${player.id}`}
                className="block"
              >
                {cardInner}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8 mb-4 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-purple-50 via-white to-cyan-50 p-4 border-b-2 border-[#6d28d9] flex items-center justify-center gap-2 shadow-sm">
          <p className="text-xs md:text-sm font-bold text-[#6d28d9] text-center tracking-tight">
            Keep uploading scans to track your progress over time!
          </p>
        </div>
      </div>
    </main>
  );
}