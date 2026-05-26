"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { X, Check, MapPin, Dumbbell, Search, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, Equipment } from "@/api/location/route";

export default function AddLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/location";

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New State for handling "Name Already Exists" error
  const [nameError, setNameError] = useState("");

  const isReadyToSave = locationName.trim().length > 0 && selected.length > 0;

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentApi.getAllEquipment();
        setEquipment(data);
      } catch (err) {
        console.error("Failed to fetch equipment:", err);
      }
    };
    fetchEquipment();
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [equipment, searchQuery]);

  const toggleEquipment = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

const handleCreate = async () => {
  if (!isReadyToSave) return;
  
  setNameError(""); // Reset error state
  setLoading(true);

  try {
    await equipmentApi.createLocation({
      location_name: locationName.trim(),
      equipments: selected.join(","),
      default_location: 0,
    });
    router.push(returnTo);
  } catch (err: any) {
    console.error("Debug Error:", err);

    // Get the message from the API response
    const apiMessage = err.response?.data?.message || "";
    const statusCode = err.response?.status;

    // Check if the name is a duplicate
    // We check for 409 (Conflict), 422 (Validation), or the specific text
    if (
      statusCode === 409 || 
      statusCode === 422 || 
      apiMessage.toLowerCase().includes("exists") || 
      apiMessage.toLowerCase().includes("already taken")
    ) {
      setNameError("This location name already exists. Please choose a unique name.");
    } else {
      // If it's something else (like a 500 error or internet connection)
      alert(apiMessage || "Failed to create location. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Create Location</h1>
            <p className="text-sm text-gray-400 m-0 font-medium">Add a new training location</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selected.length > 0 && (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100 animate-in fade-in zoom-in">
      <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-pulse" />
      <span className="text-[11px] font-bold text-[#7c3aed] whitespace-nowrap">
        {selected.length} SELECTED
      </span>
    </div>
  )}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-[#7c3aed]/10 transition-all w-48 lg:w-64"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !isReadyToSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm
              ${isReadyToSave 
                ? "bg-[#7c3aed] text-white hover:opacity-90 shadow-purple-200" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Saving..." : (
              <>
                <Check size={18} />
                <span>Save Location</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        
     {/* TOP SECTION: Location Details Card - Compact Version */}
<div className="bg-[#f8faff] rounded-[1.5rem] p-6 sm:p-7 border border-[#eef2ff] flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 mt-2">
  {/* Shrunk icon from w-20 to w-14 */}
  <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
    <MapPin size={28} />
  </div>

  <div className="flex-1 w-full text-left">
    <h2 className="text-lg font-bold text-gray-900 mb-0.5">Location Details</h2>
    <p className="text-xs text-gray-400 mb-4 font-medium">
      Give your location a name and select the equipment available
    </p>
    
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-900 ml-1">
        Location Name
      </label>
      <input
        value={locationName}
        onChange={(e) => {
          setLocationName(e.target.value);
          if (nameError) setNameError(""); 
        }}
        placeholder="e.g., Home Gym, LA Fitness"
        className={`w-full p-3 border rounded-xl text-sm font-medium transition-all outline-none 
          ${nameError 
            ? "border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200" 
            : "border-gray-100 bg-white focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]"
          }`}
      />
      
      {nameError && (
        <div className="flex items-center gap-1.5 text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={12} />
          <p className="text-[11px] font-bold">{nameError}</p>
        </div>
      )}
    </div>
  </div>
</div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden mb-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#7c3aed]/10 transition-all"
                />
            </div>
        </div>

        {/* EQUIPMENT SECTION */}
        <div className="mb-6 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Available Equipment</h2>
          <p className="text-sm text-gray-400 font-medium">
            Select at least one ({selected.length} selected)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {filteredEquipment.map((item) => {
            const isSelected = selected.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                className={`cursor-pointer rounded-2xl border p-8 flex flex-col items-center justify-center transition-all duration-200 group
                ${isSelected
                    ? "border-[#7c3aed] bg-[#7c3aed]/5 ring-1 ring-[#7c3aed] scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-gray-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="h-16 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} className="h-12 w-auto object-contain" />
                  ) : (
                    <Dumbbell size={32} className={isSelected ? 'text-[#7c3aed]' : 'text-gray-300'} />
                  )}
                </div>
                <p className={`text-xs font-bold uppercase tracking-wide text-center ${isSelected ? 'text-[#7c3aed]' : 'text-gray-900'}`}>
                  {item.name}
                </p>
              </div>
            );
          })}
        </div>
        
        {filteredEquipment.length === 0 && (
            <div className="text-center py-20">
                <p className="text-gray-400 font-medium">No equipment matches your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}