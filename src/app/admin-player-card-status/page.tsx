"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, ChevronRight, X, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { getAdminPlayerCardList, PlayerCardDetail } from "@/api/player-card/route";

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminPlayerCards() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  // 1. SWR Hook: This handles caching, loading states, and background revalidation
  const { data: response, error, isLoading, isValidating } = useSWR(
    "admin/player-cards-list", // Unique cache key
    getAdminPlayerCardList,    // Fetcher function
    {
      revalidateOnFocus: false, // Prevents refreshing every single time you click the window
      dedupingInterval: 10000,  // If you visit within 10s, it uses ONLY cache (no network call)
    }
  );

  // 2. Data Transformation: Memoized so it only re-runs when 'response' changes
  const { players, coachName } = useMemo(() => {
    if (!response) return { players: [], coachName: "Coach" };

    const name = response.name ? `Coach ${response.name}` : "Coach";
    const playersArray: PlayerCardDetail[] = [];

    if (response.data && typeof response.data === "object") {
      const dataObj = response.data as Record<string, any>;
      Object.keys(dataObj).forEach((key) => {
        if (!isNaN(Number(key))) {
          playersArray.push(dataObj[key]);
        }
      });
    }

    const mapped = playersArray.map((item: PlayerCardDetail) => ({
      id: item.id,
      name: item.name ? item.name.split("@")[0] || item.name : "User",
      handle: item.name?.includes("@") ? `@${item.name.split("@")[1]}` : "",
      status: normalizeStatus(item.status),
      date: normalizeDate(item.date),
      isPlaceholder: !item.inBodyScans && !item.progressImage,
      scanImage: item.inBodyScans || item.progressImage || null,
    }));

    return { players: mapped, coachName: name };
  }, [response]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "complete":
      case "approved":
      case "accepted":
        return "bg-[#e6f9f6] text-[#00daba]";
      case "reject":
      case "rejected":
        return "bg-[#fff1f0] text-[#ef4444]";
      case "pending":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-400";
    }
  };

  const openImagePopup = (imageUrl: string, playerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setSelectedPlayerName(playerName);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-5 py-6 md:p-10 font-sans">
      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
              <X size={20} />
            </button>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img src={selectedImage} alt={`Scan`} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">Admin Player Cards</h1>
            <p className="text-gray-400 text-xs font-medium">{coachName}</p>
          </div>
        </div>
        {/* Subtle indicator if data is refreshing in background */}
        {isValidating && <Loader2 size={14} className="animate-spin text-purple-400 ml-auto" />}
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-[#1a1c1e] mb-6 tracking-tight">Player Card Submissions</h2>

        {/* KEY CHANGE: 
            Only show the full-page loader if we have NO cached data and are loading.
            If we have cached players, they show up INSTANTLY.
        */}
        {isLoading && players.length === 0 ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6d28d9] mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading player cards...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {players.length === 0 && !error ? (
              <div className="py-12 text-center text-gray-400">No cards found.</div>
            ) : (
              players.map((player) => (
                <div key={player.id} className={`group border border-gray-100 bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all duration-200 ${player.isPlaceholder ? "opacity-70" : "hover:border-purple-200"}`}>
                  <div className="flex items-center gap-4 flex-1 mb-4 md:mb-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm ${player.isPlaceholder ? "bg-gray-100 text-gray-400" : "bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white"}`}>
                      #{player.id}
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => player.scanImage && openImagePopup(player.scanImage, player.name, e)}>
                      {player.scanImage ? <img src={player.scanImage} className="w-full h-full object-cover" /> : <span className="text-xl text-gray-400">{player.isPlaceholder ? "📷" : "📄"}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-bold truncate ${player.isPlaceholder ? "text-gray-400" : "text-[#1a1c1e]"}`}>{player.name}</p>
                      {player.handle && <span className="text-xs font-medium text-gray-400 truncate">{player.handle}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex flex-col md:items-end">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(player.status)}`}>{player.status}</span>
                      <span className="text-xs text-gray-400 mt-1">{player.date}</span>
                    </div>
                    {!player.isPlaceholder && (
                      <Link href={`/admin-player-card-status/${player.id}?name=${encodeURIComponent(player.name)}`} className="block">
                        <div className="p-2 rounded-xl group-hover:bg-purple-50 text-gray-300 group-hover:text-[#6d28d9] transition-all">
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-center py-4">Failed to sync updates.</p>}
      </div>
    </main>
  );
}