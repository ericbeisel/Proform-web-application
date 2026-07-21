"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { createPaymentIntent, getPurchases } from "@/api/payments/route";
import { getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";

const POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Plain (non-component, non-hook) helper — the timing calls inside it are
// exempt from React's render-purity check, unlike calling Date.now() directly
// in a component/hook body.
function msSince(start: number | null): string {
  return start === null ? "?ms" : `${Date.now() - start}ms`;
}

function markNow(): number {
  return Date.now();
}

interface PurchaseCheckoutProps {
  workoutId: string;
  workoutTitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CheckoutFormProps extends PurchaseCheckoutProps {
  elapsed: () => string;
}

export default function PurchaseCheckout({
  workoutId,
  workoutTitle,
  onSuccess,
  onCancel,
}: PurchaseCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const mountedAt = useRef<number | null>(null);
  const elapsed = () => msSince(mountedAt.current);
  // Diagnostic only — useId() is stable per component instance, so if two
  // log lines share the same instanceId, one instance's effect ran twice
  // (StrictMode-style); if the ids differ, two separate instances mounted.
  const instanceId = useId();

  // Kicks off loading Stripe.js's script immediately on mount, in parallel
  // with the createPaymentIntent request below — previously this only
  // happened inside the <Elements> JSX, which doesn't render until the
  // intent request resolves, so the two loads ran back-to-back instead of
  // side by side.
  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    console.log(`[PurchaseCheckout:${instanceId}] loading Stripe.js...`);
    stripePromise.then((stripe) => {
      console.log(`[PurchaseCheckout:${instanceId}] Stripe.js loaded @ ${elapsed()}`, { ok: !!stripe });
    });
  }, [stripePromise, instanceId]);

  useEffect(() => {
    let cancelled = false;
    mountedAt.current = markNow();
    console.log(`[PurchaseCheckout:${instanceId}] mounted — creating payment intent for workoutId: ${workoutId}`);
    createPaymentIntent(workoutId)
      .then((res) => {
        console.log(`[PurchaseCheckout:${instanceId}] payment intent created @ ${elapsed()}`, {
          paymentIntentId: res.paymentIntentId,
          clientSecret: res.clientSecret?.slice(0, 12) + "...",
        });
        if (!cancelled) setClientSecret(res.clientSecret);
      })
      .catch((err: Error) => {
        console.error(`[PurchaseCheckout:${instanceId}] createPaymentIntent failed @ ${elapsed()}:`, err.message);
        if (!cancelled) setIntentError(err.message);
      });
    return () => {
      cancelled = true;
      console.log(`[PurchaseCheckout:${instanceId}] unmounted/cleanup @ ${elapsed()}`);
    };
  }, [workoutId, instanceId]);

  if (intentError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-[13px] font-semibold mb-4">{intentError}</p>
        <button
          onClick={onCancel}
          className="text-gray-500 text-[13px] font-bold hover:text-gray-700 transition"
        >
          Close
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={26} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe", variables: { colorPrimary: "#7c3aed" } },
      }}
    >
      <CheckoutForm
        workoutId={workoutId}
        workoutTitle={workoutTitle}
        onSuccess={onSuccess}
        onCancel={onCancel}
        elapsed={elapsed}
      />
    </Elements>
  );
}

function CheckoutForm({
  workoutId,
  workoutTitle,
  onSuccess,
  onCancel,
  elapsed,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setPaymentError(null);

    console.log("[PurchaseCheckout] confirming payment...");
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      console.error("[PurchaseCheckout] confirmPayment error:", error.type, error.message);
      // Only a genuine decline/processing failure (card_error) sends the
      // user to the dedicated /failure page — validation errors (e.g.
      // incomplete card fields) just need fixing inline, not a full-page
      // redirect away from the form they're still editing.
      if (error.type === "card_error") {
        setSubmitting(false);
        router.push("/failure");
        return;
      }
      setPaymentError(error.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    console.log("[PurchaseCheckout] confirmPayment succeeded:", {
      id: paymentIntent?.id,
      status: paymentIntent?.status,
    });

    setPolling(true);
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      try {
        const purchases = await getPurchases("active");
        const matched = purchases.some(
          (p) =>
            p.workoutId === workoutId ||
            (workoutTitle && p.workoutTitle && p.workoutTitle.toLowerCase() === workoutTitle.toLowerCase()),
        );
        console.log(
          `[PurchaseCheckout] poll attempt ${i + 1}/${POLL_ATTEMPTS} — ${purchases.length} active purchase(s), matched:`,
          matched,
        );
        if (matched) {
          setPolling(false);
          console.log("[PurchaseCheckout] purchase confirmed — unlocking workout");
          alert("Workout unlocked successfully for 24 hours!");
          onSuccess();
          return;
        }
      } catch (err) {
        console.warn("[PurchaseCheckout] getPurchases poll failed, retrying:", err);
      }
      await sleep(POLL_INTERVAL_MS);
    }
    setPolling(false);
    setSubmitting(false);
    console.warn("[PurchaseCheckout] gave up polling after", POLL_ATTEMPTS, "attempts — purchase not yet confirmed");
    alert("Your payment is being processed. It should unlock in a few moments.");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        onReady={() => console.log(`[PurchaseCheckout] PaymentElement ready (form fully rendered) @ ${elapsed()}`)}
        onLoadError={(e) => console.error(`[PurchaseCheckout] PaymentElement load error @ ${elapsed()}:`, e.error.message)}
        options={{
          // Without this, "Card" renders as a collapsed accordion row that
          // requires an explicit click to expand — otherwise the only way
          // users find the card fields is by hitting "Pay Now" and letting
          // Stripe's validation force it open.
          layout: { type: "accordion", defaultCollapsed: false },
          defaultValues: {
            billingDetails: {
              name: (getAuthUser()?.name as string) || undefined,
              email: getTokenPayload()?.email || undefined,
            },
          },
        }}
      />

      {paymentError && (
        <p className="text-red-500 text-[12px] font-semibold mt-3">{paymentError}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full mt-5 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 disabled:opacity-60 text-white font-black text-[13px] px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
      >
        {submitting || polling ? <Loader2 size={15} className="animate-spin" /> : null}
        {polling ? "Confirming..." : submitting ? "Processing..." : "Pay Now"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="w-full mt-2 text-gray-400 text-[12px] font-bold hover:text-gray-600 transition disabled:opacity-60"
      >
        Cancel
      </button>
    </form>
  );
}
