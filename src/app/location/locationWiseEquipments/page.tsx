"use client";

import { useEffect, useState } from "react";
import { equipmentApi, Equipment, LocationEquipment } from "@/api/location/route";

export default function LocationWiseEquipments() {
  const [locations, setLocations] = useState<LocationEquipment[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadLocations = async () => {
      const data = await equipmentApi.getLocationsWithEquipment();
      setLocations(data);
    };

    loadLocations();
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = Number(e.target.value);
    setSelectedLocationId(locationId);

    const location = locations.find((l) => l.id === locationId);
    setEquipments(location?.equipmentList || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Location Wise Equipment</h1>

      {/* LOCATION DROPDOWN */}
      <select
        onChange={handleLocationChange}
        className="border p-2 rounded mb-6"
        defaultValue=""
      >
        <option value="" disabled>
          Select Location
        </option>

        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {/* EQUIPMENT LIST */}
      <div className="grid grid-cols-3 gap-6">
        {equipments.map((item) => (
          <div key={item.id} className="border p-4 rounded text-center">
         <img
  src={encodeURI(item.icon ?? "")}
  alt={item.name}
  loading="lazy"
  className="w-16 h-16 mx-auto object-contain"
/>

            <p className="mt-2 font-medium">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}