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
  title: "XMaster Online - Desi Sex Videos",
  description: "Watch free desi sex videos, desi gf sex, desi xxx content on XMaster Online. Explore hot desi adult videos and more.",
  keywords: [
    "desi", "desi sex", "desi gf sex", "desi xxx", "indian sex", "hindi porn", "bhabhi sex", "aunty sex", "indian gf", "desi bhabhi", "hot desi", "desi videos", "adult videos", "xmaster online",
    "desi porn", "indian porn", "desi sex videos", "free desi sex", "desi gf porn", "desi xxx videos", "indian sex clips", "hindi sex videos", "bhabhi porn", "aunty porn", "indian gf sex",
    "desi bhabhi sex", "hot desi porn", "desi adult videos", "xmaster desi", "desi hot sex", "indian hot porn", "desi gf videos", "desi xxx free", "indian sex free", "hindi porn free",
    "bhabhi sex videos", "aunty sex videos", "indian gf porn", "desi bhabhi videos", "hot desi videos", "desi sex clips", "indian porn videos", "desi gf free", "desi xxx clips",
    "indian sex online", "hindi sex online", "bhabhi porn online", "aunty porn online", "indian gf online", "desi bhabhi online", "hot desi online", "desi videos online", "adult videos online",
    "xmaster online desi", "desi sex site", "indian sex site", "desi gf sex site", "desi xxx site", "indian porn site", "hindi porn site", "bhabhi sex site", "aunty sex site",
    "indian gf site", "desi bhabhi site", "hot desi site", "desi videos site", "adult videos site", "xmaster site", "desi hot videos", "indian hot videos", "desi gf clips",
    "desi xxx free videos", "indian sex free videos", "hindi porn free videos", "bhabhi sex free videos", "aunty sex free videos", "indian gf free videos", "desi bhabhi free videos",
    "hot desi free videos", "desi sex free clips", "indian porn free clips", "desi gf free clips", "desi xxx free clips", "indian sex online videos", "hindi sex online videos",
    "bhabhi porn online videos", "aunty porn online videos", "indian gf online videos", "desi bhabhi online videos", "hot desi online videos", "desi videos online free",
    "adult videos online free", "xmaster online free", "desi sex watch", "indian sex watch", "desi gf sex watch", "desi xxx watch", "indian porn watch", "hindi porn watch",
    "bhabhi sex watch", "aunty sex watch", "indian gf watch", "desi bhabhi watch", "hot desi watch", "desi videos watch", "adult videos watch", "xmaster watch",
    "desi hot sex videos", "indian hot sex videos", "desi gf sex videos", "desi xxx sex videos", "indian sex porn videos", "hindi sex porn videos", "bhabhi sex porn videos",
    "aunty sex porn videos", "indian gf porn videos", "desi bhabhi porn videos", "hot desi porn videos", "desi adult porn videos", "xmaster porn videos", "desi free porn",
    "indian free porn", "desi gf free porn", "desi xxx free porn", "indian sex free porn", "hindi porn free porn", "bhabhi sex free porn", "aunty sex free porn",
    "indian gf free porn", "desi bhabhi free porn", "hot desi free porn", "desi videos free porn", "adult videos free porn", "xmaster free porn"
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://xmaster.online",
  },
  openGraph: {
    title: "XMaster Online - Desi Sex Videos",
    description: "Watch free desi sex videos, desi gf sex, desi xxx content on XMaster Online.",
    url: "https://xmaster.online",
    siteName: "XMaster Online",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XMaster Online - Desi Sex Videos",
    description: "Watch free desi sex videos, desi gf sex, desi xxx content on XMaster Online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
