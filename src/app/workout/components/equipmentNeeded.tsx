"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, EquipmentItem, LocationItem } from "@/api/location/route";

export default function EquipmentNeededPage() {
  const router = useRouter();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [equipments, setEquipments] = useState<EquipmentItem[]>([]);

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
      const data = await equipmentApi.getLocationDetail(id);
      setEquipments(data.equipmentList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationChange = (e: any) => {
    const id = e.target.value;
    setSelectedLocation(id);
    fetchLocationDetail(id);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* MATCHED HEADER */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">Start Session</h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">Select your workout environment</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-7">

        {/* LOCATION SELECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-3 uppercase tracking-wider">
            <MapPin size={14} className="text-[#7c3aed]" /> Select Location
          </label>

          <div className="flex gap-3">
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="flex-1 p-4 border border-gray-200 rounded-xl text-base font-bold text-[#1a1a2e] bg-gray-50 outline-none focus:border-[#7c3aed] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>

            {/* <button
              onClick={() => router.push("/workout/selectEquipmentNeeded")}
              className="bg-indigo-50 text-[#7c3aed] px-4 rounded-xl border border-indigo-100 hover:bg-[#7c3aed] hover:text-white transition-all flex items-center justify-center"
              title="Add New Location"
            >
              <Plus size={20} />
            </button> */}
<button
  onClick={() => {
    // If a location is selected, pass it to the next page
    const url = selectedLocation 
      ? `/workout/selectEquipmentNeeded?locationId=${selectedLocation}` 
      : "/workout/selectEquipmentNeeded";
    router.push(url);
  }}
  className="bg-indigo-50 text-[#7c3aed] px-4 rounded-xl border border-indigo-100 hover:bg-[#7c3aed] hover:text-white transition-all flex items-center justify-center"
  title="Add New Location"
>
  <Plus size={20} />
</button>
          </div>
        </div>

        {/* EQUIPMENT DISPLAY */}
        {equipments.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-bold text-[#1a1a2e] mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#7c3aed] rounded-full"></span>
              Available Equipment
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {equipments.map((eq) => (
                <div
                  key={eq.id}
                  className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <div className="w-16 h-16 mb-3 flex items-center justify-center">
                    <img
                      src={eq.icon}
                      alt={eq.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-[#555] text-center m-0 uppercase tracking-tight">
                    {eq.name}
                  </p>
                </div>
              ))}
            </div>

            {/* MATCHED START SESSION BUTTON */}
            <div className="mt-12 flex justify-center">
              <button
                className="w-full max-w-sm bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-full text-white py-4 font-bold text-base cursor-pointer hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                start session
              </button>
            </div>
          </div>
        ) : (
          selectedLocation && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-[#999] italic">
              No equipment registered at this location.
            </div>
          )
        )}
      </div>
    </div>
  );
}