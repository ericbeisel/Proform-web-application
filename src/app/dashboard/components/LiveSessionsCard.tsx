// app/dashboard/components/LiveSessionsCard.tsx (no changes)
import { Timer } from 'lucide-react'

export default function LiveSessionsCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-1">Live Sessions</h3>
      <div className="bg-[#f7f6fb] rounded-xl p-6 text-center my-3">
        <div className="text-3xl text-[#8b879e] mb-2">
          <Timer size={32} />
        </div>
        <p className="text-sm text-[#8b879e]">
          No sessions started yet.<br />Your live sessions will show here.
        </p>
      </div>
      <button className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-[10px] py-2.5 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition">
        View Team Itinerary
      </button>
    </div>
  )
}