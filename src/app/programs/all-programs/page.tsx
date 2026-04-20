// src/app/programs/all-programs/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, ArrowLeft, LayoutGrid, AlignJustify, Eye, ShoppingBag,
  SlidersHorizontal, X, Check,
  FileText, Loader2,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllPrograms, ProgramWithUI } from "@/api/programs/route";

/* ═══════════════════════════════════
   TYPES
═══════════════════════════════════ */
interface StartProgramPopupProps {
  program: ProgramWithUI;
  onClose: () => void;
}

interface ProgramDetailPageProps {
  program: ProgramWithUI;
  onBack: () => void;
}

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

/* ═══════════════════════════════════
   MODULE-LEVEL CACHE
   Persists between navigations so
   revisiting the page is instant
═══════════════════════════════════ */
let programsCache: ProgramWithUI[] | null = null;

/* ═══════════════════════════════════
   PAGE SIZE FOR PAGINATION
═══════════════════════════════════ */
const PAGE_SIZE = 12;

/* ═══════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'DM Sans', sans-serif; }
    @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes popIn        { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
    @keyframes slideDown    { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer      { from { background-position: -400px 0; } to { background-position: 400px 0; } }
    .page-grid   { animation: slideInLeft  0.28s ease; }
    .card-img { transition:transform 0.35s ease; }
    .group:hover .card-img { transform:scale(1.05); }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite linear;
    }
  `}</style>
);

/* ═══════════════════════════════════
   SKELETON CARD (shown while loading)
═══════════════════════════════════ */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
    <div className="h-40 skeleton" />
    <div className="p-4 space-y-2">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-2/3" />
      <div className="flex gap-4 pt-3 border-t border-gray-100 mt-2">
        <div className="h-3 skeleton rounded w-12" />
        <div className="h-3 skeleton rounded w-12" />
      </div>
    </div>
  </div>
);

const SkeletonList = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 flex">
    <div className="w-48 h-32 skeleton shrink-0" />
    <div className="flex-1 p-4 space-y-2">
      <div className="h-4 skeleton rounded w-2/3" />
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-3/4" />
    </div>
  </div>
);

/* ═══════════════════════════════════
   START PROGRAM POPUP
═══════════════════════════════════ */
function StartProgramPopup({ program, onClose }: StartProgramPopupProps) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-300 bg-black/55 flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md relative text-center shadow-2xl animate-[popIn_0.22s_ease]">
        <button onClick={onClose} className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
          <X size={16} className="text-gray-700" />
        </button>
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6C3AE8] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FileText size={24} className="text-white" />
        </div>
        <p className="text-lg font-bold text-gray-900 mb-2">Add to Workout Queue</p>
        <p className="text-xl font-black text-[#6C3AE8] mb-2">{program.title}</p>
        <button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6C3AE8] text-white rounded-full py-3 font-bold mb-2 shadow-lg">
          Add to Queue
        </button>
        <button onClick={onClose} className="text-blue-500 text-sm font-semibold">Go Back</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   PROGRAM DETAIL PAGE
═══════════════════════════════════ */
function ProgramDetailPage({ program, onBack }: ProgramDetailPageProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="page-grid bg-gray-50 min-h-screen">
      {showPopup && <StartProgramPopup program={program} onClose={() => setShowPopup(false)} />}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2">
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-extrabold text-gray-900">{program.title}</h1>
          </div>
          <button onClick={() => setShowPopup(true)} className="bg-[#6C3AE8] text-white px-4 py-2 rounded-lg font-bold text-sm">
            Start Program
          </button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Program Overview</h2>
            <div className="bg-[#18182A] rounded-xl p-5 text-white">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-gray-400 text-xs">Duration</p><p className="font-extrabold">{program.duration}</p></div>
                <div><p className="text-gray-400 text-xs">Enrolled</p><p className="font-extrabold">{program.enrolled?.toLocaleString() || 0}</p></div>
                <div><p className="text-gray-400 text-xs">Completed</p><p className="font-extrabold">{program.times_completed?.toLocaleString() || 0}</p></div>
                <div><p className="text-gray-400 text-xs">Package</p><p className="font-extrabold">{program.package || "Standard"}</p></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ALL PROGRAMS GRID
═══════════════════════════════════ */
export default function AllProgramsPage() {
  const [programs, setPrograms] = useState<ProgramWithUI[]>([]);
  const [loading, setLoading] = useState(!programsCache); // skip loading if cached
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDuration, setFilterDuration] = useState("All");
  const [filterPackage, setFilterPackage] = useState("All");
  const [filterFree, setFilterFree] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithUI | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // If we already have cached data, use it immediately — no fetch needed
    if (programsCache) {
      setPrograms(programsCache);
      return;
    }

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await getAllPrograms();

        const mappedPrograms: ProgramWithUI[] = data.map((program) => ({
          ...program,
          purchased: false,
          dollar: program.paid_plan !== null && program.paid_plan !== "",
          views: program.times_completed,
          bought: program.enrolled,
          category: program.package || "General",
          level: program.duration.includes("Week")
            ? program.duration === "12 Weeks" ? "Advanced"
              : program.duration === "6 Weeks" ? "Intermediate" : "Beginner"
            : "Beginner",
        }));

        // Save to module-level cache
        programsCache = mappedPrograms;
        setPrograms(mappedPrograms);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Reset pagination when filters/search change
  useEffect(() => { setPage(1); }, [searchQuery, filterDuration, filterPackage, filterFree]);

  // IntersectionObserver: load next page when sentinel div scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [searchQuery, filterDuration, filterPackage, filterFree, programs.length]);

  const durations = ["All", ...new Set(programs.map((p) => p.duration))];
  const packages = ["All", ...new Set(programs.map((p) => p.package).filter((pkg) => pkg && pkg !== ""))];

  const filtered = programs.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterDuration !== "All" && p.duration !== filterDuration) return false;
    if (filterPackage !== "All" && p.package !== filterPackage) return false;
    if (filterFree && !p.free_is_program) return false;
    return true;
  });

  // Only render programs up to current page
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const activeCount = [filterDuration !== "All", filterPackage !== "All", filterFree].filter(Boolean).length;
  const clearAll = () => {
    setFilterDuration("All");
    setFilterPackage("All");
    setFilterFree(false);
  };

  const Pill = ({ label, active, onClick }: PillProps) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
        active ? "bg-[#6C3AE8] border-[#6C3AE8] text-white" : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      {active && <Check size={10} />}{label}
    </button>
  );

  const Chip = ({ label, onRemove }: ChipProps) => (
    <div className="bg-purple-100 text-[#6C3AE8] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
      {label}<button onClick={onRemove}><X size={10} /></button>
    </div>
  );

  const handleViewProgram = useCallback((program: ProgramWithUI) => {
    router.push(`/programs/${program.id}`);
  }, [router]);

  const handleBack = () => {
    setShowDetail(false);
    setSelectedProgram(null);
  };

  /* ── LOADING STATE: shimmer skeletons instead of spinner ── */
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="bg-gray-50 min-h-screen">
          {/* Minimal header skeleton */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 skeleton rounded w-32" />
                <div className="w-8 h-8 skeleton rounded-full" />
                <div className="flex gap-1">
                  <div className="w-8 h-8 skeleton rounded-lg" />
                  <div className="w-8 h-8 skeleton rounded-lg" />
                </div>
              </div>
              <div className="h-9 skeleton rounded-lg w-full" />
            </div>
          </div>
          {/* Skeleton cards */}
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              programsCache = null; // clear stale cache on retry
              window.location.reload();
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showDetail && selectedProgram) {
    return <ProgramDetailPage program={selectedProgram} onBack={handleBack} />;
  }

  return (
    <>
      <GlobalStyles />
      <div className="page-grid bg-gray-50 min-h-screen">

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">All Programs</h1>
                <p className="text-xs text-gray-400">{filtered.length} programs available</p>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center shrink-0"
                  aria-label="Dashboard"
                  onClick={() => router.push("/dashboard")}
                >
                  <img
                    src="/images/proform-logo.jpg"
                    alt="Proform Logo"
                    className="w-8 h-8 md:w-9 md:h-9 object-contain"
                    loading="eager" // logo should load immediately
                  />
                </button>
              </div>
              <div className="flex-1 flex justify-end gap-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#6C3AE8]" : "bg-gray-100"}`}>
                  <LayoutGrid size={16} className={viewMode === "grid" ? "text-white" : "text-gray-500"} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#6C3AE8]" : "bg-gray-100"}`}>
                  <AlignJustify size={16} className={viewMode === "list" ? "text-white" : "text-gray-500"} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2">
                <Search size={14} className="text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs..."
                  className="flex-1 text-sm outline-none bg-transparent"
                />
                {searchQuery && <button onClick={() => setSearchQuery("")}><X size={12} /></button>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                    showFilters || activeCount > 0
                      ? "bg-[#6C3AE8] border-[#6C3AE8] text-white"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  Filters
                  {activeCount > 0 && (
                    <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] ml-1">{activeCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 px-4 py-4 animate-[slideDown_0.18s_ease]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">DURATION</p>
                  <div className="flex flex-wrap gap-1.5">
                    {durations.map((d) => <Pill key={d} label={d} active={filterDuration === d} onClick={() => setFilterDuration(d)} />)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">PACKAGE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {packages.map((p) => <Pill key={p} label={p} active={filterPackage === p} onClick={() => setFilterPackage(p)} />)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">PRICE</p>
                  <Pill label="Free Only" active={filterFree} onClick={() => setFilterFree(!filterFree)} />
                </div>
              </div>
              {activeCount > 0 && (
                <button onClick={clearAll} className="mt-4 text-red-500 text-xs font-semibold flex items-center gap-1">
                  <X size={11} /> Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE FILTER CHIPS ── */}
        {activeCount > 0 && !showFilters && (
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {filterDuration !== "All" && <Chip label={filterDuration} onRemove={() => setFilterDuration("All")} />}
            {filterPackage !== "All" && <Chip label={filterPackage} onRemove={() => setFilterPackage("All")} />}
            {filterFree && <Chip label="Free Only" onRemove={() => setFilterFree(false)} />}
            <button onClick={clearAll} className="text-xs text-gray-400 font-semibold">Clear all</button>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">No programs found</p>
              <button onClick={clearAll} className="mt-4 bg-[#6C3AE8] text-white px-5 py-2 rounded-lg text-sm font-bold">
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((prog) => (
                  <div
                    key={prog.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl transition"
                    onClick={() => handleViewProgram(prog)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {/* ✅ lazy loading on all card images */}
                      <img
                        src={prog.image}
                        alt={prog.title}
                        loading="lazy"
                        decoding="async"
                        className="card-img w-full h-full object-cover object-top"
                      />
                      {prog.free_is_program ? (
                        <div className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 overflow-hidden">
                          <img
                            src="https://proformapp-storage.s3.eu-north-1.amazonaws.com/Sections+Images/1f513.png"
                            alt="Unlock"
                            loading="lazy"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                      ) : (
                        <>
                          {prog.paid_plan && prog.paid_plan !== null && (
                            <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <img src={prog.paid_plan} alt="Plan" loading="lazy" className="w-5 h-5 object-contain" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            <img
                              src="https://proformapp-storage.s3.eu-north-1.amazonaws.com/Sections+Images/dollar.png"
                              alt="Dollar"
                              loading="lazy"
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {prog.duration}
                      </div>
                      {prog.package && prog.package !== "" && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/package/${prog.package_id || prog.package}`);
                          }}
                          className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-black/80 transition"
                        >
                          <Tag size={10} />
                          {prog.package}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-gray-900 mb-2 line-clamp-1">{prog.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{prog.description || "No description available"}</p>
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} className="text-blue-500" />
                          <p className="text-xs font-bold">{prog.views?.toLocaleString() || 0}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={14} className="text-green-500" />
                          <p className="text-xs font-bold">{prog.bought?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── INFINITE SCROLL SENTINEL ── */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-8 py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-3">
                {paginated.map((prog) => (
                  <div
                    key={prog.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition flex flex-col sm:flex-row"
                    onClick={() => handleViewProgram(prog)}
                  >
                    <div className="relative w-full sm:w-48 h-32 overflow-hidden shrink-0">
                      {/* ✅ lazy loading on list images */}
                      <img
                        src={prog.image}
                        alt={prog.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                      />
                      {prog.free_is_program ? (
                        <div className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                          <img
                            src="https://proformapp-storage.s3.eu-north-1.amazonaws.com/Sections+Images/1f513.png"
                            alt="Unlock"
                            loading="lazy"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                      ) : (
                        <>
                          {prog.paid_plan && prog.paid_plan !== null && (
                            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <img src={prog.paid_plan} alt="Plan" loading="lazy" className="w-4 h-4 object-contain" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            <img
                              src="https://proformapp-storage.s3.eu-north-1.amazonaws.com/Sections+Images/dollar.png"
                              alt="Dollar"
                              loading="lazy"
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {prog.duration}
                      </div>
                      {prog.package && prog.package !== "" && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Tag size={10} />
                          {prog.package}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-extrabold text-gray-900 mb-2">{prog.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{prog.description || "No description available"}</p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye size={12} className="text-blue-500" />
                            <span className="text-xs font-bold">{prog.views?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-gray-400">views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag size={12} className="text-green-500" />
                            <span className="text-xs font-bold">{prog.bought?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-gray-400">enrolled</span>
                          </div>
                        </div>
                        <button className="bg-[#6C3AE8] text-white px-4 py-1.5 rounded-lg text-xs font-bold">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── INFINITE SCROLL SENTINEL (list view) ── */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-8 py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}