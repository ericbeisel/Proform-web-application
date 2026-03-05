"use client";

import { Star } from "lucide-react";

const QUEUE_ITEMS = [
  {
    id: 1, initial: "P", bg: "bg-blue-500",
    name: "Advanced Push Program", duration: "60 min",
    tag: "PRIMARY", tagBg: "bg-blue-50", tagText: "text-blue-600",
    workouts: "11 workouts",
    desc: "Complete upper body push workout focusing on chest, shoulders, and triceps.",
    source: "From purchased program",
  },
  {
    id: 2, initial: "C", bg: "bg-yellow-500",
    name: "Speed Training", duration: "45 min",
    tag: "CONDITIONING", tagBg: "bg-yellow-50", tagText: "text-yellow-700",
    workouts: "8 workouts",
    desc: "High-intensity interval training for speed and agility.",
    source: "From purchased program",
  },
  {
    id: 3, initial: "S", bg: "bg-green-500",
    name: "Core Strength", duration: "30 min",
    tag: "SUPPLEMENTAL", tagBg: "bg-green-50", tagText: "text-green-700",
    workouts: "10 workouts",
    desc: "Build a strong foundation with core-focused exercises.",
    source: "From purchased program",
  },
  {
    id: 4, initial: "R", bg: "bg-purple-500",
    name: "Recovery Essentials", duration: "20 min",
    tag: "RECOVERY", tagBg: "bg-purple-50", tagText: "text-purple-700",
    workouts: "6 workouts",
    desc: "Post-recovery program with stretching and mobility work.",
    source: "From program",
  },
  {
    id: 5, initial: "L", bg: "bg-blue-400",
    name: "Leg Day Destroyer", duration: "55 min",
    tag: "PRIMARY", tagBg: "bg-blue-50", tagText: "text-blue-600",
    workouts: "14 workouts",
    desc: "Comprehensive lower body training program.",
    source: "From purchased program",
  },
  {
    id: 6, initial: "CB", bg: "bg-red-500",
    name: "Cardio Blast", duration: "40 min",
    tag: "CARDIO", tagBg: "bg-red-50", tagText: "text-red-600",
    workouts: "10 workouts",
    desc: "Heart-pumping cardio workouts for endurance.",
    source: "From purchased program",
  },
];

export default function QueuePage() {
  return (
    <div className="px-12 py-5">
      {/* Section header */}
      <div className="mb-5">
        <h2 className="text-[15px] font-bold text-gray-900">Workout Queue</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Workouts from your purchased programs waiting to be scheduled
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUEUE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${item.bg} flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0`}>
                  {item.initial}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.duration}</p>
                </div>
              </div>
              <Star size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" />
            </div>

            {/* Tag + count */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.tagBg} ${item.tagText}`}>
                {item.tag}
              </span>
              <span className="text-[11px] text-gray-400">{item.workouts}</span>
            </div>

            {/* Description */}
            <p className="text-[12px] text-gray-500 leading-relaxed flex-1">{item.desc}</p>

            {/* Source */}
            <p className="text-[11px] text-purple-600 font-medium">{item.source}</p>

            {/* CTA */}
            <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[12px] font-bold py-2.5 rounded-xl transition-colors">
              Add to Itinerary
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}