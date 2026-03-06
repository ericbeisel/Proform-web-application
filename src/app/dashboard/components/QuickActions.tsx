// app/dashboard/components/QuickActions.tsx
import { Plus, Edit, Search, List, Users, User } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { icon: Plus, label: 'Create Workout' },
    { icon: Edit, label: 'Log Activity' },
    { icon: Search, label: 'Search Workouts' },
    { icon: List, label: 'View Programs' },
    { icon: Users, label: 'Join a Team' },
    { icon: User, label: 'Player Card' },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <h3 className="font-bold text-sm mb-5">Quick Actions</h3>
      <div className="grid grid-cols-6 gap-3.5">
        {actions.map(item => (
          <div key={item.label} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-xl flex items-center justify-center text-white text-xl group-hover:-translate-y-0.5 group-hover:shadow-xl transition-all duration-200">
              <item.icon size={24} />
            </div>
            <span className="text-[11px] font-medium text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}