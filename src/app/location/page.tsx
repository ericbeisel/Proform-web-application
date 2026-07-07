"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  MapPin, 
  Dumbbell,
  Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi } from "@/api/location/route";

export default function LocationList() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultLocationId, setDefaultLocationId] = useState<number | null>(null);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const data = await equipmentApi.getLocationList();
      setLocations(data);
      console.log("Fetched locations:", data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    } finally {
      // Small delay can be added here if you want to ensure the loader is visible
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await equipmentApi.deleteLocation(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error("Failed to delete location:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
    const saved = localStorage.getItem("defaultLocationId");
    if (saved) setDefaultLocationId(Number(saved));
  }, []);

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">My Locations</h1>
            <p className="text-sm text-gray-400 m-0 font-medium">
              {isLoading ? "Fetching your spaces..." : `${locations.length} locations saved`}
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push("/location/addLocation")}
          className="bg-[#7c3aed] text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> 
          <span>Create Location</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 sm:p-5 lg:p-7 max-w-7xl mx-auto">
        
        <div className="mt-6">
          {isLoading ? (
            /* LOADING STATE */
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Locations</p>
            </div>
          ) : locations.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-28 h-28 mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin size={40} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Locations Yet</h2>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Add your first location to customize workouts based on available equipment.
              </p>
              <button
                onClick={() => router.push("/location/addLocation")}
                className="flex items-center gap-2 bg-[#7c3aed] text-white px-6 py-3 rounded-full font-semibold shadow-md hover:opacity-90 transition"
              >
                <Plus size={18} /> Create Your First Location
              </button>
            </div>
          ) : (
            /* DATA STATE */
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Locations</h2>
              <p className="text-sm text-gray-400 mb-8 font-medium">
                Manage equipment for your saved gyms
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => router.push(`/location/${location.id}`)}
                    className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[#7c3aed] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <MapPin size={24}  />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 leading-tight">
                            {location.name}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium tracking-wide">
                            {location.equipmentList?.length || 0} equipment items
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8 items-center">
                        {location.equipmentList?.slice(0, 3).map((eq: any) => (
                          <span
                            key={eq.id}
                            className="px-4 py-2 text-[10px] font-bold bg-[#f3f0ff] text-[#7c3aed] rounded-full flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <Dumbbell size={12} />
                            {eq.name}
                          </span>
                        ))}

                        {location.equipmentList?.length > 3 && (
                          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-tight">
                            + {location.equipmentList.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 mb-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        id={`default-${location.id}`}
                        checked={defaultLocationId === location.id}
                        onChange={() => {
                          const next = defaultLocationId === location.id ? null : location.id;
                          setDefaultLocationId(next);
                          if (next) {
                            localStorage.setItem("defaultLocationId", String(next));
                            localStorage.setItem("workoutLocationName", location.name);
                            // Persist server-side too — without this, pages that
                            // read the account's default location (e.g. the
                            // "Show exercises based on default location" filter
                            // on the workout session page) would keep seeing the
                            // old value no matter how many times they refetch.
                            equipmentApi.selectDefaultLocation(next).catch((err) => {
                              console.error("Failed to set default location:", err);
                            });
                          } else {
                            localStorage.removeItem("defaultLocationId");
                          }
                        }}
                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                      />
                      <label
                        htmlFor={`default-${location.id}`}
                        className="text-[11px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none"
                      >
                        Default
                      </label>
                    </div>

                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/location/edit/${location.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#fff7ed] text-[#f97316] text-xs font-bold py-3.5 rounded-2xl hover:bg-orange-100 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>

                        <button
                          onClick={() => setDeleteTarget(location.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#fef2f2] text-[#ef4444] text-xs font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>

                      <button
                        onClick={() => router.push(`/location/${location.id}`)}
                        className="w-full text-[11px] font-bold uppercase tracking-widest text-[#7c3aed] bg-[#f8faff] py-4 rounded-2xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                      >
                        View Full Details <span className="text-lg leading-none">›</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
  {deleteTarget !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
    {/* White Modal Container */}
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100">
      
      {/* Icon Area */}
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
        <Trash2 size={30} />
      </div>

      {/* Text Content */}
      <h3 className="text-slate-900 font-black text-xl mb-2">Delete Location?</h3>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
        This will remove this location and all its equipment settings permanently.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={async () => {
            if (deleteTarget === null) return;
            try {
              setIsDeleting(true);
              await handleDelete(deleteTarget);
              setDeleteTarget(null);
            } finally {
              setIsDeleting(false);
            }
          }}
          className={`w-full py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 ${
            isDeleting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isDeleting}
        >
          {isDeleting ? "Removing..." : "Confirm Delete"}
        </button>

        <button
          onClick={() => setDeleteTarget(null)}
          className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95"
          disabled={isDeleting}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}