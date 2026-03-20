"use client";

import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, X, Check, Loader2, MapPin, Dumbbell } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { equipmentApi, Equipment, LocationItem } from "@/api/location/route";

function EditEquipContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [locationName, setLocationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Requirement Check: Must have a name AND at least one equipment selected
  const selectedCount = equipments.filter(eq => eq.selected).length;
  const isReadyToSave = locationName.trim().length > 0 && selectedCount > 0;

  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        const [allEquip, detail] = await Promise.all([
          equipmentApi.getAllEquipment(),
          equipmentApi.getLocationDetail(id),
        ]);

        setLocationName(detail.name);
        const activeIds = detail.equipmentList.map((e) => e.id);

        setEquipments(
          allEquip.map((eq) => ({
            ...eq,
            selected: activeIds.includes(eq.id),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [id]);

  const toggleEquipment = (id: number) => {
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === id ? { ...eq, selected: !eq.selected } : eq
      )
    );
  };

  const handleUpdate = async () => {
    if (!isReadyToSave) return;

    const selectedIds = equipments
      .filter((eq: any) => eq.selected)
      .map((eq) => eq.id)
      .join(",");

    try {
      setIsSubmitting(true);
      await equipmentApi.updateLocation({
        id,
        location_name: locationName,
        equipments: selectedIds,
      });
      router.push("/location");
    } catch (err: any) {
      alert(err.message || "Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* HEADER - Matched to Create Page */}
      <div className="bg-white px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Edit Location</h1>
            <p className="text-sm text-gray-400 m-0 font-medium">Update your training location details</p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isSubmitting || !isReadyToSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm
            ${isReadyToSave 
              ? "bg-[#7c3aed] text-white hover:opacity-90 shadow-purple-200" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isSubmitting ? (
             <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Check size={18} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 mt-4">
        
        {/* TOP SECTION: Location Details Card */}
        <div className="bg-[#f8faff] rounded-[2rem] p-8 sm:p-10 border border-[#eef2ff] flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-[#7c3aed] rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <MapPin size={36}  />
          </div>
          <div className="flex-1 w-full text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Location Details</h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">
              Update the name and equipment available at this location
            </p>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 ml-1">
                Location Name
              </label>
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Gym Name"
                className="w-full p-4 border border-gray-100 rounded-2xl text-base font-medium text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all"
              />
            </div>
          </div>
        </div>

        {/* EQUIPMENT GRID SECTION */}
        <div className="mb-6 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Available Equipment</h2>
          <p className="text-sm text-gray-400 font-medium">
            Select at least one equipment ({selectedCount} selected)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {equipments.map((eq: any) => (
            <div
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className={`relative cursor-pointer rounded-2xl border p-8 flex flex-col items-center justify-center transition-all duration-200 group
              ${eq.selected
                  ? "border-[#7c3aed] bg-[#7c3aed]/5 ring-1 ring-[#7c3aed] scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-gray-200 shadow-sm"
              }`}
            >
              {eq.selected && (
                <div className="absolute top-3 right-3 bg-[#7c3aed] text-white rounded-full p-1 shadow-md">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}

              <div className="h-16 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                {eq.icon ? (
                  <img src={eq.icon} alt={eq.name} className="h-12 w-auto object-contain" />
                ) : (
                  <Dumbbell size={32} className={eq.selected ? 'text-[#7c3aed]' : 'text-gray-300'} />
                )}
              </div>
              <p className={`text-xs font-bold uppercase tracking-wide text-center ${eq.selected ? 'text-[#7c3aed]' : 'text-gray-900'}`}>
                {eq.name}
              </p>
            </div>
          ))}
        </div>

        {/* BOTTOM UPDATE BUTTON */}
        {/* <div className="mt-12 flex justify-center">
             <button
                onClick={handleUpdate}
                disabled={isSubmitting || !isReadyToSave}
                className={`w-full max-w-md py-4 rounded-full font-bold text-lg transition-all shadow-lg
                    ${isReadyToSave 
                    ? "bg-[#7c3aed] text-white hover:opacity-90" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
            >
                {isSubmitting ? "Updating..." : "Update Location"}
            </button>
        </div> */}
      </div>
    </div>
  );
}

export default function EditLocationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#7c3aed]" size={40} /></div>}>
      <EditEquipContent />
    </Suspense>
  );
}