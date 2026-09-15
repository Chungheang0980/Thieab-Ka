"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InvitationCard } from "@/components/InvitationCard";
import { Guest, RSVPStatus, Wedding } from "@/types";

export default function InvitePage() {
  const params = useParams<{ id: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [ready, setReady] = useState(false);
  const [openPhase, setOpenPhase] = useState<"closed" | "opening" | "opened">("closed");

  useEffect(() => {
    fetch(`/api/invitations/${params.id}`).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setWedding(data.wedding);
        setGuest(data.guest);
      }
      setReady(true);
    });
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
    window.setTimeout(() => setOpenPhase("opened"), 1050);
  }

  if (!ready) return <main className="center-screen">កំពុងរៀបចំធៀបការ...</main>;
  if (!guest || !wedding) return <main className="center-screen">រកមិនឃើញធៀបការ</main>;
  return (
    <main className={`public-page ${openPhase === "opened" ? "opened" : "waiting-to-open"} phase-${openPhase}`}>
      {openPhase !== "opened" && (
        <button className="invite-open-screen" type="button" onClick={openInvitation} disabled={openPhase === "opening"}>
          <img className="cover-flower cover-flower-left" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23b88a3e' stroke-width='3'%3E%3Cpath d='M18 118C55 99 72 74 80 24'/%3E%3Cpath d='M32 103c12-36 39-54 79-55'/%3E%3Cpath d='M48 87c29 3 51-6 68-31'/%3E%3C/g%3E%3Cellipse cx='42' cy='106' rx='9' ry='18' fill='%23e8c7aa' transform='rotate(-35 42 106)'/%3E%3Cellipse cx='78' cy='64' rx='8' ry='16' fill='%23f0dcc5' transform='rotate(38 78 64)'/%3E%3Cellipse cx='106' cy='50' rx='7' ry='14' fill='%23e8c7aa' transform='rotate(62 106 50)'/%3E%3C/svg%3E" alt="" />
          <img className="cover-flower cover-flower-right" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23b88a3e' stroke-width='3'%3E%3Cpath d='M18 118C55 99 72 74 80 24'/%3E%3Cpath d='M32 103c12-36 39-54 79-55'/%3E%3Cpath d='M48 87c29 3 51-6 68-31'/%3E%3C/g%3E%3Cellipse cx='42' cy='106' rx='9' ry='18' fill='%23e8c7aa' transform='rotate(-35 42 106)'/%3E%3Cellipse cx='78' cy='64' rx='8' ry='16' fill='%23f0dcc5' transform='rotate(38 78 64)'/%3E%3Cellipse cx='106' cy='50' rx='7' ry='14' fill='%23e8c7aa' transform='rotate(62 106 50)'/%3E%3C/svg%3E" alt="" />
          <span className="open-florals" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="cover-heart" aria-hidden="true">♥</span>
          <span className="cover-names">{wedding.brideName}<b>❦</b>{wedding.groomName}</span>
          <span className="cover-date">{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${wedding.date}T${wedding.time || "00:00"}`))}</span>
          <span className="cover-kicker">Cordially Invites</span>
          <span className="open-touch">Open</span>
        </button>
      )}
      <div className="public-invitation-shell" aria-hidden={openPhase !== "opened"}>
        <InvitationCard wedding={wedding} guest={guest} onRSVP={updateRSVP} />
      </div>
    </main>
  );
}
