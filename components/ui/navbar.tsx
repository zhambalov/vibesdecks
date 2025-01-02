'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AuthPopovers } from '@/components/authpopovers'
import { UserProfile } from '@/components/user-profile'
import { useAuth } from '@/contexts/auth-context'

export function NavBar() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { username, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDarkMode = theme === 'dark'

  return (
    <header className={`sticky top-0 z-50 border-b ${
      isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                   'bg-white/90 border-gray-200'
    } backdrop-blur-md`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">vibesdecks</h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-700'
          }`}>
            by pudgy fren 🧊
          </span>
        </div>
        
        <div className="flex items-center h-full">
          <div className="relative flex items-center h-full mr-8">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Find decks..."
                className={`pl-10 pr-4 py-2.5 w-64 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                  ${isDarkMode ? 
                    'bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400' : 
                    'bg-gray-50/70 border-gray-200 placeholder:text-gray-500'}`}
              />
            </div>
          </div>
          
          <div className="flex items-center h-full">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`rounded-full w-10 h-10 mr-6 flex items-center justify-center ${
                isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 
                            'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center h-full">
              {username ? (
                <UserProfile username={username} onLogout={logout} />
              ) : (
                <AuthPopovers />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}