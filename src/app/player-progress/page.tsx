"use client";

import { ArrowLeft, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlayerCardDetails, PlayerCardDetail } from "@/api/player-card/route";

interface ProgressItem {
  id: number;
  date: string;
  weight: string;
  smm: string;
  fat: string;
  score: number;
  status: "Complete" | "Pending" | "Reject";
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

        // Call your API endpoint
        const response = await getPlayerCardDetails();
        console.log("API Response:", response);

        const rows = Array.isArray(response?.data) ? response.data : [];

        const formattedData = rows.map((item: PlayerCardDetail, index: number) => ({
          id: item.id || index + 1,
          date: item.date || "N/A",
          weight: item.currentWeight ? `${item.currentWeight} lbs` : "0 lbs",
          smm: item.smm ? `${item.smm} lbs` : "0 lbs",
          fat: item.bodyFat ? `${item.bodyFat}%` : "0%",
          score: item.bodyCampScore || 0,
          status: normalizeStatus(item.status),
        }));

        setProgressData(formattedData);

        // Calculate stats from data
        if (formattedData.length > 0) {
          // Sort by date (assuming newest first)
          const sorted = [...formattedData].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          const latestScan = sorted[0];
          const oldestScan = sorted[sorted.length - 1];

          // Parse weight values (remove 'lbs' and convert to number)
          const latestWeight = parseFloat(latestScan.weight) || 0;
          const oldestWeight = parseFloat(oldestScan.weight) || 0;
          const weightDiff = (latestWeight - oldestWeight).toFixed(1);

          // Calculate score improvement
          const latestScore = latestScan.score || 0;
          const oldestScore = oldestScan.score || 0;
          const scoreDiff = latestScore - oldestScore;

          setStats({
            totalScans: response.total_scan ?? formattedData.length,
            weightChange: `${weightDiff.startsWith("-") ? "" : "+"}${weightDiff} lbs`,
            currentScore: latestScore,
            improvement: response.improvement ?? scoreDiff,
            playerName: response.name || rows[0]?.name || "Shweta Gharge",
          });
        } else {
          setStats((prev) => ({
            ...prev,
            totalScans: response.total_scan ?? 0,
            improvement: response.improvement ?? 0,
            playerName: response.name || prev.playerName,
          }));
        }
      } catch (err: unknown) {
        console.error("Error fetching progress:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load progress data",
        );

        // Fallback to dummy data if API fails
        setProgressData([
          {
            id: 4,
            date: "2/3/2026",
            weight: "67 lbs",
            smm: "52.4 lbs",
            fat: "18.2%",
            score: 85,
            status: "Complete",
          },
          {
            id: 3,
            date: "1/15/2026",
            weight: "68.5 lbs",
            smm: "51.8 lbs",
            fat: "19.1%",
            score: 82,
            status: "Complete",
          },
          {
            id: 2,
            date: "12/28/2025",
            weight: "69.2 lbs",
            smm: "51.2 lbs",
            fat: "20%",
            score: 79,
            status: "Complete",
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

  // Show loading state
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

  // Show error state (optional - you can keep showing fallback data instead)
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
    <main className="min-h-screen bg-[#f8f9fb] px-5 py-6 md:p-10 font-sans">
      {/* HEADER SECTION */}
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
              Player Progress
            </h1>
            <p className="text-gray-400 text-xs font-medium">
              Track {stats.playerName}’s fitness journey
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
            className="bg-white rounded-2xl p-5 shadow-sm border border-white"
          >
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.color} leading-none`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* PROGRESS TIMELINE SECTION */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-[#1a1c1e] mb-6 tracking-tight">
          Progress Timeline
        </h2>

        <div className="space-y-4">
          {progressData.map((item, index) => (
            <div
              key={item.id}
              className="group border border-gray-50 bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
            >
              {/* CONTENT SECTION */}
              <div className="flex items-center gap-4 flex-1">
                {/* ID BADGE */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md shadow-purple-500/10">
                  #{item.id}
                </div>

                {/* SCAN IMAGE */}
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                  <img
                    src="/images/svg.png"
                    alt="Scan"
                    className="w-full h-full object-cover grayscale opacity-60"
                  />
                </div>

                {/* INFO & METRICS */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-base font-bold text-[#1a1c1e]">
                      {item.date}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadgeClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
                      <div key={i} className="flex flex-col">
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                          {m.label}
                        </span>
                        <div className="flex items-center gap-1.5">
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
              </div>

              {/* NAV ARROW */}
              <div className="pl-4">
                <div className="p-2 rounded-xl group-hover:bg-purple-50 text-gray-300 group-hover:text-[#6d28d9] transition-all cursor-pointer">
                  <ArrowLeft
                    className="rotate-180"
                    size={18}
                    strokeWidth={2.5}
                  />
                </div>
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

      {/* FOOTER BANNER */}
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
