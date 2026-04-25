"use client";

import { usePathname, useRouter } from "next/navigation";
import PageTitle from "@/components/itinerary/Pagetitle";

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
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 flex-shrink-0 relative">
        {/* Left icons - responsive */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bar chart → All Activity */}
          <a
            href="/itinerary/all-activity"
            className="w-7 h-7 sm:w-8 sm:h-9 md:w-9 md:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-purple-600"
          >
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </a>

          {/* Bell → Missed Activity */}
          <a
            href="/itinerary/missed-activity"
            className="w-7 h-7 sm:w-8 sm:h-9 md:w-9 md:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative text-red-500"
          >
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white" />
          </a>

          {/* Settings gear - Redirect to preferences */}
          <button 
            onClick={() => router.push("/preferences")}
            className="w-7 h-7 sm:w-8 sm:h-9 md:w-9 md:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-purple-500"
          >
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Center title - responsive - wraps on mobile */}
        <div className="flex-1 text-center min-w-0">
          <PageTitle />
        </div>

        {/* Close button - Navigate back */}
        <button 
          onClick={() => router.back()}
          className="w-7 h-7 sm:w-8 sm:h-9 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
        >
          <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}