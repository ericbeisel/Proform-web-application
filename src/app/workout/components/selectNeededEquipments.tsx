"use client";

import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Plus, MapPin, Check, Loader2, ChevronRight, Dumbbell, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { equipmentApi, Equipment, LocationItem } from "@/api/location/route";

function SelectEquipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationIdFromUrl = searchParams.get("locationId");

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const selectedCount = equipments.filter(eq => eq.selected).length;

  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        const [allEquip, locList] = await Promise.all([
          equipmentApi.getAllEquipment(),
          equipmentApi.getLocationList()
        ]);
        setLocations(locList);
        
        if (locationIdFromUrl) {
          setSelectedLocation(locationIdFromUrl);
          const detail = await equipmentApi.getLocationDetail(locationIdFromUrl);
          const activeIds = detail.equipmentList.map((e) => e.id);
          setNewLocationName(detail.name);
          setEquipments(allEquip.map(eq => ({ ...eq, selected: activeIds.includes(eq.id) })));
        } else {
          setEquipments(allEquip.map(eq => ({ ...eq, selected: false })));
        }
      } catch (err) { console.error(err); } finally { setInitialLoading(false); }
    };
    init();
  }, [locationIdFromUrl]);

  const handleLocationChange = async (id: string) => {
    setSelectedLocation(id);
    if (!id) return;
    const detail = await equipmentApi.getLocationDetail(id);
    setNewLocationName(detail.name);
    const ids = detail.equipmentList.map((e) => e.id);
    setEquipments((prev) => prev.map((eq) => ({ ...eq, selected: ids.includes(eq.id) })));
  };

  const toggleEquipment = (id: number) => {
    setEquipments((prev) => prev.map((eq) => eq.id === id ? { ...eq, selected: !eq.selected } : eq));
  };

  const handleStartWorkout = async () => {
    if (!newLocationName.trim()) return alert("Please name this configuration.");
    if (selectedCount === 0) return alert("Select at least one piece of equipment.");

    setIsSubmitting(true);
    try {
      await equipmentApi.createLocation({
        location_name: newLocationName,
        equipments: equipments.filter(eq => eq.selected).map(eq => eq.id).join(","),
        default_location: 0,
      });
      router.push("/workout/session");
    } catch (err: any) { alert(err.message || "Failed to save"); } finally { setIsSubmitting(false); }
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#7c3aed]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e] pb-40">
      
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-50 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">Gear Checklist</h1>
            <p className="text-xs sm:text-sm text-gray-400 m-0 font-medium">Pick gear for this session</p>
          </div>
        </div>
        {selectedCount > 0 && (
          <div className="bg-[#7c3aed]/10 text-[#7c3aed] px-3 py-1 rounded-full text-xs font-bold">
            {selectedCount} Selected
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* TOP: QUICK RELOAD */}
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100">
          <MapPin size={20} className="text-[#7c3aed] ml-2" />
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer"
          >
            <option value="">Load gear from a saved location...</option>
            {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {equipments.map((eq: any) => (
            <div
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className={`relative cursor-pointer rounded-2xl border p-6 flex flex-col items-center justify-center transition-all
                ${eq.selected ? "border-[#7c3aed] bg-[#7c3aed]/5 ring-1 ring-[#7c3aed] scale-[1.02]" : "border-gray-100 bg-white hover:border-gray-200"}`}
            >
              {eq.selected && <div className="absolute top-2 right-2 bg-[#7c3aed] text-white rounded-full p-1"><Check size={10} strokeWidth={4} /></div>}
              <div className="h-12 w-12 mb-3"><img src={eq.icon} alt={eq.name} className="h-full w-full object-contain" /></div>
              <p className={`text-[10px] font-bold uppercase tracking-wide text-center ${eq.selected ? 'text-[#7c3aed]' : 'text-gray-900'}`}>{eq.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY FOOTER ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 sm:p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Save size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Name this configuration (e.g. Hotel Gym)"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
          </div>
          <button 
            onClick={handleStartWorkout}
            disabled={isSubmitting || selectedCount === 0}
            className="w-full sm:w-auto px-10 py-4 bg-[#7c3aed] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectNeededEquipments() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#7c3aed]" size={40} /></div>}>
      <SelectEquipContent />
    </Suspense>
  );
}