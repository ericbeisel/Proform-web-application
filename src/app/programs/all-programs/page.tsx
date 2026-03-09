"use client";

import { useState } from "react";
import {
  Search, ArrowLeft, LayoutGrid, AlignJustify, Eye, ShoppingBag,
  SlidersHorizontal, X, Check,
  Clock, Calendar, Award, Dumbbell, Users, Star,
  ChevronRight, Timer, Zap, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════
   TYPES
═══════════════════════════════════ */
interface Program {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: string;
  purchased: boolean;
  dollar: boolean;
  views: number;
  bought: number;
  image: string;
}

interface Week {
  label: string;
  title: string;
  desc: string;
  workouts: number;
  duration: string;
  img: string;
}

interface Objective {
  icon: string;
  title: string;
  desc: string;
  bg: string;
}

interface StartProgramPopupProps {
  program: Program;
  onClose: () => void;
}

interface ProgramDetailPageProps {
  program: Program;
  onBack: () => void;
}

interface AllProgramsGridProps {
  onSelectProgram: (program: Program) => void;
}

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

/* ═══════════════════════════════════
   DATA
═══════════════════════════════════ */
const programs: Program[] = [
  { id: 1, title: "July 4th Special!",  description: "Patriotic workout program celebrating American fitness culture with explosive movements and conditioning.",                                                   duration: "LIMITED TIME", category: "Conditioning", level: "Beginner",     purchased: true,  dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { id: 2, title: "RECONDITIONING",     description: "Whether you are traveling or just letting your body recover, use this program to maintain your muscles and prepare for the offseason.",                     duration: "3 WEEKS",      category: "Recovery",    level: "Intermediate", purchased: true,  dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80" },
  { id: 3, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80" },
  { id: 4, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
  { id: 5, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Intermediate", purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80" },
  { id: 6, title: "Elite Strength",     description: "6-week comprehensive strength building program with progressive overload targeting all major muscle groups for optimal growth.",                             duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 12400, bought: 3247, image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80" },
];

const weeks: Week[] = [
  { label: "WEEK 1", title: "Foundation Week",     desc: "Build your base strength with fundamental compound movements", workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
  { label: "WEEK 2", title: "Upper Body Focus",    desc: "Chest, back & shoulders with progressive overload",           workouts: 5, duration: "60-75 min", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { label: "WEEK 3", title: "Lower Body Power",    desc: "Legs & glutes training for explosive strength",               workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80" },
  { label: "WEEK 4", title: "Total Body Strength", desc: "Full body compound lifts for maximum gains",                  workouts: 5, duration: "60-75 min", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80" },
  { label: "WEEK 5", title: "Hypertrophy Phase",   desc: "Muscle building volume with time under tension",              workouts: 5, duration: "75-90 min", img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80" },
  { label: "WEEK 6", title: "Peak Performance",    desc: "Maximum intensity training and testing your limits",          workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80" },
];

const objectives: Objective[] = [
  { icon: "🟠", title: "Muscle Stimulation",     desc: "Progressive overload targeting all major muscle groups for optimal growth", bg: "#FFF7ED" },
  { icon: "🔵", title: "Technique & Repetition", desc: "Perfect form with controlled tempo and optimal rep ranges",                  bg: "#EFF6FF" },
  { icon: "🟣", title: "Balance & Core Stability",desc: "Enhanced functional strength and injury prevention focus",                  bg: "#F5F3FF" },
  { icon: "🟢", title: "Performance Metrics",    desc: "Track progress with detailed analytics and strength benchmarks",            bg: "#ECFDF5" },
];

const DURATIONS: string[] = ["All", "LIMITED TIME", "3 WEEKS", "6 WEEKS"];
const LEVELS:    string[] = ["All", "Beginner", "Intermediate", "Advanced"];
const CATS:      string[] = ["All", "Conditioning", "Recovery", "Strength"];

/* ═══════════════════════════════════
   GLOBAL STYLES (minimal, only essential animations)
═══════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'DM Sans', sans-serif; }
    @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes popIn        { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
    @keyframes slideDown    { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    .page-grid   { animation: slideInLeft  0.28s ease; }
    .page-detail { animation: slideInRight 0.28s ease; }
    .card-img { transition:transform 0.35s ease; }
    .group:hover .card-img { transform:scale(1.05); }
  `}</style>
);

/* ═══════════════════════════════════
   START PROGRAM POPUP (Responsive)
═══════════════════════════════════ */
function StartProgramPopup({ program, onClose }: StartProgramPopupProps) {
  const [inc, setInc] = useState(false);

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-300 bg-black/55 flex items-center justify-center p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md relative text-center shadow-2xl animate-[popIn_0.22s_ease] mx-4"
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 md:top-4 md:right-4 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-700" />
        </button>

        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6C3AE8] flex items-center justify-center mx-auto mb-4 md:mb-5 relative shadow-lg">
          <FileText size={24} className="text-white" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
          </div>
        </div>

        <p className="text-base md:text-lg font-bold text-gray-900 mb-2">Add this program to your<br />Workout Queue:</p>
        <p className="text-lg md:text-xl font-black text-[#6C3AE8] tracking-wider mb-2">{program.title.toUpperCase()}</p>
        <p className="text-sm text-green-600 font-semibold mb-4 md:mb-5">*Add 9 Workout(s)</p>

        <label 
          onClick={() => setInc(!inc)} 
          className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mb-4 md:mb-5 cursor-pointer text-left hover:bg-gray-100 transition-colors"
        >
          <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
            inc ? "bg-[#6C3AE8] border-[#6C3AE8]" : "bg-white border-gray-300"
          }`}>
            {inc && <span className="text-white text-xs font-black">✓</span>}
          </div>
          <span className="text-sm text-gray-700 font-medium">Include Supplemental Workouts (12)</span>
        </label>

        <button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6C3AE8] text-white rounded-full py-3 md:py-4 text-sm md:text-base font-bold mb-2 shadow-lg hover:shadow-xl transition-shadow">
          Add to Up Next
        </button>
        <button className="w-full bg-gray-900 text-white rounded-full py-3 md:py-4 text-sm md:text-base font-bold mb-3 hover:bg-gray-800 transition-colors">
          Add to Queue
        </button>
        <button onClick={onClose} className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   PROGRAM DETAIL PAGE (Responsive)
═══════════════════════════════════ */
function ProgramDetailPage({ program, onBack }: ProgramDetailPageProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="page-detail bg-gray-50 min-h-screen">
      {showPopup && <StartProgramPopup program={program} onClose={() => setShowPopup(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={onBack} 
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors"
              >
                <ArrowLeft size={18} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-base md:text-lg font-extrabold text-gray-900">{program.title}</h1>
                <p className="text-xs text-gray-400">6-week comprehensive program</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPopup(true)} 
              className="bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white px-4 md:px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
            >
              Start <ChevronRight size={16} />
            </button>
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Eye size={14} /> 
              <span>{program.views >= 1000 ? (program.views / 1000).toFixed(1) + "K" : program.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} /> 
              <span>{program.bought.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Responsive grid - stacks on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Objectives */}
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Program Objectives</h2>
            <div className="space-y-3">
              {objectives.map((o) => (
                <div 
                  key={o.title} 
                  className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm border border-gray-100"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: o.bg }}
                  >
                    {o.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 mb-1">{o.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Overview */}
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Program Overview</h2>
            <div className="bg-[#18182A] rounded-xl md:rounded-2xl p-5 md:p-6 text-white">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { icon: <Clock size={14} />, label: "Duration", value: "6 Weeks", sub: "42 days" },
                  { icon: <Calendar size={14} />, label: "Schedule", value: "4-5/week", sub: "60-90 min" },
                  { icon: <Dumbbell size={14} />, label: "Nutrition", value: "Muscle Gain", sub: "Caloric surplus" },
                  { icon: <Zap size={14} />, label: "Intensity", value: "High", sub: "RPE: 7-9" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                      {item.icon}<span>{item.label}</span>
                    </div>
                    <p className="font-extrabold text-sm text-white">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Prerequisites */}
              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex gap-2">
                  <div className="bg-purple-500/30 rounded-lg p-1.5">
                    <Award size={12} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prerequisites</p>
                    <p className="font-bold text-sm text-white">6+ months experience</p>
                    <p className="text-xs text-gray-500 mt-0.5">Familiarity with compound movements</p>
                  </div>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">27</h3>
                  <p className="text-xs text-gray-400">Workouts</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">135+</h3>
                  <p className="text-xs text-gray-400">Exercises</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <h3 className="text-xl md:text-2xl font-extrabold text-white">4.8</h3>
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xs text-gray-400">Rating</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Weekly Breakdown */}
        <section className="mt-8 md:mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">Weekly Breakdown</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Award size={12} /> Complete all 6 weeks
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.map((week) => (
              <div 
                key={week.label} 
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="relative">
                  <img src={week.img} alt={week.title} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 bg-[#6C3AE8] text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                    {week.label}
                  </div>
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="font-extrabold text-sm text-white">{week.title}</p>
                    <p className="text-[10px] text-white/80 line-clamp-1">{week.desc}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Dumbbell size={11} /> {week.workouts} workouts
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Timer size={11} className="text-[#6C3AE8]" />
                      <span className="text-[#6C3AE8]">{week.duration}</span>
                    </div>
                  </div>
                  <button className="w-full border border-gray-200 hover:border-[#6C3AE8] rounded-lg py-2 text-xs font-semibold text-gray-700 hover:text-[#6C3AE8] transition-colors flex items-center justify-center gap-1">
                    <ChevronRight size={12} /> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-center">
        <button 
          onClick={() => setShowPopup(true)} 
          className="bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white w-full max-w-md py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          Start Program <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ALL PROGRAMS GRID (Responsive)
═══════════════════════════════════ */
function AllProgramsGrid({ onSelectProgram }: AllProgramsGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDuration, setFilterDuration] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterPurchased, setFilterPurchased] = useState(false);

  const activeCount = [filterDuration !== "All", filterLevel !== "All", filterCat !== "All", filterPurchased].filter(Boolean).length;
  const clearAll = () => { 
    setFilterDuration("All"); 
    setFilterLevel("All"); 
    setFilterCat("All"); 
    setFilterPurchased(false); 
  };

  const filtered = programs.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterDuration !== "All" && p.duration !== filterDuration) return false;
    if (filterLevel !== "All" && p.level !== filterLevel) return false;
    if (filterCat !== "All" && p.category !== filterCat) return false;
    if (filterPurchased && !p.purchased) return false;
    return true;
  });

  const Pill = ({ label, active, onClick }: PillProps) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
        active 
          ? "bg-[#6C3AE8] border-[#6C3AE8] text-white" 
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
      }`}
    >
      {active && <Check size={10} />}
      {label}
    </button>
  );

  const Chip = ({ label, onRemove }: ChipProps) => (
    <div className="bg-purple-100 text-[#6C3AE8] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
      {label}
      <button onClick={onRemove} className="hover:bg-purple-200 rounded-full p-0.5">
        <X size={10} />
      </button>
    </div>
  );

  return (
    <div className="page-grid bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-gray-900">All Programs</h1>
              <p className="text-xs text-gray-400 mt-0.5">Browse training programs</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#6C3AE8]" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <LayoutGrid size={16} className={viewMode === "grid" ? "text-white" : "text-gray-500"} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[#6C3AE8]" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <AlignJustify size={16} className={viewMode === "list" ? "text-white" : "text-gray-500"} />
              </button>
            </div>
          </div>

          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/programs/all-workout')}
                className="bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-colors"
              >
                <Search size={12} /> Search Workouts
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                  showFilters || activeCount > 0
                    ? "bg-[#6C3AE8] border-[#6C3AE8] text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <SlidersHorizontal size={12} /> Filters
                {activeCount > 0 && (
                  <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[10px]">
                    {activeCount}
                  </span>
                )}
              </button>
              
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                {filtered.length} programs
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 animate-[slideDown_0.18s_ease]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              {[
                { label: "Duration", options: DURATIONS, val: filterDuration, set: setFilterDuration },
                { label: "Level", options: LEVELS, val: filterLevel, set: setFilterLevel },
                { label: "Category", options: CATS, val: filterCat, set: setFilterCat },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {f.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.options.map((o) => (
                      <Pill key={o} label={o} active={f.val === o} onClick={() => f.set(o)} />
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ownership
                </p>
                <Pill 
                  label="Purchased only" 
                  active={filterPurchased} 
                  onClick={() => setFilterPurchased(!filterPurchased)} 
                />
              </div>
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="mt-4 text-red-500 text-xs font-semibold flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <X size={11} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active chips */}
      {activeCount > 0 && !showFilters && (
        <div className="px-4 md:px-8 py-3 flex flex-wrap gap-2 items-center">
          {filterDuration !== "All" && (
            <Chip label={filterDuration} onRemove={() => setFilterDuration("All")} />
          )}
          {filterLevel !== "All" && (
            <Chip label={filterLevel} onRemove={() => setFilterLevel("All")} />
          )}
          {filterCat !== "All" && (
            <Chip label={filterCat} onRemove={() => setFilterCat("All")} />
          )}
          {filterPurchased && (
            <Chip label="Purchased only" onRemove={() => setFilterPurchased(false)} />
          )}
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 font-semibold hover:text-gray-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-bold">No programs found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
            <button
              onClick={clearAll}
              className="mt-4 bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Clear filters
            </button>
          </div>

        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((prog) => (
              <div
                key={prog.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                onClick={() => onSelectProgram(prog)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={prog.image} alt={prog.title} className="card-img w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                  
                  {prog.dollar && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center font-black text-sm text-white shadow-md">
                      $
                    </div>
                  )}
                  
                  {prog.purchased && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                      PURCHASED
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                    {prog.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-extrabold text-gray-900 mb-2">{prog.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-3">{prog.description}</p>
                  
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} className="text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{prog.views.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-green-500" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{prog.bought.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">bought</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* List View */
          <div className="space-y-3">
            {filtered.map((prog) => (
              <div
                key={prog.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col sm:flex-row"
                onClick={() => onSelectProgram(prog)}
              >
                <div className="relative w-full sm:w-48 h-32 sm:h-auto overflow-hidden">
                  <img src={prog.image} alt={prog.title} className="card-img w-full h-full object-cover" />
                  {prog.purchased && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                      PURCHASED
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                    {prog.duration}
                  </div>
                </div>
                
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-purple-100 text-[#6C3AE8] text-[10px] font-bold px-2 py-1 rounded-full">
                      {prog.category}
                    </span>
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                      {prog.level}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-gray-900 mb-2">{prog.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{prog.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye size={12} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-900">{prog.views.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400">views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag size={12} className="text-green-500" />
                        <span className="text-xs font-bold text-gray-900">{prog.bought.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400">bought</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectProgram(prog); }}
                      className="bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      View <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ROOT APP
═══════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<"grid" | "detail">("grid");
  const [program, setProgram] = useState<Program | null>(null);

  const goToDetail = (prog: Program) => { setProgram(prog); setPage("detail"); };
  const goToGrid = () => { setPage("grid"); };

  return (
    <>
      <GlobalStyles />
      {page === "grid" && <AllProgramsGrid onSelectProgram={goToDetail} />}
      {page === "detail" && program && <ProgramDetailPage program={program} onBack={goToGrid} />}
    </>
  );
}