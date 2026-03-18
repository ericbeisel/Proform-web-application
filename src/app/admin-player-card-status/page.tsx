"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, ChevronRight, X } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminPlayerCardList();

        console.log("Admin player card list response:", response);

        // Set coach name from response (if available)
        if (response?.name) {
          setCoachName(`Coach ${response.name}`);
        }

        // Handle the data object with numeric keys
        const playersArray: PlayerCardDetail[] = [];
        
        if (response?.data && typeof response.data === 'object') {
          const dataObj = response.data as Record<string, any>;
          // Convert the object with numeric keys to an array
          Object.keys(dataObj).forEach((key) => {
            // Check if key is numeric (index)
            if (!isNaN(Number(key))) {
              playersArray.push(dataObj[key]);
            }
          });
        }

        console.log("Converted players array:", playersArray);
        
        const mapped = playersArray.map((item: PlayerCardDetail) => ({
          id: item.id,
          name: item.name ? item.name.split('@')[0] || item.name : "User", // Clean up name
          handle: item.name?.includes('@') ? `@${item.name.split('@')[1]}` : "",
          status: normalizeStatus(item.status),
          date: normalizeDate(item.date),
          isPlaceholder: !item.inBodyScans && !item.progressImage,
          scanImage: item.inBodyScans || item.progressImage || null,
        }));

        console.log("Mapped player cards:", mapped);
        setPlayers(mapped);
      } catch (err: unknown) {
        console.error("Error fetching admin player cards:", err);
        setError(err instanceof Error ? err.message : "Failed to load admin player cards.");
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchList();
  }, []);

  const hasData = useMemo(() => players.length > 0, [players]);

  // Get status badge color
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
    e.stopPropagation(); // Prevent navigation to detail page
    setSelectedImage(imageUrl);
    setSelectedPlayerName(playerName);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
    setSelectedPlayerName("");
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-5 py-6 md:p-10 font-sans">
      {/* Image Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeImagePopup}
        >
          <div 
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeImagePopup}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
           
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={selectedImage}
                alt={`Scan for ${selectedPlayerName}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

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
              Admin Player Cards
            </h1>
            <p className="text-gray-400 text-xs font-medium">{coachName}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-[#1a1c1e] mb-6 tracking-tight">
          Player Card Submissions
        </h2>

        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6d28d9] mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading player cards...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-xl border border-[#f1c8c1] bg-[#fff2f0] px-5 py-4">
            <p className="text-sm font-semibold text-[#c0392b]">{error}</p>
          </div>
        )}

        {!loading && !hasData && !error && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-600 mb-1">No player cards found</p>
            <p className="text-sm text-gray-400">Players haven't submitted any cards yet</p>
          </div>
        )}

        <div className="space-y-4">
          {players.map((player) => {
            const cardInner = (
              <div
                key={player.id}
                className={`group border border-gray-100 bg-white rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all duration-200 ${
                  player.isPlaceholder ? "opacity-70" : "hover:border-purple-200"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* ID Badge */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm ${
                      player.isPlaceholder 
                        ? "bg-gray-100 text-gray-400" 
                        : "bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white shadow-purple-500/20"
                    }`}
                  >
                    #{player.id}
                  </div>

                  {/* Scan Image - Clickable */}
                  <div 
                    className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      if (player.scanImage) {
                        openImagePopup(player.scanImage, player.name, e);
                      }
                    }}
                  >
                    {player.isPlaceholder ? (
                      <span className="text-xl text-gray-400">📷</span>
                    ) : player.scanImage ? (
                      <img
                        src={player.scanImage}
                        alt={`Scan for ${player.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder-scan.jpg";
                        }}
                      />
                    ) : (
                      <span className="text-xl text-gray-400">📄</span>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-base font-bold ${
                            player.isPlaceholder ? "text-gray-400" : "text-[#1a1c1e]"
                          }`}
                        >
                          {player.name}
                        </p>
                        {player.handle && (
                          <span className="text-xs font-medium text-gray-400">
                            {player.handle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(
                            player.status
                          )}`}
                        >
                          {player.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {player.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {!player.isPlaceholder && (
                  <div className="pl-4">
                    <Link href={`/admin-player-card-status/${player.id}`}>
                      <div className="p-2 rounded-xl group-hover:bg-purple-50 text-gray-300 group-hover:text-[#6d28d9] transition-all">
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            );

            return cardInner;
          })}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-purple-50 via-white to-cyan-50 p-5 border-l-4 border-[#6d28d9] shadow-sm">
          <p className="text-sm font-bold text-[#6d28d9] text-center">
            Review and manage player card submissions. Approve or reject cards with feedback.
          </p>
        </div>
      </div>
    </main>
  );
}