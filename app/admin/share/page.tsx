"use client";

import { AlertTriangle, Check, Copy, ExternalLink, Link2, QrCode, Save, X } from "lucide-react";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { useWedding } from "@/components/WeddingProvider";
import { Guest } from "@/types";

export default function SharePage() {
  const { guests } = useWedding();
  const [copied, setCopied] = useState("");
  const [base, setBase] = useState("");
  const [baseInput, setBaseInput] = useState("");
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);

  useEffect(() => {
    const currentOrigin = window.location.origin;
    const isLoopbackOrLocalHost = (value: string) => /\/\/(?:localhost|127\.0\.0\.1|[^/:]+\.local)(?::|\/|$)/i.test(value);

    if (!isLoopbackOrLocalHost(currentOrigin)) {
      setBase(currentOrigin);
      setBaseInput(currentOrigin);
      return;
    }

    fetch("/api/network-origin")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const initialBase = data?.origin || currentOrigin;
        setBase(initialBase);
        setBaseInput(initialBase);
      })
      .catch(() => {
        setBase(currentOrigin);
        setBaseInput(currentOrigin);
      });
  }, []);

  const isLocalOnly = /\/\/(?:localhost|127\.0\.0\.1|[^/:]+\.local)(?::|\/|$)/i.test(base);
  const invitationUrl = (guest: Guest) => {
    return `${base || "http://localhost:3000"}/invite/${guest.id}`;
  };

  function copy(id: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(""), 1300);
  }

  function saveBase() {
    const normalized = baseInput.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/.+/i.test(normalized)) return;
    setBase(normalized);
    setCopied("base");
    setTimeout(() => setCopied(""), 1300);
  }

  const firstGuestUrl = guests[0] ? invitationUrl(guests[0]) : "";

  return (
    <AdminShell title="ចែករំលែកធៀបការ" subtitle="ផ្ញើតំណផ្ទាល់ខ្លួនទៅកាន់ភ្ញៀវ" action={<button className="primary-button" disabled={!guests.length} onClick={() => copy("all", guests.map(g => `${g.name}: ${invitationUrl(g)}`).join("\n"))}><Copy size={17} /> ចម្លងតំណទាំងអស់</button>}>
      <section className="panel share-address">
        <div>
          <strong>អាសយដ្ឋានសម្រាប់ភ្ញៀវ</strong>
          <span>Guest access URL · Use your Vercel domain or this computer&apos;s Wi-Fi address</span>
        </div>
        <div className="base-url-field">
          <input value={baseInput} onChange={(event) => setBaseInput(event.target.value)} placeholder="https://your-site.vercel.app" />
          <button className="primary-button" onClick={saveBase}><Save size={16} /> {copied === "base" ? "បានរក្សាទុក" : "រក្សាទុក"}</button>
        </div>
        {isLocalOnly && <p className="share-warning"><AlertTriangle size={15} /> `localhost` និង `127.0.0.1` មិនអាចបើកពីទូរស័ព្ទបានទេ។ សូមប្រើ Wi-Fi address ឬ deployed URL។</p>}
      </section>
      <div className="share-layout">
        <section className="panel master-share">
          <div className="section-title"><span><Link2 /></span><div><h2>តំណធៀបការសាធារណៈ</h2><p>Master invitation link</p></div></div>
          {firstGuestUrl ? <div className="master-content">
            <div className="qr-large"><QRCode value={firstGuestUrl} size={190} level="M" bgColor="#ffffff" fgColor="#111111" /></div>
            <div><p>ស្កេន QR code ឬចម្លងតំណខាងក្រោម។ ទូរស័ព្ទត្រូវភ្ជាប់ Wi-Fi ដូចគ្នា ប្រសិនបើប្រើ local address។</p><div className="copy-field"><input readOnly value={firstGuestUrl} /><button onClick={() => copy("master", firstGuestUrl)}>{copied === "master" ? <Check /> : <Copy />}</button></div></div>
          </div> : <div className="empty-state compact-empty"><QrCode /><strong>មិនទាន់មានតំណអញ្ជើញ</strong><span>បន្ថែមភ្ញៀវជាមុន ដើម្បីបង្កើត QR និងតំណផ្ទាល់ខ្លួន</span></div>}
        </section>
        <section className="panel guest-links">
          <div className="panel-heading"><div><h2>តំណផ្ទាល់ខ្លួន</h2><p>Personal guest links</p></div><span>{guests.length} links</span></div>
          {guests.map((guest) => {
            const url = invitationUrl(guest);
            return <div className="share-row" key={guest.id}><span className="avatar">{guest.name.slice(0, 1)}</span><div><strong>{guest.name}</strong><small>{guest.luckyId}</small></div><button className="icon-button" title="Show QR code" onClick={() => setQrGuest(guest)}><QrCode size={18} /></button><button className="icon-button" title="Open invitation" onClick={() => window.open(url, "_blank")}><ExternalLink size={17} /></button><button className="secondary-button" onClick={() => copy(guest.id, url)}>{copied === guest.id ? <Check size={16} /> : <Copy size={16} />} {copied === guest.id ? "បានចម្លង" : "ចម្លង"}</button></div>;
          })}
          {!guests.length && <div className="empty-state compact-empty"><Link2 /><strong>មិនទាន់មានភ្ញៀវ</strong><span>តំណផ្ទាល់ខ្លួននឹងបង្ហាញនៅទីនេះបន្ទាប់ពីបញ្ចូលភ្ញៀវ</span></div>}
        </section>
      </div>
      {qrGuest && (
        <div className="modal-backdrop" onClick={() => setQrGuest(null)}>
          <div className="modal guest-qr-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title"><div><h2>QR ធៀបការផ្ទាល់ខ្លួន</h2><p>{qrGuest.name} · {qrGuest.luckyId}</p></div><button className="icon-button" onClick={() => setQrGuest(null)}><X size={19} /></button></div>
            <div className="guest-qr"><QRCode value={invitationUrl(qrGuest)} size={240} level="M" bgColor="#ffffff" fgColor="#111111" /></div>
            <div className="qr-url">{invitationUrl(qrGuest)}</div>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => window.open(invitationUrl(qrGuest), "_blank")}><ExternalLink size={16} /> បើកតំណ</button>
              <button className="primary-button" onClick={() => copy(`qr-${qrGuest.id}`, invitationUrl(qrGuest))}><Copy size={16} /> {copied === `qr-${qrGuest.id}` ? "បានចម្លង" : "ចម្លងតំណ"}</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
