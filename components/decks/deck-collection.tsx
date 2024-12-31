'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Moon, Sun, Search } from 'lucide-react'
import type { Deck, Filter, FeaturedCategory } from '@/app/types'

const filters: Filter[] = [
  { id: 'all', label: 'All decks', dotColor: 'bg-gray-400' },
  { id: 'mixed', label: 'Mixed', dotColor: 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500' },
  { id: 'red', label: 'Red', dotColor: 'bg-red-500' },
  { id: 'yellow', label: 'Yellow', dotColor: 'bg-yellow-500' },
  { id: 'green', label: 'Green', dotColor: 'bg-green-500' },
  { id: 'blue', label: 'Blue', dotColor: 'bg-blue-500' },
  { id: 'purple', label: 'Purple', dotColor: 'bg-purple-500' }
]

export function DeckCollection() {
  const [selectedFilter, setSelectedFilter] = useState<Filter['id']>('all')
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  const featuredCategories: FeaturedCategory[] = [
    { id: 'beginner', title: 'Penguin School 🎓', count: 5, color: isDarkMode ? 'bg-green-900/30' : 'bg-green-100' },
    { id: 'budget', title: 'Smol Fish 🐟', count: 3, color: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100' },
    { id: 'weekly', title: "Trending rn 🔥", count: 4, color: isDarkMode ? 'bg-red-900/30' : 'bg-red-100' },
    { id: 'creative', title: 'Galaxy Brain 🧠', count: 6, color: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100' }
  ]

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' : 
                   'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      <header className={`sticky top-0 z-50 border-b ${
        isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                     'bg-white/90 border-gray-200'
      } backdrop-blur-md`}>
        {/* Header content */}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Main content */}
      </main>

      <footer className={`border-t mt-12 ${
        isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                     'bg-white/90 border-gray-200'
      } backdrop-blur-md`}>
        {/* Footer content */}
      </footer>
    </div>
  )
}