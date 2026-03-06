// app/dashboard/components/WeeklyTargets.tsx
import { Dumbbell, Activity, Zap, Heart } from 'lucide-react'

export default function WeeklyTargets() {
  const targets = [
    { label: 'Workout', sub: 'Strength training', color: 'purple', icon: Dumbbell, count: '0/3' },
    { label: 'Supplemental', sub: 'Additional work', color: 'blue', icon: Activity, count: '0/2' },
    { label: 'Conditioning', sub: 'High Intensity', color: 'green', icon: Zap, count: '0/3' },
    { label: 'Cardio', sub: 'High Intensity', color: 'red', icon: Heart, count: '0/3' },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-3.5">Weekly Targets</h3>
      {targets.map(item => (
        <div
          key={item.label}
          className={`
            flex items-center gap-3 p-2.5 rounded-xl mb-2
            ${item.color === 'purple' ? 'bg-[#ede9ff]' : ''}
            ${item.color === 'blue'   ? 'bg-[#e8f4fe]' : ''}
            ${item.color === 'green'  ? 'bg-[#e4f9f4]' : ''}
            ${item.color === 'red'    ? 'bg-[#feeae6]' : ''}
          `}
        >
          <div className={`
            w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-lg
            ${item.color === 'purple' ? 'bg-[#6c5ce7]' : ''}
            ${item.color === 'blue'   ? 'bg-[#0984e3]' : ''}
            ${item.color === 'green'  ? 'bg-[#00b894]' : ''}
            ${item.color === 'red'    ? 'bg-[#e17055]' : ''}
          `}>
            <item.icon size={18} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{item.label}</div>
            <div className="text-[11px] text-[#8b879e]">{item.sub}</div>
          </div>
          <div className={`
            font-bold text-sm
            ${item.color === 'purple' ? 'text-[#6c5ce7]' : ''}
            ${item.color === 'blue'   ? 'text-[#0984e3]' : ''}
            ${item.color === 'green'  ? 'text-[#00b894]' : ''}
            ${item.color === 'red'    ? 'text-[#e17055]' : ''}
          `}>
            {item.count}
          </div>
        </div>
      ))}
    </div>
  )
}