"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RecoveryZoneAll() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual recovery options list page
    router.replace("/recovery/all-recovery-options");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6d28d9] mx-auto mb-4" />
        <p className="text-sm text-gray-500 font-medium">Navigating to recovery options...</p>
      </div>
    </div>
  );
}
