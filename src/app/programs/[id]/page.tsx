"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Users, Eye, Clock, Dumbbell,
  Target, Zap, Heart, Award, Star, ChevronRight,
  Loader2, CheckCircle, Tag, Building2, FileText,
  Apple,
  X
} from "lucide-react";
import { getProgramDetail, ProgramDetail } from "@/api/programs/route";

// ─── Utility: resolve Wix image URLs to real CDN URLs ───────────────────────
function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url
      .replace("wix:image://v1/", "")
      .split("#")[0]   // remove #originWidth=...&originHeight=... metadata
      .split("/")[0];  // remove /filename.jpg suffix, keep only the media ID
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url; // already a normal https:// URL
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.target as HTMLImageElement;
  img.onerror = null; // prevent infinite loop
  img.src = FALLBACK_IMAGE;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const programId = params.id as string;

  useEffect(() => {
    const fetchProgramDetail = async () => {
      try {
        setLoading(true);
        const data = await getProgramDetail(programId);
        setProgram(data);
      } catch (err) {
        console.error("Error fetching program details:", err);
        setError("Failed to load program details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgramDetail();
    }
  }, [programId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error || "Program not found"}</p>
          <button onClick={() => router.back()} className="bg-purple-600 text-white px-6 py-2 rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
   <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    {/* Left: Back Button */}
    <div className="flex items-center gap-3">
      <button onClick={() => router.back()} className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors">
        <ArrowLeft size={18} className="text-gray-700" />
      </button>
      
      {/* Dashboard Logo */}
      <button
        onClick={() => router.push("/dashboard")}
        className="hidden sm:flex items-center gap-1.5  hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <img
          src="/images/proform-logo.jpg"
          alt="Proform Logo"
          className="w-5 h-5 object-contain"
        />
      </button>
    </div>

    {/* Center: Title */}
    <h1 className="text-lg font-extrabold text-gray-900 truncate max-w-[150px] md:max-w-md">
      {program.title}
    </h1>

    {/* Right: Action Buttons */}
    <div className="flex items-center gap-2">
      {/* Share Button */}
  {/* Share Button */}
<button 
  onClick={async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: program.title,
          text: `Check out this program: ${program.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }}
  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
  title="Share program"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
</button>

      {/* Other Programs Button */}
      <button
        onClick={() => router.push("/programs/all-programs")}
        className="hidden md:flex bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition"
      >
        Other Programs
      </button>

      {/* Add to Team Queue */}
      <button className="hidden sm:flex bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-md transition items-center gap-1.5">
        <Users size={14} />
        Add to Team Queue
      </button>

      {/* Add to My Queue */}
      <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-md transition">
        Add to  Queue
      </button>
    </div>
  </div>
</header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-md">
            <img
              src={resolveWixImage(program.image)}
              alt={program.title}
              className="w-full h-64 md:h-80 object-cover"
              onError={handleImgError}
            />
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{program.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                  {program.duration}
                </span>
                {program.free_is_program ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">FREE</span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">Premium</span>
                )}
                {program.package && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} /> {program.package}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {program.description || "No description available for this program."}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users size={14} />
                  <span className="text-xs">Enrolled</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{program.enrolled?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Eye size={14} />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{program.times_completed?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* Organization */}
            {program.organization_name && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Building2 size={14} />
                <span>Presented by <span className="font-semibold text-gray-700">{program.organization_name}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Workouts Section */}
        {program.workouts && program.workouts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Dumbbell size={20} className="text-purple-600" />
              Workouts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {program.workouts.map((workout, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition group cursor-pointer"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={resolveWixImage(workout.cover_photo)}
                      alt={workout.workout_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={handleImgError}
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{workout.workout_title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{workout.week}</span>
                      <button className="text-purple-600 text-xs font-semibold flex items-center gap-1">
                        Preview <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Program Specs */}
        {(program.schedule || program.nutrition || program.intensity || program.pre_req) && (
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Program Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {program.schedule && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Calendar size={16} />
                    <span className="font-semibold text-sm">Schedule</span>
                  </div>
                  <p className="text-sm text-gray-600">{program.schedule}</p>
                </div>
              )}
              {program.nutrition && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Apple size={16} />
                    <span className="font-semibold text-sm">Nutrition</span>
                  </div>
                  <p className="text-sm text-gray-600">{program.nutrition}</p>
                </div>
              )}
              {program.intensity && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Zap size={16} />
                    <span className="font-semibold text-sm">Intensity</span>
                  </div>
                  <p className="text-sm text-gray-600">{program.intensity}</p>
                </div>
              )}
              {program.pre_req && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Award size={16} />
                    <span className="font-semibold text-sm">Prerequisites</span>
                  </div>
                  <p className="text-sm text-gray-600">{program.pre_req}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Objectives Section */}
        {program.objectives && program.objectives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-purple-600" />
              Objectives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {program.objectives.map((objective, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}