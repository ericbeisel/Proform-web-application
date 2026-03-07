// app/dashboard/components/DashboardHeader.tsx
import { BarChart2, User } from 'lucide-react'

type Props = {
  activeNav: string
  setActiveNav: (value: string) => void
  userName?: string  // Add this
}

export default function DashboardHeader({ activeNav, setActiveNav, userName }: Props) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#e8e6f0] flex items-center px-8 gap-6">
      <span className="font-black text-xl mr-2">My Dashboard</span>

      <div className="flex gap-1 bg-[#f7f6fb] rounded-[10px] p-1">
        {['Home', 'Teams', 'Search Workouts', 'Programs'].map(item => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            className={`
              px-4 py-1.5 text-[13px] font-medium rounded-[7px] transition-all duration-150
              ${activeNav === item
                ? 'bg-white text-[#1a1825] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                : 'text-[#8b879e] hover:text-[#6c5ce7]'
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="w-9 h-9 rounded-[10px] border border-[#e8e6f0] bg-white flex items-center justify-center text-[#8b879e] hover:border-[#a29bfe] hover:text-[#6c5ce7] transition-all">
          <BarChart2 size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fd7b4d] to-[#fdcb6e] flex items-center justify-center text-white font-bold text-sm cursor-pointer">
          {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
        </div>
      </div>
    </header>
  )
}