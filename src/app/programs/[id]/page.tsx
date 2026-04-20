"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Users, Eye, Clock, Dumbbell,
  Target, Zap, Heart, Award, Star, ChevronRight,
  Loader2, CheckCircle, Tag, Building2, FileText,
  Apple, Play,
  X, Lock
} from "lucide-react";
import { getProgramDetail, ProgramDetail } from "@/api/programs/route";

// ─── Utility ────────────────────────────────────────────────────────────────
function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url
      .replace("wix:image://v1/", "")
      .split("#")[0]
      .split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.target as HTMLImageElement;
  img.onerror = null;
  img.src = FALLBACK_IMAGE;
}

// Objective icon colors — cycles through a set matching the screenshot
const ICON_COLORS = [
  { bg: "bg-orange-100", text: "text-orange-500", icon: <Target size={16} /> },
  { bg: "bg-blue-100",   text: "text-blue-500",   icon: <Zap size={16} /> },
  { bg: "bg-purple-100", text: "text-purple-500",  icon: <Heart size={16} /> },
  { bg: "bg-green-100",  text: "text-green-500",   icon: <Award size={16} /> },
  { bg: "bg-pink-100",   text: "text-pink-500",    icon: <Star size={16} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Popup Modal Component for Free Program
function AddToQueueModal({ 
  isOpen, 
  onClose, 
  programTitle,
  onAddToQueue 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  programTitle: string;
  onAddToQueue: (includeSupplemental: boolean) => void;
}) {
  const [includeSupplemental, setIncludeSupplemental] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add to Workout Queue</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Program Name */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">Add this program to your Workout Queue:</p>
          <p className="font-bold text-gray-900 mt-1">{programTitle}</p>
        </div>

        {/* Main Action: Reconditioning */}
        <div className="p-4 border-b border-gray-100">
          <button 
            onClick={() => onAddToQueue(false)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-between px-4"
          >
            <span>Reconditioning</span>
            <span className="text-sm bg-purple-500/30 px-2 py-0.5 rounded-full">Add 9 Workout(s)</span>
          </button>
        </div>

        {/* Supplemental Workouts Toggle */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Include Supplemental Workouts</p>
              <p className="text-xs text-gray-500">Add extra conditioning and mobility work</p>
            </div>
           <button
  onClick={() => setIncludeSupplemental(!includeSupplemental)}
  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
    includeSupplemental ? 'bg-purple-600' : 'bg-gray-300'
  }`}
>
  <span
    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
      includeSupplemental ? 'translate-x-5' : 'translate-x-1'
    }`}
  />
</button>
          </div>
          {includeSupplemental && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-purple-600">+12 Supplemental Workouts</span>
              <p className="text-xs text-gray-500 mt-1">Mobility, core, and recovery sessions</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2">
          <button 
            onClick={() => onAddToQueue(includeSupplemental)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition"
          >
            Add to Up Next
          </button>
          <button 
            onClick={() => onAddToQueue(includeSupplemental)}
            className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold py-2.5 rounded-xl transition"
          >
            Add to Queue
          </button>
          <button 
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 text-sm transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (programId) fetchProgramDetail();
  }, [programId]);

  const handleStartProgram = () => {
    const isFree = program?.free_is_program === true;
    
    if (isFree) {
      // Show popup for free program
      setIsModalOpen(true);
    } else {
      // For paid program, show pricing alert or navigate to pricing
      alert("Please see pricing plans to access this program.");
    }
  };

  const handleAddToQueue = (includeSupplemental: boolean) => {
    // Here you would implement the actual queue addition logic
    console.log("Adding to queue:", {
      programId: program?.id,
      programTitle: program?.title,
      includeSupplemental,
      supplementalCount: includeSupplemental ? 12 : 0,
      workoutsCount: program?.workouts?.length || 9
    });
    
    // Close modal and show success message
    setIsModalOpen(false);
    alert(`Program "${program?.title}" added to your queue!`);
    
    // Optional: redirect to queue page or stay
    // router.push("/workout-queue");
  };

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

  const isFree = program.free_is_program === true;
  const buttonText = isFree ? "Start Program" : "See Pricing Plans";
  const buttonIcon = isFree ? <ChevronRight size={14} /> : <Lock size={14} />;
  const buttonGradient = isFree 
    ? "from-purple-600 to-purple-700" 
    : "from-gray-600 to-gray-700";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal for Free Program */}
      <AddToQueueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programTitle={program.title}
        onAddToQueue={handleAddToQueue}
      />

      {/* ══════════════════════════════════════
          HEADER  —  matches screenshot exactly:
          [← back]  Title + subtitle        [views] [started]  [Start Program >]
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors shrink-0"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-extrabold text-gray-900 truncate leading-tight">
              {program.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {program.duration} {program.description ? `· ${program.description}` : ""}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Eye size={13} className="text-gray-400" />
              <span className="font-semibold">
                {program.times_completed
                  ? `${(program.times_completed / 1000).toFixed(1)}K`
                  : "0"} views
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Users size={13} className="text-purple-500" />
              <span className="font-semibold">
                {program.enrolled?.toLocaleString() || 0} started
              </span>
            </div>
          </div>

          {/* Logo — Dashboard shortcut */}
          <button
            onClick={() => router.push("/dashboard")}
            className="hidden sm:flex items-center gap-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <img src="/images/proform-logo.jpg" alt="Proform Logo" className="w-5 h-5 object-contain" />
          </button>

          {/* Share */}
          <button
            onClick={async () => {
              if (navigator.share) {
                try { await navigator.share({ title: program.title, url: window.location.href }); } catch {}
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors shrink-0"
            title="Share program"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Other Programs */}
          <button
            onClick={() => router.push("/programs")}
            className="hidden md:flex bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition shrink-0"
          >
            Other Programs
          </button>

          {/* Add to Team Queue */}
          <button className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-md transition shrink-0">
            <Users size={14} />
            Add to Team Queue
          </button>

          {/* Conditional Button: Start Program (Free) or See Pricing Plans (Paid) */}
          <button 
            onClick={handleStartProgram}
            className={`flex items-center gap-2 bg-gradient-to-r ${buttonGradient} text-white px-4 py-2 rounded-full font-bold text-sm transition shadow-md shrink-0 hover:shadow-lg`}
          >
            {buttonText} {buttonIcon}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── ROW 1: Objectives (left) + Overview (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Program Objectives */}
          <div>
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Program Objectives</h2>
            <div className="space-y-3">
              {program.objectives && program.objectives.length > 0 ? (
                program.objectives.map((obj, idx) => {
                  const color = ICON_COLORS[idx % ICON_COLORS.length];
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                        {color.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{obj}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* fallback if no objectives — show spec cards styled like objectives */
                [
                  program.schedule && { label: "Schedule", value: program.schedule, colorIdx: 0 },
                  program.nutrition && { label: "Nutrition Focus", value: program.nutrition, colorIdx: 1 },
                  program.intensity && { label: "Intensity", value: program.intensity, colorIdx: 2 },
                  program.pre_req   && { label: "Prerequisites", value: program.pre_req, colorIdx: 3 },
                ]
                  .filter(Boolean)
                  .map((item: any, idx) => {
                    const color = ICON_COLORS[item.colorIdx % ICON_COLORS.length];
                    return (
                      <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                          {color.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* RIGHT — Program Overview dark card */}
          <div>
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Program Overview</h2>
            <div className="bg-[#1a1a2e] rounded-2xl p-5 text-white h-full flex flex-col justify-between">

              {/* Free/Premium Badge inside overview */}
              <div className="flex justify-end mb-2">
                {isFree ? (
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">FREE</span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full">PREMIUM</span>
                )}
              </div>

              {/* Specs grid — 2 cols */}
              <div className="grid grid-cols-2 gap-4 mb-5">

                {/* Duration */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="text-sm font-extrabold">{program.duration}</p>
                  </div>
                </div>

                {/* Schedule */}
                {program.schedule && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Schedule</p>
                      <p className="text-sm font-extrabold">{program.schedule}</p>
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {program.nutrition && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Apple size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Nutrition Focus</p>
                      <p className="text-sm font-extrabold">{program.nutrition}</p>
                    </div>
                  </div>
                )}

                {/* Intensity */}
                {program.intensity && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Intensity</p>
                      <p className="text-sm font-extrabold">{program.intensity}</p>
                    </div>
                  </div>
                )}

                {/* Prerequisites — spans full width if present */}
                {program.pre_req && (
                  <div className="col-span-2 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Prerequisites</p>
                      <p className="text-sm font-extrabold">{program.pre_req}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 text-center">
                  <div>
                    <p className="text-xl font-extrabold">{program.workouts?.length || 0}</p>
                    <p className="text-[10px] text-gray-400">Total Workouts</p>
                  </div>
                  <div className="border-l border-white/10">
                    <p className="text-xl font-extrabold">{program.enrolled?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-gray-400">Enrolled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Weekly Program Breakdown ── */}
        {program.workouts && program.workouts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900">Weekly Program Breakdown</h2>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CheckCircle size={12} className="text-purple-500" />
                Complete all {program.workouts.length} weeks to unlock achievement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {program.workouts.map((workout, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition group cursor-pointer"
                >
                  {/* Image with overlaid title */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={resolveWixImage(workout.cover_photo)}
                      alt={workout.workout_title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={handleImgError}
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* WEEK badge — top left */}
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide">
                      {workout.week || `WEEK ${idx + 1}`}
                    </span>

                    {/* Title — bottom of image */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-extrabold text-sm leading-tight line-clamp-1">
                        {workout.workout_title}
                      </p>
                    </div>
                  </div>

                  {/* Preview Week button */}
                  <button className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition rounded-b-xl">
                    <Play size={11} fill="currentColor" />
                    Preview Week
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Keep original sections below (specs + objectives) as fallback ── */}

        {/* Program Specs — only shown if not already covered above */}
        {(program.schedule || program.nutrition || program.intensity || program.pre_req) &&
          !program.objectives?.length && (
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

        {/* Organization */}
        {program.organization_name && (
          <div className="flex items-center gap-2 text-gray-500 text-sm pb-2">
            <Building2 size={14} />
            <span>Presented by <span className="font-semibold text-gray-700">{program.organization_name}</span></span>
          </div>
        )}

        {/* Package / Free badge */}
        {(program.package || program.free_is_program != null) && (
          <div className="flex flex-wrap gap-2 pb-4">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{program.duration}</span>
            {isFree ? (
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
        )}

      </div>
    </div>
  );
}