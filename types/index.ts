export type ThemeId = "heritage" | "lotus" | "ivory" | "ruby" | "midnight" | "garden" | "modern" | "editorial" | "pearl";
export type RSVPStatus = "pending" | "attending" | "declined";
export type KhmerFontId = "serif" | "sans" | "battambang" | "kantumruy" | "siemreap" | "moul";
export type DateStyleId = "strip" | "black" | "classic";
export type NumberStyleId = "classic" | "italic" | "modern";
export type DateTextStyleId = "classic" | "minimal" | "editorial";

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
  scheduleTitle: string;
  schedule: string;
  theme: ThemeId;
  khmerFont: KhmerFontId;
  nameFontSize: number;
  dateStyle: DateStyleId;
  numberStyle: NumberStyleId;
  dateTextStyle: DateTextStyleId;
  animation: boolean;
  mapUrl: string;
  abaUrl: string;
  abaQrUrl: string;
  musicUrl: string;
  photoUrls: string;
  videoUrl: string;
  backgroundUrl: string;
  nameArtworkUrl?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  table: string;
  luckyId: string;
  status: RSVPStatus;
}
