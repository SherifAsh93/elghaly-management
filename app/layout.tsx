
import React from "react";
import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام أبناء الغالي للإدارة",
  description: "نظام إدارة المخازن والمبيعات المتكامل - أبناء الغالي",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="https://scontent.faly1-2.fna.fbcdn.net/v/t39.30808-1/518327138_1244906727646012_8662475096945791827_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=We9R9jSetugQ7kNvwEoJa9o&_nc_oc=AdkidbQ8pmV5D1zQ56nQFj6DGEKjFUEcSTgDMF-HZpBHgF_ELDJLkhYwx5ugk9eU34U&_nc_zt=24&_nc_ht=scontent.faly1-2.fna&_nc_gid=9VJWPZ_jzj7o0QT7d17kaA&oh=00_AfoojzV10jM-c_w1wp9H2aNrntnyELub43mpuG6yWC-2tg&oe=6969B030" />
      </head>
      <body className={`${cairo.variable} font-sans antialiased bg-[#f8fafc] selection:bg-orange-100 selection:text-orange-900`}>
        {children}
      </body>
    </html>
  );
}
