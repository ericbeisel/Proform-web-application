"use client";

import { ArrowLeft, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getPlayerCardDetails,
  PlayerCardDetail,
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

export default function PlayerProgress() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalScans: 0,
    weightChange: "0 lbs",
    currentScore: 0,
    improvement: 0,
    playerName: "Shweta Gharge",
  });

useEffect(() => {
  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors

      console.log("🔄 Fetching player progress data...");

      const response = await getPlayerCardDetails();

      // Log the raw response from API
      console.log("✅ Raw API Response:", response);

      const rows = Array.isArray(response?.data) ? response.data : [];
      console.log(`📋 Found ${rows.length} progress records in response.data`);

      // Log first record (if any) to see structure
      if (rows.length > 0) {
        console.log("📌 Sample Record (First Item):", rows[0]);
      }

      const formattedData = rows.map(
        (item: PlayerCardDetail, index: number) => {
          const cleanedImage = item.inBodyScans
            ? item.inBodyScans
                .replace("https://paxlete.com//", "https://paxlete.com/")
                .replace(/([^:]\/)\/+/g, "$1") // extra safety
            : null;

          const formattedItem = {
            id: item.id || index + 1,
            date: item.date || "N/A",
            weight: item.currentWeight ? `${item.currentWeight} lbs` : "0 lbs",
            smm: item.smm ? `${item.smm} lbs` : "0 lbs",
            fat: item.bodyFat ? `${item.bodyFat}%` : "0%",
            score: item.bodyCampScore || 0,
            status: normalizeStatus(item.status),
            inBodyScans: cleanedImage,
          };

          console.log(`🖼️  Record #${formattedItem.id} Image URL:`, cleanedImage);

          return formattedItem;
        }
      );

      console.log("✅ Final Formatted Data:", formattedData);

      setProgressData(formattedData);

      // Stats Calculation
      if (formattedData.length > 0) {
        const sorted = [...formattedData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const latestScan = sorted[0];
        const oldestScan = sorted[sorted.length - 1];

        const latestWeight = parseFloat(latestScan.weight) || 0;
        const oldestWeight = parseFloat(oldestScan.weight) || 0;
        const weightDiff = (latestWeight - oldestWeight).toFixed(1);

        const latestScore = latestScan.score || 0;
        const oldestScore = oldestScan.score || 0;
        const scoreDiff = latestScore - oldestScore;

        const finalStats = {
          totalScans: response.total_scan ?? formattedData.length,
          weightChange: `${weightDiff.startsWith("-") ? "" : "+"}${weightDiff} lbs`,
          currentScore: latestScore,
          improvement: response.improvement ?? scoreDiff,
          playerName: response.name || rows[0]?.name || "Shweta Gharge",
        };

        console.log("📊 Calculated Stats:", finalStats);

        setStats(finalStats);
      } else {
        console.log("⚠️ No progress records found.");
        setStats((prev) => ({
          ...prev,
          totalScans: response.total_scan ?? 0,
          improvement: response.improvement ?? 0,
          playerName: response.name || prev.playerName,
        }));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load progress data";
      console.error("❌ Error fetching progress:", err);
      setError(errorMsg);

      // Fallback data (you can keep this)
      console.log("📥 Using fallback data due to error");
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
        },
        {
          id: 3,
          date: "1/15/2026",
          weight: "68.5 lbs",
          smm: "51.8 lbs",
          fat: "19.1%",
          score: 82,
          status: "Complete",
          inBodyScans: "/images/svg.png",
        },
        {
          id: 2,
          date: "12/28/2025",
          weight: "69.2 lbs",
          smm: "51.2 lbs",
          fat: "20%",
          score: 79,
          status: "Complete",
          inBodyScans: "/images/svg.png",
        },
      ]);

      setStats({
        totalScans: 3,
        weightChange: "-2.2 lbs",
        currentScore: 85,
        improvement: 6,
        playerName: "Shweta Gharge",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchProgress();
}, []);

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
      {/* ── Header ── */}
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

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            label: "Total Scans",
            value: stats.totalScans,
            color: "text-[#6d28d9]",
          },
          {
            label: "Weight Change",
            value: stats.weightChange,
            color: stats.weightChange.startsWith("-")
              ? "text-[#00daba]"
              : "text-orange-500",
          },
          {
            label: "Current Score",
            value: stats.currentScore,
            color: "text-[#6d28d9]",
          },
          {
            label: "Improvement",
            value: `${stats.improvement > 0 ? "+" : ""}${stats.improvement}`,
            color: stats.improvement >= 0 ? "text-[#00daba]" : "text-red-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white"
          >
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold ${stat.color} leading-none`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Progress Timeline ── */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-base sm:text-lg font-bold text-[#1a1c1e] mb-4 sm:mb-6 tracking-tight">
          Progress Timeline
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {progressData.map((item, index) => (
            <div
              key={item.id}
              className="group border border-gray-100 bg-white rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
            >
              {/* Top row: id + image + date + status + arrow */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                {/* ID Badge */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 shadow-md shadow-purple-500/10">
                  #{item.id}
                </div>

                {/* Scan image */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                  <img
                    src={item.inBodyScans || "/images/svg.png"}
                    alt="Scan"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Date + status */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] sm:text-base font-bold text-[#1a1c1e] truncate">
                      {item.date}
                    </p>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadgeClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="p-1.5 sm:p-2 rounded-xl group-hover:bg-purple-50 text-gray-300 group-hover:text-[#6d28d9] transition-all cursor-pointer flex-shrink-0">
                  <ArrowLeft
                    className="rotate-180"
                    size={16}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Metrics — 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pl-0 sm:pl-[92px]">
                {[
                  {
                    label: "Weight",
                    value: item.weight,
                    color: "text-[#6d28d9]",
                    delta: index === 0 ? "-2 lbs" : null,
                    deltaColor: "bg-[#e6f9f6] text-[#00daba]",
                  },
                  {
                    label: "SMM",
                    value: item.smm,
                    color: "text-sky-500",
                    delta: index === 0 ? "+0.6 lbs" : null,
                    deltaColor: "bg-[#e6f9f6] text-[#00daba]",
                  },
                  {
                    label: "Body Fat",
                    value: item.fat,
                    color: "text-orange-500",
                    delta: index === 0 ? "-0.9%" : null,
                    deltaColor: "bg-[#fff1f0] text-red-400",
                  },
                  {
                    label: "Comp Score",
                    value: item.score,
                    color: "text-[#6d28d9]",
                    delta: index === 0 ? "+3" : null,
                    deltaColor: "bg-[#e6f9f6] text-[#00daba]",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-gray-50 sm:bg-transparent rounded-xl sm:rounded-none p-2 sm:p-0"
                  >
                    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                      {m.label}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`${m.color} text-sm font-bold`}>
                        {m.value}
                      </span>
                      {m.delta && (
                        <span
                          className={`${m.deltaColor} text-[8px] font-bold px-1.5 py-0.5 rounded-md`}
                        >
                          {m.delta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {progressData.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-5 py-6 text-center text-sm font-semibold text-gray-400">
              No progress cards yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Banner ── */}
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
