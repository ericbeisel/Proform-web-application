"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Zap,
  Target,
  Award,
  TrendingUp as TrendingUpIcon,
  ChevronDown,
  Scan,
  Image,
} from "lucide-react";
import {
  getAdminPlayerCardById,
  PlayerCardDetail,
} from "@/api/player-card/route";
import { dashboardApi } from "@/api/dashboard/route"; // Add this import
import { getAuthToken } from "@/lib/auth/session";

type MetricsState = {
  currentWeight: string;
  height: string;
  smm: string;
  bodyFat: string;
  bodyCampScore: string;
};

type DiffState = {
  weight_diff: string;
  height_diff: string;
  smm_diff: string;
  bf_diff: string;
  body_camp_diff: string;
};

// Accountability Tools Item Type - Same as upload page
interface AccountabilityTool {
  id: string;
  title: string;
  file: File | null;
  preview: string | null;
  isExpanded: boolean;
  allowUpload: boolean; // This will be false for all on detail page
  uploadedUrl?: string | null; // For displaying existing uploaded files
}

function initialMetrics(cardData?: PlayerCardDetail | null): MetricsState {
  return {
    currentWeight: cardData?.currentWeight?.toString() || "0.00",
    height: cardData?.height?.toString() || "0.00",
    smm: cardData?.smm?.toString() || "0",
    bodyFat: cardData?.bodyFat?.toString() || "0",
    bodyCampScore: cardData?.bodyCampScore?.toString() || "00",
  };
}

function initialDiffs(cardData?: any | null): DiffState {
  return {
    weight_diff: (cardData?.currentWeightDiff ?? cardData?.weight_diff ?? cardData?.current_weight_diff ?? "0")?.toString() || "0",
    height_diff: (cardData?.heightDiff ?? cardData?.height_diff ?? "0")?.toString() || "0",
    smm_diff: (cardData?.smmDiff ?? cardData?.smm_diff ?? "0")?.toString() || "0",
    bf_diff: (cardData?.bodyFatDiff ?? cardData?.bf_diff ?? "0")?.toString() || "0",
    body_camp_diff: (cardData?.bodyCampScoreDiff ?? cardData?.body_camp_diff ?? "0")?.toString() || "0",
  };
}

// Helper function to clean image URLs
function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace("https://paxlete.com//", "https://paxlete.com/")
    .replace(/([^:]\/)\/+/g, "$1");
}

/** Renders a small colored badge showing the diff value */
function DiffBadge({ value, unit }: { value: string; unit: string }) {
  const cleanVal = value.toString().replace(/[^\d.-]/g, "");
  const num = parseFloat(cleanVal);
  if (isNaN(num)) return null;

  if (num === 0) {
    return (
      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border bg-green-50 text-green-600 border-green-200">
        0
        {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
      </span>
    );
  }

  const isPositive = num > 0;
  
  let useBadColor = false;
  if (unit === " lbs" || unit === "%" || unit === " in") {
    useBadColor = isPositive;
  } else {
    useBadColor = !isPositive;
  }

  const displayVal = isPositive ? `+${num}` : `${num}`;

  return (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border ${
        !useBadColor
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-red-50 text-red-500 border-red-200"
      }`}
    >
      {displayVal}
      {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
    </span>
  );
}

function statusStyles(status: string): string {
  const normalized = (status || "").toLowerCase();
  if (normalized === "complete" || normalized === "approved" || normalized === "accepted") 
    return "bg-[#00daba] text-white";
  if (normalized === "reject" || normalized === "rejected") 
    return "bg-[#ef4444] text-white";
  return "bg-[#9ca3af] text-white";
}

export default function PlayerCardDetailView() {
  const router = useRouter();
  const { id } = useParams();

  const parsedId = useMemo(() => {
    const value = Array.isArray(id) ? id[0] : id;
    const asNumber = Number.parseInt(value || "", 10);
    return Number.isNaN(asNumber) ? null : asNumber;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<PlayerCardDetail | null>(null);
  const [metrics, setMetrics] = useState<MetricsState>(initialMetrics());
  const [diffs, setDiffs] = useState<DiffState>(initialDiffs());
  const [measurementUnit, setMeasurementUnit] = useState<string>("lbs"); // Add measurement unit state

  // Accountability Tools State - Same structure as upload page, but allowUpload false for all
  const [accountabilityTools, setAccountabilityTools] = useState<AccountabilityTool[]>([
    { id: "progress-photo", title: "Progress Photo", file: null, preview: null, isExpanded: false, allowUpload: false, uploadedUrl: null },
    { id: "blood-pressure", title: "Blood Pressure Test", file: null, preview: null, isExpanded: false, allowUpload: false, uploadedUrl: null },
    { id: "breathing", title: "Breathing Test", file: null, preview: null, isExpanded: false, allowUpload: false, uploadedUrl: null },
    { id: "hydration", title: "Hydration Test (Urine Test)", file: null, preview: null, isExpanded: false, allowUpload: false, uploadedUrl: null },
    { id: "bloodwork", title: "Bloodwork (Hormone) Results", file: null, preview: null, isExpanded: false, allowUpload: false, uploadedUrl: null },
  ]);

  // Toggle tool expansion
  const toggleToolExpansion = (toolId: string) => {
    setAccountabilityTools((prev) =>
      prev.map((tool) => ({
        ...tool,
        isExpanded: tool.id === toolId ? !tool.isExpanded : false,
      }))
    );
  };

  useEffect(() => {
    // Guard: a copy-pasted share link can be opened by a logged-out
    // browser — redirect to login instead of letting the fetch below fail.
    if (!getAuthToken()) {
      router.replace("/auth/login");
      return;
    }

    if (parsedId === null) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both card details and dashboard data in parallel
        const [cardResponse, dashboardResponse] = await Promise.allSettled([
          getAdminPlayerCardById(parsedId),
          dashboardApi.getDashboardSummary(),
        ]);

        // Process card data
        if (cardResponse.status === "fulfilled") {
          const data = cardResponse.value;
          setCardData(data);
          setMetrics(initialMetrics(data));
          setDiffs(initialDiffs(data));
          
          // Update accountability tools with existing uploaded files from API
          setAccountabilityTools((prev) =>
            prev.map((tool) => {
              if (tool.id === "progress-photo" && data.progressImage) {
                return { 
                  ...tool, 
                  uploadedUrl: cleanImageUrl(data.progressImage),
                  preview: cleanImageUrl(data.progressImage)
                };
              }
              return tool;
            })
          );
        } else {
          console.error("Failed to fetch card details:", cardResponse.reason);
        }

        // Process dashboard data for measurement unit
        if (dashboardResponse.status === "fulfilled") {
          const dashboardData = dashboardResponse.value;
          console.log("📊 Dashboard Data:", dashboardData);
          if (dashboardData.measurementUnit) {
            setMeasurementUnit(dashboardData.measurementUnit);
            console.log("📏 Measurement Unit from Dashboard:", dashboardData.measurementUnit);
          }
        } else {
          console.error("Failed to fetch dashboard data:", dashboardResponse.reason);
        }
        
      } catch (error: unknown) {
        console.error("Failed to load player card details:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [parsedId, router]);

  const scanDate = cardData?.date ? cardData.date.split(" ")[0] : "N/A";
  const playerName = cardData?.name || "Player";
  const statusText = cardData?.status || "Pending";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading card details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-6 md:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all border border-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#333] text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">
                Player Card
              </h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                {playerName}
              </p>
            </div>
          </div>
        </div>

        <button 
           onClick={() => router.push("/player-progress")}
           className="flex items-center gap-2 bg-[#f8f9fc] border-2 border-[#6d28d9] text-[#6d28d9] px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-purple-50 transition-all shadow-sm uppercase tracking-wider">
          <BarChart3 size={16} />
          View Player Progress
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - ACCOUNTABILITY TOOLS (Same as upload page) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Accountability Tools</h2>
              <p className="text-xs text-gray-400 mt-1">
                Track your health metrics and progress
              </p>
            </div>

            <div className="space-y-3">
              {accountabilityTools.map((tool) => (
                <div
                  key={tool.id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  {/* Tool Header */}
                  <button
                    onClick={() => toggleToolExpansion(tool.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {tool.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        tool.isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {tool.isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {tool.allowUpload ? (
                        // Upload functionality (not used on detail page)
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                          <div className="flex justify-center mb-2">
                            <img
                              src="/images/svg.png"
                              alt="Upload"
                              className="h-12 w-auto object-contain opacity-50"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload option not available on view page
                          </p>
                        </div>
                      ) : (
                        // Show existing uploaded file or placeholder
                        <div className="text-center">
                          {(tool.preview || tool.uploadedUrl) ? (
                            <div className="space-y-3">
                              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <img
                                  src={tool.preview || tool.uploadedUrl || "/images/svg.png"}
                                  alt={tool.title}
                                  className="h-32 w-full object-contain rounded-lg"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                {tool.id === "progress-photo" && (
                                  <>
                                    <Image size={12} />
                                    <span>Progress Photo</span>
                                  </>
                                )}
                                {tool.id === "blood-pressure" && (
                                  <>
                                    <span>🩺</span>
                                    <span>Blood Pressure Test Result</span>
                                  </>
                                )}
                                {tool.id === "breathing" && (
                                  <>
                                    <span>🌬️</span>
                                    <span>Breathing Test Result</span>
                                  </>
                                )}
                                {tool.id === "hydration" && (
                                  <>
                                    <span>💧</span>
                                    <span>Hydration Test Result</span>
                                  </>
                                )}
                                {tool.id === "bloodwork" && (
                                  <>
                                    <span>🧪</span>
                                    <span>Bloodwork Results</span>
                                  </>
                                )}
                              </div>
                              {tool.id === "progress-photo" && (
                                <button
                                  onClick={() => {
                                    if (tool.uploadedUrl) {
                                      window.open(tool.uploadedUrl, '_blank');
                                    }
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  View Full Size
                                </button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-center mb-2">
                                <img
                                  src="/images/svg.png"
                                  alt="No file"
                                  className="h-12 w-auto object-contain opacity-30"
                                />
                              </div>
                              <p className="text-xs text-gray-400">
                                No {tool.title.toLowerCase()} uploaded for this scan
                              </p>
                              {tool.id === "progress-photo" && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                  Progress photos help track your transformation
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Body Scan & Score */}
        <div className="lg:col-span-4 space-y-8">
          {/* Body Scan Photo */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">
                  Body Scan Photo
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  Scan Date: {scanDate}
                </p>
              </div>
              <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${statusStyles(statusText)}`}>
                {statusText.toUpperCase()}
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
              <img
                src={cleanImageUrl(cardData?.inBodyScans) || "/images/svg.png"}
                alt="Scan Thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Composition Score */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">
                  Composition Score
                </h3>
                <p className="text-gray-400 text-[10px] font-medium">
                  Overall fitness rating
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]">
                <Target size={20} />
              </div>
            </div>

            <div className="flex items-end">
              <span className="text-[80px] font-bold text-[#6d28d9] leading-none tracking-tighter">
                {metrics.bodyCampScore}
              </span>
              <div className="pb-4">
                <DiffBadge value={diffs.body_camp_diff} unit="" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metrics */}
        <div className="lg:col-span-4 space-y-8">
          {/* Basic Metrics */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">
                Basic Metrics
              </h3>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]">
                <TrendingUpIcon size={20} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Current Wt ({measurementUnit}):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.currentWeight}
                  </span>
                  <DiffBadge value={diffs.weight_diff} unit={` ${measurementUnit}`} />
                </div>
              </div>

              <div className="h-px bg-gray-50 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="flex items-center justify-between group">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Height:
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.height}
                  </span>
                  <DiffBadge value={diffs.height_diff} unit="" />
                </div>
              </div>
            </div>
          </div>

          {/* Body Composition */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">
                Body Composition
              </h3>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]">
                <Zap size={20} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  SMM ({measurementUnit}):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.smm}
                  </span>
                  <DiffBadge value={diffs.smm_diff} unit={` ${measurementUnit}`} />
                </div>
              </div>

              <div className="h-px bg-gray-50 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="flex items-center justify-between group">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Body Fat (%):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.bodyFat}
                  </span>
                  <DiffBadge value={diffs.bf_diff} unit="%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}