"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, ChevronDown, ChevronUp, Loader2, Trash2, Pencil, MapPin, Search } from "lucide-react";
import {
  SectionExercise,
  SuggestedExercise,
  getSuggestedExercises,
  saveExerciseSwap,
  SaveSwapPayload,
} from "@/api/workouts/route";

function resolveMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("wix:image://")) {
    const hash = url.replace("wix:image://v1/", "").split("/")[0];
    return `https://static.wixstatic.com/media/${hash}`;
  }
  return url;
}

type Step = "suggest" | "preview" | "review";

interface Props {
  exercise: SectionExercise;
  sessionId: string | null;
  locationId: string | null;
  locationName: string;
  section: string;
  sectionExercises: SectionExercise[];
  onClose: () => void;
  onSwapSaved: () => void;
}

export default function SwapExerciseModal({
  exercise,
  sessionId,
  locationId,
  locationName,
  section,
  sectionExercises,
  onClose,
  onSwapSaved,
}: Props) {
  const [step, setStep] = useState<Step>("suggest");
  const [suggestions, setSuggestions] = useState<SuggestedExercise[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [selected, setSelected] = useState<SuggestedExercise | null>(null);
  const [customSets, setCustomSets] = useState("1");
  const [customReps, setCustomReps] = useState("10");
  const [customWeight, setCustomWeight] = useState("0");
  const [scopeOpen, setScopeOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const exerciseId = exercise.exercise_uuid || exercise.exercise_id;
  const existingIds = sectionExercises.map((e) => e.exercise_uuid || e.exercise_id).filter(Boolean);

  useEffect(() => {
    const fetch = async () => {
      setLoadingSuggestions(true);
      try {
        const results = await getSuggestedExercises({ exerciseId, sessionId, section, existingExercises: existingIds });
        setSuggestions(results);
      } catch (err) {
        console.error("[swap] suggestions error:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetch();
  }, [exerciseId]);

  const handleSelect = (s: SuggestedExercise) => {
    setSelected(s);
    setCustomSets(s.sets || "1");
    setCustomReps(s.defaultReps?.split("-").pop()?.replace(/\D/g, "") || "10");
    setCustomWeight(s.weight || "0");
    setStep("preview");
  };

  const handleSave = async (scope: "session" | "location" | "all") => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: SaveSwapPayload = {
        exerciseId,
        swapExerciseId: selected.exercise_uuid || selected.exercise_id,
        specializedWorkoutId: exercise.id,
        title: selected.name,
        sets: customSets,
        reps: customReps,
        weight: parseFloat(customWeight) || 0,
        weightAdj: "kg",
      };
      if (scope === "all") payload.allLocations = true;
      else if (scope === "location" && locationId) payload.oneLocation = locationId;
      else if (sessionId) payload.sessionId = sessionId;
      console.log("[swap] saving payload:", payload);
      const result = await saveExerciseSwap(payload);
      console.log("[swap] save success:", result);
      onSwapSaved();
    } catch (err) {
      console.error("[swap] save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const originalName = exercise.original_exercise_name || exercise.exercise_name;
  const originalGif = resolveMedia(exercise.original_demo_gif || exercise.demo_gif || exercise.demoGif);
  const currentName = step !== "suggest" && selected ? selected.name : (exercise.exercise_name || exercise.title);
  const currentGif = step !== "suggest" && selected
    ? resolveMedia(selected.demoGif || selected.demo_gif)
    : resolveMedia(exercise.demo_gif || exercise.demoGif);
  const currentLabel = step !== "suggest" && selected
    ? `${customSets}x ${customReps} ${customWeight}kg`
    : `${exercise.sets || "1"}x ${exercise.reps} ${exercise.weight ? `${exercise.weight}kg` : "0kg"}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <MapPin size={14} />
            <span>Location: {locationName}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-3 text-center">
          <h2 className="text-[22px] font-black text-purple-600">Swap Exercise</h2>
          <p className="text-[13px] text-gray-400">Swap this exercise for another</p>
        </div>

        {/* Comparison row */}
        <div className="px-5 pb-4 flex items-stretch gap-2">
          {/* Left — original */}
          <div className="flex-1 border border-gray-200 rounded-2xl p-3 bg-white flex flex-col">
            <p className="text-[10px] font-black text-gray-700 uppercase text-center leading-tight mb-2">{originalName}</p>
            <div className="flex-1 flex items-center justify-center h-16">
              {originalGif ? (
                <img src={originalGif} alt={originalName} className="h-full max-h-16 object-contain" />
              ) : (
                <GreenDiamond />
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              {exercise.sets || "1"}x {exercise.reps} {exercise.weight ? `${exercise.weight}kg` : ""}
            </p>
          </div>

          {/* Center icon */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
              <RotateCcw size={14} className="text-gray-400" />
            </div>
          </div>

          {/* Right — current / selected */}
          <div className="flex-1 border-2 border-blue-400 rounded-2xl p-3 bg-white flex flex-col relative">
            {step === "review" && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setStep("suggest")} className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 size={10} className="text-red-400" />
                </button>
                <button onClick={() => setStep("preview")} className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <Pencil size={10} className="text-blue-400" />
                </button>
              </div>
            )}
            <p className="text-[10px] font-black text-gray-700 uppercase text-center leading-tight mb-2 pr-14">{currentName}</p>
            <div className="flex-1 flex items-center justify-center h-16">
              {currentGif ? (
                <img src={currentGif} alt={currentName} className="h-full max-h-16 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">{currentLabel}</p>
          </div>
        </div>

        {/* Step: suggest */}
        {step === "suggest" && (
          <div className="px-5 pb-6 space-y-4">
            <p className="text-[15px] font-black text-gray-900">Suggested:</p>
            {loadingSuggestions ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-purple-400" />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                  <button
                    key={s.exercise_id || s.exercise_uuid}
                    onClick={() => handleSelect(s)}
                    className="flex-shrink-0 w-[120px] border border-gray-200 rounded-2xl p-3 text-left hover:border-purple-300 hover:bg-purple-50 transition"
                  >
                    <p className="text-[10px] font-black text-gray-800 uppercase leading-tight mb-2">{s.name}</p>
                    <div className="h-14 flex items-center justify-center mb-1">
                      {resolveMedia(s.demoGif || s.demo_gif) ? (
                        <img src={resolveMedia(s.demoGif || s.demo_gif)!} alt={s.name} className="h-full object-contain" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 text-center">
                      {s.sets || "1"}x {s.defaultReps?.split("-").pop()?.replace(/\D/g, "") || "—"} {s.weight ? `${s.weight}kg` : ""}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-gray-400 text-center py-6">No suggestions available</p>
            )}

            <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl text-[13px] flex items-center justify-center gap-2 hover:bg-purple-700 transition">
              <Search size={15} /> Search Exercises
            </button>
            <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl text-[13px] hover:bg-purple-700 transition">
              Edit Location
            </button>
          </div>
        )}

        {/* Step: preview */}
        {step === "preview" && selected && (
          <div className="px-5 pb-6">
            <div className="border-2 border-blue-300 rounded-2xl p-4 relative">
              <button onClick={() => setStep("suggest")} className="absolute top-3 right-3">
                <X size={18} className="text-red-400" />
              </button>
              <p className="text-[15px] font-black text-gray-900 uppercase text-center mb-3">{selected.name}</p>
              <div className="h-36 flex items-center justify-center mb-4">
                {resolveMedia(selected.demoGif || selected.demo_gif) ? (
                  <img src={resolveMedia(selected.demoGif || selected.demo_gif)!} alt={selected.name} className="h-full object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full" />
                )}
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[15px] font-bold text-gray-700">{customSets}x</span>
                <input
                  type="number"
                  value={customReps}
                  onChange={(e) => setCustomReps(e.target.value)}
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-[15px] font-bold text-center outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-[15px] font-bold text-center outline-none focus:border-blue-400"
                />
                <span className="text-[15px] font-bold text-gray-700">kg</span>
              </div>
              <button
                onClick={() => setStep("review")}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-3 rounded-2xl text-[13px] transition"
              >
                Save & Preview
              </button>
            </div>
          </div>
        )}

        {/* Step: review */}
        {step === "review" && (
          <div className="px-5 pb-6 space-y-3">
            <p className="text-[15px] font-black text-gray-900">Review Swap:</p>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setScopeOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] text-gray-500 hover:bg-gray-50 transition"
              >
                <span>Select Option</span>
                {scopeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {scopeOpen && (
                <>
                  {[
                    { label: "Swap for this workout", scope: "session" as const },
                    { label: "Swap for this location", scope: "location" as const, disabled: !locationId },
                    { label: "Swap for all Location", scope: "all" as const },
                  ].map(({ label, scope, disabled }) => (
                    <button
                      key={scope}
                      onClick={() => !disabled && handleSave(scope)}
                      disabled={saving || disabled}
                      className="w-full text-left px-4 py-3.5 text-[13px] text-gray-700 hover:bg-gray-50 transition border-t border-gray-100 disabled:opacity-40 flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                      {label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GreenDiamond() {
  return (
    <svg viewBox="0 0 24 24" fill="#22c55e" className="w-8 h-8">
      <path d="M12 2L2 9l10 13L22 9z" />
    </svg>
  );
}
