"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Search, Dumbbell, Star } from "lucide-react";
import Link from "next/link";

const EQUIPMENT_TAGS = [
  "BAMBOO STICK",
  "BAND-RESISTED",
  "BARBELL",
  "BENCH",
  "BOXING W/U",
  "DECLINE-BENCH",
  "DUMBBELL",
  "FLOORBOARD",
  "FOOTBALL-BAR",
  "INCLINE",
  "PETTIT REF",
  "MCTBALL",
  "PLATE-LOADED",
  "RACK",
  "RECUMBENT BIKE",
  "SELECTORIZED",
  "SIDE-BENCH",
  "SMITH MACHINE",
  "STANDING",
  "VERTICAL FIXED BENCH PRESS MACHINE",
  "YOGA",
  "Bench-Supported",
  "Dumbbell",
  "Incline Bench",
  "Partner Bench",
  "Weightres",
];

interface Exercise {
  id: number;
  equipment: string;
  name: string;
  iconBg: string;
  equipmentColor: string;
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    equipment: "BAMBOO STICK",
    name: "TRICEP REACH W/ BEND",
    iconBg: "bg-orange-500",
    equipmentColor: "text-orange-500",
  },
  {
    id: 2,
    equipment: "BAND-RESISTED",
    name: "BARBELL BENCH PRESS",
    iconBg: "bg-red-500",
    equipmentColor: "text-red-500",
  },
  {
    id: 3,
    equipment: "BARBELL",
    name: "BENCH PRESS (3-REP CLUSTERS)",
    iconBg: "bg-purple-600",
    equipmentColor: "text-purple-600",
  },
  {
    id: 4,
    equipment: "BARBELL",
    name: "INCLINE BENCH PRESS (5-CT ECC)",
    iconBg: "bg-purple-600",
    equipmentColor: "text-purple-600",
  },
  {
    id: 5,
    equipment: "BARBELL",
    name: "CLOSE-GRIP BENCH PRESS W/ BLOCK",
    iconBg: "bg-purple-600",
    equipmentColor: "text-purple-600",
  },
  {
    id: 6,
    equipment: "BARBELL",
    name: "CLOSE-GRIP BENCH PRESS",
    iconBg: "bg-purple-600",
    equipmentColor: "text-purple-600",
  },
  {
    id: 7,
    equipment: "DUMBBELL",
    name: "ALTERNATING DUMBBELL CURL",
    iconBg: "bg-blue-500",
    equipmentColor: "text-blue-500",
  },
  {
    id: 8,
    equipment: "DUMBBELL",
    name: "DUMBBELL BENCH PRESS",
    iconBg: "bg-blue-500",
    equipmentColor: "text-blue-500",
  },
  {
    id: 9,
    equipment: "DUMBBELL",
    name: "DUMBBELL SHOULDER PRESS",
    iconBg: "bg-blue-500",
    equipmentColor: "text-blue-500",
  },
  {
    id: 10,
    equipment: "RECUMBENT BIKE",
    name: "PEDAL FOR-TIME (35-60 RPM's)",
    iconBg: "bg-emerald-500",
    equipmentColor: "text-emerald-600",
  },
  {
    id: 11,
    equipment: "SMITH MACHINE",
    name: "SMITH MACHINE SQUAT",
    iconBg: "bg-indigo-500",
    equipmentColor: "text-indigo-600",
  },
  {
    id: 12,
    equipment: "CABLE MACHINE",
    name: "SEATED CABLE ROW",
    iconBg: "bg-sky-500",
    equipmentColor: "text-sky-600",
  },
];

export default function FindExercisesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch =
      search === "" ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      activeTag === null ||
      ex.equipment.toUpperCase() === activeTag.toUpperCase();
    return matchesSearch && matchesTag;
  });

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Purple header */}
      <div className="bg-purple-600 px-4 pb-5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-purple-500/60 flex items-center justify-center text-white hover:bg-purple-500 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-white font-bold text-lg tracking-tight">
            Find Exercises:
          </h1>

          <button
            className="w-9 h-9 rounded-full bg-purple-500/60 flex items-center justify-center text-white hover:bg-purple-500 transition-colors"
            aria-label="Export"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-white/70 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Equipment filter chips */}
      <div className="px-4 pt-4 pb-3 flex flex-wrap gap-2">
        {EQUIPMENT_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeTag === tag
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Star size={16} className="text-amber-400 fill-amber-400" />
        <span className="font-bold text-gray-900 text-sm">
          Choose an exercise:
        </span>
        <Star size={16} className="text-amber-400 fill-amber-400" />
      </div>

      {/* Exercise grid */}
      <div className="px-4 pb-8 grid grid-cols-3 gap-3">
        {filteredExercises.map((exercise) => (
          <Link
            key={exercise.id}
            href="/exercise-details"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all active:scale-95"
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl ${exercise.iconBg} flex items-center justify-center mb-2 shadow-sm`}
            >
              <Dumbbell size={24} className="text-white" />
            </div>

            {/* Equipment label */}
            <span
              className={`text-[9px] font-bold uppercase tracking-wide ${exercise.equipmentColor} leading-tight mb-1`}
            >
              {exercise.equipment}
            </span>

            {/* Exercise name */}
            <span className="text-[11px] font-bold text-gray-900 leading-tight">
              {exercise.name}
            </span>
          </Link>
        ))}

        {filteredExercises.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
            No exercises found
          </div>
        )}
      </div>
    </div>
  );
}
