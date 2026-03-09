"use client";

import { useState } from "react";
import {
  ArrowLeft, Clock, Calendar, Flame, Target, Award,
  Dumbbell, Eye, Users, Star, ChevronRight, Timer, Zap,
  X, FileText
} from "lucide-react";

const weeks = [
  {
    label: "WEEK 1",
    title: "Foundation Week",
    desc: "Build your base strength with fundamental compound movements",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  },
  {
    label: "WEEK 2",
    title: "Upper Body Focus",
    desc: "Chest, back & shoulders with progressive overload",
    workouts: 5,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  },
  {
    label: "WEEK 3",
    title: "Lower Body Power",
    desc: "Legs & glutes training for explosive strength",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80",
  },
  {
    label: "WEEK 4",
    title: "Total Body Strength",
    desc: "Full body compound lifts for maximum gains",
    workouts: 5,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
  },
  {
    label: "WEEK 5",
    title: "Hypertrophy Phase",
    desc: "Muscle building volume with time under tension",
    workouts: 5,
    duration: "80-75 min",
    img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80",
  },
  {
    label: "WEEK 6",
    title: "Peak Performance",
    desc: "Maximum intensity training and testing your limits",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
  },
];

const objectives = [
  {
    icon: "🟠",
    title: "Muscle Stimulation",
    desc: "Progressive overload targeting all major muscle groups for optimal growth",
    color: "#F97316",
    bg: "#FFF7ED",
  },
  {
    icon: "🔵",
    title: "Technique & Repetition",
    desc: "Perfect form with controlled tempo and optimal rep ranges",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: "🟣",
    title: "Balance & Core Stability",
    desc: "Enhanced functional strength and injury prevention focus",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: "🟢",
    title: "Performance Metrics",
    desc: "Track progress with detailed analytics and strength benchmarks",
    color: "#10B981",
    bg: "#ECFDF5",
  },
];

/* ─── POPUP ─── */
function StartProgramPopup({ onClose }: { onClose: () => void }) {
  const [includeSupplemental, setIncludeSupplemental] = useState(false);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-200 bg-black/55 flex items-center justify-center p-4"
    >
      <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md relative text-center shadow-2xl animate-[popIn_0.22s_ease] mx-4"
      >
        {/* Close */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 md:top-4 md:right-4 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-700" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6C3AE8] flex items-center justify-center mx-auto mb-4 md:mb-5 relative shadow-lg">
          <FileText size={24} className="text-white" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
          </div>
        </div>

        <p className="text-base md:text-lg font-bold text-gray-900 mb-2">
          Add this program to your<br />Workout Queue:
        </p>
        <p className="text-lg md:text-xl font-black text-[#6C3AE8] tracking-wider mb-2">
          ELITE STRENGTH
        </p>
        <p className="text-sm text-green-600 font-semibold mb-4 md:mb-5">
          *Add 9 Workout(s)
        </p>

        {/* Checkbox */}
        <label
          onClick={() => setIncludeSupplemental(!includeSupplemental)}
          className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mb-4 md:mb-5 cursor-pointer text-left hover:bg-gray-100 transition-colors"
        >
          <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
            includeSupplemental ? "bg-[#6C3AE8] border-[#6C3AE8]" : "bg-white border-gray-300"
          }`}>
            {includeSupplemental && <span className="text-white text-xs font-black">✓</span>}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            Include Supplemental Workouts (12)
          </span>
        </label>

        <button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6C3AE8] text-white rounded-full py-3 md:py-4 text-sm md:text-base font-bold mb-2 shadow-lg hover:shadow-xl transition-shadow">
          Add to Up Next
        </button>

        <button className="w-full bg-gray-900 text-white rounded-full py-3 md:py-4 text-sm md:text-base font-bold mb-3 hover:bg-gray-800 transition-colors">
          Add to Queue
        </button>

        <button 
          onClick={onClose} 
          className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function EliteStrengthPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="font-['DM_Sans'] bg-gray-50 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .week-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .week-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(108,58,232,0.15); }
      `}</style>

      {/* Popup */}
      {showPopup && <StartProgramPopup onClose={() => setShowPopup(false)} />}

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div>
              <h1 className="text-base md:text-lg font-extrabold text-gray-900">Elite Strength</h1>
              <p className="text-xs text-gray-400">6-week comprehensive strength building program</p>
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
              <Eye size={14} /> <span>12.4K views</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} /> <span>3,247 started</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Responsive grid - stacks on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* LEFT: Program Objectives */}
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

          {/* RIGHT: Program Overview */}
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

        {/* Weekly Program Breakdown */}
        <section className="mt-8 md:mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">Weekly Program Breakdown</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Award size={12} /> Complete all 6 weeks
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.map((week, i) => (
              <div
                key={week.label}
                className="week-card bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="relative">
                  <img
                    src={week.img}
                    alt={week.title}
                    className="w-full h-32 object-cover"
                  />
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
                  <button
                    className="w-full border border-gray-200 hover:border-[#6C3AE8] rounded-lg py-2 text-xs font-semibold text-gray-700 hover:text-[#6C3AE8] transition-colors flex items-center justify-center gap-1"
                  >
                    <ChevronRight size={12} /> Preview Week
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