"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, DollarSign, Loader2, Plus } from "lucide-react";
import { getPowerSetDetails, PowerSetDetail, createTrackingLog, createPowerSetLog } from "@/api/workouts/route";
import { dashboardApi, UserOtherDetail } from "@/api/dashboard/route";

function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url.replace("wix:image://v1/", "").split("#")[0].split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

interface SetData {
  weight: string;
  reps: string;
  unableToPerform: boolean;
  submitted: boolean;
  isUserAdded?: boolean;
  isMoneySet?: boolean;
}

function DollarSetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const specializedWorkoutId = searchParams.get("specializedWorkoutId");
  const sessionId = searchParams.get("sessionId");

  const [powerSet, setPowerSet] = useState<PowerSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<SetData[]>([]);
  const [savingIndexes, setSavingIndexes] = useState<Set<number>>(new Set());
  const [userOtherDetail, setUserOtherDetail] = useState<UserOtherDetail | null>(null);

  useEffect(() => {
    dashboardApi.getDashboardData()
      .then((res) => setUserOtherDetail(res.user.OtherDetail))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!specializedWorkoutId) { setLoading(false); return; }
    getPowerSetDetails({ specializedWorkoutId, sessionId })
      .then((data) => {
        setPowerSet(data);
        setSets(
          (data.sets || []).map((s) => ({
            weight: s.weight || "",
            reps: s.reps || "",
            unableToPerform: s.unableToPerform || false,
            submitted: s.recorded || false,
          }))
        );
      })
      .catch((err) => console.error("[dollarSet] fetch error:", err))
      .finally(() => setLoading(false));
  }, [specializedWorkoutId, sessionId]);

  const updateSet = (idx: number, field: keyof SetData, value: string | boolean) =>
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const submitSet = async (idx: number) => {
    const set = sets[idx];
    if (set.submitted || savingIndexes.has(idx)) return;
    const apiSet = powerSet?.sets?.[idx] as (PowerSetDetail["sets"][number] & {
      min_reps?: number | null;
      power_id?: string;
    }) | undefined;

    const weightNum = set.unableToPerform ? 0 : parseFloat(set.weight) || 0;
    const repsNum = set.unableToPerform ? 0 : parseInt(set.reps, 10) || 0;
    const exerciseId = powerSet?.exercise?.exercise_uuid;
    const workoutCode = localStorage.getItem("workoutProgramCode") || "";

    setSavingIndexes((prev) => new Set(prev).add(idx));
    try {
      const bw = parseFloat(String(userOtherDetail?.currentWeight ?? 0)) || 0;
      const bh = parseFloat(String(userOtherDetail?.height ?? 0)) || 0;
      const E = parseInt(String((powerSet?.workout as unknown as Record<string, unknown>)?.loadMeter ?? 3)) || 3;
      const e = parseFloat(String((powerSet?.workout as unknown as Record<string, unknown>)?.rep_variant ?? 1)) || 1;
      const wt = weightNum * 2.20462;
      const computedLoad = Math.ceil((bw * bh + E * repsNum * e * wt) / 2600);

      const trackingResponse = await createTrackingLog({
        title: `Set ${idx + 1}`,
        exerciseId: exerciseId || "",
        sessionId: sessionId || "",
        workoutLibraryId: workoutCode,
        weight: weightNum,
        repetitions: repsNum,
        status: true,
        tag: "/e",
        load: computedLoad,
        specializedWorkoutId: specializedWorkoutId || undefined,
      });
      const trackingLogId = (trackingResponse as unknown as { id?: string; trackingLog?: { id?: string } })?.trackingLog?.id
        ?? (trackingResponse as unknown as { id?: string })?.id;

      const isMoneySet = (apiSet?.min_reps !== undefined && apiSet?.min_reps !== null) || (set.isUserAdded && set.isMoneySet);
      if (isMoneySet) {
        await createPowerSetLog({
          new_weight: weightNum,
          reps: repsNum,
          unable_to_perform: set.unableToPerform,
          power_id: apiSet?.power_id,
          specialized_workout_id: specializedWorkoutId || undefined,
          individual_exercise_id: exerciseId,
          session_id: sessionId || undefined,
          weight_adj: powerSet?.workout?.weight_adj,
          tracking_log: trackingLogId,
          old_weight: parseFloat(apiSet?.suggestedWeight || "0") || 0,
          old_reps: apiSet?.min_reps ?? (parseInt(apiSet?.suggestedReps || "0", 10) || 0),
        });
      }

      updateSet(idx, "submitted", true);
    } catch (err) {
      console.error("[dollarSet] Failed to save set:", err);
    } finally {
      setSavingIndexes((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const addSet = () =>
    setSets((prev) => [
      ...prev,
      { weight: "", reps: "", unableToPerform: false, submitted: false, isUserAdded: true, isMoneySet: false },
    ]);

  const exerciseName = powerSet?.exercise?.name || "Power Set";
  const gifUrl = resolveWixImage(powerSet?.exercise?.demoGif);
  const unit = powerSet?.unit || "kg";
  const suggestedReps = powerSet?.suggestedReps || "";
  const suggestedWeight = powerSet?.suggestedWeight || "";

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row font-sans bg-gray-100 lg:overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-[220px] lg:h-full bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] shrink-0 flex flex-col">

        {/* Mobile: compact top bar */}
        <div className="flex lg:hidden items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-black leading-tight truncate">
              Complete the <span className="text-green-400">$</span> Set
            </p>
            <p className="text-white/70 text-[10px] font-semibold uppercase truncate">
              {loading ? "Loading..." : exerciseName}
            </p>
          </div>
        </div>

        {/* Mobile: suggested strip */}
        {(suggestedReps || suggestedWeight) && (
          <div className="flex lg:hidden items-center gap-3 px-4 pb-3">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
              <p className="text-yellow-300 text-[10px] font-black">
                Suggested:{" "}
                <span className="text-white font-normal">
                  {suggestedReps} reps · {suggestedWeight}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Desktop: full sidebar */}
        <div className="hidden lg:flex flex-col flex-1 p-4 overflow-hidden">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition mb-5"
          >
            <ChevronLeft size={18} />
          </button>

          <h2 className="text-white text-[15px] font-black leading-snug mb-4">
            Complete the <span className="text-green-400">$</span> Set:
          </h2>

          <div className="w-full aspect-square bg-purple-400/40 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            {gifUrl ? (
              <img src={gifUrl} alt={exerciseName} className="w-full h-full object-contain" />
            ) : (
              <div className="w-14 h-14 bg-purple-300/60 rounded-full flex items-center justify-center">
                <div className="w-7 h-7 bg-white/40 rounded-full" />
              </div>
            )}
          </div>

          <p className="text-white text-[11px] font-black uppercase leading-tight mb-3">
            {loading ? "Loading..." : exerciseName}
          </p>

          {(suggestedReps || suggestedWeight) && (
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <p className="text-yellow-300 text-[11px] font-black mb-1.5">Suggested:</p>
              <p className="text-white text-[10px] leading-relaxed">
                Reps: {suggestedReps}<br />Weight: {suggestedWeight}
              </p>
            </div>
          )}

          <p className="text-white/70 text-[10px] leading-relaxed mt-auto">
            Are you making your <span className="text-green-400 font-bold">$</span> set the same weight for this and the next round?
          </p>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 flex flex-col lg:h-full lg:overflow-hidden p-4 lg:p-6 gap-4">

        <div className="shrink-0">
          <h1 className="text-[20px] lg:text-[22px] font-black text-gray-900 mb-1">
            Input Your Sets
          </h1>
          <p className="text-[12px] text-gray-500">
            Any sets marked with{" "}
            <span className="text-green-500 font-bold">$</span>{" "}
            must be completed to move onto the next round.
          </p>
        </div>

        <div className="flex-1 lg:overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-purple-500" />
            </div>
          ) : sets.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-400 text-sm">No set data available.</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              {sets.map((set, idx) => {
                const apiSet = powerSet?.sets?.[idx];
                const isDollarSet = idx === sets.length - 1;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-black text-gray-800">Set {idx + 1}</p>
                      {isDollarSet && (
                        <DollarSign size={16} className="text-green-500" strokeWidth={2.5} />
                      )}
                    </div>

                    {apiSet && (
                      <p className="text-[10px] text-gray-400 mb-2">
                        Suggested: {apiSet.suggestedReps} reps
                        {apiSet.suggestedWeight ? ` · ${apiSet.suggestedWeight} ${unit}` : ""}
                      </p>
                    )}

                    {set.isUserAdded && (
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={set.isMoneySet || false}
                          onChange={(e) => updateSet(idx, "isMoneySet", e.target.checked)}
                          className="w-4 h-4 accent-green-500 rounded"
                        />
                        <span className="text-[12px] font-semibold text-green-600">Mark as money set</span>
                      </label>
                    )}

                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={set.unableToPerform}
                        onChange={(e) => updateSet(idx, "unableToPerform", e.target.checked)}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                      <span className="text-[12px] text-gray-500">Unable to perform</span>
                    </label>

                    <div className="flex gap-3 mb-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-gray-400 mb-1">Weight / {unit}</p>
                        <input
                          type="number"
                          placeholder="Weight"
                          value={set.weight}
                          disabled={set.unableToPerform || set.submitted}
                          onChange={(e) => updateSet(idx, "weight", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-gray-400 mb-1">Reps</p>
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          disabled={set.unableToPerform || set.submitted}
                          onChange={(e) => updateSet(idx, "reps", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-300"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => submitSet(idx)}
                      disabled={set.submitted || savingIndexes.has(idx)}
                      className={`w-full py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${
                        set.submitted
                          ? "bg-green-500 text-white cursor-default"
                          : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white disabled:opacity-60"
                      }`}
                    >
                      {set.submitted ? "Submitted ✓" : savingIndexes.has(idx) ? (
                        <><Loader2 size={13} className="animate-spin" /> Saving...</>
                      ) : "Submit"}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addSet}
              className="w-full border-2 border-dashed border-purple-300 rounded-2xl py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-purple-500 hover:bg-purple-50 transition mb-4"
            >
              <Plus size={16} />
              Add Set
            </button>
            </>
          )}
        </div>

        <div className="shrink-0 pb-4 lg:pb-0">
          <button
            onClick={() => router.back()}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-2xl text-[14px] transition shadow-md"
          >
            Return to workout
          </button>
        </div>
      </main>
    </div>
  );
}

export default function DollarSetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-purple-500" />
      </div>
    }>
      <DollarSetContent />
    </Suspense>
  );
}
