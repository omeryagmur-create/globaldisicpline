import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "Global Discipline Engine - Master Your Exam Prep",
    template: "%s | Global Discipline Engine"
  },
  description: "Track, compete, and excel with the world's first discipline-first study platform. Join 10,000+ students mastering their goals.",
  keywords: ["study app", "focus timer", "exam prep", "leaderboard", "study planner", "productivity"],
  authors: [{ name: "Global Discipline Team" }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globaldiscipline.com',
    siteName: 'Global Discipline Engine',
    title: 'Global Discipline Engine - Master Your Exam Prep',
    description: 'Track, compete, and excel with the world\'s first discipline-first study platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Global Discipline Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Discipline Engine',
    description: 'Track, compete, and excel with the world\'s first discipline-first study platform.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
