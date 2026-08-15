"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    // Only track in production or if you want to track dev too
    // For now we'll just track every load
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics', { method: 'POST' });
      } catch (e) {
        console.error("Failed to track visit", e);
      }
    };

    trackVisit();
  }, []);

  return null; // This component doesn't render anything
}
