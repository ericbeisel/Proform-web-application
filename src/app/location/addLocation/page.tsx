"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { equipmentApi, Equipment } from "@/api/location/route";

export default function AddLocationPage() {
  const router = useRouter();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentApi.getAllEquipment();
        setEquipment(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEquipment();
  }, []);

  // toggle select
  const toggleEquipment = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((e) => e !== id)
        : [...prev, id]
    );
  };

  // create location
  const handleCreate = async () => {
    if (!locationName) {
      alert("Please enter location name");
      return;
    }

    try {
      setLoading(true);
      await equipmentApi.createLocation({
        location_name: locationName,
        equipments: selected.join(","),
        default_location: 0,
      });
      router.push("/location");
    } catch (err) {
      console.error(err);
      alert("Failed to create location");
    } finally {
      setLoading(false);
    }
  };

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
              Create Location
            </h1>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-7">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <p className="text-center text-[#999] text-sm m-0">
            Filter exercises based on the equipment available at your current location
          </p>
        </div>

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {equipment.map((item) => {
            const isSelected = selected.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 shadow-sm
                ${
                  isSelected
                    ? "border-[#7c3aed] bg-[#7c3aed]/10 scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-gray-300"
                }`}
              >
                <div className="h-12 flex items-center justify-center mb-2">
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="h-10 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded" />
                  )}
                </div>
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-tight ${isSelected ? 'text-[#7c3aed]' : 'text-gray-500'}`}>
                  {item.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* LOCATION NAME SECTION */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center max-w-xl mx-auto">
          <p className="text-sm font-semibold text-[#555] mb-4">
            Give this location a title:
          </p>

          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Gym Name"
            className="w-full p-4 border border-gray-200 rounded-xl text-lg font-bold text-[#1a1a2e] bg-gray-50 outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-center mb-6"
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-full text-white py-4 font-bold text-base cursor-pointer hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Location"}
          </button>
        </div>
      </div>
    </div>
  );
}