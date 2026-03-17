"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Dumbbell 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi } from "@/api/location/route";

export default function LocationList() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchLocations = async () => {
    try {
      const data = await equipmentApi.getLocationList();
      setLocations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
  try {
    await equipmentApi.deleteLocation(id);

    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* Top Bar - Styled exactly like Workout Dashboard */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button 
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-[#e8e8f0] rounded-full flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-colors flex-shrink-0 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">My Locations</h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">
              {locations.length} locations saved • Customize your experience
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push("/location/addLocation")}
          className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white px-3 sm:px-5 py-2 sm:py-2.5 cursor-pointer flex items-center gap-1.5 font-semibold text-xs sm:text-sm whitespace-nowrap shadow-md"
        >
          <Plus size={16} /> <span className="hidden xs:inline">Add</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 lg:p-7 max-w-4xl mx-auto">
        
        {/* Header/Hero Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 mb-4 bg-indigo-50 rounded-full flex items-center justify-center text-[#7c3aed]">
            <MapPin size={32} />
          </div>
             <h1 className="text-lg font-semibold text-purple-600">
            My Locations:
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create and edit your locations to customize your workout experience
          </p>
        </div>

        {/* Location List - Using the Dark Card style from your Sessions list */}
        <div className="flex flex-col gap-3.5">
          <h3 className="font-bold text-base text-[#1a1a2e] mb-1">Registered Locations</h3>
          
          {locations.length === 0 ? (
             <div className="text-center py-10 text-[#aaa] italic">No locations found. Add one to get started!</div>
          ) : (
            locations.map((location) => {
              const isExpanded = expanded === location.id;

              return (
                <div
                  key={location.id}
                  className={`rounded-xl p-4 sm:p-5 flex flex-col transition-all bg-[#1e1e2e] shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 sm:gap-4 cursor-pointer flex-1"
                      onClick={() => router.push(`/location/${location.id}`)}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7c3aed]/20 border-2 border-[#7c3aed] flex items-center justify-center">
                        <Dumbbell size={16} className="text-[#7c3aed]" />
                      </div>
                      <div>
                        <p className="font-bold text-sm sm:text-base text-white m-0">
                          {location.name}
                        </p>
                        <p className="text-xs text-[#888] mt-0.5">
                          {location.equipmentList?.length || 0} pieces of equipment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : location.id)}
                        className="bg-[#2a2a3e] text-white p-2 rounded-lg hover:bg-[#3b3b54] transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                  <button 
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/location/edit/${location.id}`);
  }}
  className="bg-[#2a2a3e] text-[#888] p-2 rounded-lg hover:text-white transition-colors"
>
  <Pencil size={18} />
</button>
                   <button 
  onClick={(e) => {
    e.stopPropagation(); 
    setDeleteTarget(location.id);
  }}
  className="bg-[#2a2a3e] text-[#ef4444] p-2 rounded-lg hover:bg-red-500/10 transition-colors"
>
  <Trash2 size={18} />
</button>
                    </div>
                  </div>

                  {/* Expanded Equipment List - Styled like the Tips box */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="bg-[#2a2a3e] rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#7c3aed] mb-2">Available Equipment</p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {location.equipmentList?.length > 0 
                            ? location.equipmentList.map((eq: any) => eq.name).join(" • ")
                            : "No equipment listed for this location."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
   {deleteTarget !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-[#1e1e2e] rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
      <p className="text-white font-semibold mb-4">
        Are you sure you want to delete this location?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setDeleteTarget(null)}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            if (deleteTarget === null) return;
            try {
              setIsDeleting(true);
              await handleDelete(deleteTarget);
              setDeleteTarget(null);
            } catch (err) {
              console.error(err);
            } finally {
              setIsDeleting(false);
            }
          }}
          className={`px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors ${
            isDeleting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}