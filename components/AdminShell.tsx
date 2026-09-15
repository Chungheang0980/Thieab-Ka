"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CalendarDays, Gift, LayoutDashboard, LogOut, Menu, Send, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { useWedding } from "@/components/WeddingProvider";

const nav = [
  { href: "/admin", label: "ទិដ្ឋភាពទូទៅ", english: "Overview", icon: LayoutDashboard },
  { href: "/admin/designer", label: "រចនាធៀបការ", english: "Card designer", icon: CalendarDays },
  { href: "/admin/guests", label: "បញ្ជីភ្ញៀវ", english: "Guests", icon: Users },
  { href: "/admin/share", label: "ចែករំលែក", english: "Share", icon: Send },
  { href: "/admin/draw", label: "ចាប់រង្វាន់", english: "Lucky draw", icon: Gift }
];

export function AdminShell({ children, title, subtitle, action }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { wedding, username } = useWedding();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">ធ</span>
          <div><strong>ធៀបការ</strong><small>THIEAB KA</small></div>
        </div>
        <button className="mobile-close icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        <nav>
          {nav.map(({ href, label, english, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link className={active ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>
                <Icon size={18} /><span>{label}<small>{english}</small></span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/admin/designer"><Settings size={17} /> ការកំណត់</Link>
          <button className="sidebar-logout" onClick={logout}><LogOut size={17} /> ចាកចេញ</button>
          <div className="user-chip"><span>{username.slice(0, 2).toUpperCase()}</span><div><strong>{username}</strong><small>{wedding.brideName} & {wedding.groomName}</small></div></div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div><h1>{title}</h1><p>{subtitle}</p></div>
          {action}
        </header>
        <main className="admin-content">{children}</main>
      </div>
      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
    </div>
  );
}
