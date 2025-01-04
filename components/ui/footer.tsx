'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GitHubIcon } from '@/components/icons/github-icon'
import { XIcon } from '@/components/icons/x-icon'
import { DiscordIcon } from '@/components/icons/discord-icon'
import { HeartIcon } from 'lucide-react'

export function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDarkMode = theme === 'dark'

  return (
    <footer className={`mt-20 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 shadow-[0_-2px_6px_rgba(0,0,0,0.08)]' 
        : 'bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.03)]'
    }`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6 py-6">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            building this with <Link href="https://www.vibes.game" target="_blank" rel="noopener noreferrer" className="inline-block hover:-translate-y-0.5 transition-transform"><HeartIcon className="w-4 h-4 inline-block fill-blue-500 text-blue-500" /></Link> for the community
          </span>
          
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/zhambalov/vibesdecks"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="GitHub"
            >
              <div className="p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                <GitHubIcon size={18} />
              </div>
            </Link>
            <Link
              href="https://discordapp.com/users/issaeternal"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Discord"
            >
              <div className="p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                <DiscordIcon size={18} />
              </div>
            </Link>
            <Link
              href="https://x.com/0xnmd"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="X (Twitter)"
            >
              <div className="p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                <XIcon size={18} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}