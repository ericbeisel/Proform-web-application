"use client";

import { useState } from "react";
import {
  Search, ChevronLeft, Star, Home, Dumbbell, Heart,
  Zap, Target, Activity, TrendingUp, Globe, Flame,
  Circle, Users, ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const PURPLE = "#6C3AE8";
const ORANGE  = "#F97316";
const GREEN   = "#10B981";
const BLUE    = "#3B82F6";

// ── data ──────────────────────────────────────────────────────────────────────
const freePrograms = [
  { id:1, img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id:2, img:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80" },
  { id:3, img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80" },
  { id:4, img:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80" },
  { id:5, img:"https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400&q=80" },
  { id:6, img:"https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80" },
];

const focusItems = [
  { label:"Add Muscle",      icon: TrendingUp },
  { label:"Build Power",     icon: Zap        },
  { label:"Lateral Mobility",icon: Target      },
  { label:"Endurance",       icon: Heart       },
  { label:"Fat Loss",        icon: Flame       },
  { label:"Flexibility",     icon: Activity    },
];

const sportItems = [
  { label:"General Fitness", icon: Activity },
  { label:"Football",        icon: Circle   },
  { label:"Basketball",      icon: Globe    },
  { label:"Running",         icon: Activity },
  { label:"HIIT",            icon: Flame    },
  { label:"Yoga",            icon: Target   },
];

const trainers = [
  { name:"Marcus J.", rating:4.9, img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80" },
  { name:"Sarah K.",  rating:5.0, img:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&q=80" },
  { name:"Alex R.",   rating:4.5, img:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80" },
];

const settingItems = [
  { label:"Home",     icon: Home,    color: ORANGE },
  { label:"Gym",      icon: Dumbbell,color: BLUE   },
  { label:"Wellness", icon: Heart,   color: PURPLE },
];

const ageGroups = [
  { label:"Youth",  icon: Users, color: GREEN  },
  { label:"Adult",  icon: Users, color: BLUE   },
  { label:"Senior", icon: Users, color: PURPLE },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ title, showSeeAll = false }: { title: string; showSeeAll?: boolean }) {
  return (
    <div className="flex justify-between items-center mb-3 md:mb-4">
      <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
      {showSeeAll && (
        <button className="flex items-center gap-1 text-xs md:text-sm font-semibold" style={{ color: PURPLE }}>
          See all <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Star size={12} fill="currentColor" /> {rating}
    </span>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function SearchWorkoutsPage() {
  const router = useRouter(); 
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Nav Bar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-900">Search Workouts</h1>
          <div className="flex-1 max-w-xl relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workouts, trainers, programs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-screen-xl mx-auto w-full space-y-8 md:space-y-10">
        {/* ── Featured Banner with View All Button ── */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-40 md:h-56 w-full"
          style={{ background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
            alt="Featured" className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-end">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Star size={16} fill="#FBBF24" className="text-amber-400" />
                <span className="text-white font-bold text-base md:text-xl">Featured Workouts</span>
              </div>
              <button 
                onClick={() => router.push('/programs/all-programs')}
                className="bg-white/20 backdrop-blur-sm text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1 hover:bg-white/30 transition w-fit"
              >
                View All Programs <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-gray-300 text-xs md:text-sm mt-1">Discover trending programs curated just for you</p>
          </div>
        </div>

        {/* ── Scheduled / Franchise row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div>
            <p className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">Scheduled with plan</p>
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-32 md:h-36 flex items-end p-4 md:p-5"
              style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
              <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80"
                alt="Plan" className="absolute inset-0 w-full h-full object-cover opacity-25" />
              <div className="relative z-10">
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                  <Activity size={12} className="text-blue-300" />
                  <span className="text-white text-xs md:text-sm font-bold">Your Personalized Plan</span>
                </div>
                <p className="text-blue-200 text-[10px] md:text-xs">Follow your customized schedule</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">By Franchise</p>
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-32 md:h-36 flex items-end p-4 md:p-5"
              style={{ background:"linear-gradient(135deg,#1a1a2e,#374151)" }}>
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                alt="Franchise" className="absolute inset-0 w-full h-full object-cover opacity-25" />
              <div className="relative z-10">
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                  <Dumbbell size={12} className="text-gray-300" />
                  <span className="text-white text-xs md:text-sm font-bold">Explore Franchises</span>
                </div>
                <p className="text-gray-400 text-[10px] md:text-xs">Exclusive partner gyms & studios</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── By Sport ── */}
        <div>
          <SectionHeader title="By Sport" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {sportItems.map(({ label, icon: Icon }) => (
              <button key={label}
                className="flex flex-col items-center gap-2 md:gap-3 py-3 md:py-5 px-2 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ background: PURPLE }}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-[10px] md:text-xs text-gray-700 font-medium text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Most Popular + Featured Trainers ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SectionHeader title="Most Popular" />
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-40 md:h-48">
              <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"
                alt="Popular" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-orange-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full flex items-center gap-1">
                <Star size={8} fill="white" /> Popular
              </div>
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                <p className="text-white font-bold text-sm md:text-base">Top Rated Workouts</p>
                <p className="text-gray-300 text-xs">Loved by thousands</p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader title="Featured Trainers" showSeeAll />
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {trainers.map((t) => (
                <div key={t.name} className="flex flex-col items-center gap-2 bg-white rounded-xl md:rounded-2xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
                  <img src={t.img} alt={t.name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover" />
                  <p className="text-[10px] md:text-xs font-semibold text-gray-800">{t.name}</p>
                  <StarRating rating={t.rating} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Free Programs ── */}
        <div>
          <SectionHeader title="Free Programs" showSeeAll />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {freePrograms.map((p) => (
              <div 
                key={p.id} 
                className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-square group cursor-pointer"
              >
                <img src={p.img} alt="program" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                <span className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full inline-block" />
                  FREE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── By Focus ── */}
        <div>
          <SectionHeader title="By Focus" showSeeAll />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {focusItems.map(({ label, icon: Icon }) => (
              <button key={label}
                className="flex flex-col items-center gap-2 md:gap-3 py-3 md:py-5 px-2 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ background: PURPLE }}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-[10px] md:text-xs text-gray-700 font-medium text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Additional Franchise + By Age ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <SectionHeader title="Additional Franchise" />
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-40 md:h-48 flex items-end p-4 md:p-5"
              style={{ background:"linear-gradient(135deg,#111,#2d2d2d)" }}>
              <img src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80"
                alt="OPM" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                  <span className="text-amber-400 text-sm">🏆</span>
                  <span className="text-white text-base md:text-lg font-bold">O.P.M.</span>
                </div>
                <p className="text-gray-300 text-xs">Other People's Money</p>
                <p className="text-gray-400 text-[10px] mt-0.5">Exclusive franchise workouts</p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader title="By Age" showSeeAll />
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {ageGroups.map(({ label, icon: Icon, color }) => (
                <button key={label}
                  className="flex flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center" style={{ background: color }}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── By Setting ── */}
        <div>
          <SectionHeader title="By Setting" />
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {settingItems.map(({ label, icon: Icon, color }) => (
              <button key={label}
                className="flex flex-col items-center gap-2 md:gap-3 py-4 md:py-8 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center" style={{ background: color }}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-sm md:text-base font-semibold text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── By Movement / Exercise Search ── */}
        <div>
          <SectionHeader title="By Movement" />
          <button
            className="w-full rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-1 md:gap-2 py-6 md:py-10 text-white hover:opacity-90 transition"
            style={{ background:"linear-gradient(135deg,#6C3AE8 0%,#8B5CF6 100%)" }}>
            <Search size={24} className="opacity-90" />
            <span className="font-bold text-base md:text-xl">Exercise Search</span>
            <span className="text-purple-200 text-xs">Find specific movements</span>
          </button>
        </div>
      </main>
    </div>
  );
}