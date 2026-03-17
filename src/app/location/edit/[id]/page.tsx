"use client";

import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Check, Loader2, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { equipmentApi, Equipment, LocationItem } from "@/api/location/route";

function EditEquipContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================
  // INIT (same as your UI)
  // ============================
  useEffect(() => {
    const init = async () => {
      try {
        const [locs, allEquip, detail] = await Promise.all([
          equipmentApi.getLocationList(),
          equipmentApi.getAllEquipment(),
          equipmentApi.getLocationDetail(id),
        ]);

        setLocations(locs);
        setSelectedLocation(id);
        setLocationName(detail.name);

        const activeIds = detail.equipmentList.map((e) => e.id);

        setEquipments(
          allEquip.map((eq) => ({
            ...eq,
            selected: activeIds.includes(eq.id),
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [id]);

  // ============================
  // TOGGLE
  // ============================
  const toggleEquipment = (id: number) => {
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === id ? { ...eq, selected: !eq.selected } : eq
      )
    );
  };

  // ============================
  // UPDATE
  // ============================
  const handleUpdate = async () => {
    const selectedIds = equipments
      .filter((eq: any) => eq.selected)
      .map((eq) => eq.id)
      .join(",");

    if (!locationName.trim()) {
      alert("Enter location name");
      return;
    }

    if (!selectedIds) {
      alert("Select at least one equipment");
      return;
    }

    try {
      setIsSubmitting(true);

      await equipmentApi.updateLocation({
        id,
        location_name: locationName,
        equipments: selectedIds,
      });

      router.push("/location");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e] pb-20">
      
      {/* ✅ SAME HEADER (just back button) */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button 
            onClick={() => router.back()}
            className="w-9 h-9 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">
              Edit Equipment
            </h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">
              Update your location setup
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-7">
        
        {/* SAME INPUT CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#555] mb-3 uppercase tracking-wider">
            <MapPin size={14} className="text-[#7c3aed]" /> Location Name
          </label>

          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl font-bold"
          />
        </div>

        {/* ✅ SAME GRID UI */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          {equipments.map((eq: any) => (
            <div
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className={`relative p-4 rounded-2xl border transition-all duration-200 text-center cursor-pointer bg-white shadow-sm
                ${
                  eq.selected
                    ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/10"
                    : "border-gray-100"
                }`}
            >
              {eq.selected && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#7c3aed] text-white rounded-full p-1">
                  <Check size={10} strokeWidth={4} />
                </div>
              )}

              <div className="h-12 w-12 mx-auto mb-2 flex items-center justify-center">
                <img
                  src={eq.icon || "/placeholder.png"}
                  alt={eq.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <p
                className={`text-[10px] font-black uppercase ${
                  eq.selected ? "text-[#7c3aed]" : "text-gray-500"
                }`}
              >
                {eq.name}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ SAME BUTTON STYLE */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="w-full max-w-md bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full text-white py-5 font-black shadow-2xl uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Update Location"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditLocationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditEquipContent />
    </Suspense>
  );
}