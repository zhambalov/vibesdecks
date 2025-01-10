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
    { id: 'all', label: 'All', mobileLabel: 'All' },
    { id: 'mixed', label: 'Mixed', mobileLabel: 'Mixed' },
    { id: 'red', label: 'Red', mobileLabel: 'Red', color: 'bg-red-500' },
    { id: 'blue', label: 'Blue', mobileLabel: 'Blue', color: 'bg-blue-500' },
    { id: 'yellow', label: 'Yellow', mobileLabel: 'Yellow', color: 'bg-yellow-400' },
    { id: 'green', label: 'Green', mobileLabel: 'Green', color: 'bg-green-500' },
    { id: 'purple', label: 'Purple', mobileLabel: 'Purple', color: 'bg-purple-500' }
  ];

  if (!mounted) {
    return (
      <div className="flex justify-center mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 sm:gap-5 px-2 sm:px-3 py-2 rounded-full bg-white shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              className="relative px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px] text-sm sm:text-base text-slate-600 shrink-0"
            >
              {category.color && <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${category.color}`} />}
              <span className="sm:hidden">{category.mobileLabel}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mb-6 sm:mb-8 px-4 sm:px-0">
      <div className={`inline-flex items-center gap-2 sm:gap-6 px-2 sm:px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 w-full sm:w-auto overflow-x-auto no-scrollbar ${
        isDarkMode 
          ? 'bg-gray-900/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]' 
          : 'bg-white/90 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)]'
      }`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`relative px-2.5 sm:px-3.5 py-1.5 transition-all duration-200 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px] shrink-0 text-sm sm:text-base ${
              activeCategory === category.id 
                ? isDarkMode
                  ? 'text-white bg-white/[0.08] shadow-[0_0_1px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-900 bg-slate-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
            }`}
          >
            {category.color && <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${category.color}`} />}
            <span className="sm:hidden">{category.mobileLabel}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Add this at the end of your global CSS file or in a style tag
// This removes the scrollbar but keeps the scrolling functionality
const styles = `
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
`;