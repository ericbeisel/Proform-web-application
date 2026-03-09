// app/dashboard/components/StandardsCard.tsx
import { Plus } from 'lucide-react'

interface StandardsCardProps {
  strengthMetrics?: {
    benchPress: number;
    backSquat: number;
    powerClean: number;
    deadlift: number;
  };
  measurementUnit?: string;
}

export default function StandardsCard({ strengthMetrics, measurementUnit = 'lbs' }: StandardsCardProps) {
  const metrics = strengthMetrics || {
    benchPress: 240,
    backSquat: 230,
    powerClean: 200,
    deadlift: 200
  }

  const standards = [
    { label: 'Bench Press', value: metrics.benchPress },
    { label: 'Back Squat', value: metrics.backSquat },
    { label: 'Power Clean', value: metrics.powerClean },
    { label: 'Deadlift', value: metrics.deadlift },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-bold text-sm">Standards</h3>
        <button className="w-7 h-7 bg-[#6c5ce7] rounded-lg text-white flex items-center justify-center hover:scale-110 transition">
          <Plus size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 my-3.5">
        {standards.map((item, i) => (
          <div key={i} className="bg-[#f7f6fb] rounded-xl p-3.5 text-center">
            <div className="text-2xl text-[#6c5ce7] font-bold">🏋️</div>
            <div className="text-[11px] font-medium mt-1">{item.label}</div>
            <div className="text-[10px] text-[#8b879e] mt-0.5">
              {item.value} {measurementUnit}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full bg-transparent text-[#6c5ce7] border-2 border-[#a29bfe] rounded-[10px] py-2.5 font-semibold text-sm hover:bg-[#6c5ce7] hover:text-white transition">
        Edit All Standards
      </button>
    </div>
  )
}