"use client";

const SCHEDULE = [
  {
    day: "Sunday",
    items: [
      { title: "RECOVERY FLOW", tag: "RECOVERY", tagBg: "bg-purple-500", subtag: "RECOVERY", subtagBg: "bg-purple-500", info: "Sun, Dec 29 · 8:00–8:30 PM", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75" },
    ],
  },
  {
    day: "Monday",
    items: [
      { title: "HYDRATION CHECK", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "HYDRATION", subtagBg: "bg-cyan-500", info: "Mon, Oct 27 · 6:00–6:30 AM", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=75" },
      { title: "SILVER-BACK", tag: "PRIMARY", tagBg: "bg-blue-500", subtag: "PRIMARY", subtagBg: "bg-blue-500", info: "Mon, Oct 27 · 8:00–10:00 AM · Back, Glutes", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=75" },
    ],
  },
  {
    day: "Tuesday",
    items: [
      { title: "HYDRATION CHECK", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "HYDRATION", subtagBg: "bg-cyan-500", info: "Tue, Oct 28 · 6:00–6:30 AM", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=75" },
    ],
  },
  {
    day: "Wednesday",
    items: [
      { title: "MORNING SPRINT", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "CARDIO", subtagBg: "bg-yellow-500", info: "Wed, Oct 29 · 6:00 AM · Cardio", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75" },
      { title: "WOLF-PACK", tag: "SUPPLEMENTAL", tagBg: "bg-green-500", subtag: "PRIMARY", subtagBg: "bg-blue-500", info: "Wed, Oct 29 · 12:30–1:00 PM · Full Body", img: "https://images.unsplash.com/photo-1517963879433-6ad2a56fcd82?w=400&q=75" },
    ],
  },
  {
    day: "Thursday",
    items: [
      { title: "HYDRATION CHECK", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "HYDRATION", subtagBg: "bg-cyan-500", info: "Thu, Oct 30 · 6:00 AM", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=75" },
      { title: "LEG DESTROYER", tag: "PRIMARY", tagBg: "bg-blue-500", subtag: "PRIMARY", subtagBg: "bg-blue-500", info: "Thu, Oct 30 · 5:00–5:55 PM · Legs", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=75" },
      { title: "CUSTOM ROUTINE", tag: "CUSTOM", tagBg: "bg-gray-500", subtag: "CUSTOM", subtagBg: "bg-gray-500", info: "Thu, Oct 30 · 7:00 PM", img: "https://images.unsplash.com/photo-1517963879433-6ad2a56fcd82?w=400&q=75" },
    ],
  },
  {
    day: "Friday",
    items: [
      { title: "PUMP PECS", tag: "CARDIO", tagBg: "bg-red-500", subtag: "PRIMARY", subtagBg: "bg-blue-500", info: "Fri, Oct 31 · 6:00 AM · Chest", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=75" },
      { title: "HYDRATION CHECK", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "HYDRATION", subtagBg: "bg-cyan-500", info: "Fri, Oct 31 · 3:00 PM", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=75" },
    ],
  },
  {
    day: "Saturday",
    items: [
      { title: "HYDRATION CHECK", tag: "HYDRATION", tagBg: "bg-cyan-500", subtag: "HYDRATION", subtagBg: "bg-cyan-500", info: "Sat, Nov 1 · 6:00 AM", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=75" },
      { title: "SPRINT SESSION", tag: "CARDIO", tagBg: "bg-red-500", subtag: "CARDIO", subtagBg: "bg-red-500", info: "Sat, Nov 1 · 9:00 AM", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75" },
      { title: "RECOVERY FLOW", tag: "RECOVERY", tagBg: "bg-purple-500", subtag: "RECOVERY", subtagBg: "bg-purple-500", info: "Sat, Nov 1 · 8:00 PM", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75" },
    ],
  },
];

export default function SchedulePage() {
  return (
    <div className="px-6 py-5">
      {/* Section header */}
      <div className="bg-gray-50 rounded-2xl px-5 py-3.5 mb-6">
        <p className="text-[13px] font-bold text-gray-900">Weekly Schedule</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Total Workouts on your schedule this week</p>
      </div>

      {/* Day groups */}
      <div className="flex flex-col gap-7">
        {SCHEDULE.map((group) => (
          <div key={group.day}>
            <p className="text-[12px] font-semibold text-gray-400 mb-3">By {group.day}</p>

            {/* Strict 3-column grid */}
            <div className="grid grid-cols-3 gap-4">
              {group.items.map((w, wi) => (
                <div
                  key={wi}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[2/1]"

                >
                  <img
                    src={w.img}
                    alt={w.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  {/* Top tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`${w.tagBg} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                      {w.tag}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-[12px] font-bold leading-tight truncate">{w.title}</p>
                    <p className="text-white/60 text-[9px] mt-0.5 truncate">{w.info}</p>
                    <span className={`${w.subtagBg} text-white text-[8px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block`}>
                      {w.subtag}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty placeholder slots to maintain 3-col alignment */}
              {Array.from({ length: (3 - (group.items.length % 3)) % 3 }).map((_, ei) => (
                <div key={`empty-${ei}`} className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 aspect-[2/1]"
 />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}