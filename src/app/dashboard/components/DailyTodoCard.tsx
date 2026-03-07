// app/dashboard/components/DailyTodoCard.tsx
interface DailyTodoCardProps {
  dailySteps?: number;
  caloriesGoal?: number;
  currentDate?: string;
}

export default function DailyTodoCard({ dailySteps = 4500, caloriesGoal = 1000, currentDate }: DailyTodoCardProps) {
  const today = currentDate || new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e6f0]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Daily To-Do List</h3>
        <span className="text-[11px] text-[#8b879e]">{today}</span>
      </div>
      
      {dailySteps > 0 && (
        <div className="bg-[#e6f7ff] border-2 border-[#6c5ce7] rounded-[10px] p-2.5 text-center text-sm text-[#6c5ce7] my-2.5">
          Daily Goal: {dailySteps.toLocaleString()} steps • {caloriesGoal} cal
        </div>
      )}
      
      <div className="bg-[#fff9ec] border-2 border-[#fdcb6e] rounded-[10px] p-2.5 text-center text-sm text-[#b8840a] my-2.5">
        You don't have any workouts or activity. Find workouts
      </div>
      
      <input
        placeholder="Write what exercise... Tap to Submit"
        className="w-full border-2 border-[#e8e6f0] bg-[#f7f6fb] rounded-[10px] px-3.5 py-2.5 text-sm text-[#8b879e] outline-none focus:border-[#a29bfe] transition mb-2"
      />
      <button className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-[10px] py-2.5 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition">
        Browse Workout Library
      </button>
    </div>
  )
}