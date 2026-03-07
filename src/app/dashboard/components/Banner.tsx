// app/dashboard/components/Banner.tsx
import { Clock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BannerProps {
  daysRemaining?: number;
  onClose?: () => void;
}

export default function Banner({ daysRemaining = 26, onClose }: BannerProps) {
  const router = useRouter()

  const handleCreateCard = () => {
    router.push('/player-card')
  }

  return (
    <div className="relative bg-gradient-to-r from-[#fd7b4d] to-[#e05252] rounded-2xl p-6 flex items-center gap-5 overflow-hidden shadow-lg">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 z-10">
        <Clock size={24} className="text-white" />
      </div>
      <div className="z-10">
        <h3 className="text-white font-bold text-[17px]">Create Your Player Card</h3>
        <p className="text-white/80 text-sm mt-1">
          You have {daysRemaining} days remaining to create your player card and complete your profile setup!
        </p>
      </div>
      <button 
        onClick={handleCreateCard}
        className="ml-auto bg-white text-[#e17055] px-5 py-2.5 rounded-[10px] font-semibold text-sm whitespace-nowrap hover:shadow-xl hover:-translate-y-0.5 transition-all z-10"
      >
        Create Player Card Now
      </button>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/18 text-white text-xs flex items-center justify-center z-10 hover:bg-white/30 transition"
        >
          <X size={14} />
        </button>
      )}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-white/7 rounded-full pointer-events-none" />
      <div className="absolute right-20 -bottom-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
    </div>
  )
}