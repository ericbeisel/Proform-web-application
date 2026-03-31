"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, MapPin, Dumbbell, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, EquipmentItem, LocationItem } from "@/api/location/route";

export default function EquipmentNeededPage() {
  const router = useRouter();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [equipments, setEquipments] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Type-safe states for matching logic
  const [requiredItems, setRequiredItems] = useState<any[]>([]);
  const [selectedEquipIds, setSelectedEquipIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [locData, allEquip] = await Promise.all([
          equipmentApi.getLocationList(),
          equipmentApi.getAllEquipment()
        ]);
        
        setLocations(locData);

        if (allEquip && allEquip.length > 0) {
          // Generate random requirements
          const shuffled = [...allEquip].sort(() => 0.5 - Math.random());
          setRequiredItems(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error("Initialization failed:", err);
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
      
      // Auto-match random requirements with fetched equipment
      const matchedIds = fetchedList
        .filter((eq: EquipmentItem) => requiredItems.some(req => req.id === eq.id))
        .map((eq: EquipmentItem) => eq.id);
        
      setSelectedEquipIds(new Set(matchedIds));
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLocation(id);
    if (id) {
      fetchLocationDetail(id);
    } else {
      setEquipments([]);
      setSelectedEquipIds(new Set());
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

  const handleStartSession = () => {
    const idsParam = Array.from(selectedEquipIds).join(",");
    const locationPart = selectedLocation ? `&locationId=${selectedLocation}` : "";
    router.push(`/workout/session?equipment=${idsParam}${locationPart}`);
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment Check</h1>
            <p className="text-sm text-gray-400 font-medium">Verify your gear before starting</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 mt-4">
        
        {/* REQUIREMENTS BANNER */}
        {requiredItems.length > 0 && (
          <div className="mb-8 p-5 bg-[#7c3aed]/5 rounded-[2rem] border border-[#7c3aed]/10">
            <h3 className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">Goal Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {requiredItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                  {item.icon && <img src={item.icon} alt="" className="w-4 h-4 object-contain" />}
                  <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCATION SELECTION CARD */}
        <div className="bg-[#f8faff] rounded-[2rem] p-8 sm:p-10 border border-[#eef2ff] flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <MapPin size={36} />
          </div>
          <div className="flex-1 w-full text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Choose your Location</h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">
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
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>

              {/* PLUS BUTTON WITH ORIGINAL LOCATION ID LOGIC */}
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

        {/* EQUIPMENT GRID */}
        <div className="min-h-[200px]">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
            </div>
          ) : equipments.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-gray-900">Available Gear</h2>
                <span className="text-xs font-bold text-[#7c3aed] bg-purple-50 px-3 py-1 rounded-full uppercase">
                  {selectedEquipIds.size} Matched
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {equipments.map((eq) => {
                  const isRequired = requiredItems.some(req => req.id === eq.id);
                  const isSelected = selectedEquipIds.has(eq.id);

                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`relative flex flex-col items-center bg-white border rounded-3xl p-6 shadow-sm transition-all hover:shadow-md
                        ${isSelected ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/10' : 'border-gray-100 opacity-80'}
                        ${isRequired && !isSelected ? 'bg-purple-50/10 border-dashed border-purple-200' : ''}`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-[#7c3aed] animate-in zoom-in">
                          <CheckCircle2 size={22} fill="white" />
                        </div>
                      )}

                      <div className="h-16 w-16 mb-4 flex items-center justify-center bg-gray-50 rounded-2xl p-2">
                        <img src={eq.icon} alt={eq.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#7c3aed]' : 'text-gray-500'}`}>
                        {eq.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            selectedLocation && (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                <Dumbbell size={32} className="mx-auto mb-3 opacity-10" />
                <p className="text-sm font-medium">No equipment at this location</p>
              </div>
            )
          )}
        </div>

        {/* START SESSION BUTTON */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button
            onClick={handleStartSession}
            className="w-full max-w-md bg-[#7c3aed] text-white py-5 rounded-full font-bold text-lg shadow-xl shadow-purple-100 flex items-center justify-center gap-2 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
          >
            Start Session
            <ChevronRight size={20} />
          </button>
          
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {selectedLocation ? "Location verified" : "Manual equipment mode"}
          </p>
        </div>
      </div>
    </div>
  );
}