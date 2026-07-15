"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CheckCircle2, Dumbbell, Loader2 } from "lucide-react";
import { equipmentApi, Equipment } from "@/api/location/route";
import { getProgramEquipment, Equipment as ProgramEquipment } from "@/api/programs/route";

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
  }, []);

  const isRequiredEquipment = (eq: Equipment) =>
    requiredEquipment.some(
      (req) => req.id === eq.id || req.name?.toLowerCase() === eq.name?.toLowerCase(),
    );

  const toggleEquip = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = allEquipment.filter(
    (eq) => !search || eq.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const data = await equipmentApi.createLocation({
        location_name: title.trim(),
        equipments: Array.from(selectedIds).join(","),
      });
      if (makeDefault) {
        await equipmentApi.selectDefaultLocation(data.id).catch(() => {});
      }
      // Store new location ID so equipmentNeeded auto-selects it
      localStorage.setItem("newLocationId", String(data.id));
      localStorage.setItem("newLocationName", title.trim());
      router.push("/workout/equipmentNeeded");
    } catch (err) {
      console.error("[createLocation] failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = title.trim() ? "Create Location" : "Select Equipment & Add Title";

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

          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
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
              // Two fully independent indicators: `isSelected` = added to
              // this location (purple fill + checkmark), `isRequired` =
              // needed by the workout currently being set up (amber ring) —
              // an item can be either, both, or neither.
              const isSelected = selectedIds.has(eq.id);
              const isRequired = isRequiredEquipment(eq);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquip(eq.id)}
                  className={`relative flex flex-col items-center rounded-2xl px-1.5 py-6 border transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 ring-2 ring-green-500/10"
                      : "border-gray-200 bg-white"
                  } ${
                    isRequired && !isSelected
                      ? "outline outline-2 outline-offset-2 outline-[#7c3aed]"
                      : ""
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 text-green-500">
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
                        className={isSelected ? "text-green-600" : "text-gray-400"}
                      />
                    )}
                  </div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight ${
                      isSelected ? "text-green-600" : "text-gray-500"
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
