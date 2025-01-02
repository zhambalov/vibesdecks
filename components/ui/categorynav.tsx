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
  
  // Prevent hydration mismatch by mounting theme-dependent content on client only
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const categories = [
    { id: 'all', label: 'All decks' },
    {
      id: 'mixed',
      label: 'Mixed',
      circle: (
        <div className="relative w-3 h-3">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(255,0,0,0.5), rgba(255,165,0,0.5), rgba(255,255,0,0.5), rgba(0,255,0,0.5), rgba(0,255,255,0.5), rgba(0,0,255,0.5), rgba(255,0,255,0.5), rgba(255,0,0,0.5))',
              filter: 'blur(1.5px)', 
            }}
          />
        </div>
      )
    },
    { id: 'red', label: 'Red', color: 'bg-red-500' },
    { id: 'yellow', label: 'Yellow', color: 'bg-yellow-400' },
    { id: 'green', label: 'Green', color: 'bg-green-500' },
    { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', label: 'Purple', color: 'bg-purple-500' }
  ];

  // Return early if not mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-5 px-3 py-2 rounded-full bg-white shadow-sm">
          {categories.map((category) => (
            <button
              key={category.id}
              className="relative px-3.5 py-1.5 rounded-full flex items-center gap-2 text-slate-600"
            >
              {category.circle ? (
                category.circle
              ) : (
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
              )}
              {category.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const isDarkMode = theme === 'dark'

  return (
    <div className="flex justify-center mb-8">
      <div className={`inline-flex items-center gap-5 px-3 py-2 rounded-full ${
        isDarkMode ? 'bg-gray-900 shadow-md' : 'bg-white shadow-sm'
      }`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`relative px-3.5 py-1.5 transition-all rounded-full flex items-center gap-2 ${
              activeCategory === category.id 
                ? isDarkMode
                  ? 'text-white bg-gray-800' 
                  : 'text-slate-900 bg-slate-100'
                : isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {category.circle ? (
              category.circle
            ) : (
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
            )}
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}