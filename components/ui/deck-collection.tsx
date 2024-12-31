'use client'

import { useState, useEffect } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  const featuredCategories: FeaturedCategory[] = [
    { id: 'beginner', title: 'Penguin School 📚', count: 5, color: isDarkMode ? 'bg-green-900/30' : 'bg-green-100' },
    { id: 'budget', title: 'Smol Fish 🐟', count: 3, color: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100' },
    { id: 'weekly', title: "Trending rn 🔥", count: 4, color: isDarkMode ? 'bg-red-900/30' : 'bg-red-100' },
    { id: 'creative', title: 'Galaxy Brain 🧠', count: 6, color: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100' }
  ]

  useEffect(() => {
    async function fetchDecks() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedFilter !== 'all') {
          params.append('color', selectedFilter)
        }
        if (searchQuery) {
          params.append('search', searchQuery)
        }

        const response = await fetch(`/api/decks?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch decks')
        const data = await response.json()
        setDecks(data)
      } catch (error) {
        console.error('Error fetching decks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecks()
  }, [selectedFilter, searchQuery])

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' : 
                   'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      <header className={`sticky top-0 z-50 border-b ${
        isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                     'bg-white/90 border-gray-200'
      } backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">vibesdecks</h1>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>by pudgy frens 🧊</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <Input
                type="text"
                placeholder="Find decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 rounded-full"
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button className="rounded-full">
              sign up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Featured Categories */}
        <section className="mb-10">
          <h2 className="text-lg font-medium mb-4">⭐️ Featured Collections</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {featuredCategories.map(category => (
              <div 
                key={category.id}
                className={`flex-none p-4 rounded-xl ${category.color} hover:shadow-md transition-all cursor-pointer min-w-48`}
              >
                <h3 className="font-medium mb-1">{category.title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category.count} decks
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all
                  ${selectedFilter === filter.id 
                    ? isDarkMode 
                      ? 'bg-gray-800 ring-1 ring-gray-700' 
                      : 'bg-gray-100 ring-1 ring-gray-200'
                    : isDarkMode
                      ? 'hover:bg-gray-800/50'
                      : 'hover:bg-gray-50'}`}
              >
                <span className={`w-2 h-2 rounded-full ${filter.dotColor}`}></span>
                <span className="whitespace-nowrap">{filter.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Deck Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className={`p-4 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
                <div className="h-4 w-full bg-gray-700 rounded" />
              </Card>
            ))
          ) : decks.map(deck => (
            <Card 
              key={deck.id} 
              className={`p-4 hover:shadow-lg transition-all cursor-pointer rounded-xl
                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {deck.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    by {deck.author.name}
                  </p>
                </div>
                <span className={`w-3 h-3 rounded-full ${
                  deck.color === 'red' ? 'bg-red-500' :
                  deck.color === 'blue' ? 'bg-blue-500' :
                  deck.color === 'green' ? 'bg-green-500' :
                  deck.color === 'yellow' ? 'bg-yellow-500' :
                  deck.color === 'purple' ? 'bg-purple-500' :
                  'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                }`}></span>
              </div>
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {deck.description}
              </p>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex gap-3`}>
                <span>❤️ {deck.likes}</span>
                <span>👀 {deck.views}</span>
              </div>
            </Card>
          ))}
        </section>
      </main>

      <footer className={`border-t mt-12 ${
        isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                     'bg-white/90 border-gray-200'
      } backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              made with 💙 by vibes enjoyer
            </div>
            <div className="flex gap-6">
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                discord
              </a>
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}