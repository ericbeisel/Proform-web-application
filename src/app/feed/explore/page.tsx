"use client";

import {
  ArrowLeft,
  Dumbbell,
  Heart,
  MessageCircle,
  Flame,
  DumbbellIcon,
  X,
  Calendar,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const workoutCards = [
  {
    title: "Morning Run - 5K",
    user: "@mike_fitness",
    type: "Cardio",
    likes: 89,
    comments: 12,
    color: "from-red-400 via-red-500 to-red-900",
    badge: "bg-red-500",
    avatar: "M",
  },
  {
    title: "Heavy Deadlift Day",
    user: "@jess_trains",
    type: "Primary",
    likes: 156,
    comments: 23,
    color: "from-blue-400 via-blue-500 to-blue-900",
    badge: "bg-blue-500",
    avatar: "J",
  },
  {
    title: "HIIT Circuit Training",
    user: "@alexfitpro",
    type: "Conditioning",
    likes: 203,
    comments: 34,
    color: "from-yellow-300 via-yellow-400 to-yellow-900",
    badge: "bg-yellow-500",
    avatar: "A",
  },
  {
    title: "Core & Abs Burnout",
    user: "@sophie_strong",
    type: "Supplemental",
    likes: 127,
    comments: 18,
    color: "from-purple-400 via-purple-500 to-purple-900",
    badge: "bg-purple-500",
    avatar: "S",
  },
  {
    title: "Yoga & Stretching",
    user: "@david_athlete",
    type: "Recovery",
    likes: 94,
    comments: 8,
    color: "from-emerald-400 via-emerald-500 to-emerald-900",
    badge: "bg-emerald-500",
    avatar: "D",
  },
  {
    title: "Cycling Adventure",
    user: "@rachel_runs",
    type: "Cardio",
    likes: 178,
    comments: 29,
    color: "from-red-400 via-red-500 to-red-950",
    badge: "bg-red-500",
    avatar: "R",
  },
  {
    title: "Leg Day Power",
    user: "@tom_train",
    type: "Primary",
    likes: 245,
    comments: 41,
    color: "from-blue-400 via-blue-500 to-blue-900",
    badge: "bg-blue-500",
    avatar: "T",
  },
  {
    title: "Tabata Intervals",
    user: "@emma_fit",
    type: "Conditioning",
    likes: 112,
    comments: 15,
    color: "from-yellow-300 via-yellow-400 to-yellow-900",
    badge: "bg-yellow-500",
    avatar: "E",
  },
];

const trendingWorkouts = [
  {
    title: "Morning Run - 5K",
    user: "@mike_fitness",
    likes: 89,
  },
  {
    title: "Heavy Deadlift Day",
    user: "@jess_trains",
    likes: 156,
  },
  {
    title: "HIIT Circuit Training",
    user: "@alexfitpro",
    likes: 203,
  },
  {
    title: "Core & Abs Burnout",
    user: "@sophie_strong",
    likes: 127,
  },
  {
    title: "Yoga & Stretching",
    user: "@david_athlete",
    likes: 94,
  },
];

export default function ExplorePage() {
    const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-md">
              <Flame size={18} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">
                Explore
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Discover trending workouts from athletes around the world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 flex flex-col xl:flex-row gap-6">
        {/* Workout Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {workoutCards.map((card, idx) => (
            <div
              key={idx}
               onClick={() => setSelectedWorkout(card)}
              className="rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Top */}
              <div
                className={`relative h-[190px] bg-gradient-to-b ${card.color} p-4 flex flex-col justify-between`}
              >
                {/* Type */}
                <div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-md ${card.badge}`}
                  >
                    {card.type}
                  </span>
                </div>

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Dumbbell size={58} className="text-white" />
                </div>

                {/* Bottom */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {card.avatar}
                  </div>

                  <div>
                    <p className="text-[11px] text-white/90 font-medium">
                      {card.user}
                    </p>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1 text-purple-500">
                  <Heart size={15} />
                  <span className="text-xs font-semibold text-gray-600">
                    {card.likes}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle size={15} />
                  <span className="text-xs font-semibold">
                    {card.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Sidebar */}
        <div className="w-full xl:w-[350px] shrink-0">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 mb-6">
              <Flame size={18} className="text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Trending Workouts
              </h2>
            </div>

            <div className="space-y-5">
              {trendingWorkouts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 group"
                >
                  {/* Rank */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(249,115,22,0.4)] border border-orange-200 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.user}
                    </p>
                  </div>

                  {/* Likes */}
                 <div className="flex items-center gap-3">
  {/* Likes */}
  <div className="flex items-center gap-1 text-purple-500">
    <Heart size={14} />
    <span className="text-xs font-semibold text-gray-600">
      {item.likes}
    </span>
  </div>

  {/* Workout Icon */}
  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
    <DumbbellIcon size={12} className="text-gray-500" />
  </div>
</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
{selectedWorkout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    
    <div className="relative w-full max-w-xl rounded-[28px] overflow-hidden bg-[#f7f7f8] shadow-2xl animate-in fade-in zoom-in duration-300">

      {/* Close Button */}
      <button
        onClick={() => setSelectedWorkout(null)}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition"
      >
        <X size={16} className="text-gray-700" />
      </button>

      {/* Top Banner */}
      <div
        className={`relative h-[210px] bg-gradient-to-b ${selectedWorkout.color} p-5`}
      >
        {/* Type Badge */}
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-md ${selectedWorkout.badge}`}
        >
          {selectedWorkout.type}
        </span>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Dumbbell size={70} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-md text-sm">
            {selectedWorkout.avatar}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Jessica Lee
            </h3>

            <p className="text-xs font-medium text-blue-500">
              @jess_trains
            </p>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 leading-tight">
          {selectedWorkout.title}
        </h2>

        {/* Stats */}
        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-gray-600">
          
          <div className="flex items-center gap-1.5 text-purple-500">
            <Heart size={16} />
            <span>{selectedWorkout.likes} likes</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MessageCircle size={16} />
            <span>23 comments</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-500">
            <Calendar size={16} />
            <span>Week 1 / Day 1</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-500">
            <Shield size={16} />
            <span>Lower Body</span>
          </div>
        </div>

        {/* Button */}
        <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 text-sm font-bold text-white shadow-lg hover:scale-[1.01] hover:shadow-xl transition-all">
          View Full Workout
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
