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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCardioMenu,
  CardioMenuItem,
  getCardioHistory,
} from "@/api/cardio/route";
import { preferenceApi } from "@/api/preferences/route";

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

  const userName = searchParams.get("userName") || "User";
  const userUsername = searchParams.get("userUsername") || "user";
  const feedDate = searchParams.get("date") || "";

  const [cardioMenu, setCardioMenu] = useState<CardioMenuItem[]>([]);
  const [caloriesLeftWeek, setCaloriesLeftWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isGoalOpen, setIsGoalOpen] = useState(true);
  const [isRecordsOpen, setIsRecordsOpen] = useState(true);

  const [goalCalories, setGoalCalories] = useState<number>(290);
  const [goalMinutes, setGoalMinutes] = useState<number>(42);

  const [session, setSession] = useState<Session>({
    name: "BOXING BAG. HEAVY",
    calories: 290,
    minutes: 23,
    suggestion: null,
    uploadedImage: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [menu, prefs, history] = await Promise.all([
          getCardioMenu(),
          preferenceApi.getPreferencesData(),
          getCardioHistory("thisweek", 1, 100),
        ]);

        setCardioMenu(menu);

        const goal = prefs.calories_goal || 0;
        const burned = (history as any).weeklyCaloriesSum || 0;
        setCaloriesLeftWeek(Math.max(0, goal - burned));

        const defaultItem = menu.find((i) => i.name === session.name) || menu[0];
        if (defaultItem) {
          setSession((prev) => ({
            ...prev,
            name: defaultItem.name,
            suggestion: defaultItem.suggestion,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCardioSelect = (selectedName: string) => {
    const item = cardioMenu.find((i) => i.name === selectedName);
    setSession((prev) => ({
      ...prev,
      name: selectedName,
      suggestion: item?.suggestion ?? null,
    }));
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProofImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSessionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setSession((prev) => ({ ...prev, uploadedImage: reader.result as string }));
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
            <span className="font-semibold">Author:</span> {userName}{" "}
            <span className="text-[#1da1f2]">@{userUsername}</span>
          </span>
          <button className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Plus size={14} className="text-white" />
          </button>
          <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar size={14} className="text-gray-600" />
          </button>
        </div>
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
              <button className="bg-white px-4 py-2 text-xs rounded-xl font-medium whitespace-nowrap shadow-sm border border-gray-100">
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
                  <button
                    onClick={() => setGoalCalories((c) => c + 1)}
                    className="text-gray-300 hover:text-purple-600 transition"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <span className="text-3xl font-bold text-[#6c3fef] my-0.5">
                    {goalCalories}
                  </span>
                  <button
                    onClick={() => setGoalCalories((c) => Math.max(0, c - 1))}
                    className="text-gray-300 hover:text-purple-600 transition"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <p className="text-[11px] text-gray-400 mt-1">Calories*</p>
                </div>

                {/* Minutes */}
                <div className="rounded-2xl border border-gray-200 py-4 px-3 flex flex-col items-center">
                  <button
                    onClick={() => setGoalMinutes((m) => m + 1)}
                    className="text-gray-300 hover:text-purple-600 transition"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <span className="text-3xl font-bold text-[#6c3fef] my-0.5">
                    {goalMinutes}
                  </span>
                  <button
                    onClick={() => setGoalMinutes((m) => Math.max(0, m - 1))}
                    className="text-gray-300 hover:text-purple-600 transition"
                  >
                    <ChevronDown size={18} />
                  </button>
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
                {/* Row: dropdown + calories + minutes + camera */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Activity dropdown */}
                  <div className="flex-1 min-w-0 border rounded-xl px-3 py-2.5 border-gray-300 bg-white">
                    <select
                      value={session.name}
                      onChange={(e) => handleCardioSelect(e.target.value)}
                      className="w-full text-sm outline-none bg-transparent font-medium text-gray-700"
                    >
                      {cardioMenu.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calories spinner */}
                  <div className="bg-gray-50 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                    <button
                      onClick={() =>
                        setSession((s) => ({
                          ...s,
                          calories: (s.calories || 0) + 1,
                        }))
                      }
                      className="text-gray-300 hover:text-purple-600 transition"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <span className="text-xl font-bold text-[#6c3fef]">
                      {session.calories ?? 0}
                    </span>
                    <button
                      onClick={() =>
                        setSession((s) => ({
                          ...s,
                          calories: Math.max(0, (s.calories || 0) - 1),
                        }))
                      }
                      className="text-gray-300 hover:text-purple-600 transition"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <p className="text-[10px] text-gray-400 mt-0.5">Calories*</p>
                  </div>

                  {/* Minutes spinner */}
                  <div className="bg-gray-50 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
                    <button
                      onClick={() =>
                        setSession((s) => ({
                          ...s,
                          minutes: (s.minutes || 0) + 1,
                        }))
                      }
                      className="text-gray-300 hover:text-purple-600 transition"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <span className="text-xl font-bold text-[#6c3fef]">
                      {session.minutes ?? 0}
                    </span>
                    <button
                      onClick={() =>
                        setSession((s) => ({
                          ...s,
                          minutes: Math.max(0, (s.minutes || 0) - 1),
                        }))
                      }
                      className="text-gray-300 hover:text-purple-600 transition"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <p className="text-[10px] text-gray-400 mt-0.5">Minutes</p>
                  </div>

                  {/* Camera */}
                  <label className="bg-purple-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-purple-700 transition flex-shrink-0">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSessionImageUpload}
                    />
                  </label>
                </div>

                {/* Uploaded session image */}
                {session.uploadedImage && (
                  <div className="mt-3 relative">
                    <img
                      src={session.uploadedImage}
                      alt="uploaded"
                      className="w-full h-28 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                    />
                    <button
                      onClick={() =>
                        setSession((s) => ({ ...s, uploadedImage: null }))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Suggestion */}
                {session.suggestion && (
                  <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                    <p className="text-xs text-red-400 leading-relaxed">
                      {session.suggestion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
