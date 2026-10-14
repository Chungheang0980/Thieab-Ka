import type { Metadata } from "next";
import "./globals.css";
import { WeddingProvider } from "@/components/WeddingProvider";

export const metadata: Metadata = {
  title: "ធៀបការ | Thieab Ka",
  description: "Cambodian digital wedding invitations, RSVP, and lucky draw."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Cormorant+Garamond:wght@500;600;700&family=Kantumruy+Pro:wght@400;500;600;700&family=Moul&family=Noto+Sans+Khmer:wght@400;500;600;700&family=Noto+Serif+Khmer:wght@400;500;600;700&family=Siemreap&display=swap"
        />
      </head>
      <body>
        <WeddingProvider>{children}</WeddingProvider>
      </body>
    </html>
  );
}
