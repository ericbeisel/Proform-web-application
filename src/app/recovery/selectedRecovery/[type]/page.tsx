"use client";

import { X, Upload, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getRecoveryZoneById, RecoveryZone } from "@/api/recovery/route";

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

// Helper to format instructions text
const formatInstructions = (instructions: string): string[] => {
  if (!instructions) return [];
  return instructions.split("\n").filter(line => line.trim());
};

// Get color based on recovery type
const getRecoveryColor = (form: string): string => {
  const formLower = form.toLowerCase();
  if (formLower.includes("hottub") || formLower.includes("bath")) return "bg-cyan-600";
  if (formLower.includes("sauna")) return "bg-orange-500";
  if (formLower.includes("compression")) return "bg-purple-500";
  if (formLower.includes("red-light")) return "bg-pink-500";
  if (formLower.includes("massage gun")) return "bg-indigo-500";
  if (formLower.includes("foam rolling")) return "bg-teal-600";
  return "bg-purple-600";
};

export default function RecoveryDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [recoveryZone, setRecoveryZone] = useState<RecoveryZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState<string>("10");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No recovery ID provided");
      setLoading(false);
      return;
    }

    const fetchRecoveryZone = async () => {
      try {
        setLoading(true);
        const zone = await getRecoveryZoneById(id);
        setRecoveryZone(zone);
        
        // Extract default time from zone.time (e.g., "10-15m" -> first number)
        if (zone.time) {
          const match = zone.time.match(/\d+/);
          if (match) {
            setTime(match[0]);
          }
        }
        setError(null);
      } catch (err: any) {
        console.error("Error fetching recovery zone:", err);
        setError(err.message || "Failed to load recovery details");
      } finally {
        setLoading(false);
      }
    };
    fetchRecoveryZone();
  }, [id]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setTime(value);
    }
  };

  const handleSubmit = () => {
    if (!time || Number(time) <= 0) {
      alert("Please enter valid time");
      return;
    }

    if (!recoveryZone) return;

    router.push(
      `/recovery/completion?type=${encodeURIComponent(recoveryZone.form)}&time=${time}&id=${recoveryZone.id}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !recoveryZone) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error || "Recovery not found"}</p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const recoveryColor = getRecoveryColor(recoveryZone.form);
  const instructions = formatInstructions(recoveryZone.instructions);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4 py-8">

      {/* CLOSE */}
      <button
        onClick={() => router.back()}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
      >
        <X size={18} />
      </button>

      <div className="w-full max-w-2xl text-center space-y-5">

        {/* TITLE */}
        <div>
          <p className="text-sm text-gray-500">Submit Recovery:</p>
          <h1 className="text-2xl font-bold text-gray-800">{recoveryZone.form}</h1>
        </div>

        {/* UPLOAD */}
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={uploadingImage}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploadingImage ? "Uploading..." : "Upload Photo"}
        </button>

        {/* Show uploaded image preview */}
        {uploadedImage && (
          <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-purple-300">
            <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* ICON / IMAGE */}
        <div className="flex justify-center">
          {recoveryZone.image ? (
            <img
              src={getImageUrl(recoveryZone.image)}
              alt={recoveryZone.form}
              className="w-20 h-20 rounded-2xl shadow-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className={`w-20 h-20 ${recoveryColor} rounded-2xl shadow-md`} />
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <div className="h-px bg-gray-200 my-4" />
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {recoveryZone.info || recoveryZone.form}
          </p>
        </div>

        {/* SUGGESTED TIME */}
        <div>
          <p className="text-xs text-gray-400">Suggested:</p>
          <p className="text-3xl font-bold">{recoveryZone.time || "5-30m"}</p>
        </div>

        {/* TIME CONTROLS & INSTRUCTIONS */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">

          <div className="flex flex-col items-center">
            <input
              type="text"
              value={time}
              onChange={(e) => handleChange(e.target.value)}
              className="text-6xl font-bold text-gray-500 text-center w-32 bg-transparent outline-none border-b-2 border-gray-300 focus:border-purple-600"
            />
            <p className="text-xs text-gray-400 mt-2">Time Spent (minutes)</p>
          </div>

          {/* INSTRUCTIONS */}
          {instructions.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-5 text-left flex-1">
              <p className="font-semibold text-sm mb-2">Instructions</p>
              <ul className="text-xs text-gray-600 space-y-2">
                {instructions.slice(0, 5).map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}