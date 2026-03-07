// src/app/search-workouts/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Grid3x3, List, LayoutGrid, AlignJustify } from "lucide-react";

interface Workout {
  id: number;
  week: string;
  season: string;
  title: string;
  category: string;
  image: string;
}

const workouts: Workout[] = [
  { id: 1, week: "WEEK 2", season: "SEASONS", title: "Push", category: "Chest", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" },
  { id: 2, week: "WEEK 3", season: "SEASONS", title: "Squats", category: "Legs", image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800" },
  { id: 3, week: "WEEK 1", season: "SEASONS", title: "Deadlift", category: "Back", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800" },
  { id: 4, week: "WEEK 2", season: "SEASONS", title: "Overhead Press", category: "Shoulders", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800" },
  { id: 5, week: "WEEK 4", season: "SEASONS", title: "Core Blast", category: "Core", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800" },
  { id: 6, week: "WEEK 3", season: "SEASONS", title: "Glute Builder", category: "Legs", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" },
  { id: 7, week: "WEEK 1", season: "SEASONS", title: "Arm Day", category: "Arms", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800" },
  { id: 8, week: "WEEK 2", season: "SEASONS", title: "HIIT Cardio", category: "Cardio", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800" },
];

export default function SearchWorkoutsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [muscleFilter, setMuscleFilter] = useState("All");

  const categories = ["All", "Chest", "Legs", "Back", "Shoulders", "Core", "Arms", "Cardio"];

  const filteredWorkouts = workouts.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = muscleFilter === "All" || w.category === muscleFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
     {/* Header */}
     <header
  style={{
    background: "white",
    borderBottom: "1px solid #E5E7EB",
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    
    <div>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#111827"
        }}
      >
        Search All Workouts
      </h1>

      <p
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          marginTop: 1
        }}
      >
        Find the perfect workout for your training goals
      </p>
    </div>

  </div>

  <div style={{ display: "flex", gap: 6 }}>

    <button
      onClick={() => setViewMode("grid")}
      style={{
        border: "none",
        borderRadius: 8,
        padding: "8px 10px",
        display: "flex",
        background: viewMode === "grid" ? "#6C3AE8" : "#F3F4F6",
        transition: "background 0.15s"
      }}
    >
      <LayoutGrid
        size={16}
        color={viewMode === "grid" ? "white" : "#6B7280"}
      />
    </button>

    <button
      onClick={() => setViewMode("list")}
      style={{
        border: "none",
        borderRadius: 8,
        padding: "8px 10px",
        display: "flex",
        background: viewMode === "list" ? "#6C3AE8" : "#F3F4F6",
        transition: "background 0.15s"
      }}
    >
      <AlignJustify
        size={16}
        color={viewMode === "list" ? "white" : "#6B7280"}
      />
    </button>

  </div>
</header>
      <div className="max-w-7xl mx-auto px-6 py-6">

   

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4  mb-8">

          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-200 focus:outline-none"
            />
          </div>

          {/* Dropdown */}
          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-200 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          {/* Workout Count */}
          <div className="text-sm text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
            {filteredWorkouts.length} workouts
          </div>

        </div>

        {/* GRID VIEW */}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => router.push(`/workout/${workout.id}`)}
                className="relative h-[230px] rounded-2xl overflow-hidden cursor-pointer group"
              >

                <img
                  src={workout.image}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md">
                  {workout.week}
                </div>

                <div className="absolute bottom-4 left-4 right-4">

                  <p className="text-gray-300 text-xs uppercase">
                    {workout.season}
                  </p>

                  <h3 className="text-white text-lg font-semibold mb-3">
                    {workout.title}
                  </h3>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg">
                    View Workout
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* LIST VIEW */}

     {viewMode === "list" && (
  <div className="space-y-5">

    {filteredWorkouts.map((workout) => (
      <div
        key={workout.id}
        onClick={() => router.push(`/workout/${workout.id}`)}
        className="relative h-[150px] rounded-2xl overflow-hidden cursor-pointer group"
      >

        {/* Background image */}
        <img
          src={workout.image}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

        {/* Image side */}
        <div className="absolute left-0 top-0 bottom-0 w-[160px] overflow-hidden">
          <img
            src={workout.image}
            className="w-full h-full object-cover"
          />

          {/* Week badge */}
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md">
            {workout.week}
          </div>
        </div>

        {/* Content */}
        <div className="relative ml-[180px] h-full flex flex-col justify-center pr-6">

          <p className="text-gray-300 text-xs uppercase">
            {workout.season}
          </p>

          <h3 className="text-white text-xl font-semibold">
            {workout.title}
          </h3>

          <p className="text-gray-400 text-sm mb-3">
            {workout.week} • Strength workout focusing on compound lifts
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg w-full">
            View Workout
          </button>

        </div>

      </div>
    ))}

  </div>
)}

      </div>
    </div>
  );
}