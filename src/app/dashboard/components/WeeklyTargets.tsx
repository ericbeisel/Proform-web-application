// app/dashboard/components/WeeklyTargets.tsx
import { Dumbbell, Activity, Zap, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { dashboardApi } from '@/api/dashboard/route'

interface WeeklyTargetsProps {
  targets?: {
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  };
}

interface ActivityLevel {
  id: number;
  name: string;
  value: number;
}

export default function WeeklyTargets({ targets }: WeeklyTargetsProps) {
  const router = useRouter();
  const [activityLevels, setActivityLevels] = useState<ActivityLevel[]>([]);
  
  const defaultTargets = {
    workout: 3,
    supplement: 2,
    cardio: 3,
    conditioning: 3
  };

  const data = targets || defaultTargets;

  // Fetch activity levels on component mount
  useEffect(() => {
    const fetchActivityLevels = async () => {
      try {
        const levels = await dashboardApi.getActivityLevels();
        setActivityLevels(levels);
      } catch (error) {
        console.error("Failed to fetch activity levels:", error);
      }
    };
    
    fetchActivityLevels();
  }, []);

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
      path: '/supplemental'
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
      path: '/conditioning'
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
      path: '/cardio'
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-3.5">Weekly Targets</h3>
      {targetItems.map((item) => {
        const isClickable = item.label === 'Cardio' || item.label === 'Workout';
        
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