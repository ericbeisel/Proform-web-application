'use client';

import React, { use, useState,  } from 'react'; // Added 'use' here
import { ArrowLeft, Plus, Edit2, Trash2, CalendarDays, User, X, Users, Layers } from 'lucide-react';
import Link from 'next/link';

// Mock data
const clients = [
  { id: 1, name: "Alex Chen", team: "Elite Warriors FC" },
  { id: 2, name: "Amanda Moore", team: "Power Lifters United" },
  { id: 3, name: "Chris Taylor", team: "CrossFit Champions" },
  { id: 7, name: "John Smith", team: "Elite Warriors FC" },
];

const initialSchedule = {
  currentWeek: {
    Mon: { date: 27, activities: [{ id: 1, type: 'RECOVERY FLOW', time: '18:00', detail: 'Full Body Recovery', variant: 'purple' }] },
    Tue: { date: 28, activities: [{ id: 2, type: 'LEG DESTROYER', time: '09:00', detail: 'Lower Body Strength', variant: 'teal' }] },
    Wed: { date: 29, activities: [{ id: 3, type: 'MORNING SPRINT', time: '06:00', detail: 'Cardio Session', variant: 'yellow' }] },
    Thu: { date: 30, activities: [] },
    Fri: { date: 1, activities: [] },
    Sat: { date: 2, activities: [] },
    Sun: { date: 3, activities: [] },
  }
};
// Next.js 15 requires unwrapping params
export default function ClientItineraryEditor({ params }: { params: Promise<{ id: string }> }) {
    const [showAddModal, setShowAddModal] = useState(false);
const [showRecipientsModal, setShowRecipientsModal] = useState(false);
const [activeTab, setActiveTab] = useState<"people" | "teams" | "groups">("people");
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
const [groupName, setGroupName] = useState("");
const [groupMembers, setGroupMembers] = useState<string[]>([]);
const [activityTitle, setActivityTitle] = useState("");
const [activityDate, setActivityDate] = useState("");
const [activityTime, setActivityTime] = useState("");
const [recurrence, setRecurrence] = useState<"Never" | "Daily" | "Weekly">("Never");
const [activityType, setActivityType] = useState("Recovery");
const [description, setDescription] = useState("");
const [showRecoveryDetails, setShowRecoveryDetails] = useState(false);

// Recovery states
const [recoveryMinutes, setRecoveryMinutes] = useState("");
const [recoveryType, setRecoveryType] = useState("");

// Cardio states
const [cardioMinutes, setCardioMinutes] = useState("");
const [calorieGoal, setCalorieGoal] = useState("");

// Hydration states
const [hydrationOunces, setHydrationOunces] = useState("");
const [supplements, setSupplements] = useState({
  protein: "",
  creatine: "",
  glutamine: "",
  electrolyte: "",
  bcaas: "",
  preWorkout: ""
});

// Conditioning states (same as recovery)
const [conditioningMinutes, setConditioningMinutes] = useState("");
const [conditioningType, setConditioningType] = useState("");

// Primary states (same as recovery)
const [primaryMinutes, setPrimaryMinutes] = useState("");
const [primaryType, setPrimaryType] = useState("");

// Custom state
const [customNote, setCustomNote] = useState("");

// Add these with your other state declarations


const [schedule, setSchedule] = useState(initialSchedule);


const [showEditModal, setShowEditModal] = useState(false);
const [editActivityTitle, setEditActivityTitle] = useState("");
const [editActivityTime, setEditActivityTime] = useState("");
const [editRecurrence, setEditRecurrence] = useState<"Never" | "Daily" | "Weekly">("Never");
const [editActivityType, setEditActivityType] = useState("Recovery");
const [editDescription, setEditDescription] = useState("");
const [editRecoveryMinutes, setEditRecoveryMinutes] = useState("");
const [editRecoveryType, setEditRecoveryType] = useState("");
const [editCardioMinutes, setEditCardioMinutes] = useState("");
const [editCalorieGoal, setEditCalorieGoal] = useState("");
const [editHydrationOunces, setEditHydrationOunces] = useState("");
const [editSupplements, setEditSupplements] = useState({
  protein: "", creatine: "", glutamine: "", electrolyte: "", bcaas: "", preWorkout: ""
});
const [editingActivity, setEditingActivity] = useState<any>(null);
const [editingDay, setEditingDay] = useState<string>("");

const totalSelected =
  selectedPeople.length +
  selectedTeams.length +
  selectedGroups.length;
  // Fix: Unwrap the params promise using React.use()
  const resolvedParams = use(params); 
  const id = resolvedParams.id;

  const client = clients.find(c => c.id === parseInt(id)) || { name: "Client", team: "Team" };
  
  const allActivities = Object.entries(initialSchedule.currentWeek).flatMap(([day, data]) => 
    data.activities.map(a => ({ ...a, day, date: data.date }))
  );

  

  const people = [
  { name: "John Smith", sub: "Elite Warriors FC • Advanced" },
  { name: "Sarah Johnson", sub: "Elite Warriors FC • Beginners" },
  { name: "Mike Williams", sub: "Thunder Basketball • Advanced" },
];

const teams = [
  { name: "Elite Warriors FC", sub: "4 members", color: "bg-purple-500" },
  { name: "Thunder Basketball", sub: "2 members", color: "bg-orange-500" },
  { name: "Velocity Track Team", sub: "2 members", color: "bg-blue-500" },
];

const groups = [
  { name: "Beginners", sub: "4 members" },
  { name: "Intermediate", sub: "3 members" },
  { name: "Advanced", sub: "5 members" },
];
const handleAddActivity = () => {
  if (!activityTitle || !activityDate || !activityTime) return;

  const newActivity = {
    id: Date.now(),
    type: activityTitle,
    time: activityTime,
    detail: description || activityType,
    variant:
      activityType === "Recovery"
        ? "purple"
        : activityType === "Supplemental"
        ? "teal"
        : "yellow",
  };

  console.log("NEW ACTIVITY:", newActivity);

  // 👉 later you can push into state or API

  // reset + close
  setActivityTitle("");
  setActivityDate("");
  setActivityTime("");
  setDescription("");
  setRecurrence("Never");
  setActivityType("Recovery");

  setShowAddModal(false);
};      

const handleSelect = (name: string) => {
  if (activeTab === "people") {
    setSelectedPeople((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  if (activeTab === "teams") {
    setSelectedTeams((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  if (activeTab === "groups") {
    setSelectedGroups((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }
};

const handleConfirmSelection = () => {
  console.log('Selected People:', selectedPeople);
  console.log('Selected Teams:', selectedTeams);
  console.log('Selected Groups:', selectedGroups);
  
  // Here you would typically save these selections or add activities to them
  alert(`Activity will be added to:\nPeople: ${selectedPeople.length}\nTeams: ${selectedTeams.length}\nGroups: ${selectedGroups.length}`);
  
  // Close the modal
  setShowRecipientsModal(false);
  
  // Optionally reset selections
  // setSelectedPeople([]);
  // setSelectedTeams([]);
  // setSelectedGroups([]);
};

const handleEditClick = (act: any, day: string) => {
  setEditingActivity(act);
  setEditingDay(day);
  
  // Set EDIT states (not the original ones)
  setEditActivityTitle(act.type);
  setEditActivityTime(act.time);
  setEditDescription(act.detail);
  
  if (act.detail.includes("Recovery")) {
    setEditActivityType("Recovery");
  } else if (act.detail.includes("Supplemental")) {
    setEditActivityType("Supplemental");
  } else {
    setEditActivityType("Recovery");
  }
  
  setShowEditModal(true);
};

const handleUpdateActivity = () => {
  if (!editActivityTitle || !editActivityTime) return;
  
  const updatedActivity = {
    ...editingActivity,
    type: editActivityTitle.toUpperCase(),
    time: editActivityTime,
    detail: editDescription || editActivityType,
  };
  
  // Update schedule
  const updatedWeek = {
    ...schedule.currentWeek,
    [editingDay]: {
      ...schedule.currentWeek[editingDay as keyof typeof schedule.currentWeek],
      activities: schedule.currentWeek[editingDay as keyof typeof schedule.currentWeek].activities.map(act =>
        act.id === editingActivity.id ? updatedActivity : act
      )
    }
  };
  
  setSchedule({ currentWeek: updatedWeek });
  
  // Reset EDIT states only
  setEditActivityTitle("");
  setEditActivityTime("");
  setEditDescription("");
  setEditRecurrence("Never");
  setEditActivityType("Recovery");
  
  setShowEditModal(false);
  setEditingActivity(null);
  setEditingDay("");
};

const handleDeleteActivity = (actId: number, day: string) => {
  const updatedWeek = {
    ...schedule.currentWeek,
    [day]: {
      ...schedule.currentWeek[day as keyof typeof schedule.currentWeek],
      activities: schedule.currentWeek[day as keyof typeof schedule.currentWeek].activities.filter(act => act.id !== actId)
    }
  };
  setSchedule({ currentWeek: updatedWeek });
};


  return (
    <div className="min-h-screen bg-[#F8F9FD] text-gray-800">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-itinerary" className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#6c3fef] to-[#4f28c5] flex items-center justify-center text-white border-2 border-white shadow-sm overflow-hidden">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base leading-none">{client.name}</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{client.team}</p>
              </div>
            </div>
          </div>
       <button
  onClick={() => setShowAddModal(true)}
  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
>
  <Plus size={18} /> Add Activity
</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Weekly Schedule</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Manage activities and performance workouts</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-7 border-b border-gray-50">
            {Object.entries(initialSchedule.currentWeek).map(([day, data]) => (
              <div key={day} className="py-4 text-center border-r border-gray-200 last:border-r-0 bg-gray-100/80 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{day}</p>
                <p className="text-lg font-black text-gray-900">{data.date}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[450px]">
        {Object.entries(initialSchedule.currentWeek).map(([day, data]) => (
  <div
    key={day}
className="p-2 border-r border-gray-200 last:border-r-0 flex flex-col gap-3"  >
    {data.activities.map((act) => (
      <div
        key={act.id}
        className={`p-3 rounded-2xl border-l-4 shadow-sm relative group transition-all hover:shadow-md ${
          act.variant === "purple"
            ? "bg-[#F5F3FF] border-[#8B5CF6]"
            : act.variant === "teal"
            ? "bg-[#F0FDFA] border-[#14B8A6]"
            : "bg-[#FFFBEB] border-[#F59E0B]"
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-[10px] font-black text-gray-900 leading-tight pr-4 uppercase tracking-tighter">
            {act.type}
          </h4>

          {/* ✅ Always visible icons */}
        <div className="flex gap-2">
{/* Edit */}
<div 
  onClick={() => handleEditClick(act, day)}
  className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
>
  <Edit2 size={14} className="text-purple-600" />
</div>

{/* Delete */}
<div 
  onClick={() => handleDeleteActivity(act.id, day)}
  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
>
  <Trash2 size={14} className="text-red-500" />
</div>
</div>
        </div>
        <p className="text-xs font-bold text-gray-900">{act.time}</p>
        <p className="text-[9px] text-gray-500 font-medium mt-1 leading-relaxed">
          {act.detail}
        </p>
      </div>
    ))}


  </div>
))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Scheduled Activities</h2>
          <span className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full uppercase">Total: {allActivities.length}</span>
        </div>

        <div className="space-y-4">
          {allActivities.map((act) => (
            <div key={act.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-purple-100 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  act.variant === 'purple' ? 'bg-purple-50 text-purple-500' : 
                  act.variant === 'teal' ? 'bg-teal-50 text-teal-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{act.type}</h3>
                  <p className="text-sm text-gray-400 font-medium">{act.day}, April {act.date} at {act.time} • {act.detail}</p>
                </div>
              </div>
              <div className="flex gap-2">
            
             <button className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 transition-all active:scale-95">
  <Trash2 size={18} />
</button>
              </div>
            </div>
          ))}
        </div>
      </main>
 {showAddModal && (
  <div
 className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] px-4 py-6"    onClick={(e) => {
      if (e.target === e.currentTarget) setShowAddModal(false);
    }}
  >
    <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#F9FAFB] rounded-[24px] p-5 md:p-6 relative shadow-2xl">

      {/* Close */}
      <button
        onClick={() => setShowAddModal(false)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
      >
        <X size={14} className="text-gray-600" />
      </button>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-gray-900 mb-4">
        Add Activity
      </h2>

      {/* Activity Title */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-1">
          Activity Title
        </p>
        <input
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
          placeholder="e.g., RECOVERY FLOW, LEG DAY"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[11px] font-bold text-gray-500 mb-1">Date</p>
          <input
            type="date"
                value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white"
          />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 mb-1">Time</p>
          <input
            type="time"
                value={activityTime}
            onChange={(e) => setActivityTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-2">
          Recurrence
        </p>
        <div className="grid grid-cols-3 gap-2">
      {["Never", "Daily", "Weekly"].map((item) => (
  <button
    key={item}
    onClick={() => setRecurrence(item as any)}
    className={`py-2 rounded-lg text-xs font-bold transition ${
      recurrence === item
        ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow"
        : "bg-gray-200 text-gray-500"
    }`}
  >
    {item}
  </button>
))}
        </div>
      </div>

      {/* Type */}
{/* Type */}
<div className="mb-4">
  <p className="text-[11px] font-bold text-gray-500 mb-2">Type</p>

  <div className="flex flex-wrap gap-2">
    {/* Recovery */}
    <span
      onClick={() => setActivityType("Recovery")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Recovery"
          ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]"
          : "bg-[#C4B5FD]"
      }`}
    >
      Recovery
    </span>

    {/* Supplemental */}
    <span
      onClick={() => setActivityType("Supplemental")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Supplemental"
          ? "bg-[#10B981]"
          : "bg-[#6EE7B7]"
      }`}
    >
      Supplemental
    </span>

    {/* Conditioning */}
    <span
      onClick={() => setActivityType("Conditioning")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Conditioning"
          ? "bg-[#F59E0B]"
          : "bg-[#FCD34D]"
      }`}
    >
      Conditioning
    </span>

    {/* Cardio */}
    <span
      onClick={() => setActivityType("Cardio")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Cardio"
          ? "bg-[#EF4444]"
          : "bg-[#FCA5A5]"
      }`}
    >
      Cardio
    </span>

    {/* Primary */}
    <span
      onClick={() => setActivityType("Primary")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Primary"
          ? "bg-[#3B82F6]"
          : "bg-[#93C5FD]"
      }`}
    >
      Primary
    </span>

    {/* Custom */}
    <span
      onClick={() => setActivityType("Custom")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Custom"
          ? "bg-[#6B7280]"
          : "bg-[#D1D5DB]"
      }`}
    >
      Custom
    </span>

    {/* Hydration */}
    <span
      onClick={() => setActivityType("Hydration")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
        activityType === "Hydration"
          ? "bg-[#06B6D4]"
          : "bg-[#67E8F9]"
      }`}
    >
      Hydration
    </span>
  </div>
</div>

{/* Recovery Details */}
{activityType === "Recovery" && (
  <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-200">
    <p className="text-xs font-bold text-purple-700 mb-3">
      Recovery Details
    </p>

    {/* Row layout */}
    <div className="flex gap-3">
      
      {/* Minutes */}
      <div className="flex-1">
        <p className="text-[11px] font-bold text-gray-600 mb-1">
          Minutes (Optional)
        </p>
        <input
          type="number"
          value={recoveryMinutes}
          onChange={(e) => setRecoveryMinutes(e.target.value)}
          placeholder="15, 30, 45"
          className="w-full px-3.5 py-2.5 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Recovery Type */}
      <div className="flex-1">
        <p className="text-[11px] font-bold text-gray-600 mb-1">
          Recovery Type (Optional)
        </p>
        <input
          type="text"
          value={recoveryType}
          onChange={(e) => setRecoveryType(e.target.value)}
          placeholder="Active, Cryotherapy, Massage"
          className="w-full px-3.5 py-2.5 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

    </div>
  </div>
)}

{/* Supplemental Details */}
{activityType === "Supplemental" && (
  <div className="mb-5 p-4 bg-teal-50 rounded-xl border border-teal-200">
    <p className="text-xs font-bold text-teal-700 mb-2">Supplemental Details</p>
    <p className="text-sm text-teal-600">
      This will pull directly from user's workout queue
    </p>
  </div>
)}

{/* Conditioning Details */}
{activityType === "Conditioning" && (
  <div className="mb-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
    <p className="text-xs font-bold text-amber-700 mb-2">Conditioning Details</p>
    <p className="text-sm text-amber-600">
      This will pull directly from user's workout queue
    </p>
  </div>
)}

{/* Cardio Details */}
{activityType === "Cardio" && (
  <div className="mb-5 p-4 bg-red-50 rounded-xl border border-red-200">
    <p className="text-xs font-bold text-red-700 mb-3">Cardio Details</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">Duration (minutes)</label>
        <p className="text-[10px] text-gray-400 mb-1">Optional</p>
        <input
          type="number"
          value={cardioMinutes}
          onChange={(e) => setCardioMinutes(e.target.value)}
          placeholder="e.g., 20, 30, 45"
          className="w-full px-3.5 py-2.5 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">Calorie Goal</label>
        <p className="text-[10px] text-gray-400 mb-1">Optional</p>
        <input
          type="number"
          value={calorieGoal}
          onChange={(e) => setCalorieGoal(e.target.value)}
          placeholder="e.g., 200, 300, 500"
          className="w-full px-3.5 py-2.5 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
    </div>
  </div>
)}

{/* Primary Details */}
{activityType === "Primary" && (
  <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
    <p className="text-xs font-bold text-blue-700 mb-2">Primary Details</p>
    <p className="text-sm text-blue-600">
      This will pull directly from user's workout queue
    </p>
  </div>
)}

{/* Custom Details */}
{activityType === "Custom" && (
  <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
    <p className="text-xs font-bold text-gray-700 mb-2">Custom Activity</p>
    <p className="text-sm text-gray-600">
      Custom activities can serve as notes, check-ins, reminders. Add details in the description field above.
    </p>
  </div>
)}

{/* Hydration Details */}
{activityType === "Hydration" && (
  <div className="mb-5 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
    <p className="text-xs font-bold text-cyan-700 mb-3">Hydration Details</p>
    
    {/* Ounces Input */}
    <div className="mb-4">
      <p className="text-[11px] font-bold text-gray-600 mb-1">Water Intake (ounces)</p>
      <input
        type="number"
        value={hydrationOunces}
        onChange={(e) => setHydrationOunces(e.target.value)}
        placeholder="e.g., 16, 32, 64 oz"
        className="w-full px-3.5 py-2.5 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
    </div>

    {/* Supplements Section */}
    <div>
      <p className="text-[11px] font-bold text-gray-600 mb-3">Supplements - Optional (in grams)</p>
      
      {/* Row 1 - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Protein </label>
          <input
            type="number"
            value={supplements.protein}
            onChange={(e) => setSupplements({...supplements, protein: e.target.value})}
            placeholder="grams"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">Creatine</label>
          <input
            type="number"
            value={supplements.creatine}
            onChange={(e) => setSupplements({...supplements, creatine: e.target.value})}
            placeholder="grams"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">Glutamine </label>
          <input
            type="number"
            value={supplements.glutamine}
            onChange={(e) => setSupplements({...supplements, glutamine: e.target.value})}
            placeholder="grams"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Row 2 - Bottom 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">100 mg Electrolyte </label>
          <input
            type="text"
            value={supplements.electrolyte}
            onChange={(e) => setSupplements({...supplements, electrolyte: e.target.value})}
            placeholder="100mg"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">10 g BCAA'S </label>
          <input
            type="text"
            value={supplements.bcaas}
            onChange={(e) => setSupplements({...supplements, bcaas: e.target.value})}
            placeholder="10g"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">1 scoop Pre-workout </label>
          <input
            type="text"
            value={supplements.preWorkout}
            onChange={(e) => setSupplements({...supplements, preWorkout: e.target.value})}
            placeholder="1 scoop"
            className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>
    </div>
  </div>
)}

      {/* Description */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-gray-500 mb-1">
          Description (Optional)
        </p>
        <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional details..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm resize-none"
        />
      </div>

      {/* Primary CTA */}
      <button onClick={handleAddActivity} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-bold shadow-md">
        Add Activity to {client.name}
      </button>

      {/* Secondary CTA */}
   <button
  onClick={() => {
    setShowAddModal(false);
    setShowRecipientsModal(true);
  }}
  className="w-full mt-3 py-2.5 rounded-lg border-2 border-purple-400 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition"
>
  + Add to Multiple Clients / Teams / Groups
</button>
    </div>
  </div>
)}

{/* Edit Activity Modal */}
{showEditModal && editingActivity && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1200] px-4 py-6"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        // Reset all edit states when closing
        setEditActivityTitle("");
        setEditActivityTime("");
        setEditDescription("");
        setEditRecurrence("Never");
        setEditActivityType("Recovery");
        setEditRecoveryMinutes("");
        setEditRecoveryType("");
        setEditCardioMinutes("");
        setEditCalorieGoal("");
        setEditHydrationOunces("");
        setEditSupplements({
          protein: "", creatine: "", glutamine: "", electrolyte: "", bcaas: "", preWorkout: ""
        });
        setShowEditModal(false);
        setEditingActivity(null);
        setEditingDay("");
      }
    }}
  >
    <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#F9FAFB] rounded-[24px] p-5 md:p-6 relative shadow-2xl">

      {/* Close button */}
      <button
        onClick={() => {
          setEditActivityTitle("");
          setEditActivityTime("");
          setEditDescription("");
          setEditRecurrence("Never");
          setEditActivityType("Recovery");
          setEditRecoveryMinutes("");
          setEditRecoveryType("");
          setEditCardioMinutes("");
          setEditCalorieGoal("");
          setEditHydrationOunces("");
          setEditSupplements({
            protein: "", creatine: "", glutamine: "", electrolyte: "", bcaas: "", preWorkout: ""
          });
          setShowEditModal(false);
          setEditingActivity(null);
          setEditingDay("");
        }}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
      >
        <X size={14} className="text-gray-600" />
      </button>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-gray-900 mb-4">
        Edit Activity
      </h2>

      {/* Activity Title */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-1">
          Activity Title
        </p>
        <input
          value={editActivityTitle}
          onChange={(e) => setEditActivityTitle(e.target.value)}
          placeholder="e.g., RECOVERY FLOW, LEG DAY"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Day + Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[11px] font-bold text-gray-500 mb-1">Day</p>
          <input
            value={editingDay}
            disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500"
          />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 mb-1">Time</p>
          <input
            type="time"
            value={editActivityTime}
            onChange={(e) => setEditActivityTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-2">
          Recurrence
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["Never", "Daily", "Weekly"].map((item) => (
            <button
              key={item}
              onClick={() => setEditRecurrence(item as any)}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                editRecurrence === item
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          <span
            onClick={() => setEditActivityType("Recovery")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Recovery"
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]"
                : "bg-[#C4B5FD]"
            }`}
          >
            Recovery
          </span>
          <span
            onClick={() => setEditActivityType("Supplemental")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Supplemental"
                ? "bg-[#10B981]"
                : "bg-[#6EE7B7]"
            }`}
          >
            Supplemental
          </span>
          <span
            onClick={() => setEditActivityType("Conditioning")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Conditioning"
                ? "bg-[#F59E0B]"
                : "bg-[#FCD34D]"
            }`}
          >
            Conditioning
          </span>
          <span
            onClick={() => setEditActivityType("Cardio")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Cardio"
                ? "bg-[#EF4444]"
                : "bg-[#FCA5A5]"
            }`}
          >
            Cardio
          </span>
          <span
            onClick={() => setEditActivityType("Primary")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Primary"
                ? "bg-[#3B82F6]"
                : "bg-[#93C5FD]"
            }`}
          >
            Primary
          </span>
          <span
            onClick={() => setEditActivityType("Custom")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Custom"
                ? "bg-[#6B7280]"
                : "bg-[#D1D5DB]"
            }`}
          >
            Custom
          </span>
          <span
            onClick={() => setEditActivityType("Hydration")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer transition ${
              editActivityType === "Hydration"
                ? "bg-[#06B6D4]"
                : "bg-[#67E8F9]"
            }`}
          >
            Hydration
          </span>
        </div>
      </div>

      {/* Recovery Details */}
      {editActivityType === "Recovery" && (
        <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-xs font-bold text-purple-700 mb-3">Recovery Details</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-600 mb-1">Minutes (Optional)</p>
              <input
                type="number"
                value={editRecoveryMinutes}
                onChange={(e) => setEditRecoveryMinutes(e.target.value)}
                placeholder="15, 30, 45"
                className="w-full px-3.5 py-2.5 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-600 mb-1">Recovery Type (Optional)</p>
              <input
                type="text"
                value={editRecoveryType}
                onChange={(e) => setEditRecoveryType(e.target.value)}
                placeholder="Active, Cryotherapy, Massage"
                className="w-full px-3.5 py-2.5 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Supplemental Details */}
      {editActivityType === "Supplemental" && (
        <div className="mb-5 p-4 bg-teal-50 rounded-xl border border-teal-200">
          <p className="text-xs font-bold text-teal-700 mb-2">Supplemental Details</p>
          <p className="text-sm text-teal-600">This will pull directly from user's workout queue</p>
        </div>
      )}

      {/* Conditioning Details */}
      {editActivityType === "Conditioning" && (
        <div className="mb-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs font-bold text-amber-700 mb-2">Conditioning Details</p>
          <p className="text-sm text-amber-600">This will pull directly from user's workout queue</p>
        </div>
      )}

      {/* Cardio Details */}
      {editActivityType === "Cardio" && (
        <div className="mb-5 p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-xs font-bold text-red-700 mb-3">Cardio Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Duration (minutes)</label>
              <p className="text-[10px] text-gray-400 mb-1">Optional</p>
              <input
                type="number"
                value={editCardioMinutes}
                onChange={(e) => setEditCardioMinutes(e.target.value)}
                placeholder="e.g., 20, 30, 45"
                className="w-full px-3.5 py-2.5 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Calorie Goal</label>
              <p className="text-[10px] text-gray-400 mb-1">Optional</p>
              <input
                type="number"
                value={editCalorieGoal}
                onChange={(e) => setEditCalorieGoal(e.target.value)}
                placeholder="e.g., 200, 300, 500"
                className="w-full px-3.5 py-2.5 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Primary Details */}
      {editActivityType === "Primary" && (
        <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs font-bold text-blue-700 mb-2">Primary Details</p>
          <p className="text-sm text-blue-600">This will pull directly from user's workout queue</p>
        </div>
      )}

      {/* Custom Details */}
      {editActivityType === "Custom" && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-2">Custom Activity</p>
          <p className="text-sm text-gray-600">Custom activities can serve as notes, check-ins, reminders. Add details in the description field above.</p>
        </div>
      )}

      {/* Hydration Details */}
      {editActivityType === "Hydration" && (
        <div className="mb-5 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
          <p className="text-xs font-bold text-cyan-700 mb-3">Hydration Details</p>
          <div className="mb-4">
            <p className="text-[11px] font-bold text-gray-600 mb-1">Water Intake (ounces)</p>
            <input
              type="number"
              value={editHydrationOunces}
              onChange={(e) => setEditHydrationOunces(e.target.value)}
              placeholder="e.g., 16, 32, 64 oz"
              className="w-full px-3.5 py-2.5 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-600 mb-3">Supplements - Optional (in grams)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Protein</label>
                <input
                  type="number"
                  value={editSupplements.protein}
                  onChange={(e) => setEditSupplements({...editSupplements, protein: e.target.value})}
                  placeholder="grams"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Creatine</label>
                <input
                  type="number"
                  value={editSupplements.creatine}
                  onChange={(e) => setEditSupplements({...editSupplements, creatine: e.target.value})}
                  placeholder="grams"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Glutamine</label>
                <input
                  type="number"
                  value={editSupplements.glutamine}
                  onChange={(e) => setEditSupplements({...editSupplements, glutamine: e.target.value})}
                  placeholder="grams"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">100 mg Electrolyte</label>
                <input
                  type="text"
                  value={editSupplements.electrolyte}
                  onChange={(e) => setEditSupplements({...editSupplements, electrolyte: e.target.value})}
                  placeholder="100mg"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">10 g BCAA'S</label>
                <input
                  type="text"
                  value={editSupplements.bcaas}
                  onChange={(e) => setEditSupplements({...editSupplements, bcaas: e.target.value})}
                  placeholder="10g"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">1 scoop Pre-workout</label>
                <input
                  type="text"
                  value={editSupplements.preWorkout}
                  onChange={(e) => setEditSupplements({...editSupplements, preWorkout: e.target.value})}
                  placeholder="1 scoop"
                  className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-gray-500 mb-1">
          Description (Optional)
        </p>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Add any additional details..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Update Button */}
      <button 
        onClick={handleUpdateActivity} 
        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        Edit Activity for {client.name}
      </button>
    </div>
  </div>
)}
{showRecipientsModal && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] px-4 py-6"
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowRecipientsModal(false);

    }}
  >
    <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#F9FAFB] rounded-[24px] p-5 relative shadow-2xl">

      {/* Close */}
      <button
        onClick={() => setShowRecipientsModal(false)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <X size={14} />
      </button>

      {/* Title */}
      <h2 className="text-lg font-extrabold text-gray-900">
        Select Recipients
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Choose who should receive this activity
      </p>

      {/* Tabs */}
      <div className="bg-gray-200 rounded-xl p-1 flex gap-1 mb-4">
        {[
          { key: "people", label: "People" },
          { key: "teams", label: "Teams" },
          { key: "groups", label: "Groups" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search - only show if there are items */}
      {(activeTab === "people" && people.length > 0) ||
       (activeTab === "teams" && teams.length > 0) ||
       (activeTab === "groups" && groups.length > 0) ? (
        <input
          placeholder={
            activeTab === "people"
              ? "Search people..."
              : activeTab === "teams"
              ? "Search teams..."
              : "Search groups..."
          }
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm mb-4"
        />
      ) : null}

      {/* LIST or EMPTY STATE */}
      <div className="space-y-3">
        {/* PEOPLE */}
        {activeTab === "people" && (
          people.length > 0 ? (
            people.map((item, i) => {
              const isSelected = selectedPeople.includes(item.name);
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(item.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                    isSelected
                      ? "border-purple-400 bg-purple-50"
                      : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="w-4 h-4 accent-purple-500"
                  />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-gray-400" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">No people found</p>
              <p className="text-sm text-gray-500">Add clients to get started</p>
            </div>
          )
        )}

        {/* TEAMS */}
        {activeTab === "teams" && (
          teams.length > 0 ? (
            teams.map((item, i) => {
              const isSelected = selectedTeams.includes(item.name);
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(item.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                    isSelected
                      ? "border-purple-400 bg-purple-50"
                      : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="w-4 h-4 accent-purple-500"
                  />
                  <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center text-white`}>
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">No teams created</p>
              <p className="text-sm text-gray-500 mb-4">Create your first team to organize clients</p>
              <button
                onClick={() => {
                  setShowRecipientsModal(false);
                  setShowCreateGroupModal(true);
                  // Navigate to create team page or open create team modal
                  // router.push('/teams/create');
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Create Team
              </button>
            </div>
          )
        )}

        {/* GROUPS */}
     {/* GROUPS */}
{activeTab === "groups" && (
  groups.length > 0 ? (
    groups.map((item, i) => {
      const isSelected = selectedGroups.includes(item.name);
      return (
        <div
          key={i}
          onClick={() => handleSelect(item.name)}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
            isSelected
              ? "border-purple-400 bg-purple-50"
              : "border-transparent hover:bg-gray-100"
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="w-4 h-4 accent-purple-500"
          />
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white">
            <Users size={16} />  {/* Fixed: Removed extra 'div' */}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{item.name}</p>
            <p className="text-[11px] text-gray-400">{item.sub}</p>
          </div>
        </div>
      );
    })
  ) : (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={24} className="text-gray-400" />
      </div>
      <p className="text-base font-bold text-gray-900 mb-1">No groups created</p>
      <p className="text-sm text-gray-500 mb-4">Create your first group to organize clients</p>
      <button
        onClick={() => {
          setShowRecipientsModal(false);
            setShowCreateGroupModal(true);
          // Navigate to create group page or open create group modal
          // router.push('/groups/create');
        }}
        className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all"
      >
        Create First Group
      </button>
    </div>
  )
)}
      </div>

      {/* SUMMARY */}
      {totalSelected > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-purple-100 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold mb-1">
            Activity will be added to approximately {totalSelected} recipient
            {totalSelected > 1 && "s"}
          </p>

          <div className="text-[11px] text-purple-600 space-y-1">
            {selectedPeople.length > 0 && (
              <p>• {selectedPeople.length} individual client(s)</p>
            )}

            {selectedTeams.length > 0 && (
              <p>
                • {selectedTeams.length} team(s): {selectedTeams.join(", ")}
              </p>
            )}

            {selectedGroups.length > 0 && (
              <p>
                • {selectedGroups.length} group(s): {selectedGroups.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowRecipientsModal(false)}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
            onClick={handleConfirmSelection}
          disabled={totalSelected === 0}
          className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
            totalSelected > 0
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-lg active:scale-95"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Confirm Selection ({totalSelected})
        </button>
      </div>
    </div>
  </div>
)}
{showCreateGroupModal && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1100] px-4 py-6"
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowCreateGroupModal(false);
    }}
  >
    <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#F9FAFB] rounded-[24px] p-5 relative shadow-2xl">

      {/* Close */}
      <button
        onClick={() => setShowCreateGroupModal(false)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <X size={14} />
      </button>

      {/* Title */}
      <h2 className="text-lg font-extrabold text-gray-900">
        Create New Group
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Create a custom group to organize your clients
      </p>

      {/* Group Name */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 mb-1">
          Group Name
        </p>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Morning Squad, Elite Team"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Members */}
      <div className="mb-3">
        <p className="text-[11px] font-bold text-gray-500 mb-2">
          Select Members ({groupMembers.length} selected)
        </p>

        <input
          placeholder="Search people..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm mb-3"
        />
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {people.map((item, i) => {
          const isSelected = groupMembers.includes(item.name);

          return (
            <div
              key={i}
              onClick={() =>
                setGroupMembers((prev) =>
                  prev.includes(item.name)
                    ? prev.filter((i) => i !== item.name)
                    : [...prev, item.name]
                )
              }
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                isSelected
                  ? "border-purple-500 bg-purple-50"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="w-4 h-4 accent-purple-500"
              />

              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white">
                <User size={16} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-400">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowCreateGroupModal(false)}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold"
        >
          Cancel
        </button>

        <button
          disabled={!groupName || groupMembers.length === 0}
          className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
            groupName && groupMembers.length > 0
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Create Group
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}