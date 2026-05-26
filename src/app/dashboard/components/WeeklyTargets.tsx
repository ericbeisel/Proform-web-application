// app/dashboard/components/WeeklyTargets.tsx
import { Dumbbell, Activity, Zap, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getWeeklyTarget, WeeklyTargetData } from '@/api/dashboard/route'

interface WeeklyTargetsProps {
  targets?: {
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  };
}

export default function WeeklyTargets({ targets }: WeeklyTargetsProps) {
  const router = useRouter();
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTargetData | null>(null);

  useEffect(() => {
    getWeeklyTarget()
      .then(setWeeklyTarget)
      .catch((err) => console.error("Failed to fetch weekly target:", err));
  }, []);

  const data = weeklyTarget || targets || { workout: 0, supplement: 0, cardio: 0, conditioning: 0 };

  const targetItems = [
    { 
      label: 'Workout', 
      sub: 'Strength training', 
      color: 'purple', 
      icon: Dumbbell, 
      count: `0/${data.workout}`,
      bgColor: 'bg-[#ede9ff]',
      iconBg: 'bg-[#6c5ce7]',
      textColor: 'text-[#6c5ce7]',
      path: '/workout/main'
    },
    { 
      label: 'Supplemental', 
      sub: 'Additional work', 
      color: 'blue', 
      icon: Activity, 
      count: `0/${data.supplement}`,
      bgColor: 'bg-[#e8f4fe]',
      iconBg: 'bg-[#0984e3]',
      textColor: 'text-[#0984e3]',
      path: '/workout/main?tab=Supplemental'
    },
    { 
      label: 'Conditioning', 
      sub: 'High Intensity', 
      color: 'green', 
      icon: Zap, 
      count: `0/${data.conditioning}`,
      bgColor: 'bg-[#e4f9f4]',
      iconBg: 'bg-[#00b894]',
      textColor: 'text-[#00b894]',
      path: '/workout/main?tab=Field%20Workout'
    },
    { 
      label: 'Cardio', 
      sub: 'High Intensity', 
      color: 'red', 
      icon: Heart, 
      count: `0/${data.cardio}`,
      bgColor: 'bg-[#feeae6]',
      iconBg: 'bg-[#e17055]',
      textColor: 'text-[#e17055]',
      path: '/todays-focus-cardio/scheduled-cardio'
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-3.5">Weekly Targets</h3>
      {targetItems.map((item) => {
        const isClickable = item.label === 'Cardio' || item.label === 'Workout' || item.label === 'Supplemental' || item.label === 'Conditioning';
        
        return (
          <div
            key={item.label}
            onClick={() => isClickable && handleNavigation(item.path)}
            className={`flex items-center gap-3 p-2.5 rounded-xl mb-2 ${item.bgColor} ${
              isClickable
                ? 'cursor-pointer hover:opacity-80 transition-opacity'
                : 'cursor-default'
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