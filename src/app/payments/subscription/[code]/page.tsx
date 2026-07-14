"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Atom,
  Crown,
  Star,
  Sparkles,
  TrendingUp,
  Dumbbell,
  Globe,
  Zap,
  PlayCircle,
  Users,
  ShieldCheck,
  Lock,
  Check,
  ChevronRight,
  Eye,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { getAllPrograms, Program } from "@/api/programs/route";

// Dummy data — swapped for a real API call later (per-franchise plan/pricing endpoint).
const subscriptionData: Record<string, any> = {
  OPM: {
    name: "Optimal Performance Methods",
    tagline: "Optimal training designed by experts",
    description:
      "Access to all of the OPM programs, field workouts, supplemental workouts and courses designed by expert coaches and used by the pros. The definitive performance training franchise for elite development.",
    tierBadge: "Franchise Tier",
    stats: [
      { label: "Total Programs", value: "160", color: "text-purple-400", mobileColor: "text-purple-600" },
      { label: "Combined Workouts", value: "13", color: "text-orange-400", mobileColor: "text-orange-600" },
      { label: "Workouts Created This Year", value: "0", color: "text-emerald-400", mobileColor: "text-emerald-600" },
      { label: "Total Subscribers", value: "1321", color: "text-blue-400", mobileColor: "text-blue-600" },
    ],
    features: [
      { icon: Dumbbell, title: "All OPM Programs", description: "Unlimited access to every training program in the library" },
      { icon: Globe, title: "Field Workouts", description: "Sport-specific outdoor and field session plans" },
      { icon: Zap, title: "Supplemental Workouts", description: "Mobility, prehab, and performance extra content" },
      { icon: PlayCircle, title: "Expert-Built Courses", description: "Designed and actively used by professional coaches" },
      { icon: Users, title: "All Teams Included", description: "Manage unlimited teams under one franchise plan" },
      { icon: ShieldCheck, title: "Priority Support", description: "Direct line to coaching staff and the development team" },
    ],
    plan: {
      period: "Monthly",
      periodDetail: "Flexible, cancel anytime",
      price: 29,
      programsIncluded: "All 160",
      subscribers: "1,321",
    },
  },
};

const PROGRAMS_PREVIEW_LIMIT = 9;

const FranchiseBadge = ({ tierBadge, dark = false }: { tierBadge: string; dark?: boolean }) => (
  <span
    className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${
      dark
        ? "bg-amber-500/10 border border-amber-500/40 text-amber-400"
        : "bg-amber-50 border border-amber-200 text-amber-700"
    }`}
  >
    <Crown size={13} />
    {tierBadge}
    <Star size={11} className="fill-amber-500 text-amber-500" />
  </span>
);

const FeatureList = ({ features }: { features: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {features.map((feature: any, idx: number) => {
      const Icon = feature.icon;
      return (
        <div
          key={idx}
          className="flex items-start justify-between gap-3 rounded-2xl border border-gray-100 p-4"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EFE6F9" }}
            >
              <Icon size={18} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm">{feature.title}</p>
              <p className="text-gray-500 text-[12px] mt-0.5 leading-snug">{feature.description}</p>
            </div>
          </div>
          <Check size={17} className="text-emerald-500 shrink-0 mt-1" />
        </div>
      );
    })}
  </div>
);

export default function SubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string || "").toUpperCase();
  const data = subscriptionData[code] || subscriptionData["OPM"];

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setProgramsLoading(true);
    getAllPrograms()
      .then((all) => {
        if (cancelled) return;
        const franchisePrograms = all.filter((p) => (p.package || "").toUpperCase() === code);
        setPrograms(franchisePrograms);
      })
      .catch(() => {
        if (!cancelled) setPrograms([]);
      })
      .finally(() => {
        if (!cancelled) setProgramsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="relative min-h-screen bg-white md:bg-[#f4f4f8]">
      {/* Desktop header */}
      <div className="hidden md:flex bg-white sticky top-0 z-40 border-b border-gray-100 px-4 md:px-8 py-4 items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft size={18} className="text-purple-600" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">
              Payments &middot; Subscriptions
            </p>
            <div className="flex items-center gap-2 min-w-0">
              <Atom size={16} className="text-orange-500 shrink-0" />
              <h1 className="font-extrabold text-gray-900 text-[16px] md:text-[18px] truncate">
                {data.name}
              </h1>
            </div>
          </div>
        </div>

        <FranchiseBadge tierBadge={data.tierBadge} />
      </div>

      {/* Mobile back button — floats over the hero */}
      <button
        onClick={() => router.back()}
        className="md:hidden absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
      >
        <ArrowLeft size={18} className="text-white" />
      </button>

      {/* Content */}
      <div className="px-4 md:px-8 pt-0 md:pt-8 pb-[290px] lg:pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 lg:gap-6 items-start">
          {/* MAIN COLUMN */}
          <div className="min-w-0">
            {/* Hero card */}
            <div className="relative overflow-hidden -mx-4 md:mx-0 md:rounded-3xl px-6 pt-14 pb-16 md:p-8 bg-gradient-to-br from-[#170a26] via-[#12081f] to-[#0a0612]">
              {/* Purple glow blob */}
              <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />

              {/* Decorative orbit rings — concentric circles centered on the bottom-right corner */}
              <div className="pointer-events-none absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[220px] h-[220px] rounded-full border border-white/[0.06]" />
              <div className="pointer-events-none absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/[0.045]" />

              {/* MOBILE hero content — centered, no inline stats */}
              <div className="md:hidden relative flex flex-col items-center text-center">
                <div className="relative w-[72px] h-[72px] shrink-0 mb-5">
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-white/[0.06]" />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/[0.045]" />

                  <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
                  <div className="relative w-full h-full rounded-full bg-orange-500/5 border-2 border-orange-500/40 flex items-center justify-center">
                    <Atom size={30} className="text-orange-400" />
                  </div>
                </div>

                <h2 className="text-[28px] font-extrabold leading-[1.15] text-orange-500 mb-3">
                  {data.name}
                </h2>
                <p className="text-white font-bold text-[15px] mb-3">{data.tagline}</p>
                <p className="text-white/50 text-[13px] leading-relaxed max-w-xs mx-auto">{data.description}</p>

                <div className="mt-6">
                  <FranchiseBadge tierBadge={data.tierBadge} dark />
                </div>
              </div>

              {/* DESKTOP hero content — icon left, text right, stats inline */}
              <div className="hidden md:grid relative grid-cols-[72px_1fr] gap-x-5 gap-y-6">
                <div className="relative w-[72px] h-[72px] shrink-0">
                  {/* Decorative orbit rings — concentric circles centered on the icon */}
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-white/[0.06]" />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/[0.045]" />

                  <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
                  <div className="relative w-full h-full rounded-full bg-orange-500/5 border-2 border-orange-500/40 flex items-center justify-center">
                    <Atom size={30} className="text-orange-400" />
                  </div>
                </div>

                <div className="min-w-0 pt-1">
                  <h2 className="text-[28px] md:text-[34px] font-extrabold leading-[1.15] text-orange-500 mb-3">
                    {data.name}
                  </h2>
                  <p className="text-white font-bold text-[15px] md:text-base mb-3">{data.tagline}</p>
                  <p className="text-white/50 text-[13px] md:text-sm leading-relaxed max-w-xl">{data.description}</p>
                </div>

                <div />

                <div>
                  <div className="border-t border-white/10 mb-6" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.stats.map((stat: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <p className={`text-2xl md:text-[26px] font-extrabold ${stat.color}`}>{stat.value}</p>
                        <p className="text-white/40 text-[11px] mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE-only: stats + "What's included" — overlaps the (now square-
                cornered) hero via a rounded-top card. Since the hero itself has
                no curve on mobile, this is the only curve at the seam — no
                double-curve mismatch. */}
            <div className="md:hidden relative z-10 -mt-6 -mx-4 rounded-t-3xl shadow-lg bg-white px-6 pt-6 pb-6">
              <div className="grid grid-cols-4 gap-3">
                {data.stats.map((stat: any, idx: number) => (
                  <div key={idx} className="min-w-0 text-center">
                    <p className={`text-xl font-extrabold ${stat.mobileColor}`}>{stat.value}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5 leading-snug">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 my-5" />

              <div className="flex items-center gap-2 mb-5">
                <Zap size={18} className="text-amber-400" />
                <h3 className="font-extrabold text-gray-900 text-[17px]">What&rsquo;s included</h3>
              </div>

              <FeatureList features={data.features} />
            </div>

            {/* Everything included — desktop only */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mt-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="font-extrabold text-gray-900 text-[17px]">Everything included</h3>
              </div>

              <FeatureList features={data.features} />
            </div>

            {/* Programs in this franchise — real data from getAllPrograms(),
                filtered to this franchise's package code */}
            <div className="bg-white md:rounded-3xl md:border md:border-gray-100 md:shadow-sm -mx-4 md:mx-0 px-6 md:p-8 py-6 md:py-8 mt-0 md:mt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <Dumbbell size={18} className="text-purple-500" />
                <h3 className="font-extrabold text-gray-900 text-[17px]">
                  {data.name} Programs{!programsLoading && programs.length > 0 && (
                    <span className="text-gray-400 font-normal ml-1 text-[13px]">({programs.length})</span>
                  )}
                </h3>
              </div>

              {programsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : programs.length === 0 ? (
                <p className="text-gray-400 text-sm py-4">No programs found for this franchise yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.slice(0, PROGRAMS_PREVIEW_LIMIT).map((prog) => (
                      <div
                        key={prog.id}
                        onClick={() => router.push(`/programs/${prog.id}`)}
                        className="group bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={prog.image}
                            alt={prog.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            {prog.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{prog.title}</h4>
                          <p className="text-gray-500 text-[12px] mb-3 line-clamp-2">
                            {prog.description || "No description available"}
                          </p>
                          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Eye size={13} className="text-blue-500" />
                              <span className="text-[11px] font-bold">{(prog.times_completed ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <ShoppingBag size={13} className="text-green-500" />
                              <span className="text-[11px] font-bold">{(prog.enrolled ?? 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {programs.length > PROGRAMS_PREVIEW_LIMIT && (
                    <button
                      onClick={() => router.push("/programs/all-programs")}
                      className="w-full mt-5 text-purple-600 hover:text-purple-700 font-semibold text-sm transition flex items-center justify-center gap-1.5"
                    >
                      View All Programs <ChevronRight size={15} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* SIDEBAR — fixed to the bottom of the screen below `lg` (matches the
              single-column stacked layout), sticky-in-place at `lg`+ alongside
              the main column */}
          <div className="fixed bottom-0 inset-x-0 z-40 lg:static lg:inset-auto lg:z-auto lg:sticky lg:top-24 lg:self-start w-full">
            <div className="bg-white px-6 py-6 border-t border-gray-100 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] md:rounded-3xl md:border md:border-gray-100 md:shadow-sm md:mx-0">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-gray-900 text-[16px]">Here&rsquo;s your plan</h3>
              </div>
              <p className="hidden md:block text-gray-500 text-[12px] mb-4">
                Franchise access. Elite performance. No compromises.
              </p>

              {/* Plan option */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between text-white mb-4 mt-4 md:mt-0"
                style={{ background: "linear-gradient(to right, #F49C0A, #D77B02)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[14px] leading-tight">{data.plan.period}</p>
                      <span className="md:hidden bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px]">{data.plan.periodDetail}</p>
                  </div>
                </div>
                <p className="text-[30px] font-bold shrink-0">
                  ${data.plan.price}<span className="text-[14px] font-medium">/mo</span>
                </p>
              </div>

              {/* Summary rows — desktop only */}
              <div className="hidden md:block space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Annual plan</span>
                  <span className="font-bold text-gray-900">${data.plan.price}/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Programs included</span>
                  <span className="font-bold text-emerald-600">{data.plan.programsIncluded}</span>
                </div>
                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-100">
                  <span className="font-semibold text-gray-900 text-[14px]">Total today</span>
                  <span className="font-bold text-purple-600 text-[15px]">${data.plan.price}/mo</span>
                </div>
              </div>

              {/* Subscribe button */}
              <button
                onClick={() => {
                  // Wired up to the real checkout/payment API later.
                }}
                className="w-full mt-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl text-[14px] transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Crown size={16} />
                Subscribe &mdash; ${data.plan.price}/mo
                <ChevronRight size={16} />
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-3 leading-relaxed">
                Cancel anytime. No hidden fees. Renews automatically until cancelled.
              </p>

              <div className="hidden md:flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Lock size={12} />
                  Secure payment
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  {data.plan.subscribers} subscribers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
