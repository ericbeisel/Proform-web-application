"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getProgramsByTrainer, Program } from "@/api/programs/route";

// Helper function for images
function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/images/placeholder.jpg";
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

// Program Card Component with Read More functionality
function ProgramCard({ program, onClick }: { program: Program; onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const description = program.description || "";
  const shouldTruncate = description.length > 100;
  const truncatedDescription = shouldTruncate ? description.substring(0, 100) + "..." : description;

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={getImageUrl(program.image)}
          alt={program.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }}
        />
        {program.free_is_program && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            FREE
          </span>
        )}
        
        {program.paid_plan && !program.free_is_program && (
          <div className="absolute top-2 right-2 z-10">
            <img
              src={getImageUrl(program.paid_plan)}
              alt="Premium"
              className="w-6 h-6 object-contain"
              onError={(e) => { 
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 p-3 flex flex-col">
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{program.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{program.duration}</p>
        <p className="text-xs text-purple-600 mt-1">{program.sport}</p>
        
        {description && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              {expanded ? description : truncatedDescription}
            </p>
            {shouldTruncate && (
              <button
                onClick={handleReadMore}
                className="text-xs text-purple-600 font-semibold mt-1 hover:text-purple-700 transition"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Loader
function SkeletonCard() {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-200 animate-pulse">
      <div className="h-44 bg-gray-300" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export default function TrainerProgramsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainer = searchParams.get("trainer") || "";
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrograms, setTotalPrograms] = useState(0);

  useEffect(() => {
    if (!trainer) {
      router.back();
      return;
    }

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await getProgramsByTrainer(trainer, currentPage);
        setPrograms(response.data);
        setTotalPages(response.totalPages);
        setTotalPrograms(response.total);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching programs:", err);
        setError(err.message || "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [trainer, currentPage, router]);

  const handleProgramClick = (programId: string) => {
    router.push(`/programs/${programId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Decode trainer name for display
  const formatTrainerName = (name: string) => {
    return decodeURIComponent(name);
  };

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-screen-xl mx-auto flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Loading...</h1>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {formatTrainerName(trainer)}'s Programs
              </h1>
              <p className="text-sm text-gray-500">{totalPrograms} programs available</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/programs/all-programs")}
            className="p-2 hover:bg-gray-100 rounded-full transition text-purple-600"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs found for {formatTrainerName(trainer)}.</p>
            <button
              onClick={() => router.push("/programs/all-programs")}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
            >
              Browse all programs →
            </button>
          </div>
        ) : (
          <>
            {/* Programs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onClick={() => handleProgramClick(program.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg font-medium transition ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}