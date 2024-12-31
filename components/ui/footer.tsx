'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GitHubIcon } from '@/components/icons/github-icon'
import { XIcon } from '@/components/icons/x-icon'
import { DiscordIcon } from '@/components/icons/discord-icon'

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
    <footer className={`border-t ${
      isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'
    } backdrop-blur-sm py-8`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-center gap-6">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            building this with <span className="text-blue-500">💙</span> for the community
          </span>
          
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/zhambalov/vibesdecks"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="GitHub"
            >
              <GitHubIcon size={18} />
            </Link>
            <Link
              href="https://discordapp.com/users/issaeternal"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Discord"
            >
              <DiscordIcon size={18} />
            </Link>
            <Link
              href="https://x.com/0xAldar"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:-translate-y-0.5 transition-all duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="X (Twitter)"
            >
              <XIcon size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}