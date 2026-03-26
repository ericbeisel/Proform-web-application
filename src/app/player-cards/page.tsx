// app/player-cards/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerCardList } from "@/api/player-card/route";

export default function PlayerCardsRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkScans = async () => {
      try {
        // Check if user has any scans
        const response = await getPlayerCardList();
        const hasScans = response?.data && response.data.length > 0;
        
        if (hasScans) {
          // User has scans, redirect to progress list
          router.replace("/player-progress");
        } else {
          // No scans, redirect to upload page
          router.replace("/player-cards/upload");
        }
      } catch (error) {
        console.error("Failed to check scans:", error);
        
        // On error, check if it's an authentication error
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("No authentication token found") || 
            errorMessage.includes("authentication")) {
          // If not authenticated, redirect to login
          router.replace("/auth/login");
        } else {
          // Default to upload page on other errors
          router.replace("/player-cards/upload");
        }
      } finally {
        setChecking(false);
      }
    };

    checkScans();
  }, [router]);

  // Show loading spinner while checking
  return (
    <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto mb-3" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </main>
  );
}