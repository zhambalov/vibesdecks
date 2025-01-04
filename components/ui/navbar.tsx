// components/ui/navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Search } from 'lucide-react'
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
   <header className={`sticky top-0 z-50 border-b ${
     isDarkMode ? 'bg-gray-900/90 border-gray-700' : 
                  'bg-white/90 border-gray-200'
   } backdrop-blur-md`}>
     <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
       <div className="flex items-center gap-4">
         <Link href="/">
           <h1 className="text-2xl font-bold tracking-tight">vibesdecks</h1>
         </Link>
         <span className={`text-sm font-medium px-3 py-1 rounded-full ${
           isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-700'
         }`}>
           by pudgy frens 🧊
         </span>
       </div>
       
       <div className="flex items-center h-full gap-4">
         {username && (
           <Link href="/decks/new">
             <Button variant="outline">Create Deck</Button>
           </Link>
         )}
         
         <div className="relative">
           <form onSubmit={(e) => e.preventDefault()} className="relative">
             <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`} />
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Find decks..."
               className={`pl-10 pr-4 py-2.5 w-64 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                 ${isDarkMode ? 
                   'bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400' : 
                   'bg-gray-50/70 border-gray-200 placeholder:text-gray-500'}`}
             />
           </form>

           {(searchQuery && searchResults.length > 0) && (
             <div className={`absolute top-full mt-2 w-96 rounded-lg shadow-lg border ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
             }`}>
               <div className="p-2 max-h-96 overflow-y-auto">
                 {searchResults.map((deck) => (
                   <Link 
                     key={deck.id} 
                     href={`/decks/${deck.id}`}
                     className="block"
                     onClick={() => setSearchQuery('')}
                   >
                     <Card className={`p-3 mb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                       isDarkMode ? 'bg-gray-900' : 'bg-white'
                     }`}>
                       <div className="flex items-center justify-between">
                         <h3 className="font-medium">{deck.title}</h3>
                         <span className={`w-2 h-2 rounded-full ${
                           deck.color === 'RED' ? 'bg-red-500' :
                           deck.color === 'BLUE' ? 'bg-blue-500' :
                           deck.color === 'GREEN' ? 'bg-green-500' :
                           deck.color === 'YELLOW' ? 'bg-yellow-500' :
                           deck.color === 'PURPLE' ? 'bg-purple-500' :
                           'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                         }`} />
                       </div>
                       <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                         by {deck.author.username}
                       </p>
                     </Card>
                   </Link>
                 ))}
               </div>
             </div>
           )}
         </div>
         
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
     </div>
   </header>
 )
}