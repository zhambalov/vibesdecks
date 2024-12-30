'use client'

import Link from "next/link"
import { Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function NavBar() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <nav className={`px-6 py-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-medium">
          Vibes Decks
          <span className="text-sm text-sky-400 ml-2">by Pudgy Penguins</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search..."
              className={`pl-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} border-0`}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <Button variant="ghost" className="text-sm font-normal">Log in</Button>
          <Button variant="outline" className="text-sm font-normal">Sign up</Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}