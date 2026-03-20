"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  MapPin, 
  Dumbbell 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi } from "@/api/location/route";

export default function LocationList() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
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
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* MATCHED HEADER STYLE */}
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
              {locations.length} locations saved • Customize your experience
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

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 lg:p-7 max-w-7xl mx-auto">
        
        <div className="mt-6">
          {locations.length === 0 ? (
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
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Locations</h2>
              <p className="text-sm text-gray-400 mb-8 font-medium">
                {locations.length} location{locations.length !== 1 ? "s" : ""} saved
              </p>

              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => router.push(`/location/${location.id}`)}
                    className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[#7c3aed] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Card Header */}
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

                      {/* Equipment Chips */}
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

                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      {/* Action Buttons - stopPropagation prevents triggering the card click */}
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

                      {/* View Details Button */}
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

      {/* Delete Modal */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-700">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={30} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Delete Location?</h3>
            <p className="text-gray-400 text-sm mb-8">This action cannot be undone. All equipment associations will be removed.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async (e) => {
                  if (deleteTarget === null) return;
                  try {
                    setIsDeleting(true);
                    await handleDelete(deleteTarget);
                    setDeleteTarget(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className={`flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors ${
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