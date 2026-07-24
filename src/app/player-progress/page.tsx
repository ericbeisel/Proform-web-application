"use client";

import { ArrowLeft, TrendingUp, Scan, Image, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getPlayerCardList,
  getPlayerCardTypes,
  PlayerCardDetail,
  PlayerCardType,
} from "@/api/player-card/route";
import { dashboardApi } from "@/api/dashboard/route";
import { getAuthToken } from "@/lib/auth/session";

interface ProgressItem {
  id: number;
  date: string;
  weight: string;
  smm: string;
  fat: string;
  score: number;
  status: "Complete" | "Pending" | "Reject";
  inBodyScans?: string | null;
  progressImage?: string | null;
  type?: string | null;
  weightDiff?: string | null;
  smmDiff?: string | null;
  fatDiff?: string | null;
  scoreDiff?: number | null;
}

interface Stats {
  totalScans: number;
  smmDiff: string;
  bodyFatDiff: string;
  compScoreDiff: string;
  playerName: string;
  measurementUnit: string;
}

function normalizeStatus(status: string | undefined): "Complete" | "Pending" | "Reject" {
  const value = (status || "").trim().toLowerCase();
  if (value === "complete") return "Complete";
  if (value === "reject" || value === "rejected") return "Reject";
  return "Pending";
}

function statusBadgeClass(status: "Complete" | "Pending" | "Reject"): string {
  if (status === "Complete") return "bg-[#e6f9f6] text-[#00daba]";
  if (status === "Reject") return "bg-[#fff1f0] text-[#ef4444]";
  return "bg-gray-100 text-gray-400";
}

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace("https://paxlete.com//", "https://paxlete.com/")
    .replace(/([^:]\/)\/+/g, "$1");
}

export default function PlayerProgress() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [filteredData, setFilteredData] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardTypes, setCardTypes] = useState<PlayerCardType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    smmDiff: "0",
    bodyFatDiff: "0",
    compScoreDiff: "0",
    playerName: "",
    measurementUnit: "lbs",
  });
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: 'inbody' | 'progress';
    date: string;
  } | null>(null);

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
        setError("");
        console.log("🔄 Fetching player progress data...");

        const [progressResponse, typesResponse, dashboardResponse] = await Promise.allSettled([
          getPlayerCardList(),
          getPlayerCardTypes(),
          dashboardApi.getDashboardSummary(),
        ]);

        console.log("✅ Progress Response:", progressResponse);
        console.log("✅ Types Response:", typesResponse);
        console.log("✅ Dashboard Response:", dashboardResponse);

        if (typesResponse.status === "fulfilled") {
          const typesData = typesResponse.value as PlayerCardType[];
          console.log("📋 Card types:", typesData);
          setCardTypes(typesData);
        }

        let measurementUnit = "lbs";
        if (dashboardResponse.status === "fulfilled") {
          const dashboardData = dashboardResponse.value;
          console.log("📊 Dashboard Data:", dashboardData);
          if (dashboardData.measurementUnit) {
            measurementUnit = dashboardData.measurementUnit;
            console.log("📏 Measurement Unit from Dashboard:", measurementUnit);
          }
        }

        if (progressResponse.status === "fulfilled") {
          const response = progressResponse.value;
          
          console.log("📊 Stats from API:", {
            total_scan: response.total_scan,
            smm_diff: response.smm_diff,
            bf_diff: response.bf_diff,
            body_camp_diff: response.body_camp_diff,
            name: response.name
          });

          const rows = Array.isArray(response?.data) ? response.data : [];
          console.log(`📋 Found ${rows.length} progress records in response.data`);

          if (rows.length === 0) {
            setProgressData([]);
            setFilteredData([]);
            setStats({
              totalScans: 0,
              smmDiff: "0",
              bodyFatDiff: "0",
              compScoreDiff: "0",
              playerName: response.name || "",
              measurementUnit,
            });
            setLoading(false);
            return;
          }

          const formattedData = rows.map((item: PlayerCardDetail, index: number) => ({
            id: item.id || index + 1,
            date: item.date || "N/A",
            weight: item.currentWeight ? `${item.currentWeight} ${measurementUnit}` : `0 ${measurementUnit}`,
            smm: item.smm ? `${item.smm} ${measurementUnit}` : `0 ${measurementUnit}`,
            fat: item.bodyFat ? `${item.bodyFat}%` : "0%",
            score: item.bodyCampScore || 0,
            status: normalizeStatus(item.status),
            inBodyScans: cleanImageUrl(item.inBodyScans),
            progressImage: cleanImageUrl(item.progressImage),
            type: item.type,
            weightDiff: (item.currentWeightDiff ?? item.weight_diff ?? "0").toString(),
            smmDiff: (item.smmDiff ?? item.smm_diff ?? "0").toString(),
            fatDiff: (item.bodyFatDiff ?? item.bf_diff ?? "0").toString(),
            scoreDiff: Number(item.bodyCampScoreDiff ?? item.body_camp_diff ?? 0),
          }));

          console.log("✅ Final Formatted Data:", formattedData);

          setProgressData(formattedData);
          setFilteredData(formattedData);
          setStats({
            totalScans: response.total_scan ?? formattedData.length,
            smmDiff: response.smm_diff || "0",
            bodyFatDiff: response.bf_diff || "0",
            compScoreDiff: response.body_camp_diff || "0",
            playerName: response.name || rows[0]?.name || "",
            measurementUnit,
          });
        } else {
          setError("Failed to load progress data");
        }
      } catch (err: any) {
        console.error("❌ Error fetching progress:", err);
        setError(err instanceof Error ? err.message : "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    if (selectedType) {
      setFilteredData(progressData.filter(item => 
        item.type?.toLowerCase() === selectedType.toLowerCase()
      ));
    } else {
      setFilteredData(progressData);
    }
  }, [selectedType, progressData]);

  const ImageModal = () => {
    if (!selectedImage) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
        <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="absolute top-4 left-4 z-10">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${selectedImage.type === 'inbody' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}>
              {selectedImage.type === 'inbody' ? <><Scan size={14} /><span>InBody Scan</span></> : <><Image size={14} /><span>Progress Image</span></>}
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button onClick={() => setSelectedImage(null)} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70">✕</button>
          </div>
          <div className="flex items-center justify-center p-4 bg-gray-50 max-h-[70vh]">
            <img src={selectedImage.url} alt="Scan" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
          </div>
          <div className="bg-white p-4 text-center text-sm text-gray-600 border-t">{selectedImage.date}</div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700" /></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] relative">
      <button onClick={() => router.back()} className="absolute top-5 left-4 p-2 rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
      </button>
      <div className="text-center p-8 bg-white rounded-2xl shadow-md max-w-md">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-xl">Try Again</button>
      </div>
    </div>
  );

  if (progressData.length === 0) return (
    <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center relative">
      <button onClick={() => router.back()} className="absolute top-5 left-4 p-2 rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
      </button>
      <div className="text-center bg-white p-8 rounded-2xl shadow max-w-md">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <Scan size={32} className="text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Scans Yet</h2>
        <p className="text-gray-500 mb-6">Upload your first body scan to start tracking your progress!</p>
        <Link href="/player-cards/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6d28d9] text-white rounded-xl shadow-md">
          <Plus size={18} /><span>Upload Your First Scan</span>
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-5 md:px-10 font-sans">
      <ImageModal />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white shadow-sm flex-shrink-0">
          <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#1a1c1e] tracking-tight truncate">Player Progress</h1>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Track {stats.playerName}&apos;s journey</p>
            </div>
          </div>
        </div>
        <Link href="/player-cards/upload" className="flex items-center justify-center gap-2 px-3 py-2 bg-[#6d28d9] text-white rounded-xl shadow-md text-sm font-medium whitespace-nowrap">
          <Plus size={18} /><span className="hidden sm:inline">New Scan</span><span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Total Scans", val: stats.totalScans, color: "text-[#6d28d9]" },
          { label: `SMM (${stats.measurementUnit})`, val: stats.smmDiff, color: "text-sky-500" },
          { label: "Body Fat", val: `${stats.bodyFatDiff}%`, color: "text-orange-500" },
          { label: "Comp Score", val: stats.compScoreDiff, color: "text-[#6d28d9]" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white">
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-xl sm:text-3xl font-bold leading-none ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-6 flex items-center gap-3">
        <div className="flex-1 relative">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm appearance-none outline-none">
            <option value="">All Scan Types</option>
            {cardTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{filteredData.length}/{progressData.length}</span>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-[#1a1c1e] mb-6">Progress Timeline</h2>
        
        <div className="space-y-4">
          {filteredData.map((item, index) => (
            <div key={item.id} className="group border border-gray-100 bg-white rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 shadow-md">
                  #{item.id}
                </div>

                <div className="flex-shrink-0">
                  {item.inBodyScans ? (
                    <button onClick={() => setSelectedImage({ url: item.inBodyScans!, type: 'inbody', date: item.date })} className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl overflow-hidden border-2 border-purple-200">
                      <img src={item.inBodyScans} className="w-full h-full object-cover" alt="Scan" />
                    </button>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center">
                      <Scan size={14} className="text-purple-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-[13px] sm:text-base font-bold text-[#1a1c1e] truncate">
                      {item.date.split(' ')[0]}
                    </p>
                    {item.type && <span className="text-[8px] sm:text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{item.type}</span>}
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadgeClass(item.status)}`}>{item.status}</span>
                  </div>
                </div>

                <Link href={`/player-card/${item.id}`} className="p-1.5 sm:p-2 rounded-xl text-gray-300 hover:text-[#6d28d9] hover:bg-purple-50 flex-shrink-0">
                  <ArrowLeft size={16} className="rotate-180" strokeWidth={2.5} />
                </Link>
              </div>

              {/* Metrics Grid - Fixed for Mobile Wrap */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 sm:pl-[92px]">
                {[
                  { label: "Weight", val: item.weight, diff: item.weightDiff, color: "text-[#6d28d9]", isRedGood: false },
                  { label: "SMM", val: item.smm, diff: item.smmDiff, color: "text-sky-500", isRedGood: true },
                  { label: "Body Fat", val: item.fat, diff: item.fatDiff, color: "text-orange-500", isRedGood: false },
                  { label: "Comp Score", val: item.score, diff: item.scoreDiff, color: "text-[#6d28d9]", isRedGood: true }
                ].map((metric, mIdx) => {
                  const d = parseFloat(metric.diff?.toString() || "0");
                  return (
                    <div key={mIdx} className="flex flex-col">
                      <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">{metric.label}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold ${metric.color}`}>{metric.val}</span>
                        {(metric.diff || index < filteredData.length - 1) && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            d === 0 ? 'bg-gray-100 text-gray-500' :
                            (d > 0 ? (metric.isRedGood ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600') : 
                            (metric.isRedGood ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'))
                          }`}>
                            {d > 0 ? '+' : ''}{metric.diff || "0"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-5 py-6 text-center text-sm font-semibold text-gray-400">
              No progress cards match the selected filter.
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Banner */}
      <div className="mt-6 sm:mt-8 mb-4 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-purple-50 via-white to-cyan-50 p-4 border-b-2 border-[#6d28d9] flex items-center justify-center gap-2 shadow-sm">
          <p className="text-xs sm:text-sm font-bold text-[#6d28d9] text-center tracking-tight">
            Keep uploading scans to track your progress over time!
          </p>
        </div>
      </div>
    </main>
  );
}