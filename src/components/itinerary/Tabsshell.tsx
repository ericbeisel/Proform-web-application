"use client";

import { usePathname, useRouter } from "next/navigation";
import PageTitle from "@/components/itinerary/Pagetitle";
import { ChevronRight } from "lucide-react";

// Routes inside (tabs) that should hide the shared shell
const HIDDEN_SHELL_ROUTES = ["/itinerary/missed-activity", "/itinerary/all-activity", "/itinerary/queue"];

export default function TabsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hideShell = HIDDEN_SHELL_ROUTES.some((r) => pathname.startsWith(r));

  if (hideShell) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ── Responsive Top Header Bar ── */}
      <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 flex-shrink-0">
        {/* Left — page title */}
        <PageTitle />

        {/* Center — logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img
            src="/images/proform-logo.jpg"
            alt="Proform"
            onClick={() => router.push("/feed")}
            className="h-9 w-auto cursor-pointer rounded-lg"
          />
        </div>

        {/* Right — Go to Queue */}
        <button
          onClick={() => router.push("/workout")}
          className="bg-purple-700 hover:bg-purple-800 text-white text-[12px] sm:text-[13px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          Go to Queue <ChevronRight size={13} className="inline ml-0.5" />
        </button>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}