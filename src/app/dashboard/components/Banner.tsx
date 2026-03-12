// app/dashboard/components/Banner.tsx
import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface BannerProps {
  daysRemaining?: number;
  onClose?: () => void;
}

export default function Banner({ daysRemaining = 26, onClose }: BannerProps) {
  const router = useRouter();

  const handleCreateCard = () => {
    router.push("/player-cards");
  };

  return (
    <div className="relative bg-gradient-to-r from-[#fd7b4d] to-[#e05252] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-hidden shadow-lg">
      {/* ICON */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 z-10">
        <Clock size={18} className="text-white" />
      </div>

      {/* TEXT */}
      <div className="z-10 flex-1">
        <h3 className="text-white font-semibold text-sm sm:text-base">
          Create Your Player Card
        </h3>

        <p className="text-white/80 text-xs sm:text-sm mt-0.5 leading-relaxed">
          You have {daysRemaining} days remaining to create your player card and
          complete your profile setup.
        </p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleCreateCard}
        className="sm:ml-auto bg-white text-[#e17055] px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all z-10"
      >
        Create Player Card
      </button>

      {/* CLOSE BUTTON */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center z-10 hover:bg-white/30 transition"
        >
          <X size={12} />
        </button>
      )}

      {/* BACKGROUND SHAPES */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/7 rounded-full pointer-events-none" />
      <div className="absolute right-16 -bottom-10 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
    </div>
  );
}
