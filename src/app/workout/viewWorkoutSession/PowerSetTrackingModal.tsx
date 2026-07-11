"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  X, Plus, Pencil, Loader2, CheckCircle2, Dumbbell,
} from "lucide-react";
import {
  getTrackingLogs,
  createTrackingLog,
  createPowerSetLog,
  getPowerSetLogs,
  getPowerSetDetails,
} from "@/api/workouts/route";
import { UserOtherDetail } from "@/api/dashboard/route";
import { convertToUserUnit } from "@/lib/units";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VelocitySet = {
  weight: string;
  reps: string;
  unit: string;
  recorded: boolean;
  load?: number;
  unableToPerform?: boolean;
  suggestedWeight?: string;
  suggestedReps?: string;
  pwrst_wt?: number;
  weight_adjust?: string;
  min_reps?: number | null;
  power_id?: string;
  isCustom?: boolean;
};

type Props = {
  exercise: any;
  sets: VelocitySet[];
  sessionId?: string;
  workoutLibraryId?: string;
  userOtherDetail?: UserOtherDetail | null;
  onClose: () => void;
  onAddSet: () => void;
  onUpdateSet: (index: number, field: string, value: any) => void;
  onToggleRecordSet: (index: number) => void;
  onSetSets?: (sets: VelocitySet[]) => void;
  onSave?: (sets: VelocitySet[]) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanReps(v: string | number | null | undefined): string {
  if (v == null) return "";
  const str = String(v).trim();
  return (str.split("-").pop()?.trim() ?? "").replace(/\D/g, "");
}

function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url.replace("wix:image://v1/", "").split("#")[0].split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

function getLiftMax(weightAdjStr: string, detail: UserOtherDetail | null | undefined): number {
  if (!weightAdjStr || !detail) return 0;
  const n = weightAdjStr.toLowerCase();
  let raw = 0;
  if (n.includes("squat"))    raw = parseFloat(String(detail.r_back_squat ?? 0)) || 0;
  else if (n.includes("deadlift")) raw = parseFloat(String(detail.r_deadlift ?? 0)) || 0;
  else if (n.includes("bench"))    raw = parseFloat(String(detail.r_bench_press ?? 0)) || 0;
  else if (n.includes("clean"))    raw = parseFloat(String(detail.r_power_clean ?? 0)) || 0;
  else if (n.includes("bodyweight") || n.includes("body weight"))
    raw = parseFloat(String((detail as any).current_weight ?? (detail as any).currentWeight ?? 0)) || 0;
  return raw;
}

function getLiftCategoryLabel(weightAdjStr: string): string | null {
  if (!weightAdjStr) return null;
  const n = weightAdjStr.toLowerCase().trim();
  if (n.includes("squat")) return "Squat";
  if (n.includes("deadlift")) return "Deadlift";
  if (n.includes("bench")) return "Bench";
  if (n.includes("clean")) return "Clean";
  return null;
}

function parseHeightInches(heightStr: string | number | null | undefined): number {
  if (!heightStr) return 0;
  const str = String(heightStr).trim();
  if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  const match = str.match(/(\d+)\s*['’`‘ft]*\s*(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10) || 0;
    const inches = parseInt(match[2], 10) || 0;
    return feet * 12 + inches;
  }
  return parseFloat(str) || 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PowerSetTrackingModal({
  exercise,
  sets,
  sessionId,
  workoutLibraryId,
  userOtherDetail,
  onClose,
  onAddSet,
  onUpdateSet,
  onToggleRecordSet,
  onSetSets,
  onSave,
}: Props) {
  const exerciseId =
    exercise?.exercise_uuid || exercise?.exercise_id ||
    exercise?.exercise?.exercise_uuid || exercise?.exercise?.id;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastRecord, setLastRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [bestRecord, setBestRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [savingSetIndexes, setSavingSetIndexes] = useState<number[]>([]);
  const [apiSuggestedReps, setApiSuggestedReps] = useState("");
  const [apiSuggestedWeight, setApiSuggestedWeight] = useState("");
  const [updatedRecord, setUpdatedRecord] = useState<Record<string, any>>({});
  const [editedWeights, setEditedWeights] = useState<Record<number, boolean>>({});

  const clearedSetIndexes = useRef<Record<number, boolean>>({});
  const hasInitialized = useRef(false);

  const userUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase().trim();

  // ── Suggested weight calculation ──────────────────────────────────────────
  const weightAdj = (exercise?.weight_adj || exercise?.exercise?.weight_adj || "").trim();
  const weightValue = exercise?.weight || exercise?.exercise?.defaultWt || "";
  const dWeight = exercise?.calculated_weight ?? exercise?.exercise?.defaultWt ?? null;

  let finalSuggestedWeight = "";
  const liftMaxGlobal = getLiftMax(weightAdj, userOtherDetail);
  if (weightAdj && liftMaxGlobal > 0) {
    const mult = parseFloat(String(weightValue)) || 0;
    const calc = Math.ceil(liftMaxGlobal * mult);
    if (calc > 0) finalSuggestedWeight = `${calc} ${userUnit}`;
  } else if (dWeight != null) {
    const dWeightStr = String(dWeight).trim();
    const num = parseFloat(dWeightStr) || 0;
    if (num > 0) {
      finalSuggestedWeight = convertToUserUnit(
        dWeightStr,
        userUnit,
        exercise?.msrmt || exercise?.exercise?.msrmt || "lbs",
      );
    }
  }
  if (!finalSuggestedWeight) {
    finalSuggestedWeight =
      weightValue && String(weightValue) !== "0"
        ? convertToUserUnit(weightValue, userUnit, "lbs")
        : "50–70%";
  }

  const suggestedReps = exercise?.reps || exercise?.exercise?.defaultReps || "12,8,6";

  const getNonPowerSetMessage = (set: VelocitySet): string | null => {
    const weightTyped = parseFloat(set.weight);
    if (isNaN(weightTyped) || weightTyped <= 0) return null;

    const weightAdjustStr = set.weight_adjust || weightAdj || "";
    if (!weightAdjustStr) return null;

    const liftMax = getLiftMax(weightAdjustStr, userOtherDetail);
    if (liftMax <= 0) return null;

    const opmAdjRaw = exercise?.opm_adjustor;
    const opmAdjVal = opmAdjRaw != null ? (opmAdjRaw > 1 ? opmAdjRaw / 100 : opmAdjRaw) : 0.85;

    const goalData = ((weightTyped * opmAdjVal) / liftMax) * 100;
    const pmax = [100, 95, 93, 90, 87, 85, 83, 80, 77, 75, 73, 70, 65, 60, 57, 55, 53, 50, 47, 45, 43];

    const closestPercent = pmax.reduce((prev, curr) =>
      Math.abs(curr - goalData) < Math.abs(prev - goalData) ? curr : prev
    );
    const indexData = pmax.indexOf(closestPercent);

    const cleanWeightAdjust = weightAdjustStr.replace(/^of\s+/i, "").trim();

    return `New weight is equal to( ${closestPercent}% of your max of ${cleanWeightAdjust} , you should complete ${indexData} or more reps`;
  };

  // ── Load tracking history ──────────────────────────────────────────────────
  const loadHistory = useCallback(async (currentSets?: VelocitySet[]) => {
    if (!exerciseId) return;
    try {
      setIsLoadingHistory(true);
      const records = await getTrackingLogs({ exercise_id: exerciseId });
      if (records.length > 0) {
        setLastRecord({ weight: records[0].weight, reps: records[0].repetitions });
        const best = records.reduce((b, r) => (r.weight > b.weight ? r : b), records[0]);
        setBestRecord({ weight: best.weight, reps: best.repetitions });
      }

      const swId = exercise?.id || exercise?.exercise?.id;
      if (swId) {
        const details = await getPowerSetDetails({ specializedWorkoutId: swId, sessionId });
        if (details?.sets) {
          const merged = currentSets
            ? currentSets.map((local, i) => {
                const db = details.sets![i];
                return db?.recorded ? db : local;
              })
            : details.sets;
          onSetSets?.(merged);
        }
        if (details?.suggestedReps)   setApiSuggestedReps(details.suggestedReps);
        if (details?.suggestedWeight) setApiSuggestedWeight(details.suggestedWeight);
      }

      if (sessionId) {
        const logs = await getPowerSetLogs(sessionId).catch(() => []);
        const byId: Record<string, any> = {};
        logs.forEach((l: any) => { if (l.power_id) byId[l.power_id] = l; });
        setUpdatedRecord((prev) => ({ ...prev, ...byId }));
      }
    } catch {
      // silent
    } finally {
      setIsLoadingHistory(false);
    }
  }, [exerciseId, exercise?.id, exercise?.exercise?.id, sessionId, onSetSets]);

  // initialize sets once on open
  useEffect(() => {
    if (!sets?.length || hasInitialized.current) return;
    sets.forEach((set, i) => {
      let wStr = set.suggestedWeight ?? "";
      if (!wStr) {
        const pw = parseFloat(String(set.pwrst_wt ?? 0)) || 0;
        const wa = set.weight_adjust ?? "";
        if (pw > 0 && wa) {
          const lm = getLiftMax(wa, userOtherDetail);
          const c = Math.round(pw * lm);
          if (c > 0) wStr = String(c);
        }
      }
      if (wStr && set.suggestedWeight !== wStr) onUpdateSet(i, "suggestedWeight", wStr);

      const rStr = set.suggestedReps ?? (exercise?.reps ? cleanReps(exercise.reps) : "");
      if (rStr && set.suggestedReps !== rStr) onUpdateSet(i, "suggestedReps", rStr);

      if (!clearedSetIndexes.current[i]) {
        clearedSetIndexes.current[i] = true;
        if (!set.recorded) {
          if (set.weight !== "") onUpdateSet(i, "weight", "");
          if (set.reps !== "") onUpdateSet(i, "reps", "");
        }
      }
    });
    hasInitialized.current = true;
  }, [sets, userOtherDetail, exercise, onUpdateSet]);

  useEffect(() => {
    hasInitialized.current = false;
    clearedSetIndexes.current = {};
    setLastRecord(null); setBestRecord(null);
    setApiSuggestedReps(""); setApiSuggestedWeight("");
    setEditedWeights({});
    if (exerciseId) loadHistory();
  }, [exerciseId, loadHistory]);

  // ── Save individual set ────────────────────────────────────────────────────
  const handleSaveSet = async (index: number) => {
    const set = sets[index];
    const weightNum = parseFloat(set.weight) || parseFloat(set.suggestedWeight ?? "0") || 0;
    const repsNum = parseInt(set.reps, 10) || parseInt(set.suggestedReps ?? "0", 10) || 0;

    setSavingSetIndexes((p) => [...p, index]);
    try {
      // compute load
      const isKg = userUnit === "kg";
      const rawWeight = parseFloat(String((userOtherDetail as any)?.current_weight ?? (userOtherDetail as any)?.currentWeight ?? 0)) || 0;
      const bw = isKg ? rawWeight * 2.2046 : rawWeight;
      const bh = parseHeightInches(userOtherDetail?.height);
      const E = parseInt(String(exercise?.exercise?.loadMeter ?? exercise?.loadMeter ?? 3)) || 3;
      const e = parseFloat(String(exercise?.repVariant ?? exercise?.rep_variant ?? 1)) || 1;
      const wt = weightNum * 2.20462262;
      const computedLoad = Math.ceil((bw * bh + E * repsNum * e * wt) / 2600);

      const response = await createTrackingLog({
        title: `Set ${index + 1}`,
        exerciseId: exerciseId ?? "",
        sessionId: sessionId ?? "",
        workoutLibraryId: workoutLibraryId ?? "",
        weight: set.unableToPerform ? 0 : weightNum,
        repetitions: set.unableToPerform ? 0 : repsNum,
        status: true,
        tag: "/e",
        load: set.unableToPerform ? 0 : computedLoad,
        specializedWorkoutId: exercise?.id || exercise?.exercise?.id,
      });

      const savedLoad = (response as any)?.load ?? computedLoad;
      const trackingLogId = (response as any)?.id ?? (response as any)?.trackingLog?.id;

      if (set.min_reps != null) {
        const powerSetPayload = {
          new_weight: set.unableToPerform ? 0 : weightNum,
          reps: set.unableToPerform ? 0 : repsNum,
          unable_to_perform: set.unableToPerform,
          power_id: set.power_id,
          specialized_workout_id: exercise?.id || exercise?.exercise?.id,
          individual_exercise_id: exerciseId,
          session_id: sessionId,
          weight_adj: set.weight_adjust,
          tracking_log: trackingLogId,
          old_weight: parseFloat(set.suggestedWeight ?? "0") || 0,
          old_reps: set.min_reps ?? (parseInt(set.suggestedReps ?? "0", 10) || 0),
        };
        const res = await createPowerSetLog(powerSetPayload);
        if (res?.powerSetLog) {
          setUpdatedRecord((p) => ({
            ...p,
            [set.power_id ?? String(index)]: res.powerSetLog,
          }));
        }
      }

      onUpdateSet(index, "weight", set.unableToPerform ? "0" : String(weightNum));
      onUpdateSet(index, "reps", set.unableToPerform ? "0" : String(repsNum));
      onUpdateSet(index, "load", set.unableToPerform ? 0 : savedLoad);
      onUpdateSet(index, "recorded", true);

      const updated = sets.map((s, i) =>
        i === index ? { ...s, weight: String(weightNum), reps: String(repsNum), recorded: true, load: savedLoad } : s
      );
      await loadHistory(updated);
    } catch {
    } finally {
      setSavingSetIndexes((p) => p.filter((i) => i !== index));
    }
  };

  // ── Return to workout ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        // Persist any set not yet saved via the per-set "Save Set" button —
        // covers typed values, sets left at their suggested defaults, and
        // sets marked "Unable" — mirrors mobile's safety-net save when
        // returning to the workout, so nothing is silently dropped.
        for (let i = 0; i < sets.length; i++) {
          const s = sets[i];
          if (!s.recorded && (s.unableToPerform || s.weight || s.reps || (s.suggestedWeight && s.suggestedReps))) {
            await handleSaveSet(i);
          }
        }

        const finalSets = sets.map((s) => {
          if (s.unableToPerform) return { ...s, weight: "0", reps: "0", load: 0, recorded: true };
          const w = parseFloat(s.weight) || parseFloat(s.suggestedWeight ?? "0") || 0;
          const r = parseInt(s.reps, 10) || parseInt(s.suggestedReps ?? "0", 10) || 0;
          const recorded = s.recorded || !!(s.weight || s.reps) || !!(s.suggestedWeight && s.suggestedReps);
          return { ...s, weight: String(w), reps: String(r), recorded };
        });
        await onSave(finalSets);
      } finally {
        setIsSaving(false);
      }
    }
    onClose();
  };

  const imageUrl = resolveWixImage(
    exercise?.demo_gif || exercise?.exercise?.demoGif || exercise?.demoGif || ""
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-black text-[#111827]">Complete the <span className="text-emerald-500">$</span> Set:</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* ── Exercise image + title ── */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={exercise?.title_secondary} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell size={36} className="text-gray-300" />
              )}
            </div>
            <p className="text-[13px] font-black text-[#111827] uppercase text-center">
              {(exercise?.title_secondary || exercise?.title_primary || exercise?.exercise?.name || "Exercise").toUpperCase()}
            </p>
            {exercise?.exercise?.muscleGroup && (
              <p className="text-[11px] text-gray-400 text-center">{exercise.exercise.muscleGroup}</p>
            )}
          </div>

          {/* ── Suggested card ── */}
          <div className="bg-[#f5f0ff] rounded-2xl border border-purple-100 px-4 py-3">
            <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mb-2">Suggested</p>
            <div className="flex items-center gap-0">
              <div className="flex-1 text-center">
                <p className="text-[10px] text-gray-400 font-semibold">Reps</p>
                <p className="text-[17px] font-black text-[#7c3aed]">
                  {apiSuggestedReps || suggestedReps}
                </p>
              </div>
              <div className="w-px h-10 bg-purple-200" />
              <div className="flex-1 text-center">
                <p className="text-[10px] text-gray-400 font-semibold">Weight</p>
                <p className="text-[17px] font-black text-[#111827]">
                  {apiSuggestedWeight ? convertToUserUnit(apiSuggestedWeight, userUnit, "lbs") : finalSuggestedWeight}
                </p>
              </div>
            </div>
          </div>

          {/* ── Last / Best ── */}
          {isLoadingHistory ? (
            <div className="flex justify-center py-3">
              <Loader2 size={20} className="animate-spin text-[#7c3aed]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Last Set</p>
                <p className="text-[13px] font-black text-[#111827] mt-0.5">
                  {lastRecord ? `${lastRecord.weight} ${userUnit} × ${lastRecord.reps}` : "None"}
                </p>
              </div>
              <div className="bg-[#f5f0ff] rounded-2xl px-4 py-3 border border-purple-100">
                <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide">Personal Best</p>
                <p className="text-[13px] font-black text-[#7c3aed] mt-0.5">
                  {bestRecord ? `${bestRecord.weight} ${userUnit} × ${bestRecord.reps}` : "—"}
                </p>
              </div>
            </div>
          )}

          {/* ── Divider + help text ── */}
          <div className="h-px bg-gray-100" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Any sets marked with{" "}
            <span className="font-black text-emerald-500">$</span>{" "}
            must be completed to move onto the next round.

          </p>

          {/* ── Set cards ── */}
          {sets.map((set, index) => {
            const isMainPowerSet = set.min_reps != null;
            const isSavingThis = savingSetIndexes.includes(index);
            return (
              <div
                key={index}
                className={`rounded-2xl border-2 overflow-hidden ${
                  isMainPowerSet ? "border-[#7c3aed]" : "border-gray-200"
                }`}
              >
                {isMainPowerSet && (
                  <div className="h-1 bg-[#7c3aed] w-full" />
                )}
                <div className="p-4 space-y-3">
                  {/* Set header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isMainPowerSet && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">
                          $
                        </span>
                      )}
                      <span className="text-[13px] font-black text-[#111827]">Set {index + 1}</span>
                  
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Unable to perform */}
                      <button
                        onClick={() => onUpdateSet(index, "unableToPerform", !set.unableToPerform)}
                        disabled={set.recorded}
                        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${set.unableToPerform ? "bg-gray-400 border-gray-400" : "border-gray-300"}`}>
                          {set.unableToPerform && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        Unable
                      </button>

                      {/* Is Money Set (only for custom, unrecorded sets) */}
                      {!set.recorded && set.isCustom && (
                        <button
                          onClick={() => onUpdateSet(index, "min_reps", isMainPowerSet ? null : 1)}
                          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${isMainPowerSet ? "bg-[#7c3aed] border-[#7c3aed]" : "border-gray-300"}`}>
                            {isMainPowerSet && <div className="w-2 h-2 bg-white rounded-sm" />}
                          </div>
                          Is Money Set
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => {
                          onUpdateSet(index, "weight", e.target.value);
                          setEditedWeights((p) => ({ ...p, [index]: true }));
                        }}
                        disabled={set.recorded || set.unableToPerform}
                        placeholder={set.suggestedWeight ?? "--"}
                        className="w-full h-11 rounded-xl border border-gray-200 text-center text-[15px] font-bold text-[#111827] outline-none focus:border-[#7c3aed] disabled:bg-gray-50 disabled:text-gray-400 transition"
                      />
                      <p className="text-[10px] text-gray-400 text-center mt-1">Weight ({userUnit})</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={cleanReps(set.reps)}
                        onChange={(e) => onUpdateSet(index, "reps", cleanReps(e.target.value))}
                        disabled={set.recorded || set.unableToPerform}
                        placeholder={set.suggestedReps ?? "--"}
                        className="w-full h-11 rounded-xl border border-gray-200 text-center text-[15px] font-bold text-[#111827] outline-none focus:border-[#7c3aed] disabled:bg-gray-50 disabled:text-gray-400 transition"
                      />
                      <p className="text-[10px] text-gray-400 text-center mt-1">Repetitions</p>
                    </div>
                  </div>

                  {/* 1RM feedback for non-power sets when weight is edited */}
                  {!isMainPowerSet && editedWeights[index] && (() => {
                    const msg = getNonPowerSetMessage(set);
                    return msg ? (
                      <p className="text-[11px] text-red-500 leading-snug text-center">{msg}</p>
                    ) : null;
                  })()}

                  {/* Edit button when recorded */}
                  {set.recorded && (
                    <button
                      onClick={() => onToggleRecordSet(index)}
                      className="flex items-center gap-1.5 text-[12px] text-[#7c3aed] font-semibold hover:underline"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}

                  {/* Save Set button */}
                  {!set.recorded && (
                    <button
                      onClick={() => handleSaveSet(index)}
                      disabled={isSavingThis}
                      className="w-full h-10 rounded-xl bg-[#7c3aed] text-white text-[13px] font-black hover:bg-[#6d28d9] transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSavingThis ? <Loader2 size={16} className="animate-spin" /> : null}
                      {isSavingThis ? "Saving…" : "Save Set"}
                    </button>
                  )}

                  {/* RMP / AMP feedback for money sets */}
                  {isMainPowerSet && (() => {
                    const key = set.power_id ?? String(index);
                    const rec = updatedRecord[key];
                    if (!rec) return null;
                    const weightAdjustStr = set.weight_adjust || weightAdj || "";
                    const powerTagLabel = getLiftCategoryLabel(weightAdjustStr) || "Power Set";
                    return (
                      <p className="text-[10px] text-center text-red-500 font-bold bg-red-50 rounded-lg px-3 py-2">
                        New max (RMP): {rec.member_weight_rmp} · Acute max (AMP): {rec.amp} of {powerTagLabel}
                        {rec.diff ? ` · ${rec.diff}` : ""}
                      </p>
                    );
                  })()}
                </div>
              </div>
            );
          })}

          {/* ── Bottom controls ── */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl bg-black border-2 border-[#7c3aed] text-white text-[14px] font-black hover:bg-gray-900 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSaving ? "Saving…" : "Return to workout"}
            </button>
            <button
              onClick={onAddSet}
              className="w-12 h-12 rounded-2xl bg-black border-2 border-[#7c3aed] text-white flex items-center justify-center hover:bg-gray-900 transition"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
