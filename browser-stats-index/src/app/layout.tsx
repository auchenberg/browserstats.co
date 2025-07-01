import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Browser Stats Index - Comprehensive Browser Usage Analytics",
  description: "Real-time browser market share data and analytics from multiple sources including Wikipedia, NetMarketShare, Analytics.usa.gov, and more. Track browser trends and usage statistics globally.",
  keywords: "browser stats, market share, browser analytics, web browser usage, Chrome, Firefox, Safari, Edge, Internet Explorer",
  openGraph: {
    title: "Browser Stats Index",
    description: "Comprehensive browser usage analytics and market share data",
    type: "website",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
