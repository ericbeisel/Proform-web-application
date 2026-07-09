"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  TrendingUp, 
  ChevronRight,
  Activity
} from "lucide-react";
import {
  getPlayerCardList,
  PlayerCardDetail
} from "@/api/player-card/route";
import { getAuthToken } from "@/lib/auth/session";

interface PhotoItem {
  id: number;
  displayId: number;
  date: string;
  image: string;
  status: string;
}

// Helper function to clean image URLs (from PlayerProgress page)
function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace("https://paxlete.com//", "https://paxlete.com/")
    .replace(/([^:]\/)\/+/g, "$1");
}

function statusBadgeClass(status: string): string {
  const value = (status || "").trim().toLowerCase();
  if (value === "complete" || value === "approved" || value === "accepted") 
    return "bg-[#e6f9f6] text-[#00daba]";
  if (value === "reject" || value === "rejected") 
    return "bg-[#fff1f0] text-[#ef4444]";
  return "bg-gray-100 text-gray-400";
}

export default function PlayerProgressPhotos() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    // Guard: a copy-pasted share link can be opened by a logged-out
    // browser — redirect to login instead of letting the fetch below fail.
    if (!getAuthToken()) {
      router.replace("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPlayerCardList();
        setPlayerName(response.name || "Player");
        
        const rows = Array.isArray(response?.data) ? response.data : [];
        
        // Filter out items without progress images and format them
        // We reverse if needed to show most recent first, but display IDs count down
        const formatted = rows
          .filter(item => item.progressImage)
          .map((item, index, array) => ({
            id: item.id,
            displayId: array.length - index,
            date: item.date ? item.date.split(" ")[0] : "N/A",
            image: cleanImageUrl(item.progressImage) || "",
            status: item.status || "Complete",
          }));
        
        setPhotos(formatted);
      } catch (err: unknown) {
        console.error("Failed to fetch player progress photos:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading progress photos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-8 md:px-10 md:py-12 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all border border-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <TrendingUp size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">
                Player Progress
              </h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Track body budget from scan
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar / Title */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-lg font-bold text-[#1a1c1e] tracking-tight">
            All Progress Photos
          </h2>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
             <Activity size={14} />
             <span>{photos.length} Photos total</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((item) => (
            <div 
              key={item.id}
              onClick={() => router.push(`/player-card/${item.id}`)}
              className="group bg-white rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
            >
              {/* Card Meta Container */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {/* ID Badge */}
                  <div className="w-9 h-9 rounded-full bg-[#6d28d9] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
                    #{item.displayId}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1a1c1e]">
                      {item.date}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest self-start mt-0.5 ${statusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                {/* Chevron */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d28d9] bg-purple-50 group-hover:bg-[#6d28d9] group-hover:text-white transition-all duration-300">
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>

              {/* photo Frame */}
              <div className="aspect-[4/5] rounded-[24px] overflow-hidden bg-[#1a1c1e] relative group-hover:ring-8 group-hover:ring-purple-50 transition-all duration-500">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="relative h-full w-full flex items-center justify-center p-6">
                  <img
                    src={item.image || "/images/svg.png"}
                    alt={`Progress ${item.date}`}
                    className="h-full w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(109,40,217,0.3)] group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {photos.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                <Activity size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-500">No progress photos found</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">Start uploading progress photos to track your transformation journey!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
