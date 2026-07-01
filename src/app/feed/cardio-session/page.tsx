"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  X,
  Heart,
  CheckCircle2,
} from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCardioMenu,
  getCardioSessionDetails,
  updateCardioGoal,
  CardioSessionDetailsResponse,
} from "@/api/cardio/route";

interface Session {
  name: string;
  calories: number | null;
  minutes: number | null;
  suggestion: string | null;
  uploadedImage: string | null;
}

export default function FeedCardioSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const feedId = searchParams.get("feedId") || "";
  const userName = searchParams.get("userName") || "User";
  const userUsername = searchParams.get("userUsername") || "user";
  const feedDate = searchParams.get("date") || "";
  const likeCount = parseInt(searchParams.get("likeCount") || "0", 10);

  const [caloriesLeftWeek, setCaloriesLeftWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isGoalOpen, setIsGoalOpen] = useState(true);
  const [isRecordsOpen, setIsRecordsOpen] = useState(true);

  const [goalCalories, setGoalCalories] = useState<number>(0);
  const [goalMinutes, setGoalMinutes] = useState<number>(0);
  const [showResetGoalModal, setShowResetGoalModal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    distance: "",
    mets: "",
    avgWatts: "",
    rpm: "",
    peakHr: "",
    avgHr: "",
  });

  const [session, setSession] = useState<Session>({
    name: "",
    calories: null,
    minutes: null,
    suggestion: null,
    uploadedImage: null,
  });

  const [sessionData, setSessionData] =
    useState<CardioSessionDetailsResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [menu, details] = await Promise.all([
          getCardioMenu(),
          feedId ? getCardioSessionDetails(feedId) : Promise.resolve(null),
        ]);

        if (details) {
          setSessionData(details);
          setCaloriesLeftWeek(details.left_this_week);
          if (details.cardio_goal) setGoalCalories(details.cardio_goal);

          const calc = details.calculators[0];
          if (calc) {
            setSession({
              name: calc.cardio_option || calc.title || menu[0]?.name || "",
              calories: calc.calories_burned,
              minutes: calc.minutes,
              suggestion: calc.suggestion || null,
              uploadedImage: null,
            });
            if (calc.minutes) setGoalMinutes(calc.minutes);
          }
        } else {
          const defaultItem = menu[0];
          if (defaultItem) {
            setSession((prev) => ({
              ...prev,
              name: defaultItem.name,
              suggestion: defaultItem.suggestion,
            }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [feedId]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProofImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }) +
      " @ " +
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const caloriesLeft = Math.max(0, goalCalories - (session.calories || 0));

  const displayName = sessionData?.user?.username
    ? sessionData.user.username
    : userName;
  const displayUsername = sessionData?.user?.username || userUsername;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Flame className="w-8 h-8 animate-pulse text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] text-[#1a1a2e] pb-28">
      {/* HEADER */}
      <div className="bg-white px-3 sm:px-6 py-3 flex items-center justify-between border-b sticky top-0 z-40 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700 transition flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Flame size={16} className="text-white" />
          </div>
          <h1 className="font-bold text-base truncate">Submit Cardio</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:inline">
            <span className="font-semibold">Author:</span> {displayName}{" "}
            <span className="text-[#1da1f2]">@{displayUsername}</span>
          </span>
          <button className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Plus size={14} className="text-white" />
          </button>
          <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* COMPLETION + LIKES STRIP */}
      <div className="px-4 sm:px-6 pt-4 pb-1 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
          <CheckCircle2 size={12} /> Completed
        </span>
        {likeCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400">
            <Heart size={13} className="text-red-400 fill-red-400" /> {likeCount}
          </span>
        )}
      </div>

      {/* CALORIES LEFT BANNER */}
      <div className="px-4 sm:px-6 py-5">
        <div className="border border-[#a78bfa] rounded-2xl p-5 bg-[#ede9fe]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#7c3aed] font-medium">Left this week:</p>
              <p className="text-4xl font-bold text-[#7c3aed]">{caloriesLeftWeek}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setNewGoalInput(""); setShowResetGoalModal(true); }}
                className="bg-white px-4 py-2 text-xs rounded-xl font-medium whitespace-nowrap shadow-sm border border-gray-100"
              >
                Reset Goal
              </button>

              {!proofImage ? (
                <label className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl cursor-pointer text-xs font-semibold shadow-sm whitespace-nowrap">
                  <Camera size={14} />
                  Upload Photo/ Proof
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProofUpload}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={proofImage}
                    alt="proof"
                    className="w-8 h-8 object-cover rounded-lg border"
                  />
                  <label className="text-xs bg-white px-3 py-1.5 rounded-xl cursor-pointer border border-gray-200">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProofUpload}
                    />
                  </label>
                </div>
              )}

              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6c3fef"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GOAL SECTION */}
      <div className="px-4 sm:px-6 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsGoalOpen(!isGoalOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <p className="text-base font-bold text-gray-800">Goal:</p>
            {isGoalOpen ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>

          {isGoalOpen && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Calories */}
                <div className="rounded-2xl border border-gray-200 py-4 px-3 flex flex-col items-center">
                  <ChevronUp size={18} className="text-gray-300" />
                  <span className="text-3xl font-bold text-[#6c3fef] my-0.5">{goalCalories}</span>
                  <ChevronDown size={18} className="text-gray-300" />
                  <p className="text-[11px] text-gray-400 mt-1">Calories*</p>
                </div>

                {/* Minutes */}
                <div className="rounded-2xl border border-gray-200 py-4 px-3 flex flex-col items-center">
                  <ChevronUp size={18} className="text-gray-300" />
                  <span className="text-3xl font-bold text-[#6c3fef] my-0.5">{goalMinutes}</span>
                  <ChevronDown size={18} className="text-gray-300" />
                  <p className="text-[11px] text-gray-400 mt-1">Minutes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANIFEST RECORDS */}
      <div className="px-4 sm:px-6 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsRecordsOpen(!isRecordsOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <p className="text-base font-bold text-green-600">Manifest Records</p>
            {isRecordsOpen ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>

          {isRecordsOpen && (
            <div className="px-5 pb-5">
              {feedDate && (
                <p className="text-xs text-purple-600 font-medium mb-4">
                  Started: {formatDate(feedDate)}
                </p>
              )}

              {/* Session entry card */}
              <div className="border border-gray-200 rounded-2xl p-4">
                {/* Row: activity + calories + minutes */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Activity (read-only) */}
                  <div className="flex-1 min-w-0 border rounded-xl px-3 py-2.5 border-gray-300 bg-white">
                    <p className="text-sm font-medium text-gray-700 truncate">{session.name}</p>
                  </div>

                  {/* Calories (read-only) */}
                  <div className="bg-gray-50 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                    <ChevronUp size={14} className="text-gray-300" />
                    <span className="text-xl font-bold text-[#6c3fef]">{session.calories ?? 0}</span>
                    <ChevronDown size={14} className="text-gray-300" />
                    <p className="text-[10px] text-gray-400 mt-0.5">Calories*</p>
                  </div>

                  {/* Minutes (read-only) */}
                  <div className="bg-gray-50 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                    <ChevronUp size={14} className="text-gray-300" />
                    <span className="text-xl font-bold text-[#6c3fef]">{session.minutes ?? 0}</span>
                    <ChevronDown size={14} className="text-gray-300" />
                    <p className="text-[10px] text-gray-400 mt-0.5">Minutes</p>
                  </div>
                </div>

                {/* Suggestion */}
                {session.suggestion && (
                  <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                    <p className="text-xs text-red-400 leading-relaxed">
                      {session.suggestion}
                    </p>
                  </div>
                )}

                {/* Metrics toggle */}
                <button
                  onClick={() => setIsMetricsOpen((o) => !o)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-purple-600 transition"
                >
                  {isMetricsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Metrics inputs */}
                {isMetricsOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      { label: "Distance (mi)", key: "distance" },
                      { label: "METS", key: "mets" },
                      { label: "Avg. Watts", key: "avgWatts" },
                      { label: "RPM's", key: "rpm" },
                      { label: "Peak HR", key: "peakHr" },
                      { label: "Avg. HR", key: "avgHr" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                        <input
                          type="number"
                          value={metrics[key as keyof typeof metrics]}
                          onChange={(e) => setMetrics((m) => ({ ...m, [key]: e.target.value }))}
                          placeholder="0"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition placeholder:text-gray-300 placeholder:font-normal"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESET GOAL MODAL */}
      {showResetGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-[30px] bg-white shadow-2xl border border-gray-100 overflow-hidden">

            {/* Close */}
            <button
              onClick={() => setShowResetGoalModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
            >
              <X size={16} className="text-gray-700" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Cardio Goal</h2>
                  <p className="text-xs text-gray-400 mt-0.5">You're adjusting your weekly calorie goal</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Current goal */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Current Goal (kcal)</p>
                <p className="text-4xl font-black text-[#6c3fef]">{goalCalories || caloriesLeftWeek}</p>
              </div>

              {/* New goal input */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Goal (kcal)</p>
                <input
                  type="number"
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  placeholder="Enter new goal..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-xl font-bold text-gray-800 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 transition placeholder:text-gray-300 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowResetGoalModal(false)}
                className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={savingGoal || !newGoalInput}
                onClick={async () => {
                  setSavingGoal(true);
                  try {
                    await updateCardioGoal(Number(newGoalInput));
                    setShowResetGoalModal(false);
                  } catch (err) {
                    console.error("Failed to update cardio goal:", err);
                  } finally {
                    setSavingGoal(false);
                  }
                }}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {savingGoal ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS */}
      {feedId && (
        <div className="px-4 sm:px-6 mb-24">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <FeedComments feedId={feedId} />
          </div>
        </div>
      )}

      {/* BOTTOM STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#fdf2f2] border-t border-red-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="px-4 sm:px-6 py-4 flex items-center gap-4 max-w-2xl mx-auto">
          <div className="flex-shrink-0">
            <p className="text-xs text-gray-500 leading-none">Left</p>
            <p className="text-2xl font-bold text-gray-800 leading-tight">
              {caloriesLeft}
            </p>
          </div>

          <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

          <button className="flex-1 bg-[#3b1fa3] hover:bg-[#2d1882] text-white py-3 rounded-2xl font-bold text-sm transition shadow-sm">
            Start Session
          </button>

          <button className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-2xl font-bold text-sm hover:bg-purple-50 transition">
            Duplicate Session
          </button>
        </div>
      </div>
    </div>
  );
}
