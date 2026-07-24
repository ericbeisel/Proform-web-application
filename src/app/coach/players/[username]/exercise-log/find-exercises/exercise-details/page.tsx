"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { ArrowLeft, Menu, ChevronDown, Gem, Pencil, X } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";
import {
  createExerciseLog,
  getExerciseLogs,
  type CreateExerciseLogSetInput,
  type ExerciseLogEntry,
} from "@/api/workouts/route";

const UNIT_TYPE_OPTIONS = [
  { value: "reps", label: "Reps" },
  { value: "each", label: "Each" },
  { value: "range", label: "Range" },
  { value: "yds", label: "YDS" },
  { value: "amrp", label: "AMRP" },
  { value: "series", label: "Series" },
  { value: "sec", label: "Sec" },
  { value: "seeWithEach", label: "SecWithEach" },
  { value: "minutes", label: "Minutes" },
  { value: "meters", label: "Meter" },
];

const MEASUREMENT_OPTIONS = ["lbs", "kg", "resistant"];

// Same resolution find-exercises/page.tsx already applies before handing the
// gif URL over via the query string — kept idempotent here (a plain https
// URL passes through unchanged) in case a direct/bookmarked link ever
// carries an unresolved wix:image:// URL.
function resolveMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("wix:image://")) {
    const hash = url.replace("wix:image://v1/", "").split("/")[0];
    return `https://static.wixstatic.com/media/${hash}`;
  }
  return url;
}

interface SetCardState {
  weight: string;
  reps: string;
  repsCompanion: string;
  mets: string;
  effort: string;
  miles: string;
  rpm: string;
  heartRate: string;
  calories: string;
  watt: string;
  addPowerset: boolean;
}

const EMPTY_SET_CARD: SetCardState = {
  weight: "",
  reps: "",
  repsCompanion: "",
  mets: "",
  effort: "",
  miles: "",
  rpm: "",
  heartRate: "",
  calories: "",
  watt: "",
  addPowerset: false,
};

// "each"/"seeWithEach"/"range"/"minutes" need a second number beside the main
// reps/value input — the separator and mandatory field differ per type.
function companionConfigFor(unitType: string): {
  show: boolean;
  separator: string | null;
  companionMandatory: boolean;
  primaryMandatory: boolean;
  companionPlaceholder?: string;
} {
  switch (unitType) {
    case "range":
      return { show: true, separator: "-", companionMandatory: false, primaryMandatory: false, companionPlaceholder: "Add reps" };
    case "minutes":
      return { show: true, separator: ":", companionMandatory: false, primaryMandatory: true, companionPlaceholder: "00" };
    case "each":
    case "seeWithEach":
      return { show: true, separator: null, companionMandatory: true, primaryMandatory: false, companionPlaceholder: "Rep Variable *" };
    case "meters":
      return { show: false, separator: null, companionMandatory: false, primaryMandatory: true };
    default:
      return { show: false, separator: null, companionMandatory: false, primaryMandatory: false };
  }
}

function stub(label: string) {
  alert(`${label} — coming soon (backend endpoint pending).`);
}

// Best/last summary — most recent log's first set, and the highest-weight (or
// highest-reps, if no weights logged) set across everything fetched.
function summarizeLogs(logs: ExerciseLogEntry[]) {
  if (logs.length === 0) return { last: null, best: null };

  const sorted = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
  const lastSet = sorted[0]?.sets[0] ?? null;

  const allSets = logs.flatMap((l) => l.sets);
  const withWeight = allSets.filter((s) => s.weight_1 != null);
  const bestSet =
    withWeight.length > 0
      ? withWeight.reduce((a, b) => ((b.weight_1 ?? 0) > (a.weight_1 ?? 0) ? b : a))
      : allSets.reduce((a, b) => ((b.reps ?? 0) > (a.reps ?? 0) ? b : a), allSets[0] ?? null);

  return {
    last: lastSet ? { reps: lastSet.reps ?? lastSet.value, weight: lastSet.weight_1 } : null,
    best: bestSet ? { reps: bestSet.reps ?? bestSet.value, weight: bestSet.weight_1 } : null,
  };
}

function ExerciseDetailsContent() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();
  const searchParams = useSearchParams();

  const exerciseId = searchParams.get("id") ?? "";
  const name = searchParams.get("name") ?? "Exercise";
  const gifUrl = resolveMedia(searchParams.get("gif"));

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "");
    const tokenPayload = getTokenPayload();
    const coachUsername = (user?.username as string | undefined) ?? tokenPayload?.username;
    if (coachUsername) {
      profileApi.getProfileByUsername(coachUsername).then((p) => {
        if (p?.image) setProfilePicture(p.image);
        if (!user?.name) {
          const display = p?.name || p?.username || coachUsername;
          if (display) setUserInitial((display as string)[0]?.toUpperCase() ?? "");
        }
      }).catch(() => {});
    } else if (tokenPayload?.email) {
      setUserInitial(tokenPayload.email[0]?.toUpperCase() ?? "");
    }
  }, []);

  const [history, setHistory] = useState<{
    last: { reps: number | null; weight: number | null } | null;
    best: { reps: number | null; weight: number | null } | null;
  }>({ last: null, best: null });

  useEffect(() => {
    if (!exerciseId) return;
    getExerciseLogs({ exerciseId, limit: 50, username })
      .then((res) => setHistory(summarizeLogs(res.data)))
      .catch(() => {});
  }, [exerciseId, username]);

  // Suggested section — sets is a cosmetic recommendation, reps/unit/weight/measurement
  // feed the real set cards once "Submit Set" is pressed.
  const [sets, setSets] = useState("1x");
  const [reps, setReps] = useState("");
  const [repsCompanion, setRepsCompanion] = useState("");
  const [unitType, setUnitType] = useState("reps");
  const [suggestedWeight, setSuggestedWeight] = useState("");
  const [measurement, setMeasurement] = useState("lbs");
  const [percentageBased, setPercentageBased] = useState(false);

  const companion = companionConfigFor(unitType);

  function handleUnitTypeChange(value: string) {
    setUnitType(value);
    setReps("");
    setRepsCompanion("");
  }

  const [showSets, setShowSets] = useState(false);
  const [setCards, setSetCards] = useState<SetCardState[]>([]);
  const [notes, setNotes] = useState("");

  function updateCard(index: number, patch: Partial<SetCardState>) {
    setSetCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRepsLike = unitType === "reps" || unitType === "amrp";

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = "";
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  async function handleSave() {
    if (!exerciseId) {
      setError("Missing exercise reference — go back and select an exercise again.");
      return;
    }

    const setsPayload: CreateExerciseLogSetInput[] = setCards.map((card, i) => {
      const s: CreateExerciseLogSetInput = {
        set_number: i + 1,
        unit_type: unitType,
        measurement,
        weight_1: card.weight ? Number(card.weight) : undefined,
        completed: true,
      };
      if (isRepsLike) {
        s.reps = card.reps ? Number(card.reps) : undefined;
      } else {
        s.value = card.reps ? Number(card.reps) : undefined;
      }
      if (companion.show && card.repsCompanion) {
        s.value_secondary = Number(card.repsCompanion);
      }
      return s;
    });

    setSaving(true);
    setError("");
    try {
      await createExerciseLog({
        exerciseId,
        exerciseTitle: name,
        measurement,
        notes: notes || undefined,
        sets: setsPayload,
        photos,
        username,
      });
      router.push(`/coach/players/${username}/exercise-log`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save exercise log.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      <CoachSidebar
        profilePicture={profilePicture}
        userInitial={userInitial}
        onSwitchToPlayer={() => router.replace("/team/teams")}
        onLogOut={handleLogOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="md:ml-[220px] flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <Menu size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => router.push(`/coach/players/${username}/exercise-log/find-exercises`)}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#F59E0B] uppercase leading-none truncate">
                Master Profile
              </p>
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                {name}
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 overflow-x-hidden">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Last / Best */}
            <div className="border border-[#8B5CF6] rounded-xl px-6 py-4 max-w-md mx-auto mb-8">
              <div className="grid grid-cols-2 text-center gap-4">
                <div>
                  <p className="font-bold text-[#222]">Last:</p>
                  {history.last ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Reps: {history.last.reps ?? "-"} · Weight: {history.last.weight ?? "-"}
                    </p>
                  ) : (
                    <p className="text-xs italic text-gray-500 mt-0.5">No records yet</p>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#222]">Best:</p>
                  {history.best ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Reps: {history.best.reps ?? "-"} · Weight: {history.best.weight ?? "-"}
                    </p>
                  ) : (
                    <p className="text-xs italic text-gray-400 mt-0.5">No records yet</p>
                  )}
                </div>
              </div>
            </div>

            {!exerciseId && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 mb-6">
                No exercise was selected — go back to Find Exercises and pick one before saving a log.
              </div>
            )}

            {/* Exercise + suggested */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
              <div className="flex flex-col items-center gap-2 shrink-0 w-32">
                <div className="w-28 h-28 flex items-center justify-center overflow-hidden">
                  {gifUrl ? (
                    <img src={gifUrl} alt={name} className="w-full h-full object-contain" />
                  ) : (
                    <Gem size={32} className="text-[#8B5CF6]" fill="#8B5CF6" />
                  )}
                </div>
                <p className="text-xs font-bold text-[#222] text-center leading-tight uppercase">
                  {name}
                </p>
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#8B5CF6]">Suggested:</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handlePhotoPick}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-5 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition"
                  >
                    Upload Photo
                  </button>
                </div>

                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {photos.map((file, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
                          aria-label="Remove photo"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`grid grid-cols-2 ${companion.show ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-3 max-w-2xl mb-3`}>
                  <div className="relative">
                    <select
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-500 outline-none appearance-none focus:border-[#8B5CF6] transition"
                    >
                      {["1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder={unitType === "minutes" ? "00" : unitType === "meters" ? "Add reps" : undefined}
                    className={`h-12 rounded-xl border px-4 text-base text-[#222] outline-none focus:border-[#8B5CF6] transition ${
                      companion.primaryMandatory && !reps ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {companion.show && (
                    <div className="flex items-center gap-1.5">
                      {companion.separator && (
                        <span className="text-gray-400 font-semibold text-base shrink-0">{companion.separator}</span>
                      )}
                      <input
                        value={repsCompanion}
                        onChange={(e) => setRepsCompanion(e.target.value)}
                        placeholder={companion.companionPlaceholder}
                        className={`h-12 w-full rounded-xl border px-4 text-base text-[#222] outline-none focus:border-[#8B5CF6] transition ${
                          companion.companionMandatory && !repsCompanion ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                    </div>
                  )}
                  <div className="relative">
                    <select
                      value={unitType}
                      onChange={(e) => handleUnitTypeChange(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#3B82F6] px-4 text-base text-[#3B82F6] outline-none appearance-none focus:border-[#2563EB] transition"
                    >
                      {UNIT_TYPE_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3B82F6] pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
                  <input
                    placeholder="Weight"
                    value={suggestedWeight}
                    onChange={(e) => setSuggestedWeight(e.target.value)}
                    className="h-12 rounded-xl border border-gray-200 px-4 text-base text-[#222] outline-none focus:border-[#8B5CF6] transition"
                  />
                  <input placeholder="Weight P..." disabled className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-400 outline-none" />
                  <div className="relative">
                    <select
                      value={measurement}
                      onChange={(e) => setMeasurement(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 px-4 text-base text-[#222] outline-none appearance-none focus:border-[#8B5CF6] transition"
                    >
                      {MEASUREMENT_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[10px] font-semibold text-[#3B82F6]">RV : {reps || 0}</span>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={percentageBased}
                      onChange={(e) => setPercentageBased(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                    />
                    Set Based on Percentage
                  </label>
                </div>

                <p className="text-[11px] text-emerald-600 font-medium leading-snug mt-2">
                  *AI suggests {suggestedWeight || "-"} {measurement} at {reps || "-"} or more {isRepsLike ? "reps" : unitType}.
                </p>

                {!showSets && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        const numSets = Number(sets.replace(/\D/g, "")) || 1;
                        setSetCards(
                          Array.from({ length: numSets }, () => ({
                            ...EMPTY_SET_CARD,
                            weight: suggestedWeight,
                            reps,
                            repsCompanion,
                          })),
                        );
                        setShowSets(true);
                      }}
                      className="h-9 px-5 rounded-full bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#16A34A] transition"
                    >
                      Submit Set
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* One card per set — count comes from the "sets" dropdown above (1x-5x) */}
            {showSets && setCards.map((card, i) => (
              <div key={i} className="relative border border-gray-200 rounded-2xl p-5 mb-6">
                <button
                  onClick={() => stub("Edit Set")}
                  className="absolute top-4 right-4 text-[#3B82F6] hover:opacity-70 transition"
                >
                  <Pencil size={15} />
                </button>

                <p className="text-sm font-bold text-[#222] mb-4">Set {i + 1}</p>

                <div className={`grid grid-cols-2 ${companion.show ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-3 mb-3`}>
                  <input
                    placeholder="Weight/R..."
                    value={card.weight}
                    onChange={(e) => updateCard(i, { weight: e.target.value })}
                    className="h-12 rounded-xl border border-[#3B82F6] px-4 text-base outline-none focus:border-[#2563EB] transition"
                  />
                  {card.reps ? (
                    <input
                      value={card.reps}
                      onChange={(e) => updateCard(i, { reps: e.target.value })}
                      placeholder={unitType === "minutes" ? "00" : unitType === "meters" ? "Add reps" : "Reps"}
                      className={`h-12 rounded-xl border px-4 text-base outline-none focus:border-[#2563EB] transition ${
                        companion.primaryMandatory && !card.reps ? "border-red-400" : "border-[#3B82F6]"
                      }`}
                    />
                  ) : (
                    <button
                      onClick={() => updateCard(i, { reps: "0" })}
                      className="h-12 rounded-xl border border-[#3B82F6] text-[#3B82F6] text-sm font-semibold hover:bg-blue-50 transition"
                    >
                      Add REPS
                    </button>
                  )}
                  {companion.show && (
                    <div className="flex items-center gap-1.5">
                      {companion.separator && (
                        <span className="text-gray-400 font-semibold text-base shrink-0">{companion.separator}</span>
                      )}
                      <input
                        value={card.repsCompanion}
                        onChange={(e) => updateCard(i, { repsCompanion: e.target.value })}
                        placeholder={companion.companionPlaceholder}
                        className={`h-12 w-full rounded-xl border px-4 text-base outline-none focus:border-[#2563EB] transition ${
                          companion.companionMandatory && !card.repsCompanion ? "border-red-400" : "border-[#3B82F6]"
                        }`}
                      />
                    </div>
                  )}
                  {/* Cosmetic only — no field for these in the real API yet */}
                  <input
                    placeholder="METs"
                    value={card.mets}
                    onChange={(e) => updateCard(i, { mets: e.target.value })}
                    className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition"
                  />
                  <div className="relative">
                    <select
                      value={card.effort}
                      onChange={(e) => updateCard(i, { effort: e.target.value })}
                      className="w-full h-12 rounded-xl border border-gray-200 px-4 text-base text-[#222] outline-none appearance-none focus:border-[#8B5CF6] transition"
                    >
                      <option value="" disabled>Max Effort</option>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Cosmetic only — no field for these in the real API yet */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  <input placeholder="Miles" value={card.miles} onChange={(e) => updateCard(i, { miles: e.target.value })} className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition" />
                  <input placeholder="RPM's" value={card.rpm} onChange={(e) => updateCard(i, { rpm: e.target.value })} className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition" />
                  <input placeholder="HR (Heart R..." value={card.heartRate} onChange={(e) => updateCard(i, { heartRate: e.target.value })} className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition" />
                  <input placeholder="Calories" value={card.calories} onChange={(e) => updateCard(i, { calories: e.target.value })} className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition" />
                  <input placeholder="Watt" value={card.watt} onChange={(e) => updateCard(i, { watt: e.target.value })} className="h-12 rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-[#8B5CF6] transition" />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={card.addPowerset}
                    onChange={(e) => updateCard(i, { addPowerset: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  Add powerset
                </label>
              </div>
            ))}

            {/* Notes is one field per logged exercise, not per set, so it lives outside the set cards */}
            {showSets && (
              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#3B82F6] px-4 py-3 text-base outline-none focus:border-[#2563EB] transition resize-none mb-6"
              />
            )}

            {error && (
              <p className="text-xs text-red-500 font-medium text-center mb-3">{error}</p>
            )}

            {/* Save action — only once sets have been submitted */}
            {showSets && (
              <div className="flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full max-w-72 h-10 rounded-full bg-[#3B82F6] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold hover:bg-[#2563EB] transition"
                >
                  {saving ? "Saving..." : "Save Exercise"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <ExerciseDetailsContent />
    </Suspense>
  );
}
