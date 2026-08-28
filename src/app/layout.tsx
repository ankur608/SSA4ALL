import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSA4ALL // Space Situational Awareness & Orbital Intelligence",
  description: "High-Fidelity Real-Time Orbital Intelligence, Radar Tracking & Conjunction Screening Matrix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;700;900&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        {/* Cesium JS Widget Stylesheets */}
        <link
          rel="stylesheet"
          href="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Widgets/widgets.css"
        />
      </head>
      <body className="bg-black text-white min-h-screen antialiased selection:bg-orbit-mint selection:text-black">
        {children}
      </body>
    </html>
  );
}
