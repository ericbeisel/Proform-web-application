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
      console.log("Fetched location detail:", data);
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
  {location.equipmentList?.map((equipment) => {
    // 1. Split keywords by comma
    const rawKeywords = equipment.keyword ? equipment.keyword.split(",") : [];
    
    // 2. Exact string deduplication (Remove "balance pad" if "balance pad" already exists)
    // We trim whitespace to ensure " word" and "word" are treated as the same.
    const uniqueKeywords = Array.from(
      new Set(rawKeywords.map((k) => k.trim()))
    ).filter(Boolean);

    return (
      <div
        key={equipment.id}
        className="bg-white rounded-2xl p-5 flex flex-col items-center border border-gray-100 shadow-sm hover:border-[#7c3aed]/20 transition-all"
      >
        {/* ICON & NAME SECTION */}
        <div className="h-16 w-16 mb-3 flex items-center justify-center bg-gray-50 rounded-xl p-2">
          <img
            src={equipment.icon}
            alt={equipment.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        
        <p className="text-[11px] font-black text-gray-900 text-center uppercase tracking-tight mb-3 line-clamp-2">
          {equipment.name}
        </p>

        {/* KEYWORDS SECTION */}
        {uniqueKeywords.length > 0 && (
          <div className="w-full pt-3 border-t border-gray-50">
            <div className="flex flex-wrap gap-1 justify-center max-h-[60px] overflow-y-auto no-scrollbar">
              {uniqueKeywords.map((word, idx) => (
                <span 
                  key={idx}
                  className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md whitespace-nowrap border border-gray-100"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })}
</div>
      </div>

      {/* DELETE MODAL */}
    {showDeleteModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
    {/* White Modal Container */}
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-200">
      
      {/* Warning Icon */}
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
        <Trash2 size={30} />
      </div>

      {/* Text Content */}
      <h3 className="text-slate-900 font-black text-xl mb-2">Delete Location?</h3>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
        Are you sure you want to remove <span className="text-slate-900 font-bold">"{location.name}"</span>? 
        This action cannot be undone.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`w-full py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 ${
            isDeleting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isDeleting ? "Removing..." : "Confirm Delete"}
        </button>

        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={isDeleting}
          className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95"
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