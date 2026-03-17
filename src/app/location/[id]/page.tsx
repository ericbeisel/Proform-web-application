"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { equipmentApi, LocationItem } from "@/api/location/route";

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [location, setLocation] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (params.id) {
      fetchLocation();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f8]">
        <div className="text-[#7c3aed] font-extrabold text-lg animate-pulse">Loading location...</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f8]">
        <div className="text-gray-500 font-bold">Location not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* MATCHED HEADER */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center text-white flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">
              {location.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">
              {location.equipmentList?.length || 0} items available
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-5 lg:p-7 max-w-5xl mx-auto">
        
        {/* EQUIPMENT SECTION HEADER */}
        <div className="flex items-center gap-2 mb-6">
          <Dumbbell className="text-[#7c3aed]" size={20} />
          <h2 className="text-lg font-bold text-[#1a1a2e] m-0">
            Equipment Available
          </h2>
        </div>

        {/* EQUIPMENT GRID - Original Images on White backgrounds */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {location.equipmentList?.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all"
            >
              {/* Original image display - no overlays or dark backgrounds */}
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <img
                  src={equipment.icon}
                  alt={equipment.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <p className="text-[11px] font-bold text-[#555] text-center m-0 uppercase tracking-tight">
                {equipment.name}
              </p>
            </div>
          ))}

          {(!location.equipmentList || location.equipmentList.length === 0) && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-[#999] italic">
              No equipment listed for this location.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}