"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Calendar, Search, Share2, ChevronLeft,
  Link as LinkIcon, Settings, Zap, Users, Star, Flame,
  TrendingUp, Target, Dumbbell, Activity, X,
} from "lucide-react";
import EditProfilePage from "./EditProfilePage";
import SocialLinksPage from "./SocialLinksPage";

const STATS = [
  { icon: <Zap size={20} className="text-orange-500" />, bg: "bg-yellow-50", value: "127", label: "Total Workouts", valueCls: "text-gray-900" },
  { icon: <Users size={20} className="text-blue-500" />, bg: "bg-blue-50", value: "2.4K", label: "Followers", valueCls: "text-blue-500" },
  { icon: <Star size={20} className="text-purple-500" />, bg: "bg-purple-50", value: "89", label: "Strength Score", valueCls: "text-purple-500" },
  { icon: <Flame size={20} className="text-orange-400" />, bg: "bg-orange-50", value: "7", label: "Day Streak", valueCls: "text-orange-500" },
];

const HIGHLIGHTS = [
  { icon: <Zap size={18} className="text-orange-500" />, bg: "bg-orange-50", title: "7-Day Streak", sub: "Keep pushing forward!" },
  { icon: <TrendingUp size={18} className="text-blue-500" />, bg: "bg-blue-50", title: "PR This Week", sub: "Bench Press: 185 lbs", badge: "+12%", badgeCls: "text-green-500" },
  { icon: <Target size={18} className="text-purple-500" />, bg: "bg-purple-50", title: "Monthly Goal", sub: "18/20 workouts completed", badge: "90%", badgeCls: "text-purple-500" },
];

const RECENT = [
  { icon: <Dumbbell size={18} className="text-orange-400" />, bg: "bg-orange-50", title: "Upper Body Strength", meta: "2 hours ago • 45 min", dot: "bg-orange-400" },
  { icon: <Activity size={18} className="text-blue-400" />, bg: "bg-blue-50", title: "HIIT Cardio Blast", meta: "Yesterday • 30 min", dot: "bg-blue-400" },
  { icon: <Zap size={18} className="text-yellow-500" />, bg: "bg-yellow-50", title: "Leg Day Power", meta: "2 days ago • 60 min", dot: "bg-yellow-400" },
  { icon: <Target size={18} className="text-green-500" />, bg: "bg-green-50", title: "Core & Abs Burner", meta: "3 days ago • 25 min", dot: "bg-green-400" },
];

type Modal = "edit" | "social" | null;

export default function ProfilePage() {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Banner */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => router.back()} className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white">
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white">
            <Search size={16} />
          </button>
          <button className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white">
            <Share2 size={16} />
          </button>
        </div>

        {/* Banner image */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')] bg-cover bg-center opacity-70" />

          <div className="absolute bottom-4 left-28 sm:left-36 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <h1 className="text-white text-[18px] sm:text-[20px] font-extrabold drop-shadow">
              Shweta Gharge
            </h1>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setModal("social")}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/30"
              >
                <LinkIcon size={11} />
                Social Links
              </button>

              <button
                onClick={() => setModal("edit")}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full"
              >
                <Settings size={11} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute left-4 sm:left-6 bottom-[-28px]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-700 flex items-center justify-center text-white text-[18px] sm:text-[22px] font-extrabold border-4 border-white shadow-lg">
            SG
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white" />
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-10 px-4 sm:px-6 pb-2 bg-white">
        <p className="text-[13px] text-gray-400 font-medium mb-1">@shweta18</p>

        <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-400 mb-2">
          <span className="flex items-center gap-1"><MapPin size={12} /> San Francisco, CA</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> Joined March 2026</span>
        </div>

        <p className="text-[13px] text-gray-600 leading-relaxed">
          Fitness enthusiast 💪 | Marathon runner 🏃 | Strength training addict | Helping others achieve their fitness goals
        </p>
      </div>

      {/* Follow button */}
      <div className="px-4 sm:px-6 py-3 bg-white">
        <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[14px] font-bold py-3 rounded-xl">
          Follow Me
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-6 py-4">
        {STATS.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4`}>
            <div className="mb-2">{s.icon}</div>
            <p className={`text-[22px] font-extrabold ${s.valueCls}`}>{s.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Highlights + Recent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-6 pb-8">
        <div className="flex flex-col gap-3">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${h.bg} flex items-center justify-center flex-shrink-0`}>{h.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900">{h.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{h.sub}</p>
              </div>
              {h.badge && <span className={`text-[12px] font-bold ${h.badgeCls}`}>{h.badge}</span>}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {RECENT.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${r.bg} flex items-center justify-center flex-shrink-0`}>{r.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900">{r.title}</p>
                <p className="text-[11px] text-gray-400">{r.meta}</p>
              </div>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.dot}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500"
            >
              <X size={14} />
            </button>

            {modal === "edit" && <EditProfilePage onClose={() => setModal(null)} />}
            {modal === "social" && <SocialLinksPage onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}