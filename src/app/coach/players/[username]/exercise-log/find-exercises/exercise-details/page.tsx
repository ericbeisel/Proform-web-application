"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Menu, ChevronDown, Gem, Pencil } from "lucide-react";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

function stub(label: string) {
  alert(`${label} — coming soon (backend endpoint pending).`);
}

// TODO(backend): no endpoint exists yet to save a coach-assigned exercise (suggested
// sets/reps, set tracking, powerset/percentage flags, notes) to a player's log — every
// field here is local-only dummy UI until a real per-player exercise API is added.
function ExerciseDetailsContent() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();
  const searchParams = useSearchParams();

  const name = searchParams.get("name") ?? "Exercise";
  const equipment = searchParams.get("equipment") ?? "";
  const hasPhoto = searchParams.get("hasPhoto") === "1";

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

  const [sets, setSets] = useState("1x");
  const [reps, setReps] = useState("12");
  const [unit, setUnit] = useState("Sec");
  const [percentageBased, setPercentageBased] = useState(false);

  const [showSet1, setShowSet1] = useState(false);
  const [set1Weight, setSet1Weight] = useState("");
  const [set1Reps, setSet1Reps] = useState("");
  const [mets, setMets] = useState("");
  const [effort, setEffort] = useState("Max Effort");
  const [miles, setMiles] = useState("");
  const [rpm, setRpm] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [calories, setCalories] = useState("");
  const [watt, setWatt] = useState("");
  const [addPowerset, setAddPowerset] = useState(false);
  const [notes, setNotes] = useState("");

  function handleSave(label: string) {
    stub(label);
    router.push(`/coach/players/${username}/exercise-log`);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex overflow-x-hidden">
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
                {equipment ? `${equipment} ${name}` : name}
              </h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

        {/* Last / Best */}
        <div className="border border-[#8B5CF6] rounded-xl px-6 py-4 max-w-md mx-auto mb-10">
          <div className="grid grid-cols-2 text-center gap-4">
            <div>
              <p className="font-bold text-[#222]">Last:</p>
              <p className="text-xs italic text-gray-500 mt-0.5">No records yet</p>
            </div>
            <div>
              <p className="font-bold text-[#222]">Best:</p>
              <p className="text-xs italic text-gray-400 mt-0.5">No records yet</p>
            </div>
          </div>
        </div>

        {/* Exercise + suggested */}
        <div className="flex flex-wrap items-start gap-6 sm:gap-8 mb-8">
          <div className="flex flex-col items-center gap-2 shrink-0 w-28">
            <div className="w-20 h-20 flex items-center justify-center">
              {hasPhoto ? (
                <div className="w-16 h-16 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-2xl">🏃</div>
              ) : (
                <Gem size={32} className="text-[#8B5CF6]" fill="#8B5CF6" />
              )}
            </div>
            <p className="text-xs font-bold text-[#222] text-center leading-tight uppercase">
              {name}
              {equipment && (
                <>
                  <br />
                  {equipment}
                </>
              )}
            </p>
          </div>

          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#8B5CF6]">Suggested:</p>
              <button
                onClick={() => stub("Upload Photo")}
                className="h-9 px-5 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition"
              >
                Upload Photo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mb-3">
              <div className="relative">
                <select
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-500 outline-none appearance-none focus:border-[#8B5CF6] transition"
                >
                  {["1x", "2x", "3x", "4x", "5x"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 px-3 text-sm text-[#222] outline-none focus:border-[#8B5CF6] transition"
              />
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#3B82F6] px-3 text-sm text-[#3B82F6] outline-none appearance-none focus:border-[#2563EB] transition"
                >
                  {["Sec", "Min", "Reps"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B82F6] pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              <input placeholder="Weight/R..." disabled className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 outline-none" />
              <input placeholder="Weight P..." disabled className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 outline-none" />
              <div className="relative">
                <select disabled className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 outline-none appearance-none">
                  <option>Weight T...</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-[10px] font-semibold text-[#3B82F6]">RV : 3</span>
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

            {!showSet1 && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSet1Reps(reps);
                    setShowSet1(true);
                  }}
                  className="h-9 px-5 rounded-full bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#16A34A] transition"
                >
                  Submit Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Set 1 card — only shown after the suggested set is submitted */}
        {showSet1 && (
        <div className="relative border border-gray-200 rounded-2xl p-5 mb-6">
          <button
            onClick={() => stub("Edit Set")}
            className="absolute top-4 right-4 text-[#3B82F6] hover:opacity-70 transition"
          >
            <Pencil size={15} />
          </button>

          <p className="text-sm font-bold text-[#222] mb-4">Set 1</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <input
              placeholder="Weight/R..."
              value={set1Weight}
              onChange={(e) => setSet1Weight(e.target.value)}
              className="h-10 rounded-lg border border-[#3B82F6] px-3 text-sm outline-none focus:border-[#2563EB] transition"
            />
            {set1Reps ? (
              <input
                value={set1Reps}
                onChange={(e) => setSet1Reps(e.target.value)}
                placeholder="Reps"
                className="h-10 rounded-lg border border-[#3B82F6] px-3 text-sm outline-none focus:border-[#2563EB] transition"
              />
            ) : (
              <button
                onClick={() => setSet1Reps("0")}
                className="h-10 rounded-lg border border-[#3B82F6] text-[#3B82F6] text-sm font-semibold hover:bg-blue-50 transition"
              >
                Add REPS
              </button>
            )}
            <input
              placeholder="METs"
              value={mets}
              onChange={(e) => setMets(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition"
            />
            <div className="relative">
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-[#222] outline-none appearance-none focus:border-[#8B5CF6] transition"
              >
                {["Max Effort", "80% Effort", "50% Effort"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <input placeholder="Miles" value={miles} onChange={(e) => setMiles(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition" />
            <input placeholder="RPM's" value={rpm} onChange={(e) => setRpm(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition" />
            <input placeholder="HR (Heart R..." value={heartRate} onChange={(e) => setHeartRate(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition" />
            <input placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition" />
            <input placeholder="Watt" value={watt} onChange={(e) => setWatt(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#8B5CF6] transition" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={addPowerset}
              onChange={(e) => setAddPowerset(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
            />
            Add powerset
          </label>

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#3B82F6] px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition resize-none"
          />
        </div>
        )}

        {/* Save actions */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={() => handleSave("Save Exercise")}
            className="w-72 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
          >
            Save Exercise
          </button>
          <button
            onClick={() => handleSave("Save and Add workout")}
            className="w-72 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
          >
            Save and Add workout
          </button>
          <button
            onClick={() => handleSave("Save and Add Custom Exercise Standard")}
            className="w-72 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
          >
            Save and Add Custom Exercise Standard
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ExerciseDetailsContent />
    </Suspense>
  );
}
