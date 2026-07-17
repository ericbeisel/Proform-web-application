"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Dumbbell, ChevronRight, Loader2, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, EquipmentItem, LocationItem, Equipment as CatalogEquipment } from "@/api/location/route";
import { getProgramEquipment, Equipment } from "@/api/programs/route";
import { createFeedPost, createWorkoutLocation, createWorkoutSession, swapExercise } from "@/api/workouts/route";
import { WorkoutGroup, WorkoutGroupItem } from "@/api/programs/route";
import { deleteWorkoutSession } from "@/api/workouts/route";

// Equipment names come from two different sources (a location's saved
// equipmentList vs the master catalog) that don't always agree on
// formatting — e.g. "Mini-Bands" vs "Mini Bands". Collapsing hyphens/
// underscores/whitespace before lowercasing means the same physical item
// still matches across sources instead of silently appearing twice.
function normalizeEquipmentName(name?: string): string {
  return (name || "").trim().toLowerCase().replace(/[\s\-_]+/g, " ");
}

// Mirrors mobile's EquipmentNeededModal.handleSelectLocation: matching is by
// equipment name (case-insensitive), not id — an item is checked only if its
// name appears in the chosen location's saved equipmentList.
function computeSelectedIdsForLocation(
  fetchedList: EquipmentItem[],
  requiredList: Equipment[],
  catalog: CatalogEquipment[],
): Set<number> {
  const locationNames = new Set(fetchedList.map((eq) => normalizeEquipmentName(eq.name)));
  const ids = new Set<number>();
  fetchedList.forEach((eq) => ids.add(eq.id));
  requiredList.forEach((eq) => {
    if (locationNames.has(normalizeEquipmentName(eq.name))) ids.add(eq.id);
  });
  catalog.forEach((eq) => {
    if (locationNames.has(normalizeEquipmentName(eq.name))) ids.add(eq.id);
  });
  return ids;
}

// Dedup-by-name merge for the mixed equipment grid: location's saved gear,
// then the required list, then the rest of the full catalog ("other
// equipment") — each only added if its name hasn't already been claimed by
// an earlier, more specific source.
function buildMixedEquipment(
  locationEquipment: EquipmentItem[],
  requiredList: Equipment[],
  catalog: CatalogEquipment[],
): (EquipmentItem | Equipment | CatalogEquipment)[] {
  const byName = new Map<string, EquipmentItem | Equipment | CatalogEquipment>();
  locationEquipment.forEach((eq) => byName.set(normalizeEquipmentName(eq.name), eq));
  requiredList.forEach((eq) => {
    const key = normalizeEquipmentName(eq.name);
    if (!byName.has(key)) byName.set(key, eq);
  });
  catalog.forEach((eq) => {
    const key = normalizeEquipmentName(eq.name);
    if (!byName.has(key)) byName.set(key, eq);
  });
  return Array.from(byName.values());
}

export default function ConfirmEquipmentPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [equipments, setEquipments] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [programEquipment, setProgramEquipment] = useState<Equipment[]>([]);
  const [programEquipmentLoading, setProgramEquipmentLoading] = useState(true);
  const [allEquipment, setAllEquipment] = useState<CatalogEquipment[]>([]);
  const [allEquipmentLoading, setAllEquipmentLoading] = useState(true);
  const [selectedEquipIds, setSelectedEquipIds] = useState<Set<number>>(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [displayLocationName, setDisplayLocationName] = useState("Selected Location");
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const programCode = localStorage.getItem("workoutProgramCode");

        const promises: Promise<any>[] = [equipmentApi.getLocationList(), equipmentApi.getAllEquipment()];
        if (programCode) promises.push(getProgramEquipment(programCode));

        const [locData, allEquip, programEquip] = await Promise.all(promises);

        setLocations(locData);
        setAllEquipment(Array.isArray(allEquip) ? allEquip : []);
        let sessionEquip: Equipment[] = [];
        if (programEquip && Array.isArray(programEquip)) {
          sessionEquip = programEquip;
          setProgramEquipment(sessionEquip);
        }

        // Pick up the location + selection carried over from the Equipment
        // Check page's "Add Equipment to X and Proceed" button.
        const carriedLocationId = localStorage.getItem("confirmEquipmentLocationId");
        const carriedLocationName = localStorage.getItem("confirmEquipmentLocationName");
        const carriedSelectedIds = localStorage.getItem("confirmEquipmentSelectedIds");
        localStorage.removeItem("confirmEquipmentLocationId");
        localStorage.removeItem("confirmEquipmentLocationName");
        localStorage.removeItem("confirmEquipmentSelectedIds");

        if (carriedLocationId) {
          setSelectedLocation(carriedLocationId);
          setDisplayLocationName(carriedLocationName || "Selected Location");
          try {
            const detail = await equipmentApi.getLocationDetail(carriedLocationId);
            const fetchedList = detail.equipmentList || [];
            setEquipments(fetchedList);
            setSelectedEquipIds(
              carriedSelectedIds
                ? new Set<number>(JSON.parse(carriedSelectedIds))
                : computeSelectedIdsForLocation(fetchedList, sessionEquip, Array.isArray(allEquip) ? allEquip : []),
            );
          } catch (e) {
            console.error("Failed to fetch carried-over location detail:", e);
          }
        } else if (sessionEquip.length > 0) {
          setSelectedEquipIds(new Set(sessionEquip.map((eq: Equipment) => eq.id)));
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setProgramEquipmentLoading(false);
        setAllEquipmentLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchLocationDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await equipmentApi.getLocationDetail(id);
      const fetchedList = data.equipmentList || [];
      setEquipments(fetchedList);

      setSelectedEquipIds(computeSelectedIdsForLocation(fetchedList, programEquipment, allEquipment));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLocation(id);
    setIsNewlyCreated(false);
    if (id) {
      const locName = locations.find((l) => String(l.id) === id)?.name || "Selected Location";
      setDisplayLocationName(locName);
      fetchLocationDetail(id);
    } else {
      setEquipments([]);
      setSelectedEquipIds(new Set(programEquipment.map((eq) => eq.id)));
      setDisplayLocationName("Selected Location");
    }
  };

  const toggleEquipment = (id: number) => {
    const newSelection = new Set(selectedEquipIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedEquipIds(newSelection);
  };

const handleBack = async () => {
  const pendingSessionCode = localStorage.getItem("pendingSessionCode");
  // pendingSessionCode still exists = user came here but hasn't started session yet
  // nothing to delete, just go back
  if (pendingSessionCode) {
    router.back();
    return;
  }

  // If a session was already created (user started then came back somehow), clean it up
  const activeSessionId = pendingSessionCode
    ? localStorage.getItem(`activeSessionId_${pendingSessionCode}`)
    : null;

  if (activeSessionId) {
    try {
      await deleteWorkoutSession(activeSessionId);
      localStorage.removeItem(`activeSessionId_${pendingSessionCode}`);
      localStorage.removeItem(`swappedExercises_${pendingSessionCode}`);
    } catch (err) {
      console.error("[back] ✗ Failed to delete session:", err);
    }
  }

  router.back();
};

const handleStartSession = async (locationNameOverride?: string, equipmentIdsOverride?: number[]) => {
  const pendingSessionCode = localStorage.getItem("pendingSessionCode");
  if (!pendingSessionCode) {
    console.error("[session] ✗ No pendingSessionCode — aborting");
    return;
  }

  if (locationNameOverride) setIsCreatingNew(true); else setIsDeleting(true);
  try {
    // 1. ALWAYS create a location — mirrors mobile exactly
    // Uses override name, selected location name, OR 'Temporary Location' as fallback
    const selectedLocationName = locationNameOverride
      || (selectedLocation
        ? locations.find((l) => String(l.id) === String(selectedLocation))?.name || "Temporary Location"
        : "Temporary Location"); // ← exact same fallback as mobile

    const resolvedEquipIds = equipmentIdsOverride ?? Array.from(selectedEquipIds);
    const locationResult = await createWorkoutLocation({
      locationTitle: selectedLocationName,
      equipmentIds: resolvedEquipIds.map(String),
    });
    const locationId = locationResult?.locationId;

    if (!locationId) {
      console.error("[session] ✗ No locationId returned — aborting");
      return;
    }

    if (locationNameOverride && makeDefault) {
      await equipmentApi.selectDefaultLocation(locationId).catch(() => {});
    }

    // 2. ALWAYS pass locationId to session — mirrors mobile exactly
    const sessionResult = await createWorkoutSession({
      workoutLibraryId: pendingSessionCode,
      locationId, // ← always present now
    });
    const sessionId = sessionResult.session.id;
    localStorage.setItem(`activeSessionId_${pendingSessionCode.toUpperCase()}`, sessionId);
    localStorage.setItem("workoutLocationName", selectedLocationName);
    localStorage.setItem("workoutLocationId", locationId);
    localStorage.removeItem("pendingSessionCode");

    // 3. Swap exercises
    const rawGroups = localStorage.getItem("pendingWorkoutGroups");

    if (rawGroups) {
      try {
        const groups: WorkoutGroup[] = JSON.parse(rawGroups);
        const swapsMap: [string, WorkoutGroupItem][] = [];

        for (const group of groups) {
          const processedInRound: WorkoutGroupItem[] = [];

          for (let i = 0; i < group.workouts.length; i++) {
            const exercise = group.workouts[i];

            if (!exercise.exercise_id) {
              processedInRound.push(exercise);
              continue;
            }
            if (exercise.is_power_set) {
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
        console.error("[session] ✗ Swap loop failed:", err);
      } finally {
        localStorage.removeItem("pendingWorkoutGroups");
      }
    }

    // 4. Feed post — fire and forget (mirrors mobile)
    createFeedPost({ sessionId, workoutLibraryId: pendingSessionCode }).catch((err) =>
      console.error("[session] ✗ createFeedPost failed:", err)
    );

    localStorage.setItem("sessionJustCreated", "true");
    router.replace("/workout/viewWorkoutSession");
  } catch (err) {
    console.error("[session] ✗ handleStartSession failed:", err);
  } finally {
    setIsDeleting(false);
    setIsCreatingNew(false);
  }
};

  const allProgramEquipSelected =
    programEquipment.length === 0 ||
    programEquipment.every((eq) => selectedEquipIds.has(eq.id));

  // Mixed grid: location's saved gear + required list + the rest of the full
  // catalog ("other equipment"), deduped by name.
  const mixedEquipment = buildMixedEquipment(equipments, programEquipment, allEquipment);

  // An item actually saved at this location gets the green "already have
  // this" treatment, regardless of required/selected state. Everything else
  // (required-but-missing or extra catalog items) follows the normal
  // purple-when-selected / gray-when-not scheme.
  const isPresentAtLocation = (eq: EquipmentItem | Equipment | CatalogEquipment) =>
    equipments.some((av) => normalizeEquipmentName(av.name) === normalizeEquipmentName(eq.name));
  const highlightedCount = mixedEquipment.filter(
    (eq) => selectedEquipIds.has(eq.id) || isPresentAtLocation(eq),
  ).length;

  // Any tile (required or catalog-extra) not actually saved at the
  // location — reactive, derived live from equipments/mixedEquipment every
  // render.
  const missingTiles = mixedEquipment.filter((eq) => !isPresentAtLocation(eq));

  // With a location selected, don't let the user proceed until they've
  // selected at least one tile that wasn't already present at the location —
  // the ones already saved there stay selected as-is and don't need to be
  // touched. Counts both missing-required tiles and catalog extras.
  const allMixedEquipSelected =
    missingTiles.length === 0 ||
    missingTiles.some((eq) => selectedEquipIds.has(eq.id));

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} disabled={isDeleting} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Equipment Check</h1>
            <p className="text-xs text-gray-400 font-medium">Verify your gear</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 mt-6">

        {/* COMPACT LOCATION SELECTION CARD */}
        <div className="bg-[#f8faff] rounded-2xl p-4 border border-[#eef2ff] flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  className="w-full p-2.5 pr-8 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all appearance-none cursor-pointer"
                >
                  <option value="">No location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {selectedLocation ? (
                  <button
                    onClick={() => { setSelectedLocation(""); setEquipments([]); setSelectedEquipIds(new Set(programEquipment.map((eq) => eq.id))); setIsNewlyCreated(false); setDisplayLocationName("Selected Location"); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EQUIPMENT GRID */}
        <div className="min-h-[200px]">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {!selectedLocation ? (
                /* REQUIRED EQUIPMENT FOR THIS PROGRAM — only relevant grouping
                   when there's no location to mix it in with. */
                programEquipmentLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-[#7c3aed]" size={24} />
                  </div>
                ) : programEquipment.length > 0 && (
                  <div>
                    <div className="mb-3 px-2">
                      <h2 className="text-lg font-bold text-gray-900">Required</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Must have this gear</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {programEquipment.map((eq) => {
                        const isSelected = selectedEquipIds.has(eq.id);
                        return (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => toggleEquipment(eq.id)}
                            className={`relative flex flex-col items-center rounded-2xl p-3 shadow-sm transition-all hover:shadow-md border ${
                              isSelected
                                ? "bg-purple-50 border-[#7c3aed] ring-2 ring-[#7c3aed]/10"
                                : "bg-white border-gray-100 opacity-80"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 text-[#7c3aed]">
                                <CheckCircle2 size={14} fill="white" />
                              </div>
                            )}
                            <div className="h-14 w-14 mb-2 flex items-center justify-center bg-gray-50 rounded-xl p-1">
                              {eq.icon ? (
                                <img src={eq.icon} alt={eq.name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <Dumbbell size={24} className="text-purple-400" />
                              )}
                            </div>
                            <p className={`text-[9px] font-bold uppercase tracking-wider text-center ${isSelected ? "text-[#7c3aed]" : "text-gray-500"}`}>
                              {eq.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                /* MIXED EQUIPMENT — location selected: Required/Available/Other
                   shown together in one grid. Gear actually at this location
                   is green; everything else is the normal purple/gray. */
                (programEquipmentLoading || allEquipmentLoading) ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-[#7c3aed]" size={24} />
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 flex justify-between items-center px-2">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Equipment</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Tap to verify</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#7c3aed] bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                        {highlightedCount} Matched
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {mixedEquipment.map((eq) => {
                        const atLocation = isPresentAtLocation(eq);
                        const isRequired = programEquipment.some(
                          (req) => normalizeEquipmentName(req.name) === normalizeEquipmentName(eq.name),
                        );
                        const manuallySelected = selectedEquipIds.has(eq.id);
                        // Purple = required (always, regardless of match) OR
                        // a catalog extra the user just tapped on. Green =
                        // the location's own saved gear that isn't required.
                        // Plain = not required, not at this location, and
                        // not yet tapped.
                        const category: "purple" | "green" | "none" = isRequired
                          ? "purple"
                          : atLocation
                            ? "green"
                            : manuallySelected
                              ? "purple"
                              : "none";
                        const showCheck = category !== "none";

                        return (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => toggleEquipment(eq.id)}
                            className={`relative flex flex-col items-center bg-white border rounded-2xl p-3 shadow-sm transition-all hover:shadow-md ${
                              category === "purple"
                                ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/10"
                                : category === "green"
                                  ? "border-green-400 ring-2 ring-green-400/10"
                                  : "border-gray-100 opacity-80"
                            }`}
                          >
                            {showCheck && (
                              <div className={`absolute top-1.5 right-1.5 animate-in zoom-in ${category === "green" ? "text-green-500" : "text-[#7c3aed]"}`}>
                                <CheckCircle2 size={14} fill="white" />
                              </div>
                            )}

                            <div className="h-14 w-14 mb-2 flex items-center justify-center bg-gray-50 rounded-xl p-1">
                              {eq.icon ? (
                                <img src={eq.icon} alt={eq.name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <Dumbbell size={24} className="text-purple-400" />
                              )}
                            </div>

                            <p className={`text-[9px] font-bold uppercase tracking-wider text-center ${
                              category === "purple" ? "text-[#7c3aed]" : category === "green" ? "text-green-600" : "text-gray-500"
                            }`}>
                              {eq.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-12 flex flex-col items-center gap-4">
          {selectedLocation && isNewlyCreated ? (
            /* ── Newly created location: only Start Workout ── */
            <button
              onClick={() => handleStartSession()}
              disabled={isDeleting || isCreatingNew}
              className="w-full max-w-sm bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <><Loader2 size={16} className="animate-spin" /> Setting up...</>
              ) : (
                <>Start Workout <ChevronRight size={16} /></>
              )}
            </button>
          ) : selectedLocation && !isNewlyCreated ? (
            /* ── Dropdown-selected location: full flow ── */
            <>
              <button
                onClick={() => handleStartSession()}
                disabled={isDeleting || isCreatingNew || !allMixedEquipSelected}
                className="w-full max-w-sm bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <><Loader2 size={16} className="animate-spin" /> Setting up...</>
                ) : (
                  <>Add Equipment to {displayLocationName} and Proceed <ChevronRight size={16} /></>
                )}
              </button>

              {!allMixedEquipSelected && (
                <p className="text-xs text-gray-400 -mt-2">Select at least one missing item above to continue</p>
              )}

              <p className={`text-sm text-[#7c3aed] font-medium ${!allMixedEquipSelected ? "opacity-40" : ""}`}>
                + Create a new location and proceed
              </p>

              <input
                type="text"
                placeholder="New location name..."
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                disabled={!allMixedEquipSelected}
                className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <label className="w-full max-w-sm flex items-center gap-2.5 cursor-pointer select-none has-[:disabled]:opacity-40 has-[:disabled]:cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  disabled={!allMixedEquipSelected}
                  className="w-4 h-4 rounded accent-[#7c3aed] cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm font-medium text-gray-700">Make this my default location</span>
              </label>

              <button
                onClick={() => newLocationName.trim() && handleStartSession(newLocationName.trim())}
                disabled={isCreatingNew || isDeleting || !newLocationName.trim() || !allMixedEquipSelected}
                className="w-full max-w-sm bg-[#7c3aed] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:bg-[#6d28d9] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreatingNew ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating...</>
                ) : (
                  <>Proceed <ChevronRight size={16} /></>
                )}
              </button>
            </>
          ) : (
            /* ── No location selected ── */
            <>
              <button
                onClick={() => router.push("/workout/createLocation")}
                disabled={isDeleting || isCreatingNew}
                className="w-full max-w-sm bg-[#7c3aed] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:bg-[#6d28d9] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <MapPin size={16} />
                Create Location
              </button>

              <button
                onClick={() => handleStartSession("Temporary Location")}
                disabled={isDeleting || isCreatingNew || !allProgramEquipSelected}
                className="text-[#7c3aed] text-sm font-medium hover:text-[#6d28d9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    Starting...
                  </span>
                ) : (
                  "Start Workout Without Location"
                )}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
