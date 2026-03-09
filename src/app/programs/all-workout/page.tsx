"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutGrid, AlignJustify } from "lucide-react"

interface Workout {
  id: number
  week: string
  season: string
  title: string
  category: string
  image: string
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
]

export default function SearchWorkoutsPage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [muscleFilter, setMuscleFilter] = useState("All")
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Chest", "Legs", "Back", "Shoulders", "Core", "Arms", "Cardio"]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredWorkouts = workouts.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = muscleFilter === "All" || w.category === muscleFilter
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Search All Workouts
          </h1>

          <p className="text-xs text-gray-400">
            Find the perfect workout for your training goals
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition ${
              viewMode === "grid" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            <LayoutGrid size={16} />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition ${
              viewMode === "list" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            <AlignJustify size={16} />
          </button>

        </div>

      </header>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-[76px] z-30 bg-gray-100 border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4">

          {/* SEARCH */}
          <div className="relative flex-1">

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

          {/* CATEGORY FILTER */}
          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-200 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          {/* COUNT */}
          <div className="text-sm text-gray-600 bg-gray-200 px-4 py-2 rounded-lg flex items-center">
            {filteredWorkouts.length} workouts
          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* SKELETON LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] bg-white rounded-2xl overflow-hidden shadow animate-pulse"
              >
                <div className="h-full bg-gray-300" />
              </div>
            ))}

          </div>
        )}

        {/* GRID VIEW */}
        {!loading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => router.push(`/workout/${workout.id}`)}
                className="relative h-[220px] rounded-2xl overflow-hidden cursor-pointer group"
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
        {!loading && viewMode === "list" && (
          <div className="space-y-5">

            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => router.push(`/workout/${workout.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer group flex flex-col sm:flex-row"
              >

                {/* IMAGE */}
                <div className="relative sm:w-[220px] h-[180px] sm:h-auto flex-shrink-0">

                  <img
                    src={workout.image}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md">
                    {workout.week}
                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col justify-center flex-1">

                  <p className="text-gray-400 text-xs uppercase">
                    {workout.season}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {workout.title}
                  </h3>

                  <p className="text-gray-500 text-sm mb-3">
                    {workout.week} • Strength workout focusing on compound lifts
                  </p>

                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg w-full sm:w-[160px]">
                    View Workout
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}