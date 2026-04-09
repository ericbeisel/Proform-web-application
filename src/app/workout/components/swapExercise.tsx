"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Search,
  X,
  Info,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── Dumbbell SVG ─────────────────────────────────────────── */
const DumbbellIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="18" width="8" height="12" rx="3" fill="#C4B5FD" />
    <rect x="10" y="20" width="28" height="8" rx="2" fill="#C4B5FD" />
    <rect x="36" y="18" width="8" height="12" rx="3" fill="#C4B5FD" />
    <rect x="6" y="15" width="4" height="18" rx="2" fill="#A78BFA" />
    <rect x="38" y="15" width="4" height="18" rx="2" fill="#A78BFA" />
  </svg>
);

/* ─── Types ─────────────────────────────────────────────────── */
interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  tempo: string;
  rest: string;
}

interface FilterOption {
  label: string;
  options: string[];
}

/* ─── Filter config ─────────────────────────────────────────── */
const FILTERS: FilterOption[] = [
  {
    label: "Muscle Group",
    options: [
      "Chest",
      "Back",
      "Shoulders",
      "Biceps",
      "Triceps",
      "Legs",
      "Core",
      "Glutes",
    ],
  },
  {
    label: "Equipment",
    options: [
      "Barbell",
      "Dumbbell",
      "Kettlebell",
      "Resistance Band",
      "Cable",
      "Machine",
      "Bodyweight",
      "Pull-up Bar",
    ],
  },
  {
    label: "Difficulty",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    label: "Category",
    options: [
      "Strength",
      "Hypertrophy",
      "Endurance",
      "Power",
      "Mobility",
      "Cardio",
    ],
  },
  {
    label: "Body Part",
    options: ["Upper Body", "Lower Body", "Full Body", "Core", "Arms", "Legs"],
  },
  {
    label: "Force",
    options: ["Push", "Pull", "Static", "Hinge", "Squat", "Carry"],
  },
  {
    label: "Mechanic",
    options: ["Compound", "Isolation"],
  },
];

/* ─── FilterRow ─────────────────────────────────────────────── */
function FilterRow({
  filter,
  openFilter,
  setOpenFilter,
  selectedFilters,
  toggleFilter,
}: {
  filter: FilterOption;
  openFilter: string | null;
  setOpenFilter: (v: string | null) => void;
  selectedFilters: Record<string, string[]>;
  toggleFilter: (filterLabel: string, option: string) => void;
}) {
  const isOpen = openFilter === filter.label;
  const selected = selectedFilters[filter.label] ?? [];

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpenFilter(isOpen ? null : filter.label)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          {filter.label}
          {selected.length > 0 && (
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-3 pb-3">
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filter.options.map((opt) => {
              const active = selected.includes(opt);

              return (
                <button
                  key={opt}
                  onClick={() => toggleFilter(filter.label, opt)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                    active
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt}</span>

                  {/* optional checkmark */}
                  {active && <span className="text-purple-600 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── StatCell ──────────────────────────────────────────────── */
function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-black text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

/* ─── ExerciseCard ──────────────────────────────────────────── */
function ExerciseCard({
  exercise,
  selected,
  onSwap,
}: {
  exercise: Exercise;
  selected: boolean;
  onSwap: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="bg-gray-100 h-28 flex items-center justify-center relative">
        <DumbbellIcon />
        <button className="absolute top-2.5 right-2.5 opacity-40 hover:opacity-70 transition-opacity">
          <Info size={15} color="#6b7280" />
        </button>
      </div>
      <div className="p-3.5 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-black text-gray-900 leading-tight">
          {exercise.name}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          <StatCell label="SETS" value={exercise.sets} />
          <StatCell label="REPS" value={exercise.reps} />
          <StatCell label="TEMPO" value={exercise.tempo} />
          <StatCell label="REST" value={exercise.rest} />
        </div>
        <button
          onClick={onSwap}
          className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
            selected ? "bg-green-500" : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          {selected ? "✓ Swapped!" : "Swap Exercise"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function SwapExercisePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const exercises: Exercise[] = [
    {
      id: 1,
      name: "Close-Grip Pull Up",
      sets: 3,
      reps: "8-12",
      tempo: "2-0-2-0",
      rest: "90s",
    },
    {
      id: 2,
      name: "Assisted Pull Up",
      sets: 3,
      reps: "10-12",
      tempo: "2-0-2-0",
      rest: "60s",
    },
    {
      id: 3,
      name: "Chin Up",
      sets: 3,
      reps: "AMRAP",
      tempo: "2-0-2-0",
      rest: "90s",
    },
    {
      id: 4,
      name: "Lat Pulldown",
      sets: 3,
      reps: "10-15",
      tempo: "2-1-2-0",
      rest: "60s",
    },
    {
      id: 5,
      name: "Inverted Row",
      sets: 3,
      reps: "12-15",
      tempo: "2-0-2-0",
      rest: "60s",
    },
    {
      id: 6,
      name: "Neutral Grip Pull Up",
      sets: 3,
      reps: "AMRAP",
      tempo: "2-0-2-0",
      rest: "90s",
    },
    {
      id: 7,
      name: "Band-Assisted Pull Up",
      sets: 3,
      reps: "8-10",
      tempo: "2-0-2-0",
      rest: "90s",
    },
    {
      id: 8,
      name: "Scapular Pull Up",
      sets: 3,
      reps: "10-12",
      tempo: "2-1-2-0",
      rest: "60s",
    },
    {
      id: 9,
      name: "TRX Row",
      sets: 3,
      reps: "12-15",
      tempo: "2-0-2-0",
      rest: "60s",
    },
  ];

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleFilter = (filterLabel: string, option: string) => {
    setSelectedFilters((prev) => {
      const current = prev[filterLabel] ?? [];
      return {
        ...prev,
        [filterLabel]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const totalActiveFilters = Object.values(selectedFilters).flat().length;

  // Split filters into left/right columns matching the screenshot's 2-col layout
  const leftFilters = FILTERS.filter((_, i) => i % 2 === 0); // Muscle Group, Difficulty, Body Part, Mechanic
  const rightFilters = FILTERS.filter((_, i) => i % 2 === 1); // Equipment, Category, Force

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-start justify-between">
          {/* Left side */}
          <div className="flex items-start gap-2.5">
            <button
              onClick={() => window.history.back()}
              className="mt-0.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">
                Swap Exercise
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Currently: WIDE-GRIP PULL UP
              </p>
            </div>
          </div>

          {/* Right side helper text */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <p className="text-xs font-semibold text-gray-600">
              Tap on any exercise to replace{" "}
              <span className="font-bold text-gray-800">WIDE-GRIP PULL UP</span>
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-6 pb-16">
        {/* ── Search row ── */}
        <div className="flex gap-2.5 mb-5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, muscle, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* + button */}
          <button className="w-10 h-10 bg-purple-700 hover:bg-purple-800 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
            <Plus size={18} className="text-white" />
          </button>

          {/* Filter toggle — purple when open (matches screenshot) */}
          <button
            onClick={() => {
              setShowFilters((v) => !v);
              setOpenFilter(null);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 border ${
              showFilters
                ? "bg-purple-700 border-purple-700"
                : "bg-white border-gray-200 hover:border-purple-400"
            }`}
          >
            {showFilters ? (
              <ChevronUp size={18} className="text-white" />
            ) : (
              <ChevronDown size={18} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 mb-5 overflow-hidden shadow-sm">
            {/* Active filter badge row */}
            {totalActiveFilters > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-purple-50">
                <span className="text-xs font-semibold text-purple-700">
                  {totalActiveFilters} filter{totalActiveFilters > 1 ? "s" : ""}{" "}
                  active
                </span>
                <button
                  onClick={() => setSelectedFilters({})}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Two-column layout matching the screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Left column */}
              <div className="sm:border-r border-gray-100">
                {leftFilters.map((filter) => (
                  <FilterRow
                    key={filter.label}
                    filter={filter}
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    selectedFilters={selectedFilters}
                    toggleFilter={toggleFilter}
                  />
                ))}
              </div>

              {/* Right column */}
              <div>
                {rightFilters.map((filter) => (
                  <FilterRow
                    key={filter.label}
                    filter={filter}
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    selectedFilters={selectedFilters}
                    toggleFilter={toggleFilter}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Recommended Alternatives
          </h2>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            {filtered.length} found
          </span>
        </div>

        {/* ── Exercise grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              selected={selectedExercise === exercise.id}
              onSwap={() => setSelectedExercise(exercise.id)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No exercises found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
