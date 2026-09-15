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
      <body>
        <WeddingProvider>{children}</WeddingProvider>
      </body>
    </html>
  );
}
