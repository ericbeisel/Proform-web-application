// src/app/programs/trainers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Loader2, LayoutDashboard } from "lucide-react";
import { getAllFeaturedTrainers, FeaturedTrainer } from "@/api/programs/route";

// Helper function to get initials for fallback avatar
function getTrainerInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper function for images
function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("wix:image://v1/")) {
    const match = imageUrl.match(/wix:image:\/\/v1\/([^/]+)/);
    if (match?.[1]) return `/api/image-proxy/media/${match[1]}`;
  }
  if (imageUrl.match(/^[a-f0-9_]+~mv2/i)) return `/api/image-proxy/media/${imageUrl}`;
  if (imageUrl.includes("static.wixstatic.com/media/")) {
    const path = imageUrl.replace("https://static.wixstatic.com/", "");
    return `/api/image-proxy/${path}`;
  }
  return imageUrl;
}

export default function AllTrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<FeaturedTrainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<FeaturedTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const data = await getAllFeaturedTrainers();
        // Filter out hidden trainers if needed
        const visibleTrainers = data.filter(trainer => trainer.hide === false);
        setTrainers(visibleTrainers);
        setFilteredTrainers(visibleTrainers);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        setError("Failed to load trainers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTrainers(trainers);
    } else {
      const filtered = trainers.filter(trainer =>
        trainer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrainers(filtered);
    }
  }, [searchTerm, trainers]);

  const handleTrainerClick = (trainerName: string) => {
    // Redirect to programs by trainer page
    router.push(`/programs/by-trainer?trainer=${encodeURIComponent(trainerName)}`);
  };

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
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Trainers</h1>

          {/* Right-aligned icon group */}
          <div className="ml-auto flex items-center gap-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
              aria-label="Search trainers" 
              onClick={() => router.push('/programs/all-programs')}
            >
              <Search size={20} />
            </button>

            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
              aria-label="Dashboard"
              onClick={() => router.push('/dashboard')}
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              onClick={() => handleTrainerClick(trainer.title)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
            >
              {/* Trainer Image / Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:scale-105 transition duration-300">
                {trainer.image ? (
                  <img
                    src={getImageUrl(trainer.image)}
                    alt={trainer.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            ${getTrainerInitials(trainer.title)}
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xl">
                    {getTrainerInitials(trainer.title)}
                  </div>
                )}
              </div>

              {/* Trainer Info */}
              <div className="text-center">
                <p className="font-bold text-sm md:text-base text-gray-900 line-clamp-1">{trainer.title}</p>
                {trainer.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{trainer.description}</p>
                )}
                {/* View Programs Link */}
                <p className="text-xs text-purple-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Programs →
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrainers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No trainers found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Count */}
        {filteredTrainers.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing {filteredTrainers.length} of {trainers.length} trainers
          </div>
        )}
      </div>
    </div>
  );
}