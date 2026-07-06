"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// The backend already hands out session links in this format (see
// rejoinSessions[].url from /programs/{code}/overview), so this route exists
// purely to match that format and forward into the real session view.
export default function ViewSessionRedirectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    router.replace(`/workout/viewWorkoutSession?sessionId=${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
    </div>
  );
}
