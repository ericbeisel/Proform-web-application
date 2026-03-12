// app/dashboard/components/ChallengesCard.tsx
"use client";

import { Award, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ChallengesCardProps {
  streak?: number;
  completed?: number;
}

export default function ChallengesCard({ streak = 0, completed = 0 }: ChallengesCardProps) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-sm">Challenges</h3>
          <p className="text-xs text-[#8b879e] mt-0.5">Your Challenges Streak Tips</p>
        </div>
        <button className="w-8 h-8 bg-gradient-to-br from-[#fd7b4d] to-[#fdcb6e] rounded-full text-white flex items-center justify-center text-base">
          <Award size={20} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-[#f7f6fb] rounded-xl p-3.5 text-center">
          <div className="font-black text-3xl">{streak}</div>
          <div className="text-[10px] text-[#8b879e] mt-0.5 flex items-center justify-center gap-1">
            <TrendingUp size={13} /> Day Streak
          </div>
        </div>
        <div className="bg-[#f7f6fb] rounded-xl p-3.5 text-center">
          <div className="font-black text-3xl">{completed}</div>
          <div className="text-[10px] text-[#8b879e] mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 size={13} /> Completed
          </div>
        </div>
      </div>
      <button
        onClick={() => router.push('/checklist')}
        className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-[10px] py-2.5 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition"
      >
        Go Check List
      </button>
    </div>
  )
}