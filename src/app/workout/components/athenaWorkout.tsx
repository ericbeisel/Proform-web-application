"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  Clock,
  Play,
  Pause,
  SkipForward,
  User,
  NotepadText,
  Settings,
  Share2,
  MapPin,
  BarChart3,
  Info,
  Pen,
  Star,
  StarHalfIcon,
  X,
  Plus,
  Save,
  Replace,
  Shuffle,
} from "lucide-react";
import { useRouter } from "next/navigation";
export default function AthenaWorkoutPage() {
  const router = useRouter();
  const [isNotePopupOpen, setIsNotePopupOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [shareWithCoach, setShareWithCoach] = useState(false);
  const [isVelocityPopupOpen, setIsVelocityPopupOpen] = useState(false);
  const [velocitySets, setVelocitySets] = useState([
    { id: 1, weight: 9, reps: "12-15", maxV: 1.0, unit: "m/s" },
  ]);
  const [isRunning, setIsRunning] = useState(true);
  const [progress] = useState(45);

  const exercises = [
    { id: 1, title: "WIDE-GRIP PULL UP", subtitle: "1x AMRP", isCurrent: true },
    {
      id: 2,
      title: "STANDING SQUAT HOLD",
      subtitle: "1x HOLD",
      isCurrent: false,
    },
    {
      id: 3,
      title: "OBLIQUE BRIDGE ADD",
      subtitle: "1x 12-15",
      isCurrent: false,
    },
    {
      id: 4,
      title: "FLOOR PUSHUP W/ CHAIR",
      subtitle: "1x AMRP",
      isCurrent: false,
    },
    {
      id: 5,
      title: "FLOOR PLANK-TO-PUSH",
      subtitle: "1x 8-12s",
      isCurrent: false,
    },
    { id: 6, title: "FLOOR GROIN FLOW", subtitle: "1x 6/s", isCurrent: false },
    { id: 7, title: "REST PERIOD", subtitle: "60s", isCurrent: false },
  ];

  const addNewSet = () => {
    const newId = velocitySets.length + 1;
    setVelocitySets([
      ...velocitySets,
      { id: newId, weight: 0, reps: "", maxV: 0, unit: "m/s" },
    ]);
  };

  return (
    // Changed h-screen to min-h-screen for mobile safety, but kept h-screen for desktop
    <div className="h-screen bg-[#fcfdfe] flex flex-col font-sans overflow-hidden">
      {/* SECTION 1: Fixed Headers */}
      <div className="flex flex-col shrink-0">
        <header className="bg-[#6202AC] text-white py-2 px-4 flex items-center justify-between">
          <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition">
            <ChevronLeft size={16} strokeWidth={3} />
            <span className="hidden sm:inline">Return to Workout</span>
            <span className="inline sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="p-1 hover:opacity-80">
              <User size={18} />
            </button>
            <button className="p-1 hover:opacity-80">
              <NotepadText size={18} />
            </button>
            <button className="p-1 hover:opacity-80">
              <Settings size={18} />
            </button>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold border border-white/30">
              AM
            </div>
            <button className="p-1 hover:opacity-80">
              <Share2 size={18} />
            </button>
          </div>
        </header>

        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-700" />
            <h2 className="font-bold text-sm md:text-base tracking-tight">
              WARM-UP (1x)
            </h2>
          </div>
          <p className="text-gray-500 text-[10px] md:text-[11px] mt-0.5">
            Complete the following warm-up sets in order
          </p>
        </div>

        <div className="bg-[#0FCC91] text-white text-[9px] md:text-[10px] font-bold py-1.5 px-4 flex items-center justify-center gap-1.5 text-center">
          <Award size={14} className="shrink-0" />
          <span className="truncate">
            Exercises customized to your location: Gym1
          </span>
        </div>
      </div>

      {/* SECTION 2: Main Content Area */}
      {/* flex-col on mobile, flex-row on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1440px] mx-auto w-full">
        {/* Left: Main Exercise */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-3 custom-scrollbar">
          <div className="flex items-center justify-between">
            {/* Title + Star */}
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />

              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase truncate mr-2">
                WIDE-GRIP PULL UP
              </h1>
            </div>

            {/* Rotate + 1/6 */}
            <div className="flex items-center gap-2 shrink-0">
              
            <button onClick={() =>  router.push("/workout/swapExercise")} className="p-2 bg-[#6202AC] rounded-lg shadow-sm border border-gray-200 hover:bg-[#4d0187] transition">
  <Shuffle size={18} className="text-white" />
</button>
              <span className="text-sm font-bold text-gray-600">1/6</span>
            </div>
          </div>

          {/* Adjusted aspect ratio for mobile vs desktop */}
          <div className="relative aspect-[16/9] lg:aspect-[16/5] bg-[#e4ebf3] rounded-md flex items-center justify-center border border-white shadow-sm overflow-hidden shrink-0">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full" />
            </div>
            <p className="absolute bottom-1.5 text-[7px] font-black text-gray-400 tracking-wider uppercase">
              Exercise placeholder
            </p>

            <button className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 p-0.5 rounded-full shadow-sm hover:bg-white transition">
              <ChevronLeft size={25} />
            </button>
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 p-0.5 rounded-full shadow-sm hover:bg-white transition">
              <ChevronRight size={25} />
            </button>

            {/* Bottom-left icons - scaled for mobile */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 md:gap-3">
              <NotepadText
                size={32}
                className="text-white bg-gradient-to-br from-orange-400 to-orange-600 p-2 md:p-3 md:w-10 md:h-10 rounded-full shadow-xl hover:scale-110 transition-transform cursor-pointer"
                onClick={() => setIsNotePopupOpen(true)}
              />
              <BarChart3
                size={32}
                onClick={() => setIsVelocityPopupOpen(true)}
                className="text-white bg-gradient-to-br from-blue-400 to-blue-600 p-2 md:p-3 md:w-10 md:h-10 rounded-full shadow-xl hover:scale-110 transition-transform"
              />

              {isVelocityPopupOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
                  onClick={() => setIsVelocityPopupOpen(false)}
                >
                  <div
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#6202AC] rounded-lg shadow-sm">
                          <BarChart3 size={18} className="text-white" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-[#6202AC]">
                          Load Velocity
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-700">
                          WIDE-GRIP PULL UP
                        </p>
                        <button
                          onClick={() => setIsVelocityPopupOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Black placeholder image */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow">
                          <div className="w-6 h-6 bg-white rounded-full" />
                        </div>
                        <p className="mt-2 text-[10px] font-semibold text-gray-500 text-center">
                          Plug your velocity results to save and compare data.
                        </p>
                      </div>

                      {/* Sets */}
                      {velocitySets.map((set, idx) => (
                        <div
                          key={set.id}
                          className="mb-6 border border-gray-200 rounded-xl p-4 bg-gray-50/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-sm text-gray-700">
                              Set {idx + 1}
                            </h3>
                            {/* Remove button */}
                            <button
                              onClick={() => {
                                const newSets = velocitySets.filter(
                                  (_, i) => i !== idx,
                                );
                                setVelocitySets(newSets);
                              }}
                              className="p-1 hover:bg-red-100 rounded-full transition"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>

                          {/* Horizontal layout */}
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Weight (lbs):
                              </span>
                              <input
                                type="number"
                                value={set.weight}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].weight =
                                    parseInt(e.target.value) || 0;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Reps:
                              </span>
                              <input
                                type="text"
                                value={set.reps}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].reps = e.target.value;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Max V.:
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={set.maxV}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].maxV =
                                    parseFloat(e.target.value) || 0;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Unit:
                              </span>
                              <select
                                value={set.unit}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].unit = e.target.value;
                                  setVelocitySets(newSets);
                                }}
                              >
                                <option>m/s</option>
                                <option>ft/s</option>
                                <option>km/h</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Set Button */}
                      <button
                        onClick={addNewSet}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-semibold text-sm hover:bg-purple-50 transition mb-5"
                      >
                        <Plus size={18} />
                        Add Another Set
                      </button>

                      {/* Save Button */}
                      <button
                        onClick={() => {
                          console.log("Saved velocity data:", velocitySets);
                          setIsVelocityPopupOpen(false);
                        }}
                        className="w-full bg-[#6202AC] text-white font-bold py-3 rounded-xl hover:bg-[#4d0187] transition flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isNotePopupOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
                  onClick={() => setIsNotePopupOpen(false)}
                >
                  <div
                    className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="p-6 pb-2">
                      <h2 className="text-xl font-black tracking-tight text-gray-900">
                        Add a Note
                      </h2>
                    </div>

                    {/* Description */}
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Create a note to this exercise or this round of
                        exercises to share with your followers or your coach.
                        You can edit or remove these notes before completing
                        your workout from the workout review page.
                      </p>
                    </div>

                    {/* Textarea */}
                    <div className="px-6 pb-4">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your message here..."
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Checkbox */}
                    <div className="px-6 pb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareWithCoach}
                          onChange={(e) => setShareWithCoach(e.target.checked)}
                          className="w-4 h-4 accent-[#6202AC] rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Share this note with your coach
                        </span>
                      </label>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Add to Workout Button */}
                    <div className="p-6">
                      <button
                        onClick={() => {
                          console.log("Note saved:", {
                            text: noteText,
                            shareWithCoach,
                          });
                          setIsNotePopupOpen(false);
                          setNoteText("");
                          setShareWithCoach(false);
                        }}
                        className="w-full bg-[#6202AC] text-white font-bold py-3 rounded-xl hover:bg-[#4d0187] transition text-sm"
                      >
                        Add to Workout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar - wrapping for small screens */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pb-1">
            <div className="flex-1 bg-white rounded-lg p-2.5 border border-gray-100 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-[#6202AC] rounded"
                  />
                  <p className="text-[9px] font-bold text-gray-400">
                    Check when completed
                  </p>
                </div>
                <span className="text-xs font-medium text-purple-600">
                  What's Next?
                </span>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-400">
                    Sets
                  </p>
                  <span className="text-xs font-black text-gray-700">1x</span>
                </div>
                <div className="text-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-400">
                    Reps
                  </p>
                  <span className="text-xs font-black text-gray-700">AMRP</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button className="bg-gray-500 text-white p-1.5 md:p-2 rounded-full shadow hover:shadow-md transition">
                    <Pen size={14} />
                  </button>
                  <button className="bg-gray-500 text-white p-1.5 md:p-2 rounded-full shadow hover:shadow-md transition">
                    <Info size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button className="bg-[#6202AC] hover:bg-[#4d0187] text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg text-[11px] shadow transition shrink-0">
              ROUND 1
            </button>
          </div>
        </div>

        {/* Right Panel: Exercise Overview */}
        {/* Hidden on very small screens or shown as a bottom section */}
        <aside className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white flex flex-col overflow-hidden h-[300px] lg:h-full">
          <div className="flex flex-col h-full">
            <div className="p-3 pb-2 shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Exercise Overview</h3>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  1/6
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-1.5 pb-2">
                {exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className={`rounded-lg border p-1.5 flex flex-col items-center justify-center relative transition-all h-20 md:h-24 ${
                      ex.isCurrent
                        ? "border-[#6202AC] bg-[#f8f5ff] shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border border-white shadow-sm ${
                        ex.isCurrent
                          ? "bg-[#6202AC] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div
                      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mb-1 border ${
                        ex.isCurrent
                          ? "bg-black border-black"
                          : "bg-gray-200 border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${ex.isCurrent ? "bg-white" : "bg-gray-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[9px] md:text-[10px] leading-tight tracking-tight line-clamp-1">
                        {ex.title}
                      </p>
                      <p className="text-[8px] md:text-[9px] mt-0.5 font-medium text-gray-400">
                        {ex.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 bg-white border-t border-gray-100 px-3 pt-2 pb-3 hidden lg:block">
              <div className="bg-[#6202AC] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg inline-block w-fit">
                ELITE
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SECTION 3: Sticky Timer Bar */}
      <footer className="shrink-0 bg-white border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-[1440px] mx-auto px-2 py-1.5 flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition shrink-0"
          >
            {isRunning ? (
              <Pause size={14} fill="#1a1c1e" />
            ) : (
              <Play size={14} fill="#1a1c1e" className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 relative h-7 md:h-8 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center px-2 justify-between text-[11px] font-bold z-10">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-500" />
                <span className="tabular-nums text-xs md:text-sm">00:45</span>
                <span className="text-[7px] hidden sm:inline text-emerald-600 font-black tracking-widest ml-1 uppercase">
                  ACTIVE
                </span>
              </div>
              <button className="text-purple-600 font-black text-[9px] tracking-widest hover:underline uppercase">
                Skip
              </button>
            </div>
          </div>

          <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-400 hover:text-purple-600 transition shrink-0">
            <SkipForward size={16} />
          </button>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
