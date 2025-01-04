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
  title: 'VibesDecks',
  description: 'Build and share your favorite decks',
  metadataBase: new URL('https://vibesdecks.com'),
  colorScheme: 'dark light',
  openGraph: {
    title: 'VibesDecks',
    description: 'Build and share your favorite decks',
    url: 'https://vibesdecks.com',
    siteName: 'VibesDecks',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibesDecks - Build and share your favorite decks'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibesDecks',
    description: 'Build and share your favorite decks',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = localStorage.getItem('theme') || (isDark ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
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