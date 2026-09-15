"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Copy, Eye, Gift, Send, Users, XCircle } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { InvitationCard } from "@/components/InvitationCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useWedding } from "@/components/WeddingProvider";

export default function Dashboard() {
  const { wedding, guests } = useWedding();
  const attending = guests.filter((g) => g.status === "attending").length;
  const declined = guests.filter((g) => g.status === "declined").length;
  const pending = guests.length - attending - declined;
  const stats = [
    { label: "ភ្ញៀវសរុប", value: guests.length, detail: "Total guests", icon: Users, tone: "gold" },
    { label: "ចូលរួម", value: attending, detail: `${guests.length ? Math.round(attending / guests.length * 100) : 0}% confirmed`, icon: CheckCircle2, tone: "green" },
    { label: "រង់ចាំ", value: pending, detail: "Awaiting reply", icon: Clock3, tone: "amber" },
    { label: "មិនចូលរួម", value: declined, detail: "Declined", icon: XCircle, tone: "red" }
  ];

  return (
    <AdminShell title={`សួស្តី, ${wedding.brideName} & ${wedding.groomName}`} subtitle="នេះជាទិដ្ឋភាពនៃធៀបការរបស់អ្នក" action={guests[0] ? <Link className="primary-button" href={`/invite/${guests[0].id}`}><Eye size={17} /> មើលធៀបការ</Link> : <Link className="primary-button" href="/admin/guests"><Users size={17} /> បន្ថែមភ្ញៀវ</Link>}>
      <section className="stats-grid">
        {stats.map(({ label, value, detail, icon: Icon, tone }) => <div className="stat-card" key={label}><span className={`stat-icon ${tone}`}><Icon size={20} /></span><div><small>{label}</small><strong>{value}</strong><em>{detail}</em></div></div>)}
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading"><div><h2>ការឆ្លើយតបថ្មីៗ</h2><p>Recent RSVP responses</p></div><Link href="/admin/guests">មើលទាំងអស់ <ArrowRight size={15} /></Link></div>
          <div className="guest-list">
            {guests.slice(0, 4).map((guest) => <div key={guest.id}><span className="avatar">{guest.name.slice(0, 1)}</span><div><strong>{guest.name}</strong><small>{guest.luckyId} · តុ {guest.table}</small></div><StatusBadge status={guest.status} /></div>)}
            {!guests.length && <div className="dashboard-empty"><Users /><strong>មិនទាន់មានភ្ញៀវ</strong><small>បន្ថែមភ្ញៀវម្នាក់ៗ ឬនាំចូលបញ្ជី Excel / CSV</small><Link href="/admin/guests">បន្ថែមភ្ញៀវ <ArrowRight size={14} /></Link></div>}
          </div>
        </div>
        <div className="panel preview-panel">
          <div className="panel-heading"><div><h2>ធៀបការរបស់អ្នក</h2><p>Live card preview</p></div><Link href="/admin/designer">កែសម្រួល</Link></div>
          <div className="mini-preview"><InvitationCard wedding={wedding} guest={guests[0]} compact /></div>
        </div>
      </section>
      <section className="quick-actions">
        <Link href="/admin/designer"><CalendarDays /><span><strong>កែធៀបការ</strong><small>Details & style</small></span><ArrowRight /></Link>
        <Link href="/admin/guests"><Users /><span><strong>បន្ថែមភ្ញៀវ</strong><small>Manage guests</small></span><ArrowRight /></Link>
        <Link href="/admin/share"><Send /><span><strong>ចែករំលែក</strong><small>Links & QR codes</small></span><Copy /></Link>
        <Link href="/admin/draw"><Gift /><span><strong>ចាប់រង្វាន់</strong><small>Wedding day draw</small></span><ArrowRight /></Link>
      </section>
    </AdminShell>
  );
}
