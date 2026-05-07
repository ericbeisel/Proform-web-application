"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Heart,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getSuggestedAndFavouriteZones, RecoveryZone } from "@/api/recovery/route";

// Helper function to get image URL
const getImageUrl = (imageUrl: string | null | undefined): string => {
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
};

// Map form names to fallback gradient colors
const getFallbackColor = (form: string): string => {
  const formLower = form.toLowerCase();
  if (formLower.includes("hottub") || formLower.includes("bath")) return "bg-teal-500";
  if (formLower.includes("sauna")) return "bg-orange-500";
  if (formLower.includes("compression")) return "bg-purple-500";
  if (formLower.includes("red-light")) return "bg-pink-500";
  if (formLower.includes("massage gun")) return "bg-indigo-500";
  if (formLower.includes("foam rolling")) return "bg-teal-600";
  return "bg-blue-500";
};

// Map form names to icons (as fallback when no image)
const getIcon = (form: string) => {
  const formLower = form.toLowerCase();
  if (formLower.includes("hottub") || formLower.includes("bath")) return "💧";
  if (formLower.includes("sauna")) return "🔥";
  if (formLower.includes("compression")) return "🛡️";
  if (formLower.includes("red-light")) return "☀️";
  if (formLower.includes("massage gun")) return "⚡";
  if (formLower.includes("foam rolling")) return "○";
  return "❤️";
};

export default function RecoveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedZones, setSuggestedZones] = useState<RecoveryZone[]>([]);
  const [favouriteZones, setFavouriteZones] = useState<RecoveryZone[]>([]);

  useEffect(() => {
    const fetchRecoveryZones = async () => {
      try {
        setLoading(true);
        const response = await getSuggestedAndFavouriteZones();
        setSuggestedZones(response.SuggestedZones || []);
        setFavouriteZones(response.FavouriteZones || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching recovery zones:", err);
        setError(err.message || "Failed to load recovery options");
      } finally {
        setLoading(false);
      }
    };
    fetchRecoveryZones();
  }, []);

  const handleNavigate = (zone: RecoveryZone) => {
    const slug = zone.form.toLowerCase().replace(/\s+/g, "-");
    router.push(`/recovery/selectedRecovery/${slug}?id=${zone.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading recovery options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">

      {/* HEADER */}
      <div className="w-full bg-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
        <div className="w-full flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft size={18} color="white" />
            </button>

            <div>
              <div className="text-white font-extrabold text-base sm:text-lg md:text-xl">
                Submit Recovery
              </div>
              <div className="text-white/80 text-[10px] sm:text-xs md:text-sm mt-0.5">
                Track your recovery activities
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white/20 rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-2 backdrop-blur-sm border border-white/30">
            <Calendar size={14} className="sm:w-4 sm:h-4" color="white" />
            <div className="text-right">
              <div className="text-white/80 text-[9px] sm:text-[10px] font-semibold uppercase">
                TIME LEFT
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg font-extrabold">
                60m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 py-6 space-y-8">

        {/* SUGGESTED */}
        {suggestedZones.length > 0 && (
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 text-sm sm:text-base">
              <Sparkles size={16} className="text-green-500" />
              Suggested:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {suggestedZones.map((zone) => (
                <RecoveryCard
                  key={zone.id}
                  zone={zone}
                  onClick={() => handleNavigate(zone)}
                />
              ))}
            </div>
          </div>
        )}

        {/* FAVORITES */}
        {favouriteZones.length > 0 && (
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 text-sm sm:text-base">
              <Heart size={16} className="text-red-500" />
              Favorites:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favouriteZones.map((zone) => (
                <RecoveryCard
                  key={zone.id}
                  zone={zone}
                  onClick={() => handleNavigate(zone)}
                />
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center pt-6 space-y-4 flex flex-col items-center">
          <button
            onClick={() => router.push("/recovery/all-recovery-options")}
            className="text-purple-700 text-sm font-medium hover:underline"
          >
            All Recovery Options
          </button>

          <button
            onClick={() => router.push("/recovery/recovery-dashboard")}
            className="bg-purple-700 hover:bg-purple-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md text-sm sm:text-base"
          >
            View Recovery Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* Recovery Card Component with Circular Thumbnail Images */
function RecoveryCard({
  zone,
  onClick,
}: {
  zone: RecoveryZone;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const fallbackColor = getFallbackColor(zone.form);
  const fallbackIcon = getIcon(zone.form);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
    >
      {/* Circular Image */}
      <div className="flex-shrink-0">
        {!imgError && zone.image ? (
          <img
            src={getImageUrl(zone.image)}
            alt={zone.form}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${fallbackColor} flex items-center justify-center shadow-md`}>
            <span className="text-2xl sm:text-3xl">{fallbackIcon}</span>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 text-base sm:text-lg">
          {zone.form}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          {zone.time}
        </p>
      </div>
    </div>
  );
}