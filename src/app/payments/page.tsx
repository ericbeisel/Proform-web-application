"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Coins,
  Dumbbell,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { getPurchases, Purchase } from "@/api/payments/route";
import { getPointsTotal } from "@/api/points/route";

interface PurchaseItem {
  id: string;
  title: string;
  creator: string;
  price: string;
  duration: string;
  purchaseDate: string;
  status: "Active" | "Expired";
  dateDetail: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Expired">("Expired");
  const [isWorkoutCollapsed, setIsWorkoutCollapsed] = useState(false);
  const [rawPurchases, setRawPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPointsTotal()
      .then((pts) => {
        if (!cancelled) setTotalPoints(pts);
      })
      .catch(() => {
        if (!cancelled) setTotalPoints(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPurchases()
      .then((data) => {
        console.log("[Payments] getPurchases resolved", data);
        if (!cancelled) setRawPurchases(data);
      })
      .catch((error) => {
        console.error("[Payments] getPurchases failed", error);
        if (!cancelled) setRawPurchases([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const purchases: PurchaseItem[] = rawPurchases.map((item) => {
    const isExpired = new Date(item.expiresAt) <= new Date();
    const status = isExpired ? ("Expired" as const) : ("Active" as const);

    console.log("[Payments] purchase expiration check", {
      id: item.id,
      expiresAt: item.expiresAt,
      expiresAtParsed: new Date(item.expiresAt),
      now: new Date(),
      isExpired,
      status,
    });

    const purchaseDate = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const expiryDate = new Date(item.expiresAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    return {
      id: item.id,
      title: (item.workoutTitle as string) || "Premium Workout",
      creator: (item.creatorName as string) || "Alpha Pump",
      price: `$${item.amount ?? 0}`,
      duration: (item.duration as string) || "24-hr access",
      purchaseDate,
      status,
      dateDetail: isExpired ? `Expired ${expiryDate}` : `Access until ${expiryDate}`,
    };
  });

  const activeCount = rawPurchases.filter(
    (p) => p.status === "succeeded" && new Date(p.expiresAt) > new Date(),
  ).length;

  const totalSpent = rawPurchases
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const filteredPurchases = purchases.filter((item) => {
    if (activeTab === "All") return true;
    return item.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Purple gradient header */}
      <div
        className="relative overflow-hidden rounded-b-[24px] shadow-lg shadow-purple-900/10"
        style={{ background: "linear-gradient(135deg, #8A49F7 0%, #6202AC 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-[110px] h-[110px] rounded-full bg-white/[0.08]" />
        <div className="absolute -bottom-12 right-4 w-[140px] h-[140px] rounded-full bg-white/[0.05]" />

        <div className="relative px-5 pt-4 pb-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/account")}
              className="w-9 h-9 rounded-full bg-white/[0.18] flex items-center justify-center hover:bg-white/25 transition"
              aria-label="Back"
            >
              <ChevronLeft size={20} className="text-white" strokeWidth={2} />
            </button>

            <div className="flex-1 ml-3">
              <h1 className="text-lg font-bold text-white leading-tight">Payments</h1>
              <p className="text-[12px] text-white/70">All purchases</p>
            </div>

            <button
              onClick={() => router.push("/points")}
              className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-2.5 h-9 hover:bg-white/20 transition mr-2.5"
              aria-label="View points"
            >
              <Coins size={16} className="text-amber-300" />
              <span className="text-[12px] font-semibold text-white">
                {totalPoints === null ? "—" : totalPoints}
              </span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <CreditCard size={18} className="text-white" strokeWidth={1.8} />
            </div>
          </div>

          <div className="flex bg-white/10 border border-white/[0.15] rounded-2xl px-4 py-3 mx-0.5">
            <div className="flex-1">
              <p className="text-[11px] text-white/65 font-medium">Active purchases</p>
              <p className="text-2xl font-bold text-white my-0.5">{activeCount}</p>
              <p className="text-[10px] text-white/55">subscriptions &amp; purchases</p>
            </div>
            <div className="w-px bg-white/20 mx-4" />
            <div className="flex-1 text-right">
              <p className="text-[11px] text-white/65 font-medium">Total spent</p>
              <p className="text-2xl font-bold text-white my-0.5">${totalSpent.toFixed(0)}</p>
              <p className="text-[10px] text-white/55">all time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 pt-5 pb-10 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex bg-[#F1F1F5] rounded-xl p-1 mb-5">
          {(["All", "Active", "Expired"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isSelected ? "bg-white text-[#6202AC] shadow-sm" : "text-[#8E8E93] hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#6202AC]" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
            <button
              onClick={() => setIsWorkoutCollapsed((prev) => !prev)}
              className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-gray-50/60 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-teal-50 flex items-center justify-center">
                  <Dumbbell size={18} className="text-teal-600" strokeWidth={2} />
                </div>
                <span className="text-[15px] font-bold text-gray-800">Workout Purchases</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-violet-50 text-[#6202AC] text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredPurchases.length}
                </span>
                {isWorkoutCollapsed ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>
            </button>

            {!isWorkoutCollapsed && (
              <div className="border-t border-gray-100">
                {filteredPurchases.map((item, index) => {
                  const isItemActive = item.status === "Active";
                  return (
                    <div key={item.id} className="px-4">
                      {index > 0 && <div className="h-px bg-gray-100" />}
                      <div className="flex items-start gap-3.5 py-4 hover:bg-gray-50/40 -mx-4 px-4 rounded-lg transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Dumbbell size={16} className="text-white" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-snug mb-1">{item.title}</p>
                          <p className="text-[13px] font-semibold text-violet-500 mb-1">{item.creator}</p>
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span className="text-[15px] font-bold text-[#6202AC]">{item.price}</span>
                            <span className="text-gray-400">·</span>
                            <span className="text-[13px] text-gray-500">{item.duration}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                            <Calendar size={13} className="text-gray-400 mr-0.5" />
                            <span className="text-[11px] font-medium text-gray-500 mr-2.5">
                              Purchased {item.purchaseDate}
                            </span>
                            <Clock size={13} className={isItemActive ? "text-emerald-500" : "text-gray-400"} />
                            <span
                              className={`text-[11px] font-medium ${
                                isItemActive ? "text-emerald-500" : "text-gray-500"
                              }`}
                            >
                              {item.dateDetail}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border shrink-0 ${
                            isItemActive
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          {isItemActive ? (
                            <CheckCircle size={12} className="text-emerald-500" />
                          ) : (
                            <XCircle size={12} className="text-gray-500" />
                          )}
                          <span
                            className={`text-[11px] font-semibold ${
                              isItemActive ? "text-emerald-500" : "text-gray-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPurchases.length === 0 && (
                  <div className="py-12 text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <CreditCard size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">No purchases found for this tab.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
