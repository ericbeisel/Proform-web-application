// app/dashboard/components/WeeklyTargets.tsx
import { Dumbbell, Activity, Zap, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WeeklyTargetsProps {
  targets?: {
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  };
}

export default function WeeklyTargets({ targets }: WeeklyTargetsProps) {
  const router = useRouter(); // Add this
  
  const defaultTargets = {
    workout: 3,
    supplement: 2,
    cardio: 3,
    conditioning: 3
  };

  const data = targets || defaultTargets;

  const targetItems = [
    { 
      label: 'Workout', 
      sub: 'Strength training', 
      color: 'purple', 
      icon: Dumbbell, 
      count: `0/${data.workout}`,
      bgColor: 'bg-[#ede9ff]',
      iconBg: 'bg-[#6c5ce7]',
      textColor: 'text-[#6c5ce7]'
    },
    { 
      label: 'Supplemental', 
      sub: 'Additional work', 
      color: 'blue', 
      icon: Activity, 
      count: `0/${data.supplement}`,
      bgColor: 'bg-[#e8f4fe]',
      iconBg: 'bg-[#0984e3]',
      textColor: 'text-[#0984e3]'
    },
    { 
      label: 'Conditioning', 
      sub: 'High Intensity', 
      color: 'green', 
      icon: Zap, 
      count: `0/${data.conditioning}`,
      bgColor: 'bg-[#e4f9f4]',
      iconBg: 'bg-[#00b894]',
      textColor: 'text-[#00b894]'
    },
    { 
      label: 'Cardio', 
      sub: 'High Intensity', 
      color: 'red', 
      icon: Heart, 
      count: `0/${data.cardio}`,
      bgColor: 'bg-[#feeae6]',
      iconBg: 'bg-[#e17055]',
      textColor: 'text-[#e17055]'
    },
  ]

  // Add this click handler
  const handleCardioClick = () => {
    router.push('/cardio');
  };

  // const handleWorkoutClick = () => {
  //   router.push('/workout');
  // }

    const handleWorkoutClick = () => {
    router.push('/location');
  }

  
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-3.5">Weekly Targets</h3>
    {targetItems.map(item => {
  const handleClick = () => {
    if (item.label === 'Cardio') {
      router.push('/cardio');
    }
    if (item.label === 'Workout') {
      router.push('/workout');
    }
  };

  return (
    <div
      key={item.label}
      onClick={
        item.label === 'Cardio' || item.label === 'Workout'
          ? handleClick
          : undefined
      }
      className={`flex items-center gap-3 p-2.5 rounded-xl mb-2 ${item.bgColor} ${
        item.label === 'Cardio' || item.label === 'Workout'
          ? 'cursor-pointer hover:opacity-80 transition-opacity'
          : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-lg ${item.iconBg}`}>
        <item.icon size={18} />
      </div>

      <div className="flex-1">
        <div className="font-semibold text-sm">{item.label}</div>
        <div className="text-[11px] text-[#8b879e]">{item.sub}</div>
      </div>

      <div className={`font-bold text-sm ${item.textColor}`}>
        {item.count}
      </div>
    </div>
  );
})}
    </div>
  )
}