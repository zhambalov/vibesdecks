'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AuthPopovers } from '@/components/authpopovers' 

export function NavBar() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

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
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">vibesdecks</h1>
          <span className={`text-sm px-2 py-0.5 rounded-full ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>by pudgy fren 🧊</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Find decks..."
              className={`pl-9 pr-4 py-2 w-48 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                ${isDarkMode ? 
                  'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400' : 
                  'bg-white border-gray-200'}`}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`rounded-full ${
              isDarkMode ? 'text-gray-300 hover:text-white' : 
                          'text-gray-600 hover:text-gray-900'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <AuthPopovers />  {/* Fixed component name */}
        </div>
      </div>
    </header>
  )
}