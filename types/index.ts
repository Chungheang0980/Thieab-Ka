export type ThemeId = "heritage" | "lotus" | "ivory" | "ruby" | "midnight" | "garden" | "modern" | "editorial" | "pearl";
export type RSVPStatus = "pending" | "attending" | "declined";
export type KhmerFontId = "serif" | "sans" | "battambang" | "kantumruy" | "siemreap" | "moul";

export interface Wedding {
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  message: string;
  announcementText: string;
  dressCode: string;
  schedule: string;
  theme: ThemeId;
  khmerFont: KhmerFontId;
  animation: boolean;
  mapUrl: string;
  abaUrl: string;
  abaQrUrl: string;
  musicUrl: string;
  photoUrls: string;
  videoUrl: string;
  backgroundUrl: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  table: string;
  luckyId: string;
  status: RSVPStatus;
}
