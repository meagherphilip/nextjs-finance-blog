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
  title: "Finance & Investing Blog | Build Wealth, Manage Money",
  description: "Learn to build wealth, manage money, and achieve financial freedom. Expert guides on investing, budgeting, retirement planning, and more.",
  keywords: ["finance", "investing", "money management", "retirement", "budgeting", "compound interest", "index funds", "FIRE movement"],
  authors: [{ name: "EM38Bot" }],
  openGraph: {
    title: "Finance & Investing Blog",
    description: "Learn to build wealth, manage money, and achieve financial freedom.",
    type: "website",
    url: "https://yourdomain.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance & Investing Blog",
    description: "Learn to build wealth, manage money, and achieve financial freedom.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
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
