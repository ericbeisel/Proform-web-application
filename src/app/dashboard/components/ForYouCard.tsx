// app/dashboard/components/ForYouCard.tsx
import { Flame } from 'lucide-react'

export default function ForYouCard() {
  return (
    <div className="bg-white rounded-2xl shadow border border-[#e8e6f0] overflow-hidden">
      <div className="px-5 pt-4 pb-0">
        <h3 className="font-bold text-sm">For You</h3>
      </div>
      <div className="m-3 mb-4 bg-[#1c1929] rounded-xl p-7 text-center relative">
        <button className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white text-sm flex items-center justify-center hover:bg-white/20 transition">
          ‹
        </button>

        <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-full flex items-center justify-center">
          <Flame size={24} className="text-white" />
        </div>
        <div className="text-white font-bold text-base">Complete Cardio</div>
        <div className="text-white/50 text-xs mt-1.5">Stay on track to meet your Cardio Goals</div>

        <div className="flex justify-center gap-1.5 mt-3.5">
          {Array(5).fill(0).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4.5 bg-[#a29bfe]' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>

        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white text-sm flex items-center justify-center hover:bg-white/20 transition">
          ›
        </button>
      </div>
    </div>
  )
}