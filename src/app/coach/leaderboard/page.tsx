"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  X,
  Trophy,
  ChevronRight,
  User,
} from "lucide-react";
import { coachApi } from "@/api/coach/route";

// ── Category Modal ─────────────────────────────────────────────────────────────

function CategoryModal({ cat, onClose }: { cat: any; onClose: () => void }) {
  const others = [];
  if (cat.rank1) others.push(cat.rank1);
  if (cat.rank2) others.push(cat.rank2);
  if (cat.rank3) others.push(cat.rank3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${cat.headerGradient} px-5 pt-5 pb-6 relative`}>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
            Leaderboard Category
          </p>
          <p className="text-white font-black text-2xl leading-tight">
            {cat.name.split(" ")[0]}{" "}
            <span className="font-normal text-white/80 text-base">
              {cat.name.match(/\(([^)]+)\)/)?.[0] ?? ""}
            </span>
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Dark table body */}
        <div style={{ background: "#1a1535" }} className="px-0 py-0">
          {others.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No entries yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: "#221b42" }}>
                  <th className="text-left py-3 px-5 text-white text-sm font-bold">UserName</th>
                  <th className="text-right py-3 px-5 text-white text-sm font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {others.map((entry, i) => (
                  <tr
                    key={entry.memberId}
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <td className="py-3.5 px-5 text-white/70 text-sm italic">@{entry.username}</td>
                    <td className="py-3.5 px-5 text-right text-[#a78bfa] font-semibold text-sm">
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function LeaderCard({ cat, onViewCategory }: { cat: any; onViewCategory: () => void }) {
  const noRecord = !cat.rank1;
  const initial = cat.rank1 ? cat.rank1.username[0].toUpperCase() : null;

  const others = [];
  if (cat.rank2) others.push(cat.rank2);
  if (cat.rank3) others.push(cat.rank3);

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-gradient-to-br ${cat.gradient} shadow-lg border border-white/5`}>
      {/* Main section */}
      <div className="px-4 pt-4 pb-5 flex flex-col gap-3 flex-1">
        {/* Top row: rank + icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#f59e0b] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
              1
            </span>
            <span className="text-white/70 text-xs font-semibold">Rankings</span>
          </div>
          <Trophy size={20} className={`${cat.iconColor} opacity-80`} />
        </div>

        {/* Avatar + score row */}
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.avatarBg} flex items-center justify-center shrink-0 shadow-inner`}>
            {cat.rank1?.profilePicture ? (
              <img
                src={cat.rank1.profilePicture}
                alt={cat.rank1.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : initial ? (
              <span className="text-white font-black text-2xl">{initial}</span>
            ) : (
              <User size={26} className="text-white/60" />
            )}
          </div>

          <div className="min-w-0">
            {noRecord ? (
              <p className="text-white font-black text-2xl sm:text-3xl leading-tight">No record</p>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-3xl sm:text-4xl leading-tight">
                  {cat.rank1.value}
                </span>
                <span className="text-white/60 text-xs">{cat.unit}</span>
              </div>
            )}
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide truncate mt-0.5">
              {cat.name}
            </p>
            {cat.rank1 && (
              <p className="text-white/90 text-sm font-semibold truncate">@{cat.rank1.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom dark strip */}
      <div className="bg-black/25 px-4 py-3 flex items-center justify-between gap-2 min-h-[44px]">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {others.length === 0 ? (
            <p className="text-white/40 text-xs italic">No other entries</p>
          ) : (
            others.map((o) => (
              <p key={o.memberId} className="text-white/60 text-xs truncate">
                @{o.username} <span className="text-white/40">({o.value})</span>
              </p>
            ))
          )}
        </div>
        {!noRecord && (
          <button
            onClick={onViewCategory}
            className="text-white/80 text-xs font-semibold flex items-center gap-0.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            View Category <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  {
    gradient: "from-[#4158D0] via-[#7B5CF6] to-[#8B4CF6]",
    headerGradient: "from-[#4158D0] to-[#8B4CF6]",
    avatarBg: "bg-[#9333ea]",
    iconColor: "text-orange-300",
  },
  {
    gradient: "from-[#0093E9] to-[#38bdf8]",
    headerGradient: "from-[#0093E9] to-[#38bdf8]",
    avatarBg: "bg-[#2563eb]",
    iconColor: "text-blue-200",
  },
  {
    gradient: "from-[#11998e] to-[#38ef7d]",
    headerGradient: "from-[#11998e] to-[#38ef7d]",
    avatarBg: "bg-[#f59e0b]",
    iconColor: "text-green-200",
  },
  {
    gradient: "from-[#f7971e] to-[#ffd200]",
    headerGradient: "from-[#f7971e] to-[#ffd200]",
    avatarBg: "bg-[#d97706]/40",
    iconColor: "text-yellow-200",
  },
  {
    gradient: "from-[#FF416C] to-[#FF4B2B]",
    headerGradient: "from-[#FF416C] to-[#FF4B2B]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-red-200",
  },
  {
    gradient: "from-[#7B2FBE] to-[#4A00E0]",
    headerGradient: "from-[#7B2FBE] to-[#4A00E0]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-purple-200",
  },
];

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const isTvMode = !!code;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<any | null>(null);

  // Poll TV casting config if in kiosk mode
  useEffect(() => {
    if (!isTvMode || !code) return;
    const interval = setInterval(async () => {
      try {
        const res = await coachApi.resolveXanvas(code);
        console.log("[Leaderboard] resolveXanvas poll response:", res);
        if (res?.url && !res.url.includes(`code=${code}`)) {
          window.location.href = res.url;
        }
      } catch (err) {
        console.error("TV casting resolution poll failed:", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isTvMode, code]);

  // Load leaderboard categories and ranks dynamically
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await coachApi.getGlobalLeaderboard();
        console.log("[Leaderboard] getGlobalLeaderboard raw response:", res);
        const mapped = res.categories.map((cat, i) => {
          const style = GRADIENTS[i % GRADIENTS.length];
          return {
            id: cat.category.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            name: cat.category,
            unit: cat.measurement,
            rank1: cat.rank1,
            rank2: cat.rank2,
            rank3: cat.rank3,
            ...style,
          };
        });
        console.log("[Leaderboard] mapped categories:", mapped);
        setCategories(mapped);
      } catch (err) {
        console.error("Failed to fetch rankings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 50%, #0a1020 100%)" }}
    >
      {/* Header - Hidden in TV casting mode */}
      {!isTvMode && (
        <header
          className="relative overflow-hidden sticky top-0 z-40 px-4 sm:px-6 py-5 border-b border-white/10"
          style={{ background: "rgba(15,5,32,0.85)", backdropFilter: "blur(12px)" }}
        >
          {/* Decorative glowing orbs */}
          <div
            className="absolute rounded-full pointer-events-none blur-2xl"
            style={{ width: 220, height: 220, backgroundColor: "rgba(124,58,237,0.35)", top: -120, left: -60 }}
          />
          <div
            className="absolute rounded-full pointer-events-none blur-2xl"
            style={{ width: 160, height: 160, backgroundColor: "rgba(167,139,250,0.25)", top: -80, right: 10 }}
          />

          <div className="relative flex items-center justify-between gap-2">
            {/* Left */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0"
              >
                <ArrowLeft size={15} className="text-white/70" />
              </button>
              <span className="text-white font-semibold text-base sm:text-lg truncate">
                Leaderboard
              </span>
            </div>

            {/* Center — sm+ only */}
            <div className="hidden sm:flex flex-col items-center shrink-0 absolute left-1/2 -translate-x-1/2">
              <img
                src="/images/proform-logo.jpg"
                alt="Proform"
                className="w-8 h-8 object-contain rounded-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    '<span class="text-white font-black text-sm">P</span>';
                }}
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => router.push("/coach/coach-dashboard")}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0"
              >
                <X size={14} className="text-white/60" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Grid */}
      <div className="flex-1 px-4 sm:px-6 pt-5 sm:pt-6 pb-24 sm:pb-6 animate-fadeIn">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 animate-pulse">
            <div className="w-12 h-12 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-semibold">Loading leaderboard statistics...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Trophy size={48} className="text-white/20" />
            <p className="text-white/50 text-sm font-bold">No metrics found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCategories.map((cat) => (
              <LeaderCard
                key={cat.id}
                cat={cat}
                onViewCategory={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category modal */}
      {activeCategory && (
        <CategoryModal cat={activeCategory} onClose={() => setActiveCategory(null)} />
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function CoachLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 100%)" }}
        >
          <div className="w-10 h-10 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
