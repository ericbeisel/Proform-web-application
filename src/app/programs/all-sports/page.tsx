// src/app/programs/sports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { getAllSportCategories, SportCategoryName } from "@/api/programs/route";

export default function AllSportsPage() {
  const router = useRouter();
  const [sports, setSports] = useState<SportCategoryName[]>([]);
  const [filteredSports, setFilteredSports] = useState<SportCategoryName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const data = await getAllSportCategories();
        setSports(data);
        setFilteredSports(data);
        console.log("Fetched sports categories:", data);
      } catch (err) {
        console.error("Error fetching sports:", err);
        setError("Failed to load sports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSports(sports);
    } else {
      const filtered = sports.filter(sport =>
        sport.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSports(filtered);
    }
  }, [searchTerm, sports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Sports</h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sports Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredSports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => router.push(`/programs/sport/${sport.id}`)}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {sport.title.charAt(0)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-700 font-medium text-center line-clamp-2">
                {sport.title}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredSports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sports found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Count */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Showing {filteredSports.length} of {sports.length} sports
        </div>
      </div>
    </div>
  );
}