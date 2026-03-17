// components/ScrollRestoration.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollRestoration() {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);
  useEffect(() => {
    // Get stored position for current page
    const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);

    if (savedPosition) {
      // Restore position
      window.scrollTo(0, parseInt(savedPosition));
    }

    // Save position when leaving page
    const savePosition = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
    };

    window.addEventListener("beforeunload", savePosition);

    return () => {
      window.removeEventListener("beforeunload", savePosition);
      savePosition(); // Save when navigating away
    };
  }, [pathname]);

  return null;
}
