"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, MapPin, Dumbbell, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, EquipmentItem, LocationItem } from "@/api/location/route";

export default function EquipmentNeededPage() {
  const router = useRouter();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [equipments, setEquipments] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch locations
  const fetchLocations = async () => {
    try {
      const data = await equipmentApi.getLocationList();
      setLocations(data);
    } catch (err) {
      console.error(err);
    }
  };

  // fetch equipment for location
  const fetchLocationDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await equipmentApi.getLocationDetail(id);
      setEquipments(data.equipmentList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLocation(id);
    if (id) {
      fetchLocationDetail(id);
    } else {
      setEquipments([]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* MATCHED HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Start Session</h1>
            <p className="text-sm text-gray-400 m-0 font-medium">Select your workout environment</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 mt-4">

        {/* LOCATION SELECTION CARD */}
        <div className="bg-[#f8faff] rounded-[2rem] p-8 sm:p-10 border border-[#eef2ff] flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <MapPin size={36}  />
          </div>
          <div className="flex-1 w-full text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-left">Choose your Location</h2>
            <p className="text-sm text-gray-400 mb-6 font-medium text-left">
              We'll filter exercises based on the gear available here
            </p>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  className="w-full p-4 pr-10 border border-gray-100 rounded-2xl text-base font-medium text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a saved location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>

              <button
                onClick={() => {
                  const url = selectedLocation 
                    ? `/workout/selectEquipmentNeeded?locationId=${selectedLocation}` 
                    : "/workout/selectEquipmentNeeded";
                  router.push(url);
                }}
                className="bg-white text-[#7c3aed] w-14 rounded-2xl border border-gray-100 hover:border-[#7c3aed] hover:bg-purple-50 transition-all flex items-center justify-center shadow-sm"
                title="Add New Location"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* EQUIPMENT DISPLAY */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
          </div>
        ) : equipments.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Section Header with Dumbbell Icon */}
            <div className="mb-8 p-6 border border-gray-100 rounded-[2rem] bg-white flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 bg-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] flex-shrink-0">
                <Dumbbell size={28} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Available Equipment</h2>
                <p className="text-sm text-gray-400 font-medium">
                  {equipments.length} items found at this location
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {equipments.map((eq) => (
                <div
                  key={eq.id}
                  className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm transition-all hover:border-[#7c3aed]/30 hover:shadow-md"
                >
                  <div className="h-16 w-16 mb-4 flex items-center justify-center bg-gray-50 rounded-xl p-2">
                    <img
                      src={eq.icon}
                      alt={eq.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-900 text-center m-0 uppercase tracking-wide">
                    {eq.name}
                  </p>
                </div>
              ))}
            </div>

            {/* START SESSION BUTTON */}
            <div className="mt-16 flex justify-center">
              <button
                className="w-full max-w-md bg-[#7c3aed] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                start session
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          selectedLocation && !loading && (
            <div className="text-center py-20 bg-[#f8faff] rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-medium">
              <Dumbbell size={40} className="mx-auto mb-4 opacity-20" />
              No equipment registered at this location.
            </div>
          )
        )}
      </div>
    </div>
  );
}