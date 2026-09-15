"use client";

import { useState } from "react";
import { Check, Eye, Image, Link2, Music2, QrCode, Save, Trash2, Upload, Video } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { InvitationCard } from "@/components/InvitationCard";
import { useWedding } from "@/components/WeddingProvider";
import { khmerFontNames, themeNames } from "@/lib/data";
import { KhmerFontId, ThemeId } from "@/types";

export default function Designer() {
  const { wedding, guests, updateWedding } = useWedding();
  const [saved, setSaved] = useState(false);
  const [mediaStatus, setMediaStatus] = useState("");
  const [mediaError, setMediaError] = useState("");
  const themes = Object.entries(themeNames) as [ThemeId, string][];
  const khmerFonts = Object.entries(khmerFontNames) as [KhmerFontId, string][];
  const photoUrls = parseMediaUrls(wedding.photoUrls);

  async function uploadMedia(kind: "photo" | "video" | "abaQr" | "background", files: FileList | File[]) {
    const selected = Array.from(files).filter(Boolean);
    if (!selected.length) return;

    setMediaStatus(kind === "photo" ? "Uploading photos..." : kind === "video" ? "Uploading video..." : kind === "abaQr" ? "Uploading ABA QR..." : "Uploading background...");
    setMediaError("");

    const form = new FormData();
    form.append("kind", kind === "video" ? "video" : "photo");
    (kind === "abaQr" || kind === "background" ? selected.slice(0, 1) : selected).forEach((file) => form.append("files", file));

    try {
      const response = await fetch("/api/data/media", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) {
        setMediaError(result.error || "Unable to upload media.");
        setMediaStatus("");
        return;
      }

      const urls = (result.media ?? []).map((item: { url: string }) => item.url);
      if (kind === "photo") {
        updateWedding({ photoUrls: [...photoUrls, ...urls].join("\n") });
      } else if (kind === "video") {
        updateWedding({ videoUrl: urls[0] || "" });
      } else if (kind === "abaQr") {
        updateWedding({ abaQrUrl: urls[0] || "" });
      } else {
        updateWedding({ backgroundUrl: urls[0] || "" });
      }
      setMediaStatus("Uploaded");
      setTimeout(() => setMediaStatus(""), 1400);
    } catch {
      setMediaError("Upload failed. Check the file type and try again.");
      setMediaStatus("");
    }
  }

  async function removeMedia(url: string, kind: "photo" | "video") {
    const id = getMediaId(url);
    if (id) await fetch(`/api/data/media/${id}`, { method: "DELETE" });

    if (kind === "photo") {
      updateWedding({ photoUrls: photoUrls.filter((photoUrl) => photoUrl !== url).join("\n") });
    } else if (kind === "video") {
      updateWedding({ videoUrl: "" });
    }
  }

  async function removeAbaQr() {
    const id = getMediaId(wedding.abaQrUrl);
    if (id) await fetch(`/api/data/media/${id}`, { method: "DELETE" });
    updateWedding({ abaQrUrl: "" });
  }

  async function removeBackground() {
    const id = getMediaId(wedding.backgroundUrl);
    if (id) await fetch(`/api/data/media/${id}`, { method: "DELETE" });
    updateWedding({ backgroundUrl: "" });
  }

  return (
    <AdminShell title="រចនាធៀបការ" subtitle="កែសម្រួលព័ត៌មាន និងរចនាប័ទ្ម" action={<button className="primary-button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}><Save size={17} /> {saved ? "បានរក្សាទុក" : "រក្សាទុក"}</button>}>
      <div className="designer-layout">
        <div className="designer-form">
          <section className="form-section">
            <div className="section-title"><span>01</span><div><h2>ព័ត៌មានគូស្វាមីភរិយា</h2><p>Couple details</p></div></div>
            <div className="form-grid">
              <label>ឈ្មោះកូនកំលោះ<input value={wedding.groomName} onChange={(e) => updateWedding({ groomName: e.target.value })} /></label>
              <label>ឈ្មោះកូនក្រមុំ<input value={wedding.brideName} onChange={(e) => updateWedding({ brideName: e.target.value })} /></label>
              <label>កាលបរិច្ឆេទ<input type="date" value={wedding.date} onChange={(e) => updateWedding({ date: e.target.value })} /></label>
              <label>ម៉ោង<input type="time" value={wedding.time} onChange={(e) => updateWedding({ time: e.target.value })} /></label>
              <label className="full">សារអញ្ជើញ<textarea rows={4} value={wedding.message} onChange={(e) => updateWedding({ message: e.target.value })} /></label>
            </div>
          </section>
          <section className="form-section">
            <div className="section-title"><span>02</span><div><h2>ទីកន្លែង</h2><p>Venue & directions</p></div></div>
            <div className="form-grid">
              <label className="full">ឈ្មោះទីកន្លែង<input value={wedding.venue} onChange={(e) => updateWedding({ venue: e.target.value })} /></label>
              <label className="full">អាសយដ្ឋាន<input value={wedding.address} onChange={(e) => updateWedding({ address: e.target.value })} /></label>
              <label className="full">Google Maps link<input value={wedding.mapUrl} onChange={(e) => updateWedding({ mapUrl: e.target.value })} /></label>
            </div>
          </section>
          <section className="form-section">
            <div className="section-title"><span>03</span><div><h2>ខ្លឹមសារធៀបការ</h2><p>Invitation content</p></div></div>
            <div className="form-grid">
              <label className="full">Announcement text<textarea rows={2} value={wedding.announcementText || ""} onChange={(e) => updateWedding({ announcementText: e.target.value })} /></label>
              <label className="full">Dress code<textarea rows={2} value={wedding.dressCode || ""} onChange={(e) => updateWedding({ dressCode: e.target.value })} /></label>
              <label className="full">Wedding day schedule<small className="field-help">One line per item: 17:30 | Welcome</small><textarea rows={6} value={wedding.schedule || ""} onChange={(e) => updateWedding({ schedule: e.target.value })} /></label>
            </div>
          </section>
          <section className="form-section">
            <div className="section-title"><span>04</span><div><h2>រចនាប័ទ្ម</h2><p>Choose card theme</p></div></div>
            <div className="theme-grid">
              {themes.map(([id, name]) => <button className={`theme-swatch swatch-${id} ${wedding.theme === id ? "selected" : ""}`} key={id} onClick={() => updateWedding({ theme: id })}><i /><span>{name}</span>{wedding.theme === id && <b><Check size={13} /></b>}</button>)}
            </div>
            <div className="font-picker">
              <div><strong>អក្សរខ្មែរ</strong><small>Khmer font style</small></div>
              <div>
                {khmerFonts.map(([id, name]) => (
                  <button
                    type="button"
                    className={`font-option font-${id} ${wedding.khmerFont === id ? "selected" : ""}`}
                    key={id}
                    onClick={() => updateWedding({ khmerFont: id })}
                  >
                    <span>កូនក្រមុំ & កូនកំលោះ</span>
                    <small>{name}</small>
                  </button>
                ))}
              </div>
            </div>
            <label className="toggle-row"><span><strong>ផ្ការីកធ្លាក់</strong><small>Falling petal animation</small></span><input type="checkbox" checked={wedding.animation} onChange={(e) => updateWedding({ animation: e.target.checked })} /><i /></label>
            <div className="background-picker">
              <div><strong>រូបភាពផ្ទៃក្រោយ</strong><small>Upload a simple background for the invitation cover</small></div>
              <div className="media-drop-zone">
                <Image size={20} />
                <div><strong>Invitation background</strong><small>JPG, PNG, WebP, or GIF. Best as portrait image.</small></div>
                <label className="secondary-button">
                  <Upload size={16} /> {wedding.backgroundUrl ? "Replace" : "Upload"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => {
                    if (event.target.files) uploadMedia("background", event.target.files);
                    event.target.value = "";
                  }} />
                </label>
              </div>
              {wedding.backgroundUrl && (
                <div className="uploaded-background">
                  <img src={wedding.backgroundUrl} alt="Invitation background preview" />
                  <button className="secondary-button" onClick={removeBackground}><Trash2 size={16} /> Remove background</button>
                </div>
              )}
            </div>
          </section>
          <section className="form-section">
            <div className="section-title"><span><Music2 /></span><div><h2>តន្ត្រី និងមេឌៀ</h2><p>Song link, uploaded pre-wedding photos, and video</p></div></div>
            <div className="media-link-grid">
              <label className="full">YouTube song link
                <div className="input-with-icon">
                  <Link2 size={15} />
                  <input
                    value={wedding.musicUrl}
                    onChange={(e) => updateWedding({ musicUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </label>
              <div
                className="media-drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  uploadMedia("photo", event.dataTransfer.files);
                }}
              >
                <Image size={20} />
                <div><strong>Pre-wedding photos</strong><small>Drop JPG, PNG, WebP, or GIF files here</small></div>
                <label className="secondary-button">
                  <Upload size={16} /> Add photos
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => {
                    if (event.target.files) uploadMedia("photo", event.target.files);
                    event.target.value = "";
                  }} />
                </label>
              </div>
              {photoUrls.length > 0 && (
                <div className="uploaded-photo-grid">
                  {photoUrls.map((url, index) => (
                    <div key={`${url}-${index}`}>
                      <img src={url} alt={`Uploaded pre-wedding photo ${index + 1}`} />
                      <button className="icon-button" title="Remove photo" onClick={() => removeMedia(url, "photo")}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div
                className="media-drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  uploadMedia("video", Array.from(event.dataTransfer.files).slice(0, 1));
                }}
              >
                <Video size={20} />
                <div><strong>Pre-wedding video</strong><small>Drop one MP4, WebM, or MOV file here</small></div>
                <label className="secondary-button">
                  <Upload size={16} /> {wedding.videoUrl ? "Replace video" : "Add video"}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => {
                    if (event.target.files) uploadMedia("video", event.target.files);
                    event.target.value = "";
                  }} />
                </label>
              </div>
              {wedding.videoUrl && (
                <div className="uploaded-video">
                  <video src={wedding.videoUrl} controls playsInline preload="metadata" />
                  <button className="secondary-button" onClick={() => removeMedia(wedding.videoUrl, "video")}><Trash2 size={16} /> Remove video</button>
                </div>
              )}
              <small className={`field-help ${mediaError ? "error" : ""}`}>
                {mediaError || mediaStatus || "Photos are shown as a gallery. Video size limit is 25 MB; use short compressed videos for faster guest loading."}
              </small>
            </div>
          </section>
          <section className="form-section">
            <div className="section-title"><span><QrCode /></span><div><h2>ABA QR</h2><p>Upload the payment QR shown on invitations</p></div></div>
            <div className="media-link-grid">
              <label className="full">ABA payment link
                <div className="input-with-icon">
                  <Link2 size={15} />
                  <input
                    value={wedding.abaUrl}
                    onChange={(e) => updateWedding({ abaUrl: e.target.value })}
                    placeholder="https://pay.ababank.com/..."
                  />
                </div>
              </label>
              <div className="media-drop-zone aba-qr-drop">
                <QrCode size={20} />
                <div><strong>ABA QR image</strong><small>Upload JPG, PNG, WebP, or GIF. This replaces the generated QR.</small></div>
                <label className="secondary-button">
                  <Upload size={16} /> {wedding.abaQrUrl ? "Replace QR" : "Upload QR"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => {
                    if (event.target.files) uploadMedia("abaQr", event.target.files);
                    event.target.value = "";
                  }} />
                </label>
              </div>
              {wedding.abaQrUrl && (
                <div className="uploaded-aba-qr">
                  <img src={wedding.abaQrUrl} alt="Uploaded ABA QR code" />
                  <button className="secondary-button" onClick={removeAbaQr}><Trash2 size={16} /> Remove QR</button>
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="live-preview">
          <div className="preview-label"><Eye size={16} /> មើលជាមុន · LIVE PREVIEW</div>
          <div className="phone-frame"><InvitationCard wedding={wedding} guest={guests[0]} compact /></div>
        </aside>
      </div>
    </AdminShell>
  );
}

function parseMediaUrls(value: string) {
  return value
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function getMediaId(url: string) {
  return url.match(/\/api\/media\/([^/?#]+)/)?.[1] || "";
}
