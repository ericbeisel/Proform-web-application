"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CheckCircle2, Dumbbell, Loader2 } from "lucide-react";
import { equipmentApi, Equipment } from "@/api/location/route";

export default function CreateLocationPage() {
  const router = useRouter();

  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    equipmentApi
      .getAllEquipment()
      .then(setAllEquipment)
      .catch(console.error)
      .finally(() => setLoadingEquip(false));
  }, []);

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
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Location</h1>
            <p className="text-xs text-gray-400 mt-1">
              Customize your workout by selecting available equipment
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Selected count pill */}
        <div className="mt-4 inline-flex items-center gap-2 bg-[#7c3aed] text-white text-sm font-semibold px-5 py-2.5 rounded-full">
          <CheckCircle2 size={15} className="fill-white/30" />
          {selectedIds.size} equipment selected
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Equipment grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {loadingEquip ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7c3aed]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((eq) => {
              const isSelected = selectedIds.has(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquip(eq.id)}
                  className={`relative flex flex-col items-center rounded-2xl p-3 border transition-all ${
                    isSelected
                      ? "border-[#7c3aed] bg-purple-50 ring-2 ring-[#7c3aed]/10"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 text-[#7c3aed]">
                      <CheckCircle2 size={14} fill="white" />
                    </div>
                  )}
                  <div className="h-10 w-10 mb-2 flex items-center justify-center bg-gray-50 rounded-xl p-1.5">
                    {eq.icon ? (
                      <img
                        src={eq.icon}
                        alt={eq.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Dumbbell
                        size={18}
                        className={isSelected ? "text-[#7c3aed]" : "text-gray-400"}
                      />
                    )}
                  </div>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-wide text-center leading-tight ${
                      isSelected ? "text-[#7c3aed]" : "text-gray-500"
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
      <div className="px-5 pt-4 pb-8 flex-shrink-0 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          Give this location a title:
        </p>
        <input
          type="text"
          placeholder="e.g., Home Gym, Main Gym, Outdoor Park"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7c3aed] mb-4"
        />
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm py-4 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
