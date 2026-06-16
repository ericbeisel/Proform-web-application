"use client";

interface CoachSidebarProps {
  profilePicture: string | null;
  userInitial: string;
  onSwitchToPlayer: () => void;
  onLogOut: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: "Teams",       highlight: false },
  { label: "Calendar",    highlight: false },
  { label: "Activity",    highlight: false },
  { label: "Players",     highlight: false },
  { label: "Reports",     highlight: false },
  { label: "Create Team", highlight: false },
];

const TOOL_ITEMS = [
  "Team Queues", "Settings",
];

export function CoachSidebar({ profilePicture, userInitial, onSwitchToPlayer, onLogOut, isOpen = false, onClose }: CoachSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[997] md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed left-0 top-0 h-full w-[220px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.10)] z-[998] flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-[#f0eef8]">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
          {profilePicture
            ? <img src={profilePicture} alt="profile" className="w-full h-full object-cover" />
            : userInitial}
        </div>
        <span className="font-semibold text-[#1a1825] text-sm ml-3">{userInitial}</span>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`text-sm py-2.5 px-3 rounded-xl text-left transition-colors hover:bg-[#f5f0ff] hover:text-[#8B5CF6] ${
              item.highlight ? "text-[#e17055] font-medium" : "text-[#3d3a4a]"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="h-px bg-[#f0eef8] my-2" />
        <span className="text-[11px] font-semibold text-[#b0adc0] uppercase tracking-wide px-3 mb-1">
          Tools
        </span>

        {TOOL_ITEMS.map((label) => (
          <button
            key={label}
            className="text-sm py-2.5 px-3 rounded-xl text-left text-[#3d3a4a] hover:bg-[#f5f0ff] hover:text-[#8B5CF6] transition-colors"
          >
            {label}
          </button>
        ))}

        <div className="h-px bg-[#f0eef8] my-2" />

        <button
          onClick={onSwitchToPlayer}
          className="text-sm py-2.5 px-3 rounded-xl text-left text-[#8B5CF6] font-medium hover:bg-[#f5f0ff] transition-colors"
        >
          Switch to Player
        </button>
        <button
          onClick={onLogOut}
          className="text-sm py-2.5 px-3 rounded-xl text-left text-[#e17055] font-medium hover:bg-red-50 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
    </>
  );
}
