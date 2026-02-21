import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'],
});

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
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans`} style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <LanguageSwitcher variant="floating" />
          </LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(224, 60%, 5%)',
                color: 'hsl(210, 40%, 98%)',
                border: '1px solid hsl(224, 32%, 12%)',
                borderRadius: '12px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(238, 84%, 67%)',
                  secondary: 'white',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
