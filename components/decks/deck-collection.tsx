'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/card'
import type { Deck, Like } from '@prisma/client'
import Link from 'next/link'
import { EyeIcon, HeartIcon } from 'lucide-react'

interface DeckWithAuthor extends Deck {
  author: {
    username: string
  }
  likes: Like[]
}

type SortOption = 'recent' | 'popular'

export function DeckCollection({ 
  activeCategory, 
  searchQuery = '' 
}: { 
  activeCategory: string
  searchQuery?: string 
}) {
  const [decks, setDecks] = useState<DeckWithAuthor[]>([])
  const [filteredDecks, setFilteredDecks] = useState<DeckWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const { theme } = useTheme()

  useEffect(() => {
    async function fetchDecks() {
      try {
        const url = searchQuery 
          ? `/api/decks/search?q=${encodeURIComponent(searchQuery)}`
          : '/api/decks'
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch decks')
        const data = await response.json()
        setDecks(data)
        setFilteredDecks(data)
      } catch (error) {
        console.error('Error fetching decks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecks()
  }, [searchQuery])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...decks]

    // Apply color filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(deck => 
        deck.color === activeCategory.toUpperCase()
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.likes.length - a.likes.length
      }
    })

    setFilteredDecks(filtered)
  }, [decks, activeCategory, sortBy])

  const isDarkMode = theme === 'dark'

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 h-24 animate-pulse bg-gray-800/50" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-4 py-4 sm:py-6">
      <div className="flex justify-start items-center mb-4 sm:mb-6">
        <div className={`w-full sm:w-auto inline-flex rounded-full p-1 ${
          isDarkMode 
            ? 'bg-white/[0.03] border border-white/[0.08]' 
            : 'bg-gray-100/50 border border-gray-200/50'
        }`}>
          <button
            onClick={() => setSortBy('recent')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              sortBy === 'recent'
                ? isDarkMode
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                  : 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-gray-900'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              sortBy === 'popular'
                ? isDarkMode
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                  : 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-gray-900'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Most Popular
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 mb-16 sm:mb-24">
        {filteredDecks.map((deck) => (
          <Link href={`/decks/${deck.id}`} key={deck.id} className="block">
            <Card 
              className={`p-4 sm:p-6 transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-gray-800 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)]' 
                  : 'bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.12)]'
              }`}
            >
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Title Row */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold">{deck.title}</h3>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    deck.color === 'RED' ? 'bg-red-500' :
                    deck.color === 'BLUE' ? 'bg-blue-500' :
                    deck.color === 'GREEN' ? 'bg-green-500' :
                    deck.color === 'YELLOW' ? 'bg-yellow-500' :
                    deck.color === 'PURPLE' ? 'bg-purple-500' :
                    'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                  }`} />
                </div>

                {/* Author and Dates */}
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{deck.author.username}</span>
                  <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm text-muted-foreground">
                    <span>Created {new Date(deck.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                    {deck.updatedAt > deck.createdAt && (
                      <span>Last updated {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <HeartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" /> {deck.likes.length}
                  </span>
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {deck.views}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}