import type { Metadata } from "next";
import "./globals.css";
import { Space_Mono, JetBrains_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Watch & Learn | Convert Screen Recordings into Skills",
  description:
    "Upload a screen recording and watch Watch & Learn transform it into an executable skill package with full transparency."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
