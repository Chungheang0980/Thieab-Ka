"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Copy, Gift, Image, MapPin, Music2, Video } from "lucide-react";
import QRCode from "react-qr-code";
import { Guest, RSVPStatus, Wedding } from "@/types";
import { useEffect, useRef, useState } from "react";

function getYouTubeEmbedUrl(value: string) {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
        id = url.pathname.split("/").filter(Boolean)[1] || "";
      } else {
        id = url.searchParams.get("v") || "";
      }
    }

    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : "";
  } catch {
    return "";
  }
}

function getVideoEmbedUrl(value: string) {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");

    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    return getYouTubeEmbedUrl(value);
  } catch {
    return "";
  }
}

function isDirectVideoUrl(value: string) {
  if (value.startsWith("/api/media/")) return true;
  try {
    return /\.(mp4|webm|ogg)(?:$|\?)/i.test(new URL(value.trim()).pathname);
  } catch {
    return false;
  }
}

function parsePhotoUrls(value: string) {
  return value
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/api/media/"));
}

export function InvitationCard({ wedding, guest, onRSVP, compact = false }: {
  wedding: Wedding;
  guest?: Guest;
  onRSVP?: (status: RSVPStatus) => void;
  compact?: boolean;
}) {
  const [notice, setNotice] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [albumIndex, setAlbumIndex] = useState(0);
  const [wishFormOpen, setWishFormOpen] = useState(false);
  const [wishName, setWishName] = useState(guest?.name || "");
  const [wishMessage, setWishMessage] = useState("");
  const [wishes, setWishes] = useState<{ name: string; message: string }[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [photoShapes, setPhotoShapes] = useState<Record<string, "portrait" | "landscape" | "square">>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackDate = "2026-12-12";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(wedding.date || "") ? wedding.date : fallbackDate;
  const safeTime = /^\d{2}:\d{2}$/.test(wedding.time || "") ? wedding.time : "00:00";
  const candidateDate = new Date(`${safeDate}T${safeTime}`);
  const date = Number.isNaN(candidateDate.getTime()) ? new Date(`${fallbackDate}T00:00`) : candidateDate;
  const targetTime = date.getTime();
  const [dateYear, dateMonth, dateDay] = safeDate.split("-").map(Number);
  const displayDate = new Date(Date.UTC(dateYear, dateMonth - 1, dateDay));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayText = String(dateDay).padStart(2, "0");
  const monthText = monthNames[dateMonth - 1];
  const weekdayText = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(displayDate);
  const yearText = String(dateYear);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(wedding.musicUrl || "");
  const videoEmbedUrl = getVideoEmbedUrl(wedding.videoUrl || "");
  const hasDirectVideo = isDirectVideoUrl(wedding.videoUrl || "");
  const photoUrls = parsePhotoUrls(wedding.photoUrls || "").slice(0, 8);
  const calendarStart = `${safeDate.replace(/-/g, "")}T${safeTime.replace(":", "")}00`;
  const calendarEndDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
  const calendarEnd = `${calendarEndDate.getFullYear()}${String(calendarEndDate.getMonth() + 1).padStart(2, "0")}${String(calendarEndDate.getDate()).padStart(2, "0")}T${String(calendarEndDate.getHours()).padStart(2, "0")}${String(calendarEndDate.getMinutes()).padStart(2, "0")}00`;
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${wedding.brideName} & ${wedding.groomName} Wedding`)}&dates=${calendarStart}/${calendarEnd}&details=${encodeURIComponent(wedding.message)}&location=${encodeURIComponent(`${wedding.venue}, ${wedding.address}`)}`;
  const cardStyle = {
    ...(wedding.backgroundUrl ? { "--invite-background-image": `url("${wedding.backgroundUrl}")` } : {}),
    "--invite-name-size": `${wedding.nameFontSize || 72}px`
  } as React.CSSProperties;
  const schedule = parseSchedule(wedding.schedule);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasDirectVideo) return;

    video.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.55 });

    observer.observe(video);
    return () => observer.disconnect();
  }, [hasDirectVideo, wedding.videoUrl]);

  useEffect(() => {
    const observed = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [photoUrls.length, wishes.length]);

  useEffect(() => {
    if (photoUrls.length <= 1) return;
    const timer = window.setInterval(() => {
      setAlbumIndex((current) => (current + 1) % photoUrls.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [photoUrls.length]);

  useEffect(() => {
    function tick() {
      const remaining = Math.max(targetTime - Date.now(), 0);
      setCountdown({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining / 3600000) % 24),
        minutes: Math.floor((remaining / 60000) % 60),
        seconds: Math.floor((remaining / 1000) % 60)
      });
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetTime]);

  function submit(status: RSVPStatus) {
    onRSVP?.(status);
    setNotice(status === "attending" ? "អរគុណ! យើងខ្ញុំរង់ចាំជួបលោកអ្នក" : "អរគុណសម្រាប់ការឆ្លើយតប");
  }

  function setPhotoShape(url: string, image: HTMLImageElement) {
    const ratio = image.naturalWidth / Math.max(image.naturalHeight, 1);
    const shape = ratio > 1.18 ? "landscape" : ratio < 0.82 ? "portrait" : "square";
    setPhotoShapes((current) => current[url] === shape ? current : { ...current, [url]: shape });
  }

  function submitWish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = wishName.trim() || "Guest";
    const message = wishMessage.trim();
    if (!message) return;
    setWishes((current) => [{ name, message }, ...current]);
    setWishMessage("");
    setWishFormOpen(false);
  }

  function shiftLightbox(direction: number) {
    if (lightboxIndex === null || photoUrls.length === 0) return;
    setLightboxIndex((lightboxIndex + direction + photoUrls.length) % photoUrls.length);
  }

  function shiftAlbum(direction: number) {
    if (photoUrls.length === 0) return;
    setAlbumIndex((current) => (current + direction + photoUrls.length) % photoUrls.length);
  }

  function getAlbumOffset(index: number) {
    if (photoUrls.length <= 1) return 0;
    const raw = index - albumIndex;
    const half = photoUrls.length / 2;
    if (raw > half) return raw - photoUrls.length;
    if (raw < -half) return raw + photoUrls.length;
    return raw;
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const calendarOffset = (monthStart.getDay() + 6) % 7;
  const calendarCells = Array.from({ length: calendarOffset + monthDays }, (_, index) => index < calendarOffset ? 0 : index - calendarOffset + 1);

  return (
    <article className={`invitation jasmine-card theme-${wedding.theme} font-${wedding.khmerFont || "serif"} date-${wedding.dateStyle || "classic"} number-${wedding.numberStyle || "classic"} date-text-${wedding.dateTextStyle || "classic"} ${compact ? "compact" : ""}`} style={cardStyle}>
      {wedding.animation && <div className="petals" aria-hidden="true">{[...Array(20)].map((_, i) => <i key={i} style={{ "--i": i, "--delay": `${-i * 0.8}s` } as React.CSSProperties} />)}</div>}
      <section className="invite-hero reveal-on-scroll">
        <div className="invite-shade" />
        <div className="baroque-pillar baroque-pillar-left" aria-hidden="true"><i /><i /><i /></div>
        <div className="baroque-pillar baroque-pillar-right" aria-hidden="true"><i /><i /><i /></div>
        <div className="card-floral card-floral-top" aria-hidden="true"><span /><span /><span /></div>
        <div className="card-floral card-floral-bottom" aria-hidden="true"><span /><span /><span /></div>
        <div className="invite-hero-content">
          <span className="invite-label">Welcome to our wedding</span>
          <div className="couple-mark" aria-hidden="true">{wedding.brideName.slice(0, 1)}{wedding.groomName.slice(0, 1)}</div>
          <h1><span>{wedding.groomName}</span><b>&</b><span>{wedding.brideName}</span></h1>
          {guest && (
            <div className="hero-guest">
              <small>INVITATION FOR</small>
              <strong>{guest.name}</strong>
            </div>
          )}
          <div className="ornament" aria-hidden="true"><span />Together Forever<span /></div>
          <div className="hero-date-card">
            <span>{weekdayText}</span>
            <strong>{dayText}</strong>
            <em>{monthText}</em>
          </div>
          <p>{yearText}</p>
        </div>
      </section>

      <section className="invite-body reveal-on-scroll">
        <p className="blessing">សិរីសួស្តី ជ័យមង្គល វិបុលសុខ</p>
        <p className="invite-message">{wedding.message}</p>
      </section>

      <section className="dress-code reveal-on-scroll">
        <span aria-hidden="true">❦</span>
        <strong>Dress Code</strong>
        <p>{wedding.dressCode || "Elegant evening attire in soft neutrals, gold, ivory, or classic black."}</p>
      </section>

      <section className="schedule-section reveal-on-scroll">
        <h2>{wedding.scheduleTitle || "Wedding Day Schedule"}</h2>
        <div className="schedule-days">
          {schedule.map((day, dayIndex) => (
            <div className="schedule-day" key={`${day.title}-${dayIndex}`}>
              <div className="schedule-day-heading"><span>DAY {String(dayIndex + 1).padStart(2, "0")}</span><h3>{day.title}</h3></div>
              <div className="timeline">
                {day.items.map(([time, label], index) => (
                  <div className="timeline-item" style={{ "--delay": `${(dayIndex * 5 + index) * 90}ms` } as React.CSSProperties} key={`${dayIndex}-${time}-${label}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><strong>{time}</strong><small>{label}</small></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="invite-body">
        {(photoUrls.length > 0 || videoEmbedUrl || hasDirectVideo) && (
          <section className="prewedding-media reveal-on-scroll">
            <div className="media-heading"><Image size={17} /><span>Wedding Album</span></div>
            {photoUrls.length > 0 && (
              <div className="album-single">
                <button className="album-single-photo" type="button" onClick={() => setLightboxIndex(albumIndex)}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={photoUrls[albumIndex]}
                      src={photoUrls[albumIndex]}
                      alt={`Pre-wedding photo ${albumIndex + 1}`}
                      loading="lazy"
                      initial={{ opacity: 0, scale: .98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: .45 }}
                      onLoad={(event) => setPhotoShape(photoUrls[albumIndex], event.currentTarget)}
                    />
                  </AnimatePresence>
                </button>
                <div className="album-dots" aria-label="Album photos">
                  {photoUrls.map((url, index) => (
                    <button className={index === albumIndex ? "active" : ""} type="button" key={`${url}-dot`} onClick={() => setAlbumIndex(index)} aria-label={`Show photo ${index + 1}`} />
                  ))}
                </div>
                <span className="album-counter">{albumIndex + 1} / {photoUrls.length}</span>
              </div>
            )}
            {(videoEmbedUrl || hasDirectVideo) && (
              <div className="prewedding-video">
                <div><Video size={16} /><span>Pre-wedding video</span></div>
                {videoEmbedUrl ? (
                  <iframe
                    title="Pre-wedding video"
                    src={videoEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <video ref={videoRef} src={wedding.videoUrl} controls muted playsInline preload="metadata" />
                )}
              </div>
            )}
          </section>
        )}
        <section className="countdown-section reveal-on-scroll">
          <div className="large-date">
            <span>{weekdayText}</span>
            <strong>{dayText}</strong>
            <span>{monthText} {yearText}</span>
          </div>
          <div className="countdown-grid">
            {Object.entries(countdown).map(([key, value]) => (
              <div className="countdown-unit" key={key}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{key === "minutes" ? "MIN" : key === "seconds" ? "SEC" : key.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="month-calendar">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => <b key={day}>{day}</b>)}
            {calendarCells.map((day, index) => <span className={day === date.getDate() ? "wedding-day" : ""} key={`${day}-${index}`}>{day || ""}</span>)}
          </div>
          <a className="map-button calendar-button" href={calendarUrl} target="_blank" rel="noreferrer"><CalendarDays size={17} /> Add to Calendar</a>
        </section>

        <section className="venue-section reveal-on-scroll">
          <a className="map-button" href={wedding.mapUrl} target="_blank" rel="noreferrer"><MapPin size={17} /> បើកផែនទី</a>
          <iframe
            title="Wedding venue map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${wedding.venue} ${wedding.address}`)}&output=embed`}
            loading="lazy"
          />
        </section>
        {guest && (
          <>
            <div className="lucky-ticket">
              <div><Gift size={22} /><span><small>លេខសំណាងរបស់លោកអ្នក</small><strong>{guest.luckyId}</strong></span></div>
              <button title="Copy lucky ID" onClick={() => navigator.clipboard?.writeText(guest.luckyId)}><Copy size={16} /></button>
            </div>
            <div className="rsvp">
              <span>តើលោកអ្នកអាចចូលរួមបានទេ?</span>
              <div>
                <button className={guest.status === "attending" ? "selected" : ""} onClick={() => submit("attending")}>ចូលរួម</button>
                <button className={guest.status === "declined" ? "selected decline" : ""} onClick={() => submit("declined")}>មិនបាន</button>
              </div>
              <AnimatePresence>{notice && <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>{notice}</motion.p>}</AnimatePresence>
            </div>
          </>
        )}
        <div className="payment">
          <div><span>ចំណងដៃតាម ABA</span><small>ស្កេនដើម្បីផ្ញើអំណោយ</small></div>
          <div className="qr-frame">
            {wedding.abaQrUrl ? <img src={wedding.abaQrUrl} alt="ABA payment QR code" /> : <QRCode value={wedding.abaUrl || "https://pay.ababank.com/demo"} size={76} />}
          </div>
        </div>
        {youtubeEmbedUrl && (
          <div className="youtube-music">
            <div><Music2 size={16} /><span>Wedding song</span></div>
            <iframe
              title="Wedding song from YouTube"
              src={youtubeEmbedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
        <section className="guestbook reveal-on-scroll">
          <h2>Guestbook</h2>
          <button className="map-button" type="button" onClick={() => setWishFormOpen((current) => !current)}>Send Wishes</button>
          {wishFormOpen && (
            <form className="wish-form" onSubmit={submitWish}>
              <input value={wishName} onChange={(event) => setWishName(event.target.value)} placeholder="Your name" />
              <textarea value={wishMessage} onChange={(event) => setWishMessage(event.target.value)} placeholder="Write your message" />
              <button className="primary-button" type="submit">Send</button>
            </form>
          )}
          <div className="wish-list">
            {wishes.length === 0 ? <p>No wishes yet. Be the first!</p> : wishes.map((wish, index) => (
              <div className="wish-item" key={`${wish.name}-${index}`}>
                <strong>{wish.name}</strong>
                <span>{wish.message}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button className="lightbox-close" type="button" onClick={() => setLightboxIndex(null)}>×</button>
          <button className="lightbox-arrow prev" type="button" onClick={() => shiftLightbox(-1)}>‹</button>
          <img src={photoUrls[lightboxIndex]} alt={`Pre-wedding photo ${lightboxIndex + 1}`} />
          <button className="lightbox-arrow next" type="button" onClick={() => shiftLightbox(1)}>›</button>
          <div className="lightbox-thumbs">
            {photoUrls.map((url, index) => (
              <button className={index === lightboxIndex ? "active" : ""} type="button" onClick={() => setLightboxIndex(index)} key={`thumb-${url}-${index}`}>
                <img src={url} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}
      <footer>ធៀបការ · THIEAB KA</footer>
    </article>
  );
}

function parseSchedule(value: string | undefined) {
  type ScheduleDay = { title: string; items: string[][] };
  const fallback: ScheduleDay[] = [{
    title: "Wedding Day",
    items: [["17:30", "Welcome"], ["18:30", "Reception"], ["18:45", "Toasts & Cake"], ["19:00", "Main Course"], ["21:00", "Farewell"]]
  }];
  const days: ScheduleDay[] = [];
  let current: ScheduleDay = { title: "Wedding Day", items: [] };

  for (const rawLine of (value || "").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = line.match(/^\[(.+?)\]$/);
    if (heading) {
      if (current.items.length) days.push(current);
      current = { title: heading[1].trim() || `Day ${days.length + 1}`, items: [] };
      continue;
    }
    const parts = line.split("|").map((part) => part.trim());
    if (parts[0] && parts[1]) current.items.push([parts[0], parts.slice(1).join(" | ")]);
  }
  if (current.items.length) days.push(current);
  return days.length ? days.map((day) => ({ ...day, items: day.items.slice(0, 8) })) : fallback;
}
