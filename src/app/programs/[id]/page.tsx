// src/app/programs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Users, Eye, Clock, Dumbbell,
  Target, Zap, Heart, Award, Star, ChevronRight,
  Loader2, CheckCircle, Tag, Building2, FileText,
  Apple, Play,
  X, Lock, AlertCircle
} from "lucide-react";
import { getProgramDetail, startProgram, ProgramDetail } from "@/api/programs/route";
import { QRCodeSVG } from "qrcode.react";
import { hasAuthSession } from "@/lib/auth/session";

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

// Objective icon colors
const ICON_COLORS = [
  { bg: "bg-orange-100", text: "text-orange-500", icon: <Target size={16} /> },
  { bg: "bg-blue-100",   text: "text-blue-500",   icon: <Zap size={16} /> },
  { bg: "bg-purple-100", text: "text-purple-500",  icon: <Heart size={16} /> },
  { bg: "bg-green-100",  text: "text-green-500",   icon: <Award size={16} /> },
  { bg: "bg-pink-100",   text: "text-pink-500",    icon: <Star size={16} /> },
];

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-top-2 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Pricing Plans Modal for paid programs
function PricingPlansModal({
  isOpen,
  onClose,
  programTitle,
  packageName,
  addWorkoutCount,
  onAddToQueuePayLater,
}: {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
  packageName: string;
  addWorkoutCount: number;
  onAddToQueuePayLater: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-y-auto max-h-[90vh] relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-6 space-y-5">
          {/* Icon */}
          <div className="flex justify-center pt-2">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-2xl">
                <FileText className="text-white" size={28} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-400 w-5 h-5 rounded-md" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              You don&apos;t have access to<br />this workout or program
            </h2>
            <p className="text-sm text-gray-400 mt-1">Purchase this program individually</p>
          </div>

          {/* Purchase individually button */}
          <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition text-sm">
            Purchase Program
          </button>

          {/* Workout count */}
          <p className="text-center text-green-600 text-sm font-semibold">
            *Add {addWorkoutCount} Workout{addWorkoutCount !== 1 ? "s" : ""}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Package section */}
          {packageName && (
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <span className="bg-orange-400 text-white text-sm font-bold px-5 py-1.5 rounded-full">
                  {packageName}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can access this program and all other workouts/programs in this package by purchasing a Franchise License.
              </p>
              <p className="text-sm text-gray-400">View details and options below:</p>
            </div>
          )}

          {/* Franchise subscription */}
          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">Purchase a franchise subscription:</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="border-2 border-cyan-400 text-cyan-500 font-bold py-3 rounded-xl text-sm hover:bg-cyan-50 transition">
                $29/mo
              </button>
              <button className="bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-black transition">
                $299/yr
              </button>
            </div>
            <div className="text-center">
              <a href="#" className="text-blue-500 underline text-sm font-medium">
                View Franchise Details
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Add to queue pay later */}
          <div className="space-y-2 pb-2">
            <button
              onClick={onAddToQueuePayLater}
              disabled={false}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition text-sm"
            >
              Add to queue and pay later
            </button>
            <p className="text-center text-green-600 text-xs font-medium">
              *You will able to purchase these workouts before starting them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Original popup from your code
// Update the AddToQueueModal component props
function AddToQueueModal({
  isOpen,
  onClose,
  programTitle,
  onAddToQueue,
  isAdding,
  addWorkoutCount,
  supplementalWorkoutCounts
}: {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
  onAddToQueue: (includeSupplemental: boolean, queueType: 'up_next' | 'queue') => Promise<void>;
  isAdding: boolean;
  addWorkoutCount: number;
  supplementalWorkoutCounts: number;
}) {
  const [includeSupplemental, setIncludeSupplemental] = useState(true);
  const router = useRouter();

  if (!isOpen) return null;

  const handleAddToQueue = async (queueType: 'up_next' | 'queue') => {
    await onAddToQueue(includeSupplemental, queueType);
    // Redirect to workout/main after adding to queue
    router.push('/workout/main');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-2xl">
            <FileText className="text-white" size={28} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800">
          Add this program to your
        </h2>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Workout Queue:
        </h2>

        {/* Program Name */}
        <p className="text-xl font-bold text-blue-600 mb-1">
          {programTitle}
        </p>

        {/* Workout Count */}
        <p className="text-green-600 text-sm font-medium mb-4">
          + Add {addWorkoutCount} Workout{addWorkoutCount !== 1 ? "s" : ""}
        </p>

        {/* Checkbox */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={includeSupplemental}
            onChange={() => setIncludeSupplemental(!includeSupplemental)}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-600">
            Include Supplemental Workouts ({supplementalWorkoutCounts})
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleAddToQueue("up_next")}
            disabled={isAdding}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition"
          >
            {isAdding ? "Adding..." : "Add to Up Next"}
          </button>

          <button
            onClick={() => handleAddToQueue("queue")}
            disabled={isAdding}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-900 transition"
          >
            {isAdding ? "Adding..." : "Add to Queue"}
          </button>

          <button
            onClick={onClose}
            className="text-blue-600 text-sm font-medium hover:underline mt-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const AUTH_PROMPT_COPY = {
  start: { heading: "Start this Program", subtitle: "Log in or sign up to start this program" },
  preview: { heading: "Preview this Workout", subtitle: "Log in or sign up to preview this workout" },
  programs: { heading: "Browse other Programs", subtitle: "Log in or sign up to browse other programs" },
  dashboard: { heading: "Go to your Dashboard", subtitle: "Log in or sign up to view your dashboard" },
} as const;

export default function ProgramDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<keyof typeof AUTH_PROMPT_COPY | null>(null);
  const isLoggedIn = hasAuthSession();
  const loginUrl = `/auth/login?next=${encodeURIComponent(pathname)}`;

  const programId = params.id as string;

useEffect(() => {
  const fetchProgramDetail = async () => {
    try {
      setLoading(true);
      const data = await getProgramDetail(programId);
      setProgram(data);
      
      // ← Store immediately when program loads
      if (data.id) {
        localStorage.setItem("workoutProgramId", data.id);
        console.log("✅ Stored workoutProgramId:", data.id);
      }
      
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
    if (!isLoggedIn) {
      setAuthPrompt("start");
      return;
    }
    const isFree = Boolean(program?.free_is_program);

    if (isFree) {
      // Show popup for free program
      setIsModalOpen(true);
    } else {
      setIsPricingModalOpen(true);
    }
  };

const handleAddToQueue = async (includeSupplemental: boolean, queueType: 'up_next' | 'queue') => {
  if (!program) return;
    console.log("📤 Sending to API:", {
    programId: program.id,
    type: "Workout",
    addSuggested: includeSupplemental ? 1 : 0,
    queueType
  });
  setIsAdding(true);
  
  try {
    const response = await startProgram({
      programId: program.id,
      type: "Workout",
      addSuggested: includeSupplemental ? 1 : 0,
    });
    
    console.log("Program added to queue:", response);
    
    setToast({
      message: `"${program.title}" has been added to your ${queueType === 'up_next' ? 'Up Next' : 'Queue'}!`,
      type: 'success'
    });
    
    setIsModalOpen(false);
    
  } catch (err: any) {
    console.error("Error adding program to queue:", err);
    setToast({
      message: err.message || "Failed to add program to queue. Please try again.",
      type: 'error'
    });
  } finally {
    setIsAdding(false);
  }
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

  const isFree = Boolean(program.free_is_program);
  const buttonText = isFree ? "Start Program" : "See Pricing Plans";
  const buttonIcon = isFree ? <ChevronRight size={14} /> : <Lock size={14} />;
  const buttonGradient = isFree 
    ? "from-purple-600 to-purple-700" 
    : "from-gray-600 to-gray-700";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal for Program */}
{/* Modal for Program */}
<AddToQueueModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  programTitle={program.title}
  onAddToQueue={handleAddToQueue}
  isAdding={isAdding}
  addWorkoutCount={program.addworkoutcount || 0}
  supplementalWorkoutCounts={program.supplementalWorkoutCounts || 0}
/>

<PricingPlansModal
  isOpen={isPricingModalOpen}
  onClose={() => setIsPricingModalOpen(false)}
  programTitle={program.title}
  packageName={program.package || ""}
  addWorkoutCount={program.addworkoutcount || 0}
  onAddToQueuePayLater={() => {
    setIsPricingModalOpen(false);
    setIsModalOpen(true);
  }}
/>

{/* SHARE PROGRAM MODAL — same QR/copy-link design as the feed's Share
    Session modal and the profile Share Profile modal. */}
{showShareModal && (() => {
  const shareUrl = `https://paxlete.com/programs/${programId}`;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => { setShowShareModal(false); setShareLinkCopied(false); }}
    >
      <div
        className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setShowShareModal(false); setShareLinkCopied(false); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
        >
          <X size={14} className="text-gray-600" />
        </button>

        <div className="px-6 pt-6 pb-6">
          <h3 className="font-bold text-gray-900 text-[17px] mb-1">Share Program</h3>
          <p className="text-[13px] text-gray-400 mb-5 truncate">{program.title}</p>

          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <QRCodeSVG value={shareUrl} size={140} fgColor="#1f2937" bgColor="#ffffff" />
              </div>
              <p className="text-[12px] text-gray-400">Scan this code to view the program</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 mb-5">
            <span className="text-[12px] text-gray-500 truncate flex-1">{shareUrl}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setShareLinkCopied(true);
                setTimeout(() => setShareLinkCopied(false), 2000);
              }}
              className="shrink-0 text-[12px] font-bold text-purple-600 hover:text-purple-700 px-2 disabled:opacity-40"
            >
              {shareLinkCopied ? "Copied!" : "Copy"}
            </button>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: program.title, url: shareUrl });
              } else {
                navigator.clipboard.writeText(shareUrl);
                setShareLinkCopied(true);
                setTimeout(() => setShareLinkCopied(false), 2000);
              }
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-2xl text-[14px] transition hover:shadow-lg disabled:opacity-50"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
})()}

{/* AUTH PROMPT — same purple-gradient login/signup modal used across the
    app's anonymous-preview flows; copy varies per triggering action. */}
{authPrompt && (
  <div
    className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setAuthPrompt(null)}
  >
    <div
      className="relative w-full max-w-3xl overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14 shadow-2xl"
      style={{ background: "linear-gradient(135deg, #8B5CF6, #6202AC)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setAuthPrompt(null)}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
      >
        <X size={15} className="text-white" />
      </button>

      <div className="relative z-10 max-w-xs md:max-w-sm">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-4">
          <AlertCircle size={20} className="text-white" />
        </div>
        <h3 className="text-white font-medium text-3xl md:text-4xl mb-2">{AUTH_PROMPT_COPY[authPrompt].heading}</h3>
        <p className="text-white/80 text-sm md:text-base mb-6">{AUTH_PROMPT_COPY[authPrompt].subtitle}</p>
        <button
          onClick={() => router.push(loginUrl)}
          className="bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-50 transition"
        >
          Log in or Sign up
        </button>
      </div>

      <img
        src="/images/Visual.png"
        alt=""
        className="hidden sm:block absolute right-2 md:right-6 bottom-0 w-64 md:w-80 pointer-events-none select-none"
      />
    </div>
  </div>
)}

      {/* ══════════════════════════════════════
          HEADER
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
            onClick={() => (isLoggedIn ? router.push("/dashboard") : setAuthPrompt("dashboard"))}
            className="hidden sm:flex items-center gap-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <img src="/images/proform-logo.jpg" alt="Proform Logo" className="w-5 h-5 object-contain" />
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
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
            onClick={() => (isLoggedIn ? router.push("/programs") : setAuthPrompt("programs"))}
            className="hidden md:flex bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition shrink-0"
          >
            Other Programs
          </button>

          {/* Add to Team Queue */}
          <button className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-md transition shrink-0">
            <Users size={14} />
            Add to Team Queue
          </button>

          {/* Conditional Button */}
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
                /* fallback if no objectives */
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
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={resolveWixImage(workout.cover_photo)}
                      alt={workout.workout_title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={handleImgError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide">
                      {workout.week || `WEEK ${idx + 1}`}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-extrabold text-sm leading-tight line-clamp-1">
                        {workout.workout_title}
                      </p>
                    </div>
                  </div>
             <button
onClick={() => {
  if (!isLoggedIn) {
    setAuthPrompt("preview");
    return;
  }
  console.log("🔍 workout.title (code):", workout.title);
  localStorage.setItem("workoutIsFree", program?.free_is_program ? "true" : "false");
  if (program?.id) localStorage.setItem("workoutProgramId", program.id);
  router.push(`/workout/detail?code=${workout.title}&workoutKey=${encodeURIComponent(workout.workout_title)}`);
}}
  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition rounded-b-xl"
>
  <Play size={11} fill="currentColor" />
  Preview Workout
</button>
                </div>
              ))}
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