"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Info, Trophy, ShoppingCart, Coins, Gift, Package, Headphones, ShoppingBag, Zap, Dumbbell } from "lucide-react";
import type { ComponentType } from "react";
import { dashboardApi } from "@/api/dashboard/route";

type RewardItem = {
  icon: ComponentType<{ size?: number; color?: string }>;
  name: string;
  pts: number;
};

const REWARDS: RewardItem[] = [
  { icon: Gift,        name: "$10 Giftcard",             pts: 3000 },
  { icon: Package,     name: "$15 Amazon GC",             pts: 5000 },
  { icon: Headphones,  name: "VectorFPS Set",              pts: 7500 },
  { icon: ShoppingBag, name: "Adidas Gym Bag",             pts: 12000 },
  { icon: Zap,         name: "Theragun Prime",             pts: 75000 },
  { icon: Dumbbell,    name: '"For-Life" Gym Membership', pts: 300000 },
];

// Mirrors the stat-card / muscle-activation palette from /metrics for visual consistency.
const REWARD_COLORS = [
  { fg: "#7B5EA7", bg: "#F3E8FF" },
  { fg: "#06BCC1", bg: "#E0F7FA" },
  { fg: "#F59E0B", bg: "#FEF3C7" },
  { fg: "#3B82F6", bg: "#DBEAFE" },
  { fg: "#EF4444", bg: "#FEE2E2" },
  { fg: "#10B981", bg: "#D1FAE5" },
];

function fmtPts(n: number) {
  return n.toLocaleString();
}

export default function PointsPage() {
  const router = useRouter();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    dashboardApi
      .getDashboardSummary()
      .then((summary) => setPoints(summary.pfPoints))
      .catch(() => setPoints(0));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 pt-3 pb-2.5"
        style={{ backgroundColor: "#9B59D4" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-white">Pro-Points</h1>
          <button
            onClick={() => router.back()}
            className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-70"
          >
            <X size={17} color="rgba(255,255,255,0.85)" />
          </button>
        </div>
      </div>

      {/* Gradient hero */}
      <div
        className="relative overflow-hidden px-6 pt-4 pb-5 rounded-b-3xl"
        style={{ background: "linear-gradient(135deg, #9B59D4 0%, #7C3AED 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 200, height: 200, backgroundColor: "rgba(255,255,255,0.08)", top: -70, left: -50 }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 140, height: 140, backgroundColor: "rgba(255,255,255,0.07)", bottom: -60, right: -30 }}
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-2">
            <Coins size={20} color="#ffffff" />
          </div>

          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.85)" }}>
              Points Available
            </span>
            <Info size={12} color="rgba(255,255,255,0.6)" />
          </div>

          {points === null ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin my-2" />
          ) : (
            <span className="font-bold text-white leading-none" style={{ fontSize: 40 }}>
              {fmtPts(points)}
            </span>
          )}

          <p className="text-[11px] leading-snug mt-1.5 max-w-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            Increase your Pro-Points by completing workouts and other activity
            daily, and by using accountability features like hydration tracking,
            cardio logging, submitting player reports and Macro-Tracking.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 pt-5 pb-10">
        {/* Pro Card bonus banner */}
        <div
          className="rounded-2xl p-4 border mb-6 flex items-center gap-3 max-w-2xl mx-auto"
          style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FEF3C7" }}>
            <Trophy size={18} color="#D97706" />
          </div>
          <p className="text-sm font-medium leading-snug" style={{ color: "#92400E" }}>
            Complete your Pro Card and get a bonus{" "}
            <span className="font-bold" style={{ color: "#D97706" }}>+150 pts</span>
          </p>
        </div>

        {/* Shop Rewards */}
        <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>Shop Rewards:</h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>{REWARDS.length} items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-6xl mx-auto mb-6">
          {REWARDS.map((r, i) => {
            const Icon = r.icon;
            const color = REWARD_COLORS[i % REWARD_COLORS.length];
            return (
              <button
                key={r.name}
                className="rounded-2xl p-4 flex flex-col items-center gap-2.5 border transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color.bg }}>
                  <Icon size={20} color={color.fg} />
                </div>
                <p className="text-xs font-semibold text-center leading-tight" style={{ color: "#1A1A1A" }}>
                  {r.name}
                </p>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: color.fg, backgroundColor: color.bg }}>
                  {fmtPts(r.pts)} pts
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 text-white font-bold text-base py-4 rounded-2xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#9333EA" }}
        >
          <ShoppingCart size={18} />
          Shop All Rewards
        </button>
      </div>
    </div>
  );
}
