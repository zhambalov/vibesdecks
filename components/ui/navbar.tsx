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
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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
   <header className="sticky top-0 z-50 border-b transition-colors duration-200 bg-background/60 border-border/20 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-opacity-50">
     <nav className="container-lg flex items-center justify-between h-16 px-4">
       <div className="flex items-center gap-6">
         <Link href="/" className="flex items-center gap-2">
           <Image
             src="/logo.svg"
             alt="VibesDecks"
             width={32}
             height={32}
             className="w-8 h-8"
           />
           <span className="font-bold text-foreground">VibesDecks</span>
         </Link>
       </div>

       <div className="flex items-center gap-3">
         {/* Search button */}
         <Button
           variant="ghost"
           size="icon"
           onClick={() => setIsSearchOpen(true)}
           className="text-muted-foreground hover:text-foreground"
         >
           <Search className="h-5 w-5" />
         </Button>

         {/* Theme toggle */}
         <Button
           variant="ghost"
           size="icon"
           onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
           className="text-muted-foreground hover:text-foreground"
         >
           <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
           <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
         </Button>

         {/* User profile or sign in */}
         {username ? (
           <UserProfile username={username} onLogout={logout} />
         ) : (
           <Button
             variant="ghost"
             size="sm"
             asChild
             className="text-muted-foreground hover:text-foreground"
           >
             <Link href="/api/auth/signin">Sign in</Link>
           </Button>
         )}
       </div>
     </nav>

     {/* Search dialog */}
     <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
       <DialogContent className="bg-background border-border">
         <div className="flex items-center gap-2 mb-4">
           <Search className="h-5 w-5 text-muted-foreground" />
           <input
             type="text"
             placeholder="Search decks..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
           />
         </div>

         {searchResults.length > 0 ? (
           <div className="space-y-2">
             {searchResults.map((deck) => (
               <Link
                 key={deck.id}
                 href={`/decks/${deck.id}`}
                 className="block p-2 rounded-md hover:bg-muted/50"
                 onClick={() => setIsSearchOpen(false)}
               >
                 <div className="flex items-center gap-2">
                   <span className="text-foreground">{deck.title}</span>
                   <span className="text-sm text-muted-foreground">by {deck.author.username}</span>
                 </div>
               </Link>
             ))}
           </div>
         ) : searchQuery ? (
           <div className="text-center text-muted-foreground">
             No decks found
           </div>
         ) : null}
       </DialogContent>
     </Dialog>
   </header>
 )
}