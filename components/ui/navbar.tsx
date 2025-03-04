// components/ui/navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Search, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AuthPopovers } from '@/components/authpopovers'
import { UserProfile } from '@/components/user-profile'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { Card } from "@/components/ui/card"
import type { Deck, Like } from '@prisma/client'

interface DeckWithAuthor extends Deck {
  author: {
    username: string;
  }
  likes: Like[];
}

export function NavBar() {
  const [mounted, setMounted] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { username, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const [searchResults, setSearchResults] = useState<DeckWithAuthor[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch) {
        setSearchResults([])
        return
      }
      
      try {
        const response = await fetch(`/api/decks/search?q=${encodeURIComponent(debouncedSearch)}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Search error:', error)
      }
    }

    performSearch()
  }, [debouncedSearch])

  if (!mounted) return null

  const isDarkMode = theme === 'dark'

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-900/60 border-gray-800/20' 
        : 'bg-white/60 border-gray-200/20'
    } backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-opacity-50`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/">
            <div className="flex flex-col sm:block">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">vibesdecks</h1>
              <span className={`sm:hidden text-xs ${
                isDarkMode ? 'text-blue-300/70' : 'text-blue-600/70'
              }`}>by pudgy frens 🧊</span>
            </div>
          </Link>
          <span className={`hidden sm:inline-block text-sm font-medium px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-700'
          }`}>
            by pudgy frens 🧊
          </span>
        </div>

        <div className="flex items-center h-full gap-2 sm:gap-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden rounded-full w-10 h-10"
              onClick={() => {
                if (isSearchOpen) {
                  setIsSearchOpen(false)
                } else {
                  setIsMobileMenuOpen(false)
                  setIsSearchOpen(true)
                }
              }}
            >
              {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>

            <form onSubmit={(e) => e.preventDefault()} className="relative hidden sm:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find decks..."
                className={`pl-8 pr-3 py-2 w-48 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm
                  ${isDarkMode ? 
                    'bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400' : 
                    'bg-gray-50/70 border-gray-200 placeholder:text-gray-500'}`}
              />
              
              {/* Search Results Popup */}
              {searchQuery && (
                <div className={`absolute top-full mt-2 w-72 left-1/2 -translate-x-1/2 border rounded-lg shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-800/20 bg-gray-900/95' 
                    : 'border-gray-200/20 bg-white/95'
                } backdrop-blur-sm`}>
                  <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((deck) => (
                        <Link 
                          key={deck.id} 
                          href={`/decks/${deck.id}`}
                          className="block"
                          onClick={() => setSearchQuery('')}
                        >
                          <Card className={`p-2.5 mb-2 transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-800/40 hover:bg-gray-800/60' 
                              : 'bg-gray-50/40 hover:bg-gray-50/60'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <h3 className={`font-medium text-sm truncate ${
                                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>{deck.title}</h3>
                                <p className={`text-xs truncate ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>by {deck.author.username}</p>
                              </div>
                              <span className={`ml-2 flex-shrink-0 w-2 h-2 rounded-full ${
                                deck.color === 'RED' ? 'bg-red-500' :
                                deck.color === 'BLUE' ? 'bg-blue-500' :
                                deck.color === 'GREEN' ? 'bg-green-500' :
                                deck.color === 'YELLOW' ? 'bg-yellow-500' :
                                deck.color === 'PURPLE' ? 'bg-purple-500' :
                                'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                              }`} />
                            </div>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className={`text-sm p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No results found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            {username && (
              <Link href="/decks/new">
                <Button 
                  variant="outline" 
                  className={`transition-all duration-200 px-4 py-2 text-sm ${
                    isDarkMode 
                      ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.1] text-gray-300 hover:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Create Deck
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`rounded-full w-10 h-10 flex items-center justify-center ${
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false)
              } else {
                setIsSearchOpen(false)
                setIsMobileMenuOpen(true)
              }
            }}
            className="sm:hidden rounded-full w-10 h-10"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`sm:hidden border-t ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800/20' : 'bg-white/60 border-gray-200/20'
        } backdrop-blur-xl backdrop-saturate-150`}>
          <div className="px-4 py-2 flex items-center gap-3">
            {username && (
              <Link href="/decks/new" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                <Button 
                  variant="outline" 
                  className={`w-full transition-all duration-200 px-4 py-2 text-sm ${
                    isDarkMode 
                      ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.1] text-gray-300 hover:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Create Deck
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`rounded-full w-10 h-10 flex items-center justify-center ${
                isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 
                            'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {username ? (
              <UserProfile username={username} onLogout={logout} />
            ) : (
              <AuthPopovers />
            )}
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className={`sm:hidden fixed inset-x-0 top-16 border-t z-20 ${
          isDarkMode 
            ? 'border-gray-800/20 bg-gray-900' 
            : 'border-gray-200/20 bg-white'
        }`}>
          <form onSubmit={(e) => e.preventDefault()} className="px-4 py-2">
            <div className="relative max-w-[240px] mx-auto">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find decks..."
                className={`w-full rounded-lg border-0 focus:outline-none text-sm pl-8 pr-2.5 py-1.5 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white placeholder:text-gray-400' 
                    : 'bg-gray-50 text-gray-900 placeholder:text-gray-500'
                }`}
              />
            </div>
          </form>

          {(searchResults.length > 0 && searchQuery) && (
            <div className={`border-t ${
              isDarkMode 
                ? 'border-gray-800/20 bg-gray-900/95' 
                : 'border-gray-200/20 bg-white/95'
            } backdrop-blur-sm`}>
              <div className="max-w-[240px] mx-auto px-4 py-2 max-h-[60vh] overflow-y-auto">
                {searchResults.map((deck) => (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="block"
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearchOpen(false)
                    }}
                  >
                    <Card className={`p-2.5 mb-2 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800/40 hover:bg-gray-800/60' 
                        : 'bg-gray-50/40 hover:bg-gray-50/60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-medium text-sm truncate ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>{deck.title}</h3>
                          <p className={`text-xs truncate ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>by {deck.author.username}</p>
                        </div>
                        <span className={`ml-2 flex-shrink-0 w-2 h-2 rounded-full ${
                          deck.color === 'RED' ? 'bg-red-500' :
                          deck.color === 'BLUE' ? 'bg-blue-500' :
                          deck.color === 'GREEN' ? 'bg-green-500' :
                          deck.color === 'YELLOW' ? 'bg-yellow-500' :
                          deck.color === 'PURPLE' ? 'bg-purple-500' :
                          'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                        }`} />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}