"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell, Pencil, MapPin, Loader2, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { equipmentApi, LocationItem } from "@/api/location/route";

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [location, setLocation] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchLocation = async () => {
    try {
      const data = await equipmentApi.getLocationDetail(params.id as string);
      setLocation(data);
    } catch (err) {
      console.error("Failed to fetch location:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await equipmentApi.deleteLocation(params.id as string);
      router.push("/location");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete location");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchLocation();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Location not found</h2>
          <button onClick={() => router.back()} className="text-[#7c3aed] mt-4 font-bold underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* HEADER WITH MATCHING BUTTONS */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Location Details</h1>
            {/* <p className="text-sm text-gray-400 m-0 font-medium">Location Details</p> */}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* DELETE BUTTON - Exact same styling as Edit but Red */}
              {/* EDIT BUTTON */}
          <button
            onClick={() => router.push(`/location/edit/${params.id}`)}
            className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all"
          >
            <Pencil size={16} />
            <span className="hidden sm:inline">Edit Location</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-red-600 transition-all"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete Location</span>
          </button>

      
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 mt-4">
        
        {/* SUMMARY CARD */}
        <div className="bg-[#f8faff] rounded-[2rem] p-8 sm:p-10 border border-[#eef2ff] flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <MapPin size={36}  />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{location.name}</h2>
            <div className="flex items-center gap-4 text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs border border-gray-100 shadow-sm">
                <Dumbbell size={14} className="text-[#7c3aed]" />
                {location.equipmentList?.length || 0} Equipment Items
              </span>
            </div>
          </div>
        </div>

        {/* GRID */}
     <div className="mb-8 p-6 border border-gray-100 rounded-[2rem] bg-white flex items-center gap-5 shadow-sm">
  {/* Circular Icon beside text */}
  <div className="w-14 h-14 bg-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] flex-shrink-0">
    <Dumbbell size={28} />
  </div>

  <div className="text-left">
    <h2 className="text-xl font-bold text-gray-900 mb-0.5">Available Equipment</h2>
    <p className="text-sm text-gray-400 font-medium">
      All equipment available at this location
    </p>
  </div>
</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {location.equipmentList?.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm border border-gray-100"
            >
              <div className="h-16 w-16 mb-4 flex items-center justify-center bg-gray-50 rounded-xl p-2">
                <img
                  src={equipment.icon}
                  alt={equipment.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-xs font-bold text-gray-900 text-center m-0 uppercase tracking-wide">
                {equipment.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-700">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={30} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Delete Location?</h3>
            <p className="text-gray-400 text-sm mb-8">Are you sure you want to remove "{location.name}"? This cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors ${
                  isDeleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
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