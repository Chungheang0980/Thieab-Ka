"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MailOpen } from "lucide-react";
import { InvitationCard } from "@/components/InvitationCard";
import { Guest, KhmerFontId, RSVPStatus, Wedding } from "@/types";

const fontFamilies: Record<KhmerFontId, string> = {
  serif: "Noto Serif Khmer",
  sans: "Noto Sans Khmer",
  battambang: "Battambang",
  kantumruy: "Kantumruy Pro",
  siemreap: "Siemreap",
  moul: "Moul"
};

function preloadImage(url: string) {
  if (!url) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
    if (image.complete) resolve();
  });
}

async function prepareInvitation(wedding: Wedding) {
  const family = fontFamilies[wedding.khmerFont || "serif"];
  const nameArtworkUrl = wedding.nameArtworkUrl || "/sai-rachana-gold.png";
  const assets = Promise.allSettled([
    document.fonts.load(`400 16px "${family}"`, "ធៀបការ"),
    document.fonts.load('600 16px "Cormorant Garamond"', "Wedding"),
    preloadImage(nameArtworkUrl),
    preloadImage(wedding.backgroundUrl || "")
  ]);

  await Promise.race([
    assets,
    new Promise<void>((resolve) => window.setTimeout(resolve, 2500))
  ]);
}

export default function InvitePage() {
  const params = useParams<{ id: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [ready, setReady] = useState(false);
  const [openPhase, setOpenPhase] = useState<"closed" | "opening" | "opened">("closed");

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      try {
        const response = await fetch(`/api/invitations/${params.id}`);
        if (!response.ok) return;
        const data = await response.json() as { wedding: Wedding; guest: Guest };
        await prepareInvitation(data.wedding);
        if (!active) return;
        setWedding(data.wedding);
        setGuest(data.guest);
      } finally {
        if (active) setReady(true);
      }
    }

    loadInvitation();
    return () => { active = false; };
  }, [params.id]);

  function updateRSVP(status: RSVPStatus) {
    setGuest((current) => current ? { ...current, status } : current);
    fetch(`/api/invitations/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }

  function openInvitation() {
    setOpenPhase("opening");
    window.setTimeout(() => setOpenPhase("opened"), 380);
  }

  if (!ready) return <main className="center-screen">កំពុងរៀបចំធៀបការ...</main>;
  if (!guest || !wedding) return <main className="center-screen">រកមិនឃើញធៀបការ</main>;
  return (
    <main className={`public-page font-${wedding.khmerFont || "serif"} ${openPhase === "opened" ? "opened" : "waiting-to-open"} phase-${openPhase}`}>
      {openPhase !== "opened" && (
        <button
          className="invite-open-screen"
          type="button"
          onClick={openInvitation}
          disabled={openPhase === "opening"}
          aria-label={`Open wedding invitation for ${guest.name}`}
        >
          <span className="open-cover-panel">
            <span className="open-kicker">THIEAB KA · WEDDING INVITATION</span>
            <span className="open-envelope" aria-hidden="true">
              <span className="open-card">
                <small>You are invited</small>
                <strong>{wedding.brideName}<i>&amp;</i>{wedding.groomName}</strong>
                <em>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${wedding.date}T${wedding.time || "00:00"}`))}</em>
              </span>
              <span className="envelope-pocket" />
              <span className="envelope-seal">{wedding.brideName.slice(0, 1)}{wedding.groomName.slice(0, 1)}</span>
            </span>
            <span className="open-guest"><small>សូមគោរពអញ្ជើញ</small><strong>{guest.name}</strong></span>
            <span className="open-touch"><MailOpen size={21} aria-hidden="true" /><span>បើកធៀបការ<small>Open invitation</small></span></span>
          </span>
        </button>
      )}
      <div className="public-invitation-shell" aria-hidden={openPhase !== "opened"}>
        <InvitationCard wedding={wedding} guest={guest} onRSVP={updateRSVP} compact />
      </div>
    </main>
  );
}
