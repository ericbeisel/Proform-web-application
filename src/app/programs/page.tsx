"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  Star,
  Home,
  Dumbbell,
  Heart,
  Zap,
  Target,
  Activity,
  TrendingUp,
  Globe,
  Flame,
  Circle,
  Users,
  ArrowRight,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getWorkoutPageData,
  Program,
  SportCategory,
  FeaturedTrainer,
  AgeGroup,
  SettingCategory,
  Organization,
  ProgramFocus,
  FeaturedFranchise,
} from "@/api/programs/route";
import proformLogo from "../images/proform-logo.jpg"; // Adjust the ../ path based on your file structure

const PURPLE = "#6C3AE8";
const ORANGE = "#F97316";
const GREEN = "#10B981";
const BLUE = "#3B82F6";

// Helper function to fix image URLs
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/images/placeholder.jpg";

  // Parse wix:image://v1/{mediaId}/{filename}#originWidth=...&originHeight=...
  if (imageUrl.startsWith("wix:image://v1/")) {
    const match = imageUrl.match(/wix:image:\/\/v1\/([^/]+)/);
    if (match?.[1]) {
      return `/api/image-proxy/media/${match[1]}`;
    }
  }

  // Bare Wix media ID
  if (imageUrl.match(/^[a-f0-9_]+~mv2/i)) {
    return `/api/image-proxy/media/${imageUrl}`;
  }

  // Already a full Wix URL
  if (imageUrl.includes("static.wixstatic.com/media/")) {
    const path = imageUrl.replace("https://static.wixstatic.com/", "");
    return `/api/image-proxy/${path}`;
  }

  return imageUrl;
}

// ── Helper Components ──
function SectionHeader({
  title,
  showSeeAll = false,
  onSeeAll,
}: {
  title: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-3 md:mb-4">
      <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
      {showSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-xs md:text-sm font-semibold"
          style={{ color: PURPLE }}
        >
          See all <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Star size={12} fill="currentColor" /> {rating}
    </span>
  );
}

function ProgramCard({
  program,
  isFree = false,
  onClick,
}: {
  program: Program;
  isFree?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-square group cursor-pointer"
    >
      <img
        src={getImageUrl(program.image)}
        alt={program.title}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
        }}
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
      {isFree && (
        <span className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full inline-block" />
          FREE
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-xs md:text-sm font-bold truncate">
          {program.title}
        </p>
        <p className="text-white/80 text-[10px] md:text-xs">
          {program.duration}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function SearchWorkoutsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    featuredPrograms: Program | null;
    popularPrograms: Program[];
    freePrograms: Program[];
    suggestedPrograms: Program[];
    organizations: Organization[];
    sportCategories: SportCategory[];
    programFocus: ProgramFocus[];
    featuredTrainers: FeaturedTrainer[];
    ageGroups: AgeGroup[];
    settingCategories: SettingCategory[];
    featuredFranchise: FeaturedFranchise | null;
  }>({
    featuredPrograms: null,
    popularPrograms: [],
    freePrograms: [],
    suggestedPrograms: [],
    organizations: [],
    sportCategories: [],
    programFocus: [],
    featuredTrainers: [],
    ageGroups: [],
    settingCategories: [],
    featuredFranchise: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getWorkoutPageData();
        setData({
          featuredPrograms: response.featuredPrograms,
          popularPrograms: response.popularPrograms,
          freePrograms: response.freePrograms,
          suggestedPrograms: response.suggestedPrograms,
          organizations: response.organizations,
          sportCategories: response.sportCategories,
          programFocus: response.programFocus || [],
          featuredTrainers: response.featuredTrainers,
          ageGroups: response.ageGroups,
          settingCategories: response.settingCategories,
          featuredFranchise: response.featuredFranchise || null,
        });
      } catch (err) {
        console.error("Error fetching workout page data:", err);
        setError("Failed to load workout data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading workouts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Nav Bar ── */}
      {/* <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
  <div className="max-w-screen-xl mx-auto flex items-center justify-between">
    <h1 className="text-lg md:text-xl font-bold text-gray-900">Search Workouts</h1>
    
    <div className="flex items-center gap-2 md:gap-4 text-gray-600">
      <button className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Search"  onClick={() => router.push('/programs/all-programs')}>
        <Search size={20} />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition text-yellow-500" aria-label="Quick Actions">
        <Zap size={20} fill="currentColor" />
      </button>
<button 
  className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center shrink-0" 
  aria-label="Dashboard"  
  onClick={() => router.push('/dashboard')}
>
  <img 
    src="/images/proform-logo.jpg" 
    alt="Proform Logo" 
    className="w-5 h-5 md:w-6 md:h-6 object-contain" 
  />
</button>
    </div>
  </div>
</header> */}

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
        {/* Added 'relative' here so the logo can center itself against this container */}
        <div className="max-w-screen-xl mx-auto flex items-center justify-between relative">
          {/* 1. Title on the far left */}
          <h1 className="text-lg md:text-xl font-bold text-gray-900 z-10">
            Search Workouts
          </h1>

          {/* 2. Logo in the absolute middle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center shrink-0"
              aria-label="Dashboard"
              onClick={() => router.push("/dashboard")}
            >
              <img
                src="/images/proform-logo.jpg"
                alt="Proform Logo"
                className="w-7 h-7 md:w-9 md:h-9 object-contain"
              />
            </button>
          </div>

          {/* 3. Icons on the far right */}
          <div className="flex items-center gap-2 md:gap-4 text-gray-600 z-10">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Search"
              onClick={() => router.push("/programs/all-programs")}
            >
              <Search size={20} />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition text-yellow-500"
              aria-label="Quick Actions"
              onClick={() => router.push("/programs/plans-pricing")}
            >
              <Zap size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-screen-xl mx-auto w-full space-y-8 md:space-y-10">
        {/* ── 1. Featured Program Banner ── */}
        {data.featuredPrograms && (
          <div
            className="relative rounded-2xl md:rounded-3xl overflow-hidden h-40 md:h-56 w-full cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
            }}
            onClick={() =>
              router.push(`/programs/${data.featuredPrograms?.id}`)
            }
          >
            <img
              src={getImageUrl(data.featuredPrograms.image)}
              alt={data.featuredPrograms.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-end">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Star size={16} fill="#FBBF24" className="text-amber-400" />
                  <span className="text-white font-bold text-base md:text-xl">
                    Featured Workouts
                  </span>
                </div>
                {/* <button
                  onClick={() => router.push('/programs/all-programs')}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1 hover:bg-white/30 transition w-fit"
                >
                  View All Programs <ArrowRight size={14} />
                </button> */}
              </div>
              <p className="text-white text-lg md:text-2xl font-bold mt-1">
                {data.featuredPrograms.title}
              </p>
              <p className="text-gray-300 text-xs md:text-sm">
                {data.featuredPrograms.duration}
              </p>
              <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                {data.featuredPrograms.description}
              </p>
            </div>
          </div>
        )}

        {/* ── 2. Scheduled & Franchise Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
  {/* Scheduled with plan */}
  <div className="flex flex-col">
    <p className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">
      Scheduled with plan
    </p>
    <div
      className="relative rounded-xl md:rounded-2xl overflow-hidden flex-1 h-full flex flex-col justify-end p-4 md:p-5 cursor-pointer"
      style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)" }}
    >
      <img
        src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80"
        alt="Plan"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="relative z-10">
        <div className="flex items-center gap-1 md:gap-2 mb-1">
          <Activity size={12} className="text-blue-300" />
          <span className="text-white text-xs md:text-sm font-bold">
            Your Personalized Plan
          </span>
        </div>
        <p className="text-blue-200 text-[10px] md:text-xs">
          Follow your customized schedule
        </p>
      </div>
    </div>
  </div>

  {/* By Franchise - All Organizations */}
  <div className="flex flex-col">
    <p className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">
      By Franchise
    </p>
    <div
      className="relative rounded-xl md:rounded-2xl overflow-hidden flex-1 h-full flex flex-col justify-end p-4 md:p-5"
      style={{ background: "linear-gradient(135deg,#1a1a2e,#374151)" }}
    >
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
        alt="Franchise"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="relative z-10">
        <div className="flex items-center gap-1 md:gap-2 mb-1">
          <Dumbbell size={12} className="text-gray-300" />
          <span className="text-white text-xs md:text-sm font-bold">
            Explore Franchises
          </span>
        </div>
        <p className="text-gray-400 text-[10px] md:text-xs mb-3">
          Exclusive partner gyms & studios
        </p>
        <div className="grid grid-cols-2 gap-2">
          {data.organizations.map((org) => (
            <div
              key={org.id}
              onClick={() =>
                router.push(`/programs/franchise/${org.id}`)
              }
              className="text-[10px] md:text-xs text-white bg-white/10 px-2 py-1 rounded-md hover:bg-white/20 transition cursor-pointer"
            >
              {org.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

        {/* ── 3. By Sport (All Sport Categories) ── */}
        <div>
          <SectionHeader
            title="By Sport"
            showSeeAll
            onSeeAll={() => router.push("/programs/all-sports")}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
            {/* Use .slice(0, 8) to limit the display to the first 8 items */}
            {data.sportCategories.slice(0, 8).map((sport) => (
              <button
                key={sport.id}
                // onClick={() => router.push(`/programs/sport/${sport.slug}`)}
                className="flex flex-col items-center gap-2 md:gap-3 py-3 md:py-5 px-2 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm"
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                  style={{ background: PURPLE }}
                >
                  {sport.image ? (
                    <img
                      src={getImageUrl(sport.image)}
                      alt={sport.title}
                      className="w-6 h-6 md:w-7 md:h-7 object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Activity size={18} className="text-white" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-gray-700 font-medium text-center line-clamp-2">
                  {sport.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Most Popular + Featured Trainers ── */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Most Popular - Square cards with image as background */}
  <div>
    <SectionHeader
      title="Most Popular"
      showSeeAll
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {data.popularPrograms.slice(0, 3).map((program) => {
        const imageUrl = getImageUrl(program.image);
        return (
          <div
            key={program.id}
            onClick={() => router.push(`/programs/${program.id}`)}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
          >
            <img
              src={imageUrl}
              alt={program.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="font-bold text-sm md:text-base line-clamp-1">
                {program.title}
              </p>
              <p className="text-xs text-white/90">
                Week {program.duration || '1'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Featured Trainers - Same square cards as Most Popular */}
  <div>
    <SectionHeader
      title="Featured Trainers"
      showSeeAll
      onSeeAll={() => router.push("/programs/all-trainers")}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {data.featuredTrainers.slice(0, 3).map((trainer) => {
        const trainerImage = getImageUrl(trainer.image);
        return (
          <div
            key={trainer.id}
            onClick={() => router.push(`/trainers/${trainer.slug}`)}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
          >
            <img
              src={trainerImage}
              alt={trainer.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="font-bold text-sm md:text-base line-clamp-1">
                {trainer.title}
              </p>
              <p className="text-xs text-white/90">
                {trainer.description || 'Trainer'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>
        {/* ── 5. Free Programs (All) ── */}
        <div>
          <SectionHeader
            title="Free Programs"
            showSeeAll
            // onSeeAll={() => router.push('/programs/free')}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {data.freePrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                isFree
                // onClick={() => router.push(`/programs/${program.id}`)}
              />
            ))}
          </div>
        </div>

        {/* ── 6. Suggested Programs (NEW from API) ── */}
        <div>
          <SectionHeader
            title="Suggested for You"
            showSeeAll
            // onSeeAll={() => router.push('/programs/suggested')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {data.suggestedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                //  onClick={() => router.push(`/programs/${program.id}`)}
              />
            ))}
          </div>
        </div>

        {/* ── 7. By Focus (Using Sport Categories as Focus) ── */}
        {/* ── By Focus (Using programFocus from API) ── */}
        <div>
          <SectionHeader title="By Focus" showSeeAll />

          {/* Changed grid to flex and added overflow-x-auto for smaller screens if needed */}
          <div className="flex flex-nowrap items-stretch gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {data.programFocus.slice(0, 7).map((focus) => (
              <button
                key={focus.id}
                // flex-1 allows them to shrink/grow equally to fit the line
                // min-w-0 prevents flex items from overflowing their container
                className="flex-1 min-w-[80px] md:min-w-[100px] flex flex-col items-center gap-2 md:gap-3 py-3 md:py-5 px-1 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-purple-100 shrink-0">
                  {focus.icon ? (
                    <img
                      src={focus.icon}
                      alt={focus.title}
                      className="w-6 h-6 md:w-7 md:h-7 object-contain"
                    />
                  ) : (
                    <Target size={18} className="text-purple-600" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-gray-700 font-medium text-center line-clamp-1">
                  {focus.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 8. Additional Franchise + By Age ── */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Additional Franchise Spotlight - Reduced Height */}
  {data.featuredFranchise && (
    <div>
      <SectionHeader title="Featured Franchise" />
      <div
        className="relative rounded-xl md:rounded-2xl overflow-hidden h-32 md:h-40 flex items-end p-4 md:p-5 cursor-pointer"
        style={{ background: "linear-gradient(135deg,#111,#2d2d2d)" }}
        onClick={() =>
          router.push(
            `/programs/franchise/${data.featuredFranchise?.franchise_id}`,
          )
        }
      >
        <img
          src={
            data.featuredFranchise.cover_photo
              ?.replace(
                "wix:image://v1/",
                "https://static.wixstatic.com/media/",
              )
              .split("#")[0]
          }
          alt={data.featuredFranchise.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80";
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-1 md:gap-2 mb-1">
            <span className="text-amber-400 text-sm">🏆</span>
            <span className="text-white text-base md:text-lg font-bold">
              {data.featuredFranchise.abbreviation}
            </span>
          </div>
          <p className="text-white text-sm font-semibold">
            {data.featuredFranchise.title}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {data.featuredFranchise.upgrade_lightbox}
          </p>
        </div>
      </div>
    </div>
  )}

  {/* By Age - Same height as Featured Franchise */}
  <div>
    <SectionHeader
      title="By Age"
      showSeeAll
      // onSeeAll={() => router.push('/programs/by-age')}
    />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 h-32 md:h-40">
      {data.ageGroups.map((age) => (
        <button
          key={age.id}
          // onClick={() => router.push(`/programs/age/${age.slug}`)}
          className="flex flex-col items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm h-full"
        >
          <img
            src={getImageUrl(age.icon)}
            alt={age.title}
            className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(age.title) +
                "&background=6C3AE8&color=fff";
            }}
          />
          <span className="text-xs md:text-sm font-semibold text-gray-700 text-center">
            {age.title}
          </span>
        </button>
      ))}
    </div>
  </div>
</div>

        {/* ── 9. By Setting (All Setting Categories with Icons) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* ── By Setting ── */}
  <div>
    <SectionHeader
      title="By Setting"
      showSeeAll
      // onSeeAll={() => router.push('/programs/setting')}
    />
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {data.settingCategories.map((setting) => (
        <button
          key={setting.id}
          className="flex flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition shadow-sm"
        >
          <img
            src={getImageUrl(setting.icon)}
            alt={setting.title}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(setting.title.substring(0, 2)) +
                "&background=6C3AE8&color=fff";
            }}
          />
          <span className="text-xs md:text-sm font-semibold text-gray-700 text-center">
            {setting.title}
          </span>
        </button>
      ))}
    </div>
  </div>

  {/* ── By Movement / Exercise Search ── */}
  <div>
    <SectionHeader title="By Movement" />
    <button
      className="relative w-full rounded-2xl md:rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 py-10 md:py-1 text-white hover:opacity-95 transition overflow-hidden group h-[270px] min-h-[200px]"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: "url('https://proformapp-storage.s3.eu-north-1.amazonaws.com/Sections+Images/movement.png')",
        }}
      />
      
      {/* Overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(108,58,234,0.65) 0%, rgba(139,92,246,0.65) 100%)",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 md:gap-3">
        <Search size={28} className="opacity-95" />
        <span className="font-bold text-lg md:text-xl">
          Exercise Search
        </span>
        <span className="text-purple-100 text-xs md:text-sm">
          Find a workout with a specific movement
        </span>
      </div>
    </button>
  </div>
</div>
      </main>

      <style jsx global>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
