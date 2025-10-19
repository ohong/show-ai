import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { WindowManagerProvider } from "@/lib/context/WindowManagerContext";

export const metadata: Metadata = {
  title: "Show AI - Teach AI agents new skills by showing",
  description: "Convert screen recordings into executable AI skill packages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <WindowManagerProvider>
            {children}
          </WindowManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
