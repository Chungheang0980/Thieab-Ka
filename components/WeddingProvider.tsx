"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { defaultGuests, defaultWedding } from "@/lib/data";
import { Guest, RSVPStatus, Wedding } from "@/types";

interface WeddingContextValue {
  wedding: Wedding;
  guests: Guest[];
  username: string;
  ready: boolean;
  updateWedding: (patch: Partial<Wedding>) => void;
  saveWedding: () => Promise<void>;
  addGuest: (guest: Omit<Guest, "id" | "luckyId" | "status">) => void;
  importGuests: (guests: Array<Omit<Guest, "id" | "luckyId" | "status">>) => void;
  removeGuest: (id: string) => void;
  updateRSVP: (id: string, status: RSVPStatus) => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [wedding, setWedding] = useState(defaultWedding);
  const [guests, setGuests] = useState(defaultGuests);
  const [username, setUsername] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/invite/") || pathname === "/admin/login") {
      setReady(true);
      return;
    }
    fetch("/api/data").then(async (response) => {
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await response.json();
      setWedding({ ...defaultWedding, ...(data.wedding ?? {}) });
      setGuests(data.guests ?? []);
      setUsername(data.username ?? "");
      setReady(true);
    });
  }, [pathname]);

  useEffect(() => {
    if (!ready || !username) return;
    const timer = setTimeout(() => {
      fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wedding)
      }).catch(() => undefined);
    }, 450);
    return () => clearTimeout(timer);
  }, [wedding, ready, username]);

  const value = useMemo<WeddingContextValue>(() => ({
    wedding,
    guests,
    username,
    ready,
    updateWedding: (patch) => setWedding((current) => ({ ...current, ...patch })),
    saveWedding: async () => {
      const response = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wedding)
      });
      if (!response.ok) throw new Error("Unable to save wedding details.");
    },
    addGuest: (guest) => {
      fetch("/api/data/guests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: [guest] })
      }).then((response) => response.json()).then((data) => setGuests((current) => [...current, ...(data.guests ?? [])]));
    },
    importGuests: (importedGuests) => {
      fetch("/api/data/guests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: importedGuests })
      }).then((response) => response.json()).then((data) => setGuests((current) => [...current, ...(data.guests ?? [])]));
    },
    removeGuest: (id) => {
      setGuests((current) => current.filter((guest) => guest.id !== id));
      fetch(`/api/data/guests/${id}`, { method: "DELETE" });
    },
    updateRSVP: (id, status) => setGuests((current) => current.map((guest) => guest.id === id ? { ...guest, status } : guest))
  }), [wedding, guests, username, ready]);

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) throw new Error("useWedding must be used inside WeddingProvider");
  return context;
}
