"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, CheckCircle2, X } from "lucide-react";
import { getWorkoutSectionFull, getWorkoutLoads, getWorkoutLoadRecords, completeActivity, getPendingActivities, WorkoutLoadSummary, WorkoutLoadRecord } from "@/api/workouts/route";
import { getProgramGroupedWorkouts, WorkoutGroup } from "@/api/programs/route";

export default function WorkoutSummaryPage() {
  const router = useRouter();

  const [loads, setLoads] = useState<WorkoutLoadSummary>({ load: 0, power: 0, kcal: 0 });
  const [sections, setSections] = useState<WorkoutGroup[]>([]);
  const [sectionExercises, setSectionExercises] = useState<Record<string, { name: string; supplemental: string; demo_gif: string; title: string }[]>>({});
  const [sectionCovers, setSectionCovers] = useState<Record<string, string>>({});
  const [sectionLoads, setSectionLoads] = useState<Record<string, WorkoutLoadSummary>>({});
  const [allLoadRecords, setAllLoadRecords] = useState<WorkoutLoadRecord[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showNowWhat, setShowNowWhat] = useState(false);
  const [showNextSlide, setShowNextSlide] = useState(false);
  const [showSupplementals, setShowSupplementals] = useState(false);
  const [showProgressPhoto, setShowProgressPhoto] = useState(false);
  const [showNextWorkout, setShowNextWorkout] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [pendingActivities, setPendingActivities] = useState<{ id: number; label: string }[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("summarySessionId") || "" : "";
  const workoutCode = typeof window !== "undefined" ? localStorage.getItem("summaryWorkoutCode") || "" : "";
  const workoutTitle = typeof window !== "undefined" ? localStorage.getItem("workoutTitle") || "" : "";
  const workoutType = typeof window !== "undefined" ? localStorage.getItem("workoutType") || "Workout" : "Workout";

  useEffect(() => {
    const init = async () => {
      try {
        const [loadsData, rawRecords, groups, pendingActivities] = await Promise.all([
          getWorkoutLoads(sessionId),
          getWorkoutLoadRecords(sessionId),
          getProgramGroupedWorkouts(workoutCode),
          getPendingActivities({ type: workoutType, workoutName: workoutTitle }),
        ]);
        console.log("[workoutSummary] raw load records:", rawRecords);
        setAllLoadRecords(rawRecords);
        if (pendingActivities.length > 0) {
          setPendingActivities(
            pendingActivities.map((a) => ({
              id: a.id,
              label: [a.workoutTitle || a.name, a.day && a.time ? `${a.day} at ${a.time}` : a.day || a.time]
                .filter(Boolean)
                .join(" - ") || `Workout #${a.id}`,
            }))
          );
        }
        setLoads(loadsData);

        const getRoundNum = (label: string) => {
          const m = label.match(/^ROUND\s+(\d+)/i);
          return m ? parseInt(m[1], 10) : Infinity;
        };
        const sorted = [...groups].sort((a, b) => getRoundNum(a.label) - getRoundNum(b.label));
        setSections(sorted);

        const exerciseMap: Record<string, { name: string; supplemental: string; demo_gif: string; title: string }[]> = {};
        await Promise.all(
          sorted.map(async (group) => {
            try {
              const full = await getWorkoutSectionFull({
                sessionId,
                programCode: workoutCode,
                section: group.label,
              });
              const exercises = full.exercises || full.workouts || [];
              // Update isCompleted on the section
              if (full.isCompleted !== undefined) {
                setSections((prev) =>
                  prev.map((s) => s.label === group.label ? { ...s, isCompleted: full.isCompleted } : s)
                );
              }
              exerciseMap[group.label] = exercises.map((ex) => ({
                name: ex.exercise_name,
                supplemental: ex.supplemental || "",
                demo_gif: ex.demo_gif || ex.demoGif || "",
                title: ex.title || "",
              }));
              if (exercises[0]?.demo_gif || exercises[0]?.demoGif) {
                setSectionCovers((prev) => ({
                  ...prev,
                  [group.label]: exercises[0].demo_gif || exercises[0].demoGif,
                }));
              }
            } catch {
              exerciseMap[group.label] = [];
            }
          })
        );
        setSectionExercises(exerciseMap);

        // Compute per-section L/P/C by matching load record titles to section exercise titles
        const loadsBySection: Record<string, WorkoutLoadSummary> = {};
        for (const [label, exList] of Object.entries(exerciseMap)) {
          const titles = new Set(exList.map((e) => e.title).filter((t): t is string => !!t));
          const matching = rawRecords.filter((r) => r.title !== undefined && titles.has(r.title));
          loadsBySection[label] = matching.reduce(
            (acc, r) => ({
              load: acc.load + (Number(r.load) || 0),
              power: acc.power + (Number(r.power) || 0),
              kcal: acc.kcal + (Number(r.kcal) || 0),
            }),
            { load: 0, power: 0, kcal: 0 }
          );
        }
        setSectionLoads(loadsBySection);
      } catch (err) {
        console.error("[workoutSummary] init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const handleComplete = async (activityId?: number | null) => {
    setCompleting(true);
    setShowCompletionModal(false);
    try {
      await completeActivity({
        sessionId,
        workoutLibraryId: workoutCode.toUpperCase(),
        workoutName: workoutTitle,
        customActivityId: activityId ?? undefined,
      });
      setShowCongrats(true);
    } catch (err) {
      console.error("[workoutSummary] complete error:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header image area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">Summary</p>
          <h1 className="text-[22px] font-black uppercase">{workoutTitle || "WORKOUT SUMMARY"}</h1>
        </div>
      </div>

      {/* Load / Power / Cal */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-around">
        {[
          { label: "Load", value: loads.load, color: "text-[#7c3aed]" },
          { label: "Power", value: loads.power, color: "text-[#7c3aed]" },
          { label: "Cal", value: loads.kcal, color: "text-[#7c3aed]" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className={`text-[13px] font-black ${stat.color}`}>{stat.label}:</span>
            <span className="text-[13px] font-black text-gray-800 ml-1">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="px-5 pt-6 pb-2">
        <h2 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">WORKOUT SUMMARY</h2>
      </div>

      {/* Sections */}
      <div className="flex-1 px-4 pb-32 space-y-3 overflow-y-auto">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.label);
          const exercises = sectionExercises[section.label] || [];

          return (
            <div key={section.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center px-4 py-4 gap-2">
                {/* Left: navigates to that round in athenaWorkout */}
                <button
                  onClick={() => {
                    localStorage.setItem("sessionActive", "true");
                    router.push(`/workout/athenaWorkout?section=${encodeURIComponent(section.label)}`);
                  }}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {sectionCovers[section.label] ? (
                      <img src={sectionCovers[section.label]} alt={section.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {section.isCompleted && (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-[14px] font-black text-gray-900">{section.label}</span>
                      <span className="text-[11px] text-gray-400">{section.rounds}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      L: {sectionLoads[section.label]?.load ?? 0} • P: {sectionLoads[section.label]?.power ?? 0} • C: {sectionLoads[section.label]?.kcal ?? 0}
                    </p>
                  </div>
                </button>

                {/* Right: toggles accordion */}
                <button onClick={() => toggleSection(section.label)} className="p-1">
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-blue-500" />
                  ) : (
                    <ChevronDown size={18} className="text-blue-500" />
                  )}
                </button>
              </div>

              {isExpanded && exercises.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 mb-2">Exercises</p>
                  <div className="space-y-2">
                    {exercises.map((ex, i) => (
                      <div key={i}>
                        <p className="text-[13px] font-black text-gray-800">• {ex.name}</p>
                        {ex.supplemental && (
                          <p className="text-[11px] text-gray-400 ml-3">was {ex.supplemental}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={() => setShowCompletionModal(true)}
          disabled={completing}
          className="w-full bg-[#0099FF] hover:bg-[#007dd4] text-white font-black py-4 rounded-2xl text-[16px] uppercase tracking-widest transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {completing ? <Loader2 size={18} className="animate-spin" /> : null}
          Complete Workout
        </button>
      </div>

      {/* Congrats Overlay */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            {/* Purple header */}
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button
                  onClick={() => router.push("/workout/main")}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-8 flex flex-col items-center gap-3">
              {/* Badge icon */}
              <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center shadow-lg shadow-amber-200">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-2xl">🎖</span>
                </div>
              </div>

              <p className="text-[22px] font-black text-[#111] tracking-wide">CONGRATS!</p>
              <p className="text-sm text-gray-400">you&apos;ve completed</p>

              <p className="text-[18px] font-black text-[#8B5CF6] italic uppercase text-center">
                {workoutTitle || "WORKOUT"}
              </p>

              <p className="text-xs text-gray-500 font-semibold">Week 3 | Day 1</p>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-4 flex flex-col gap-3">
              <button
                onClick={() => router.push("/workout/viewWorkoutSession")}
                className="w-full h-12 rounded-2xl bg-[#1a1a1a] text-white text-sm font-bold hover:bg-black transition"
              >
                View Results
              </button>
              <button
                className="w-full h-12 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <span className="text-base">↗</span> Share Workout
              </button>
            </div>
            <div className="flex justify-center pb-5">
              <button
                onClick={() => { setShowCongrats(false); setShowNowWhat(true); }}
                className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOW WHAT modal */}
      {showNowWhat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            {/* Purple header */}
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-8 pb-4 flex flex-col items-center gap-1">
              <p className="text-[26px] font-black text-[#111] tracking-wide">NOW WHAT...</p>
              <p className="text-sm text-gray-400 mb-6">Training results:</p>

              {/* Stats */}
              <div className="flex items-center gap-3 w-full justify-center mb-6">
                {[
                  { label: "Power", value: loads.power, bg: "bg-[#8B5CF6]" },
                  { label: "Load",  value: loads.load,  bg: "bg-[#EF4444]" },
                  { label: "Kcal",  value: loads.kcal,  bg: "bg-[#10B981]" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-[22px] font-black">{s.value}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Submit Player Card */}
              <button
                onClick={() => router.push("/player-cards/upload")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3b1473] transition"
              >
                <span className="text-base">👤</span> Submit Player Card
              </button>
              <p className="text-[11px] text-[#3B82F6] font-semibold mt-2">Earn 2x points (limited once per week)</p>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowNowWhat(false); setShowCongrats(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 1 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNowWhat(false); setShowNextSlide(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next slide */}
      {showNextSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            {/* Purple header */}
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-8 pb-4 flex flex-col items-center gap-4">
              <p className="text-[22px] font-black text-[#111]">TRACK IT</p>
              <p className="text-sm text-gray-400">What would you like to do next?</p>

              <button
                disabled
                className="w-full h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                📊 Log
              </button>
              <button
                disabled
                className="w-full h-12 rounded-2xl bg-[#3B82F6] text-white text-sm font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                📈 Visualise
              </button>
              <p className="text-[10px] text-gray-400 text-center">These features are coming soon</p>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowNextSlide(false); setShowNowWhat(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 2 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNextSlide(false); setShowSupplementals(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplementals slide */}
      {showSupplementals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">Suggested Supplementals</p>

              <div className="w-full border border-gray-100 rounded-2xl p-4 flex flex-col items-center relative shadow-sm">
                <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <span className="text-3xl">🧘</span>
                </div>
                <p className="text-[14px] font-black text-[#111] uppercase tracking-tight text-center">KIN-STRETCH SERIES</p>
                <p className="text-[12px] text-[#8B5CF6] font-semibold mt-1">Click to begin</p>
              </div>

              <button
                onClick={() => router.push("/workout/main?tab=Supplemental")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold hover:bg-[#3b1473] transition"
              >
                View your Supplementals
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowSupplementals(false); setShowNextSlide(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 3 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowSupplementals(false); setShowProgressPhoto(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Photo slide */}
      {showProgressPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">Take a new progress photo:</p>

              <div className="flex gap-4 w-full justify-center">
                {/* Compare */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">🏃</span>
                  </div>
                  <p className="text-[13px] font-semibold text-gray-700">Compare</p>
                </div>
                {/* Recent */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-28 h-28 rounded-2xl bg-[#8B5CF6] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-[#8B5CF6]">Recent</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">Last update: -</p>

              <button
                onClick={() => router.push("/player-progress")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold hover:bg-[#3b1473] transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                View/Share Profile Image
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowProgressPhoto(false); setShowSupplementals(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 4 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowProgressPhoto(false); setShowNextWorkout(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Workout slide */}
      {showNextWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">View the next workout:</p>

              {/* Next workout card */}
              <div className="w-full rounded-2xl bg-[#3D3D5C] px-6 py-6 flex flex-col items-center gap-1 text-white">
                <p className="text-[12px] font-medium opacity-70">
                  {workoutTitle ? "Week 2" : "Week 2"}
                </p>
                <p className="text-[20px] font-black uppercase tracking-tight text-center">
                  {workoutCode?.toUpperCase() || "RECONDITIONING"}
                </p>
                <p className="text-[12px] opacity-70 text-center mt-1">Back, Glutes, Arms</p>
              </div>

              <button
                onClick={() => router.push("/workout/main")}
                className="w-full h-12 rounded-2xl bg-[#6D28D9] text-white text-sm font-bold hover:bg-[#5b21b6] transition"
              >
                View All Workouts
              </button>
              <button
                onClick={() => router.push("/itinerary/itinerary-page")}
                className="w-full h-12 rounded-2xl border-2 border-[#6D28D9] text-[#6D28D9] text-sm font-bold hover:bg-purple-50 transition"
              >
                Go to Itinerary
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowNextWorkout(false); setShowProgressPhoto(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 4 ? "w-5 bg-[#6D28D9]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNextWorkout(false); setShowRecovery(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Zone slide */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <button onClick={() => router.push("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-5">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-3">Recovery Zone:</p>

              {/* Recovery options */}
              <div className="flex items-start justify-center gap-6 w-full">
                {[
                  { emoji: "💡", label: "Red-Light", sub: "Therapy", bg: "bg-red-400" },
                  { emoji: "🤿", label: "HBOT", sub: "(Hyperbaric\nOxygen)", bg: "bg-[#0EA5E9]", active: true },
                  { emoji: "😷", label: "Red-Light", sub: "Mask", bg: "bg-red-400" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center shadow-md ${item.active ? "ring-4 ring-[#0EA5E9]/30" : ""}`}>
                      <span className="text-2xl">{item.emoji}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-gray-700 text-center">{item.label}</p>
                    <p className={`text-[10px] text-center leading-tight whitespace-pre-line ${item.active ? "text-[#0EA5E9]" : "text-gray-400"}`}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/recovery/recovery-dashboard")}
                className="w-full h-12 rounded-2xl bg-[#6D28D9] text-white text-sm font-bold hover:bg-[#5b21b6] transition"
              >
                View All Recovery
              </button>
              <p className="text-[11px] text-[#6D28D9] font-semibold -mt-2">Earn 20 PF Bonus Pts (through March 15)</p>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowRecovery(false); setShowNextWorkout(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 5 ? "w-5 bg-[#6D28D9]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => router.push("/workout/main")}
                className="text-sm font-bold text-[#6D28D9] hover:text-purple-800 transition flex items-center gap-1 font-bold"
              >
                Done <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[17px] font-black text-[#111]">Workout Completion</h2>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Choose how you want to save your completed Workout Session on your itinerary page
              </p>

              {pendingActivities.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[12px] text-gray-500">
                    Get credit towards one of your scheduled workouts{" "}
                    <span className="font-bold text-[#111]">(Choose One)</span>:
                  </p>

                  <div className="flex flex-col gap-2">
                    {pendingActivities.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                            selectedActivityId === a.id
                              ? "border-[#8B5CF6]"
                              : "border-gray-300"
                          }`}
                          onClick={() => setSelectedActivityId(a.id)}
                        >
                          {selectedActivityId === a.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                          )}
                        </div>
                        <span className="text-[13px] font-bold text-[#111] uppercase">{a.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => handleComplete(selectedActivityId)}
                    disabled={selectedActivityId === null || completing}
                    className="w-full h-12 rounded-2xl bg-gray-200 text-gray-500 text-sm font-bold transition disabled:cursor-not-allowed enabled:bg-[#8B5CF6] enabled:text-white enabled:hover:bg-[#7C3AED]"
                  >
                    Save Workout
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-[12px] text-gray-500 text-center leading-relaxed">
                Save as a new Workout session, which will not affect your Workout Completion this week:
              </p>

              <button
                onClick={() => handleComplete(null)}
                disabled={completing}
                className="w-full h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#7C3AED] transition disabled:opacity-50"
              >
                Create a New One
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
