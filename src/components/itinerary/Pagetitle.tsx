"use client";

import { usePathname } from "next/navigation";

const TAB_NAMES: Record<string, string> = {
  "/itinerary/itinerary-page": "Itinerary",
  "/itinerary/queue": "Queue",
  "/itinerary/schedule": "Schedule",
    "/itinerary/missed-activity": "Missed Activity",

};

export default function PageTitle() {
  const pathname = usePathname();

  // Match the first segment
  const match = Object.keys(TAB_NAMES).find((key) => pathname.startsWith(key));
  const title = match ? TAB_NAMES[match] : "Itinerary";

  return (
    <h1 className="text-[22px] font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 pointer-events-none select-none">
      {title}
    </h1>
  );
}