'use client'

import { CategoryNav } from "@/components/ui/categorynav"
import { useState } from "react"

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      <div className="pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <CategoryNav 
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isDarkMode={false}  
          />
        </div>
      </div>
    </main>
  )
}