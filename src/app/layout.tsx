import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const SITE_NAME = "Цахирмаа Boutique";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsahirmaa.mn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Дэгжин загварын онлайн дэлгүүр`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Эмэгтэйчүүдийн дэгжин хувцас, гоёл чимэглэлийн premium онлайн дэлгүүр. Улаанбаатар хотод шуурхай хүргэлт, QPay болон бүх банкны төлбөр.",
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Дэгжин загварын онлайн дэлгүүр`,
    description:
      "Эмэгтэйчүүдийн дэгжин хувцасны premium онлайн дэлгүүр. Шуурхай хүргэлт, найдвартай төлбөр.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#181419" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        {/*
          Fonts are loaded via Google Fonts CDN for now.
          TODO (deploy): switch to next/font/google self-hosting for
          zero-CLS font loading once building on a network with access
          to fonts.googleapis.com.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Prata&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
