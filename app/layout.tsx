import { Footer } from '@/components/ui/footer'
import { NavBar } from '@/components/ui/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
    template: '%s | VibesDecks - Vibes TCG'
  },
  description: 'Create and share Vibes TCG decks. The official deck builder for Pudgy Penguins Vibes trading card game. Build, discover, and share your favorite Vibes decks with the community.',
  keywords: ['Vibes TCG', 'Pudgy Penguins Vibes', 'Vibes Decks', 'deck builder', 'trading card game', 'Pudgy Penguins', 'TCG deck sharing'],
  authors: [{ name: 'pudgy frens' }],
  metadataBase: new URL('https://vibesdecks.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibesdecks.com',
    siteName: 'VibesDecks - Vibes TCG',
    title: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
    description: 'Create and share Vibes TCG decks. The official deck builder for Pudgy Penguins Vibes trading card game.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
    description: 'Create and share Vibes TCG decks. The official deck builder for Pudgy Penguins Vibes trading card game.',
    images: ['/og-image.png']
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
    google: 'your-google-site-verification',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' }
    ]
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFF' },
    { media: '(prefers-color-scheme: dark)', color: '#020817' }
  ],
  appleWebApp: {
    title: 'VibesDecks - Vibes TCG',
    statusBarStyle: 'default',
    capable: true
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className={`min-h-screen flex flex-col ${
              'dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 ' +
              'bg-gradient-to-b from-[#FAFBFF] to-[#FCFDFF]'
            }`}>
              <NavBar />
              <main className="flex-1">
                {children}
                <Analytics />
                <SpeedInsights />
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}