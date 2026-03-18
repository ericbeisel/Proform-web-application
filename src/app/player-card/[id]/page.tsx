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
} from "lucide-react";
import {
  getAdminPlayerCardById,
  PlayerCardDetail,
} from "@/api/player-card/route";

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

/** Renders a small colored badge showing the diff value */
function DiffBadge({ value, unit }: { value: string; unit: string }) {
  const cleanVal = value.toString().replace(/[^\d.-]/g, "");
  const num = parseFloat(cleanVal);
  if (isNaN(num)) return null;

  // Show positive style for 0 change by default for user per previous request on progress page
  if (num === 0) {
    return (
      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border bg-green-50 text-green-600 border-green-200">
        0
        {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
      </span>
    );
  }

  const isPositive = num > 0;
  
  // Weight/Fat: positive is bad (red), negative is good (green)
  // SMM/Score: positive is good (green), negative is bad (red)
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

  useEffect(() => {
    if (parsedId === null) {
      setLoading(false);
      return;
    }

    const fetchCard = async () => {
      try {
        setLoading(true);
        const data = await getAdminPlayerCardById(parsedId);
        setCardData(data);
        setMetrics(initialMetrics(data));
        setDiffs(initialDiffs(data));
      } catch (error: unknown) {
        console.error("Failed to load player card details:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCard();
  }, [parsedId]);

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
        <div className="lg:col-span-4 h-full">
          <div 
            onClick={() => router.push("/player-progress-photos")}
            className="bg-white rounded-[40px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white h-full relative overflow-hidden flex flex-col items-center cursor-pointer group hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] transition-all duration-500"
          >
            <div className="absolute inset-0 bg-[#1a1c1e] m-4 rounded-[32px] overflow-hidden group-hover:m-3 transition-all duration-500">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="relative h-full w-full flex items-center justify-center p-12">
                <img
                  src={cardData?.progressImage || "/images/svg.png"}
                  alt="Human Asset"
                  className="h-full w-auto object-contain brightness-110 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* View All Overlay */}
                <div className="absolute inset-0 bg-[#6d28d9]/0 group-hover:bg-[#6d28d9]/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-[#6d28d9] text-[10px] font-bold uppercase tracking-widest">View All Photos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[500px] w-full" />

            <span className="mt-6 text-[#6d28d9] text-xs font-bold uppercase tracking-widest relative z-10 group-hover:underline underline-offset-4">
              Progress Photo
            </span>
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
                src={cardData?.inBodyScans || "/images/svg.png"}
                alt="Scan Thumbnail"
                className="w-full h-full object-cover grayscale opacity-60"
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
                  Current Wt (lbs):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.currentWeight}
                  </span>
                  <DiffBadge value={diffs.weight_diff} unit=" lbs" />
                </div>
              </div>

              <div className="h-px bg-gray-50 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="flex items-center justify-between group">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Height (Inches):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.height}
                  </span>
                  <DiffBadge value={diffs.height_diff} unit=" in" />
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
                  SMM (lbs):
                </p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#6d28d9] text-right">
                    {metrics.smm}
                  </span>
                  <DiffBadge value={diffs.smm_diff} unit=" lbs" />
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

          <div className="bg-[#f0f9ff] rounded-2xl p-4 border border-blue-100">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest text-center">
              Consistency is the key to progress! 🚀
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
