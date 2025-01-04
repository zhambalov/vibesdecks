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
  title: 'Vibes Decks',
  description: 'Create, Share & Explore Decks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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