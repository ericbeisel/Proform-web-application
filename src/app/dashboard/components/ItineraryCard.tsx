// app/dashboard/components/ItineraryCard.tsx
interface ItineraryCardProps {
  weeklyTargets?: {
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  };
  completionPercentage?: number;
}

export default function ItineraryCard({
  weeklyTargets,
  completionPercentage = 0,
}: ItineraryCardProps) {
  const targets = weeklyTargets || {
    workout: 3,
    supplement: 2,
    cardio: 3,
    conditioning: 3,
  };

  return (
    <div className="bg-[#1c1929] rounded-2xl p-5 shadow-[0_2px_12px_rgba(108,92,231,0.07)] border border-transparent">
      <div className="text-white/50 text-[11px] uppercase tracking-wider">
        Itinerary
      </div>
      <div className="text-white/45 text-xs mt-0.5">Activity this week</div>
      <div className="text-[#fd7b4d] font-black text-7xl leading-none mt-3">
        0
      </div>
      <div className="text-[#fd7b4d] text-xl font-bold mt-1">
        {completionPercentage}
        <span className="text-sm opacity-60 ml-1">%</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-white/6 rounded-lg p-2.5 text-center">
          <div className="text-white text-xl font-bold">
            0/{targets.workout}
          </div>
          <div className="text-white/40 text-[10px] mt-0.5">Workout</div>
        </div>
        <div className="bg-white/6 rounded-lg p-2.5 text-center">
          <div className="text-white text-xl font-bold">
            0/{targets.supplement}
          </div>
          <div className="text-white/40 text-[10px] mt-0.5">Supplemental</div>
        </div>
        <div className="bg-white/6 rounded-lg p-2.5 text-center">
          <div className="text-white text-xl font-bold">
            0/{targets.conditioning}
          </div>
          <div className="text-white/40 text-[10px] mt-0.5">Conditioning</div>
        </div>
        <div className="bg-white/6 rounded-lg p-2.5 text-center">
          <div className="text-white text-xl font-bold">0/{targets.cardio}</div>
          <div className="text-white/40 text-[10px] mt-0.5">Cardio</div>
        </div>
      </div>
    </div>
  );
}
