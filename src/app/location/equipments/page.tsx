"use client";

import { useEffect, useState } from "react";
import { equipmentApi, Equipment } from "@/api/location/route";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadEquipment = async () => {
      const data = await equipmentApi.getAllEquipment();
      setEquipment(data);
      console.log("Loaded equipment:", data);
    };

    loadEquipment();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {equipment.map((item) => (
        <div key={item.id} className="border p-4 rounded text-center">
          <img
            src={item.icon}
            alt={item.name}
            className="w-20 h-20 object-contain mx-auto"
          />

          <p className="mt-2 font-medium">{item.name}</p>
        </div>
      ))}
    </div>
  );
}