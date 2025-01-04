'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

interface CategoryNavProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryNav({ activeCategory, setActiveCategory }: CategoryNavProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = theme === 'dark'
  
  const categories = [
    { id: 'all', label: 'All decks' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'red', label: 'Red', color: 'bg-red-500' },
    { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { id: 'yellow', label: 'Yellow', color: 'bg-yellow-400' },
    { id: 'green', label: 'Green', color: 'bg-green-500' },
    { id: 'purple', label: 'Purple', color: 'bg-purple-500' }
  ];

  if (!mounted) {
    return (
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-5 px-3 py-2 rounded-full bg-white shadow-sm">
          {categories.map((category) => (
            <button
              key={category.id}
              className="relative px-3.5 py-1.5 rounded-full flex items-center justify-center gap-2 min-w-[80px] text-slate-600"
            >
              {category.color && <div className={`w-3 h-3 rounded-full ${category.color}`} />}
              {category.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mb-8">
      <div className={`inline-flex items-center gap-6 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
        isDarkMode 
          ? 'bg-gray-900/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]' 
          : 'bg-white/90 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)]'
      }`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`relative px-3.5 py-1.5 transition-all duration-200 rounded-full flex items-center justify-center gap-2 min-w-[80px] ${
              activeCategory === category.id 
                ? isDarkMode
                  ? 'text-white bg-white/[0.08] shadow-[0_0_1px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-900 bg-slate-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
            }`}
          >
            {category.color && <div className={`w-3 h-3 rounded-full ${category.color}`} />}
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}