"use client";

import { ArrowLeft, TrendingUp, Scan, Image, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getPlayerCardList,
  getPlayerCardTypes,
  PlayerCardDetail,
  PlayerCardType,
} from "@/api/player-card/route";

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
  // Add these if your API returns them
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

function normalizeStatus(
  status: string | undefined,
): "Complete" | "Pending" | "Reject" {
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

// Helper function to clean image URLs
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
    playerName: "Shweta Gharge",
    measurementUnit: "lbs",
  });
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: 'inbody' | 'progress';
    date: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("🔄 Fetching player progress data...");

        const [progressResponse, typesResponse] = await Promise.allSettled([
          getPlayerCardList(),
          
          getPlayerCardTypes(),
        ]);
        console.log("✅ Progress Response:", progressResponse);
        console.log("✅ Types Response:", typesResponse);

        // Process card types
        if (typesResponse.status === "fulfilled") {
          const typesData = typesResponse.value as PlayerCardType[];
          console.log("📋 Card types:", typesData);
          setCardTypes(typesData);
        }

        // Process progress data
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

          if (rows.length > 0) {
            console.log("📌 Sample Record (First Item):", rows[0]);
          }

          const formattedData = rows.map(
            (item: PlayerCardDetail, index: number) => {
              const formattedItem: ProgressItem = {
                id: item.id || index + 1,
                date: item.date || "N/A",
                weight: item.currentWeight ? `${item.currentWeight} lbs` : "0 lbs",
                smm: item.smm ? `${item.smm} lbs` : "0 lbs",
                fat: item.bodyFat ? `${item.bodyFat}%` : "0%",
                score: item.bodyCampScore || 0,
                status: normalizeStatus(item.status),
                inBodyScans: cleanImageUrl(item.inBodyScans),
                progressImage: cleanImageUrl(item.progressImage),
                type: item.type,
                // Extract diffs from API response or default to "0"
                weightDiff: (item.currentWeightDiff ?? item.weight_diff ?? "0").toString(),
                smmDiff: (item.smmDiff ?? item.smm_diff ?? "0").toString(),
                fatDiff: (item.bodyFatDiff ?? item.bf_diff ?? "0").toString(),
                scoreDiff: Number(item.bodyCampScoreDiff ?? item.body_camp_diff ?? 0),
              };

              return formattedItem;
            }
          );

          console.log("✅ Final Formatted Data:", formattedData);

          setProgressData(formattedData);
          setFilteredData(formattedData);

          // Update stats from API response
          setStats({
            totalScans: response.total_scan ?? formattedData.length,
            smmDiff: response.smm_diff || "0",
            bodyFatDiff: response.bf_diff || "0",
            compScoreDiff: response.body_camp_diff || "0",
            playerName: response.name || rows[0]?.name || "Shweta Gharge",
            measurementUnit: "lbs",
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load progress data";
        console.error("❌ Error fetching progress:", err);
        setError(errorMsg);

        // Fallback data
        setProgressData([
          {
            id: 4,
            date: "2/3/2026",
            weight: "67 lbs",
            smm: "52.4 lbs",
            fat: "18.2%",
            score: 85,
            status: "Complete",
            inBodyScans: "/images/svg.png",
            progressImage: "/images/svg.png",
            type: "Inbody",
          },
        ]);
        setFilteredData([
          {
            id: 4,
            date: "2/3/2026",
            weight: "67 lbs",
            smm: "52.4 lbs",
            fat: "18.2%",
            score: 85,
            status: "Complete",
            inBodyScans: "/images/svg.png",
            progressImage: "/images/svg.png",
            type: "Inbody",
          },
        ]);

        setStats({
          totalScans: 3,
          smmDiff: "-2.5",
          bodyFatDiff: "-1.2",
          compScoreDiff: "+6",
          playerName: "Shweta Gharge",
          measurementUnit: "lbs",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data when type changes
  useEffect(() => {
    if (selectedType) {
      const filtered = progressData.filter(item => 
        item.type?.toLowerCase() === selectedType.toLowerCase()
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(progressData);
    }
  }, [selectedType, progressData]);

  // Image Modal Component
  const ImageModal = () => {
    if (!selectedImage) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}
      >
        <div
          className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 left-4 z-10">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              selectedImage.type === 'inbody' 
                ? 'bg-purple-600 text-white' 
                : 'bg-green-600 text-white'
            }`}>
              {selectedImage.type === 'inbody' ? (
                <>
                  <Scan size={14} />
                  <span>InBody Scan</span>
                </>
              ) : (
                <>
                  <Image size={14} />
                  <span>Progress Image</span>
                </>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setSelectedImage(null)}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Image Container with max dimensions */}
          <div className="flex items-center justify-center p-4 bg-gray-50 max-h-[70vh]">
            <img
              src={selectedImage.url}
              alt={`${selectedImage.type === 'inbody' ? 'InBody Scan' : 'Progress Image'} from ${selectedImage.date}`}
              className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-lg"
            />
          </div>
          
          <div className="bg-white p-4 text-center text-sm text-gray-600 border-t border-gray-100">
            {selectedImage.date}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </main>
    );
  }

  if (error && progressData.length === 0) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-10 font-sans">
      <ImageModal />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 sm:p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft
            size={16}
            className="text-gray-700 sm:w-[18px] sm:h-[18px]"
            strokeWidth={2.5}
          />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0">
            <TrendingUp
              size={18}
              className="sm:w-[22px] sm:h-[22px]"
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h1 className="text-[18px] sm:text-2xl font-bold text-[#1a1c1e] tracking-tight leading-tight">
              Player Progress
            </h1>
            <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate max-w-[200px] sm:max-w-none">
              Track {stats.playerName}'s fitness journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Scans Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white">
          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
            Total Scans
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#6d28d9] leading-none">
            {stats.totalScans}
          </p>
        </div>

        {/* SMM Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white">
          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
            SMM ({stats.measurementUnit})
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-sky-500 leading-none">
            {stats.smmDiff}
          </p>
        </div>

        {/* Body Fat Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white">
          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
            Body Fat
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-500 leading-none">
            {stats.bodyFatDiff}%
          </p>
        </div>

        {/* Composition Score Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white">
          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
            Comp Score
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#6d28d9] leading-none">
            {stats.compScoreDiff}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Filter by Scan Type
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d28d9] appearance-none cursor-pointer text-sm"
              >
                <option value="">All Scan Types</option>
                {cardTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          <div className="sm:self-end pb-1">
            <p className="text-sm text-gray-500">
              Showing {filteredData.length} of {progressData.length} scans
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
    {/* Progress Timeline */}
<div className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
  <h2 className="text-base sm:text-lg font-bold text-[#1a1c1e] mb-4 sm:mb-6 tracking-tight">
    Progress Timeline
  </h2>

  {/* Image Legend */}
  <div className="flex items-center gap-4 mb-4 px-2">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-purple-600"></div>
      <span className="text-xs text-gray-600 flex items-center gap-1">
        <Scan size={14} className="text-purple-600" />
        InBody Scan
      </span>
    </div>
  </div>

  <div className="space-y-3 sm:space-y-4">
    {filteredData.map((item, index) => {
      // Calculate differences from previous item if needed
      const prevItem = index < filteredData.length - 1 ? filteredData[index + 1] : null;
      
      // Parse numeric values for comparison
      const currentWeight = parseFloat(item.weight);
      const prevWeight = prevItem ? parseFloat(prevItem.weight) : null;
      const currentSMM = parseFloat(item.smm);
      const prevSMM = prevItem ? parseFloat(prevItem.smm) : null;
      const currentFat = parseFloat(item.fat);
      const prevFat = prevItem ? parseFloat(prevItem.fat) : null;
      const currentScore = item.score;
      const prevScore = prevItem ? prevItem.score : null;

      // Use diffs from API if available, otherwise calculate manually or default to "0"
      const weightDiff = item.weightDiff || (prevWeight !== null ? (currentWeight - prevWeight).toFixed(1) : "0");
      const smmDiff = item.smmDiff || (prevSMM !== null ? (currentSMM - prevSMM).toFixed(1) : "0");
      const fatDiff = item.fatDiff || (prevFat !== null ? (currentFat - prevFat).toFixed(1) : "0");
      const scoreDiff = item.scoreDiff !== undefined && item.scoreDiff !== null ? item.scoreDiff : (prevScore !== null ? (currentScore - prevScore) : 0);

      return (
        <div
          key={item.id}
          className="group border border-gray-100 bg-white rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
        >
          {/* Top row: id + images + date + status */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            {/* ID Badge */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 shadow-md shadow-purple-500/10">
              #{item.id}
            </div>

            {/* Images Container */}
            <div className="flex gap-2">
              {item.inBodyScans ? (
                <div className="relative group/image">
                  <button
                    onClick={() => setSelectedImage({
                      url: item.inBodyScans!,
                      type: 'inbody',
                      date: item.date
                    })}
                    className="relative w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl overflow-hidden border-2 border-purple-200 hover:border-purple-500 transition-all"
                    title="Click to view InBody Scan"
                  >
                    <img
                      src={item.inBodyScans}
                      alt="InBody Scan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 hover:opacity-100">🔍</span>
                    </div>
                  </button>
                  {/* Small Label Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Scan size={8} />
                    <span>InBody</span>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl border-2 border-purple-200 border-dashed flex flex-col items-center justify-center">
                  <Scan size={14} className="text-purple-300" />
                  <span className="text-[6px] text-purple-300 mt-0.5">No Scan</span>
                </div>
              )}
            </div>

            {/* Date + status + type */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] sm:text-base font-bold text-[#1a1c1e]">
                  {item.date}
                </p>
                {item.type && (
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {item.type}
                  </span>
                )}
                <span
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
       {/* Metrics Grid */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
  {/* Weight */}
  <div className="flex flex-col">
    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
      Weight
    </span>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[#6d28d9] text-sm font-bold">
        {item.weight}
      </span>
      {weightDiff && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          parseFloat(weightDiff) > 0 
            ? 'bg-red-100 text-red-600' 
            : 'bg-green-100 text-green-600'
        }`}>
          {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff}
        </span>
      )}
    </div>
  </div>

  {/* SMM */}
  <div className="flex flex-col">
    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
      SMM
    </span>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sky-500 text-sm font-bold">
        {item.smm}
      </span>
      {smmDiff && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          parseFloat(smmDiff) < 0 
            ? 'bg-red-100 text-red-600' 
            : 'bg-green-100 text-green-600'
        }`}>
          {parseFloat(smmDiff) > 0 ? '+' : ''}{smmDiff}
        </span>
      )}
    </div>
  </div>

  {/* Body Fat */}
  <div className="flex flex-col">
    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
      Body Fat
    </span>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-orange-500 text-sm font-bold">
        {item.fat}
      </span>
      {fatDiff && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          parseFloat(fatDiff) > 0 
            ? 'bg-red-100 text-red-600' 
            : 'bg-green-100 text-green-600'
        }`}>
          {parseFloat(fatDiff) > 0 ? '+' : ''}{fatDiff}
        </span>
      )}
    </div>
  </div>

  {/* Comp Score */}
  <div className="flex flex-col">
    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
      Comp Score
    </span>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[#6d28d9] text-sm font-bold">
        {item.score}
      </span>
      {scoreDiff !== undefined && scoreDiff !== null && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          scoreDiff < 0 
            ? 'bg-red-100 text-red-600' 
            : 'bg-green-100 text-green-600'
        }`}>
          {scoreDiff > 0 ? '+' : ''}{scoreDiff}
        </span>
      )}
    </div>
  </div>
</div>

          {/* Show message for pending items */}
          {item.status === 'Pending' && (
            <div className="mt-3 text-xs text-gray-400 italic">
              Scan not completed yet
            </div>
          )}
        </div>
      );
    })}

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