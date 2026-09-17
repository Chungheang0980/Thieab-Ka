import { Guest, KhmerFontId, Wedding } from "@/types";

export const defaultWedding: Wedding = {
  groomName: "វិសាល",
  brideName: "សុភា",
  date: "2026-12-12",
  time: "17:30",
  venue: "សណ្ឋាគារ រ៉ូសវូដ ភ្នំពេញ",
  address: "Vattanac Capital Tower, Phnom Penh",
  message: "យើងខ្ញុំមានកិត្តិយស សូមគោរពអញ្ជើញលោកអ្នកចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។",
  announcementText: "We joyfully announce the wedding of our children",
  dressCode: "Elegant evening attire in soft neutrals, gold, ivory, or classic black.",
  scheduleTitle: "Wedding Day Schedule",
  schedule: "17:30 | Welcome\n18:30 | Reception\n18:45 | Toasts & Cake\n19:00 | Main Course\n21:00 | Farewell",
  theme: "heritage",
  khmerFont: "siemreap",
  nameFontSize: 72,
  dateStyle: "strip",
  numberStyle: "classic",
  dateTextStyle: "classic",
  animation: true,
  mapUrl: "https://maps.google.com/?q=Rosewood+Phnom+Penh",
  abaUrl: "https://pay.ababank.com/demo",
  abaQrUrl: "",
  musicUrl: "",
  photoUrls: "",
  videoUrl: "",
  backgroundUrl: ""
};

export const defaultGuests: Guest[] = [];

export const themeNames = {
  heritage: "Baroque Gold",
  lotus: "Baroque Blush",
  ivory: "Ivory Palace",
  ruby: "Royal Ruby",
  midnight: "Midnight Gilded",
  garden: "Olive Chateau",
  modern: "Black Tie Gold",
  editorial: "Editorial Gold",
  pearl: "Pearl Baroque"
};

export const khmerFontNames: Record<KhmerFontId, string> = {
  serif: "Noto Serif Khmer",
  sans: "Noto Sans Khmer",
  battambang: "Battambang",
  kantumruy: "Kantumruy Pro",
  siemreap: "Siemreap",
  moul: "Moul"
};
