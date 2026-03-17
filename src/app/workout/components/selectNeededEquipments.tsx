"use client";

import { useEffect, useState, Suspense } from "react";
import { X, Plus, MapPin, Check, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { equipmentApi, Equipment, LocationItem } from "@/api/location/route";

function SelectEquipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationIdFromUrl = searchParams.get("locationId");

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  
  // NEW STATES
  const [newLocationName, setNewLocationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchLocations();
      const allEquip = await equipmentApi.getAllEquipment();
      
      if (locationIdFromUrl) {
        setSelectedLocation(locationIdFromUrl);
        try {
          const detail = await equipmentApi.getLocationDetail(locationIdFromUrl);
          const activeIds = detail.equipmentList.map((e) => e.id);
          setEquipments(allEquip.map(eq => ({
            ...eq,
            selected: activeIds.includes(eq.id)
          })));
        } catch (err) {
          setEquipments(allEquip);
        }
      } else {
        setEquipments(allEquip);
      }
    };
    init();
  }, [locationIdFromUrl]);

  const fetchLocations = async () => {
    const data = await equipmentApi.getLocationList();
    setLocations(data);
  };

  const handleLocationChange = async (id: string) => {
    setSelectedLocation(id);
    if (!id) return;
    const detail = await equipmentApi.getLocationDetail(id);
    const ids = detail.equipmentList.map((e) => e.id);
    setEquipments((prev) =>
      prev.map((eq) => ({ ...eq, selected: ids.includes(eq.id) }))
    );
  };

  const toggleEquipment = (id: number) => {
    setEquipments((prev) =>
      prev.map((eq) => eq.id === id ? { ...eq, selected: !eq.selected } : eq)
    );
  };

  // HANDLE CREATE AND START
  const handleStartWorkout = async () => {
    if (!newLocationName.trim()) {
      alert("Please enter a name for this location configuration.");
      return;
    }

    const selectedIds = equipments
      .filter((eq: any) => eq.selected)
      .map((eq) => eq.id)
      .join(",");

    if (!selectedIds) {
      alert("Please select at least one piece of equipment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await equipmentApi.createLocation({
        location_name: newLocationName,
        equipments: selectedIds,
        default_location: 0,
      });
      
      // Navigate to the next step of your workout flow
    } catch (err: any) {
      alert(err.message || "Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e] pb-20">
      
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#7c3aed] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Plus size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">Equipment Needed</h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">Customize your session gear</p>
          </div>
        </div>
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-7">
        
        {/* QUICK SELECT DROPDOWN */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#555] mb-3 uppercase tracking-wider">
            <MapPin size={14} className="text-[#7c3aed]" /> Quick Select by Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl text-base font-bold text-[#1a1a2e] bg-gray-50 outline-none focus:border-[#7c3aed] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="">Choose a saved location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          {equipments.map((eq: any) => (
            <div
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className={`relative p-4 rounded-2xl border transition-all duration-200 text-center cursor-pointer bg-white shadow-sm
                ${eq.selected ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/10" : "border-gray-100"}`}
            >
              {eq.selected && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#7c3aed] text-white rounded-full p-1 z-10">
                  <Check size={10} strokeWidth={4} />
                </div>
              )}
              <div className="h-12 w-12 mx-auto mb-2 flex items-center justify-center">
                <img src={eq.icon} alt={eq.name} className="max-h-full max-w-full object-contain" />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-tight leading-tight ${eq.selected ? 'text-[#7c3aed]' : 'text-gray-500'}`}>
                {eq.name}
              </p>
            </div>
          ))}
        </div>

        {/* LOCATION NAME INPUT & START BUTTON */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col items-center gap-6">
          <div className="w-full max-w-md">
            <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Name this Configuration
            </label>
            <input 
              type="text"
              placeholder="e.g. My Home Gym, Planet Fitness..."
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold text-[#1a1a2e] outline-none focus:border-[#7c3aed] focus:bg-white transition-all shadow-inner"
            />
          </div>

          <button 
            onClick={handleStartWorkout}
            disabled={isSubmitting}
            className="w-full max-w-md bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full text-white py-5 font-black shadow-2xl uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Save & Start Workout"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SelectNeededEquipments() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SelectEquipContent />
    </Suspense>
  );
}