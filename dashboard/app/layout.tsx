import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rank Radar",
  description: "Energiecontract-rankings over 6 Nederlandse vergelijkers",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // Browser extensions (dark readers, translators, password managers) often
      // inject classes/attributes into <html> before React hydrates, producing a
      // false-positive mismatch warning. This suppresses attribute warnings on
      // this element only; content mismatches elsewhere still surface.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
