// app/dashboard/components/AccountabilityTools.tsx
import CircleProgress from "./CircleProgress";

interface AccountabilityToolsProps {
  repSetProgress?: number;
  recoveryProgress?: number;
  overallProgress?: number;
}

export default function AccountabilityTools({
  repSetProgress = 0,
  recoveryProgress = 0,
  overallProgress = 0,
}: AccountabilityToolsProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-4">Accountability Tools</h3>
      <div className="flex justify-around gap-4 my-4">
        <div className="text-center">
          <CircleProgress pct={repSetProgress} color="#6c5ce7" />
          <div className="text-[#8b879e] text-[10px] mt-1">Rep / Set</div>
        </div>
        <div className="text-center">
          <div className="w-[68px] h-[68px] mx-auto bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-full flex flex-col items-center justify-center">
            <span className="text-white font-black text-[15px]">
              {overallProgress}%
            </span>
            <span className="text-white/75 text-[8px] tracking-wide mt-0.5 uppercase">
              Completed
            </span>
          </div>
        </div>
        <div className="text-center">
          <CircleProgress pct={recoveryProgress} color="#0984e3" />
          <div className="text-[#8b879e] text-[10px] mt-1">Recovery</div>
        </div>
      </div>
      <div className="flex justify-around text-[10px] text-[#8b879e] border-t border-[#e8e6f0] pt-2.5 mt-1">
        {["By 8:00am", "By 12:00m", "By 6:00pm", "By 10pm"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
