"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, Trash2, Dumbbell } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  equipment: string;
  iconBg: string;
  repsTime: string;
  sets: string;
  weight?: string;
  createdDate: string;
  status: string;
}

const DUMMY_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "INCLINE BENCH PRESS",
    equipment: "BARBELL",
    iconBg: "bg-purple-600",
    repsTime: "8-12",
    sets: "2x",
    weight: "153lbs",
    createdDate: "3/6/2026 6:31 pm",
    status: "Draft Exercise",
  },
  {
    id: 2,
    name: "PEDAL FOR-TIME (35-60 RPM's)",
    equipment: "RECUMBENT BIKE",
    iconBg: "bg-emerald-500",
    repsTime: "(5:00)",
    sets: "1x",
    createdDate: "3/3/2026 11:40 pm",
    status: "Draft Exercise",
  },
  {
    id: 3,
    name: "SEATED CABLE ROW",
    equipment: "CABLE MACHINE",
    iconBg: "bg-sky-500",
    repsTime: "12-15",
    sets: "2x",
    weight: "120lbs",
    createdDate: "3/3/2026 11:37 pm",
    status: "Draft Exercise",
  },
];

export default function ExerciseLogPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState(DUMMY_EXERCISES);
  const [search, setSearch] = useState("");

  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment.toLowerCase().includes(search.toLowerCase())
  );

  const remove = (id: number) =>
    setExercises((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Purple header */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pb-6 pt-4">
        {/* Avatar above title */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-400/60 border-2 border-white/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        </div>

        {/* Back + title row */}
        <div className="flex items-center mb-5">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white transition-colors p-1 -ml-1"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-white font-bold text-lg tracking-tight pr-6">
            Individual Exercise Log
          </h1>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-white/60 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Exercise"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => router.push("/find-exercises")}
            className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md transition-colors"
            aria-label="Add exercise"
          >
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No exercises found
          </div>
        )}

        {filtered.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            {/* Delete button */}
            <button
              onClick={() => remove(exercise.id)}
              className="flex-shrink-0 mt-0.5 text-red-400 hover:text-red-600 transition-colors p-1"
              aria-label="Delete exercise"
            >
              <Trash2 size={18} />
            </button>

            {/* Exercise icon */}
            <div
              className={`w-11 h-11 rounded-xl ${exercise.iconBg} flex items-center justify-center flex-shrink-0`}
            >
              <Dumbbell size={20} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row: name + created date */}
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {exercise.name}
                </p>
                <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                  Created:<br />
                  {exercise.createdDate}
                </span>
              </div>

              {/* Equipment */}
              <p className="text-xs font-semibold text-purple-600 mb-2">
                {exercise.equipment}
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 font-medium">
                  Reps/Time: {exercise.repsTime}
                </span>
                <span className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 font-medium">
                  Sets: {exercise.sets}
                </span>
                {exercise.weight && (
                  <span className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 font-medium">
                    Weight/Resistance: {exercise.weight}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  Status: {exercise.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
