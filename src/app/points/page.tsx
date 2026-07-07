"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Info, Trophy, ShoppingCart, Coins, Gift, Package, Headphones, ShoppingBag, Zap, Dumbbell } from "lucide-react";
import type { ComponentType } from "react";
import { dashboardApi } from "@/api/dashboard/route";

type RewardItem = {
  icon: ComponentType<{ size?: number; className?: string }>;
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
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Close button */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center px-6 pt-2 pb-6 text-center">
        {/* Coin icon */}
        <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center shadow-md mb-4">
          <Coins size={30} className="text-white" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">Pro-Points</h1>

        {/* Points display */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-5xl font-extrabold text-purple-600">
            {points === null ? "—" : `${fmtPts(points)} Pts`}
          </span>
          <Info size={16} className="text-gray-400 mt-1" />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Increase your Pro-Points by completing workouts and other activity
          daily, and by using accountability features like hydration tracking,
          cardio logging, submitting player reports and Macro-Tracking.
        </p>
      </div>

      {/* Pro Card bonus banner */}
      <div className="mx-4 mb-6">
        <div className="flex items-center gap-3 border border-purple-300 rounded-2xl px-4 py-4 bg-white">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Trophy size={20} className="text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-800 leading-snug">
            Complete your Pro Card and get a bonus{" "}
            <span className="text-purple-600 font-bold">+150 pts</span>
          </p>
        </div>
      </div>

      {/* Shop Rewards */}
      <div className="flex-1 px-4 pb-32">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
          Shop Rewards:
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {REWARDS.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.name}
                className="flex flex-col items-center bg-gray-50 rounded-2xl p-3 gap-2 hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Icon size={24} className="text-gray-700" />
                </div>
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {r.name}
                </p>
                <p className="text-xs font-bold text-purple-600">
                  {fmtPts(r.pts)} pts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-base py-4 rounded-2xl transition-colors shadow-md">
          <ShoppingCart size={18} />
          Shop All Rewards
        </button>
      </div>
    </div>
  );
}
