"use client";

import { useEffect } from "react";

// Har bir mehmon kuniga 1 marta sanaladi (sessionStorage + localStorage orqali)
export function VisitTracker() {
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const key = `ayub-visit-${today}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        // Eski kunlar belgilarini tozalash
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("ayub-visit-") && k !== key) {
            localStorage.removeItem(k);
          }
        }
        fetch("/api/track", { method: "POST" }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
