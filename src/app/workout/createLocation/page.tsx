"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CheckCircle2, Dumbbell, Loader2 } from "lucide-react";
import { equipmentApi, Equipment, EquipmentItem } from "@/api/location/route";
import { getProgramEquipment, Equipment as ProgramEquipment, WorkoutGroup, WorkoutGroupItem } from "@/api/programs/route";
import { createWorkoutLocation, createWorkoutSession, createFeedPost, swapExercise } from "@/api/workouts/route";

const normalizeEquipmentName = (name?: string) =>
  (name || "").trim().toLowerCase().replace(/[\s\-_]+/g, " ");

export default function CreateLocationPage() {
  const router = useRouter();

  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);
  // Equipment required by whichever workout the user is currently setting up
  // (if any) — drives the "outlined" indicator, independent of "selected".
  const [requiredEquipment, setRequiredEquipment] = useState<ProgramEquipment[]>([]);
  // The location that was selected on the Equipment Check page, if the user
  // got here via its "Create a Location" button — drives the "at this
  // location" indicator, same as the confirm page.
  const [referenceEquipment, setReferenceEquipment] = useState<EquipmentItem[]>([]);
  const [referenceLocationName, setReferenceLocationName] = useState<string | null>(null);

  useEffect(() => {
    equipmentApi
      .getAllEquipment()
      .then(setAllEquipment)
      .catch(console.error)
      .finally(() => setLoadingEquip(false));

    const programCode = localStorage.getItem("workoutProgramCode");
    if (programCode) {
      getProgramEquipment(programCode)
        .then((equip) => setRequiredEquipment(Array.isArray(equip) ? equip : []))
        .catch(() => setRequiredEquipment([]));
    }

    const referenceLocationId = localStorage.getItem("referenceLocationId");
    const referenceSelectedIds = localStorage.getItem("referenceSelectedIds");
    localStorage.removeItem("referenceLocationId");
    localStorage.removeItem("referenceSelectedIds");
    if (referenceLocationId) {
      equipmentApi
        .getLocationDetail(referenceLocationId)
        .then((detail) => {
          setReferenceEquipment(detail.equipmentList || []);
          setReferenceLocationName(detail.name || null);
        })
        .catch(() => setReferenceEquipment([]));
    }
    // Carry over whatever was checked on the Equipment Check page, so this
    // page starts with the same selection instead of empty.
    if (referenceSelectedIds) {
      try {
        setSelectedIds(new Set<number>(JSON.parse(referenceSelectedIds)));
      } catch {
        // malformed — leave selection empty
      }
    }
  }, []);

  const isRequiredEquipment = (eq: Equipment) =>
    requiredEquipment.some(
      (req) => req.id === eq.id || req.name?.toLowerCase() === eq.name?.toLowerCase(),
    );

  const isAtReferenceLocation = (eq: Equipment) =>
    referenceEquipment.some((ref) => normalizeEquipmentName(ref.name) === normalizeEquipmentName(eq.name));

  const toggleEquip = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = allEquipment.filter(
    (eq) => !search || eq.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Creates the location, then immediately starts the workout session with
  // it — mirrors handleStartSession on the Equipment Check / confirm pages,
  // so this page can be a one-step "build a location and go" flow instead of
  // creating the location and bouncing back for a separate confirm step.
  const handleCreate = async () => {
    if (!title.trim()) return;
    const pendingSessionCode = localStorage.getItem("pendingSessionCode");
    if (!pendingSessionCode) {
      console.error("[createLocation] No pendingSessionCode — aborting");
      return;
    }

    setSubmitting(true);
    try {
      const locationResult = await createWorkoutLocation({
        locationTitle: title.trim(),
        equipmentIds: Array.from(selectedIds).map(String),
      });
      const locationId = locationResult?.locationId;
      if (!locationId) {
        console.error("[createLocation] No locationId returned — aborting");
        return;
      }

      if (makeDefault) {
        await equipmentApi.selectDefaultLocation(locationId).catch(() => {});
      }

      const sessionResult = await createWorkoutSession({
        workoutLibraryId: pendingSessionCode,
        locationId,
      });
      const sessionId = sessionResult.session.id;
      localStorage.setItem(`activeSessionId_${pendingSessionCode.toUpperCase()}`, sessionId);
      localStorage.setItem("workoutLocationName", title.trim());
      localStorage.setItem("workoutLocationId", locationId);
      localStorage.removeItem("pendingSessionCode");

      // Swap exercises
      const rawGroups = localStorage.getItem("pendingWorkoutGroups");
      if (rawGroups) {
        try {
          const groups: WorkoutGroup[] = JSON.parse(rawGroups);
          const swapsMap: [string, WorkoutGroupItem][] = [];

          for (const group of groups) {
            const processedInRound: WorkoutGroupItem[] = [];

            for (let i = 0; i < group.workouts.length; i++) {
              const exercise = group.workouts[i];

              if (!exercise.exercise_id || exercise.is_power_set) {
                processedInRound.push(exercise);
                continue;
              }

              const existingExercises = [
                ...processedInRound.map((e) => e.exercise_name),
                ...group.workouts.slice(i + 1).map((e) => e.exercise_name),
              ].filter(Boolean);

              const result = await swapExercise({
                exerciseId: exercise.exercise_id,
                sessionId,
                section: group.label,
                existingExercises,
              });

              if (result.swapped && result.exercise) {
                const swappedItem: WorkoutGroupItem = {
                  ...exercise,
                  exercise_id: result.exercise.exercise_uuid || exercise.exercise_id,
                  exercise_name: result.exercise.name || exercise.exercise_name,
                  demo_gif: result.exercise.demoGif || exercise.demo_gif,
                  reps: result.exercise.defaultReps || exercise.reps,
                  supplemental: result.exercise.supplemental || exercise.supplemental,
                };
                swapsMap.push([exercise.exercise_id, swappedItem]);
                processedInRound.push(swappedItem);
              } else {
                processedInRound.push(exercise);
              }
            }
          }

          localStorage.setItem(`swappedExercises_${pendingSessionCode}`, JSON.stringify(swapsMap));
        } catch (err) {
          console.error("[createLocation] Swap loop failed:", err);
        } finally {
          localStorage.removeItem("pendingWorkoutGroups");
        }
      }

      createFeedPost({ sessionId, workoutLibraryId: pendingSessionCode }).catch((err) =>
        console.error("[createLocation] createFeedPost failed:", err)
      );

      localStorage.setItem("sessionJustCreated", "true");
      router.replace("/workout/viewWorkoutSession");
    } catch (err) {
      console.error("[createLocation] failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = "Select Equipment and Proceed";

  return (
    <div
      className="h-screen bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-900">Create Location</h1>
            <span className="inline-flex items-center gap-1 bg-[#7c3aed] text-white text-xs font-semibold px-3 py-1 rounded-full">
              <CheckCircle2 size={12} className="fill-white/30" />
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-[240px]">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
            />
          </div>

          {referenceLocationName && (
            <p className="text-base font-bold text-[#7c3aed] text-right truncate max-w-[35%]">
              {referenceLocationName}
            </p>
          )}

          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Legend — explains what each border color/checkmark means */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-[#7c3aed] flex-shrink-0" fill="#EFE6F9" />
            <span className="text-[11px] text-gray-500">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-green-400 bg-white flex-shrink-0" />
            <span className="text-[11px] text-gray-500">Required, not selected</span>
          </div>
          {referenceEquipment.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-[#7c3aed] bg-white flex-shrink-0" />
              <span className="text-[11px] text-gray-500">At this location, not required</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-gray-200 bg-white flex-shrink-0" />
            <span className="text-[11px] text-gray-500">Other equipment</span>
          </div>
        </div>
      </div>

      {/* Equipment grid */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-3 min-h-0">
        {loadingEquip ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2.5">
            {filtered.map((eq) => {
              // Exact same rule as confirmEquipment: required is always
              // purple (a permanent "needed" badge, with a checkmark once
              // selected). At the reference location but not required is
              // always purple too, but never gets a checkmark — it's
              // informational, not a confirmed selection. Everything else
              // is plain until tapped, then purple + checkmark.
              const isSelected = selectedIds.has(eq.id);
              const isRequired = isRequiredEquipment(eq);
              const atReferenceLocation = isAtReferenceLocation(eq);
              const isLocationExtra = atReferenceLocation && !isRequired;
              const category: "purple" | "green" | "none" = isLocationExtra
                ? "purple"
                : isSelected
                  ? "purple"
                  : isRequired
                    ? "green"
                    : "none";
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquip(eq.id)}
                  className={`relative flex flex-col items-center rounded-2xl px-1.5 py-6 border transition-all ${
                    category === "purple"
                      ? "border-[#7c3aed] bg-purple-50 ring-2 ring-[#7c3aed]/10"
                      : category === "green"
                        ? "border-green-400 bg-white ring-2 ring-green-400/10"
                        : "border-gray-200 bg-white"
                  }`}
                >
                  {!isLocationExtra && isSelected && (
                    <div className="absolute top-1.5 right-1.5 text-[#7c3aed]">
                      <CheckCircle2 size={14} fill="white" />
                    </div>
                  )}
                  <div className="h-16 w-full mb-2 flex items-center justify-center bg-gray-50 rounded-xl p-1">
                    {eq.icon ? (
                      <img
                        src={eq.icon}
                        alt={eq.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Dumbbell
                        size={24}
                        className={category === "purple" ? "text-[#7c3aed]" : category === "green" ? "text-green-600" : "text-gray-400"}
                      />
                    )}
                  </div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight ${
                      category === "purple" ? "text-[#7c3aed]" : category === "green" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {eq.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Title + submit */}
      <div className="px-5 pt-2 pb-3 flex-shrink-0 border-t border-gray-100">
        <input
          type="text"
          placeholder="Give this location a title, e.g., Home Gym"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7c3aed] mb-2"
        />

        <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-[#7c3aed] cursor-pointer"
          />
          <span className="text-xs font-medium text-gray-700">Make this my default location</span>
        </label>

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm py-3 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating...
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
}
