"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllRecoveryZones, RecoveryZone } from "@/api/recovery/route";

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

// Get icon emoji based on form name
const getIconEmoji = (form: string): string => {
  const formLower = form.toLowerCase();
  if (formLower.includes("compression")) return "🦵";
  if (formLower.includes("contrast")) return "🛁";
  if (formLower.includes("cryo")) return "❄️";
  if (formLower.includes("sauna")) return "🌡️";
  if (formLower.includes("massage gun")) return "🔫";
  if (formLower.includes("dry-needling")) return "💉";
  if (formLower.includes("e-stim")) return "⚡";
  if (formLower.includes("foam rolling")) return "🧘";
  if (formLower.includes("laser")) return "💡";
  if (formLower.includes("nap")) return "😴";
  if (formLower.includes("hbot")) return "🫁";
  if (formLower.includes("hot tub") || formLower.includes("hottub")) return "♨️";
  if (formLower.includes("ice bath")) return "🧊";
  if (formLower.includes("massage") && !formLower.includes("gun")) return "🐯";
  if (formLower.includes("red-light mask")) return "😷";
  if (formLower.includes("red-light therapy")) return "🔴";
  if (formLower.includes("salt bath")) return "🧂";
  return "💪";
};

export default function RecoveryOptions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoveryZones, setRecoveryZones] = useState<RecoveryZone[]>([]);
  const [hasPrefilledImage, setHasPrefilledImage] = useState(false);

  // Fetch all recovery zones
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("recoveryDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.uploadImage) {
            setHasPrefilledImage(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchRecoveryZones = async () => {
      try {
        setLoading(true);
        const zones = await getAllRecoveryZones();
        setRecoveryZones(zones);
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

  // Handle Done button - redirect to selected recovery detail page
  // You can change this to whatever page you want to redirect to
  const handleDone = () => {
    // Example: redirect to a specific recovery or back
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 pb-32">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Recovery Options
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Choose from our list of proven and trusted recovery methods used by
            top athletes and health professionals in the industry
          </p>
        </div>
      </div>
      {/* Prefilled Image Banner */}
      {hasPrefilledImage && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Prefilled Image
            </span>
            <span className="text-sm text-purple-600">
              Select a recovery option to log it with your uploaded highlight image.
            </span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("recoveryDetails");
              setHasPrefilledImage(false);
            }}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline transition-all"
          >
            Clear Prefilled Image
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {recoveryZones.map((zone) => {
          const icon = getIconEmoji(zone.form);
          const displayTime = zone.time || "5-30m";

          return (
            <div
              key={zone.id}
              onClick={() => router.push(`/recovery/selectedRecovery/${zone.form.toLowerCase().replace(/\s+/g, "-")}?id=${zone.id}`)}
              className="cursor-pointer rounded-2xl p-4 bg-white border border-gray-200 transition-all hover:shadow-md hover:border-purple-300"
            >
              {/* Image/Icon box */}
              <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center mb-3 overflow-hidden">
                {zone.image ? (
                  <img
                    src={getImageUrl(zone.image)}
                    alt={zone.form}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const span = document.createElement("span");
                        span.className = "text-2xl";
                        span.textContent = icon;
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-2xl">{icon}</span>
                )}
              </div>

              {/* Text */}
              <p className="text-sm font-medium text-gray-800 text-center line-clamp-2">
                {zone.form}
              </p>
              <p className="text-xs text-green-600 text-center mt-1">
                {displayTime}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer with Done Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center shadow-lg">
        <button
          onClick={handleDone}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-lg shadow transition font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}