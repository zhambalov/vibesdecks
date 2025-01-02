'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { DeckCollection } from '@/components/deck-collection';
import { CategoryNav } from '@/components/ui/categorynav';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all'); // Default category
  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  return (
    <main>
      {/* Featured Collections */}
      <section className="max-w-6xl mx-auto w-full px-4 py-6">
        <h2 className="text-lg font-medium mb-4">⭐ Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Add your featured collections logic or static data */}
          <div
            className={`p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${
              isDarkMode ? 'bg-blue-900 text-gray-100' : 'bg-blue-100 text-gray-800'
            }`}
          >
            <h3 className="font-medium mb-1">Penguin School 📚</h3>
            <p className="text-sm">5 decks</p>
          </div>
          <div
            className={`p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${
              isDarkMode ? 'bg-green-900 text-gray-100' : 'bg-green-100 text-gray-800'
            }`}
          >
            <h3 className="font-medium mb-1">Smol Fish 🐟</h3>
            <p className="text-sm">3 decks</p>
          </div>
          <div
            className={`p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${
              isDarkMode ? 'bg-red-900 text-gray-100' : 'bg-red-100 text-gray-800'
            }`}
          >
            <h3 className="font-medium mb-1">Trending rn 🔥</h3>
            <p className="text-sm">4 decks</p>
          </div>
          <div
            className={`p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${
              isDarkMode ? 'bg-purple-900 text-gray-100' : 'bg-purple-100 text-gray-800'
            }`}
          >
            <h3 className="font-medium mb-1">Galaxy Brain 🧠</h3>
            <p className="text-sm">6 decks</p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Deck Collection */}
      <DeckCollection activeCategory={activeCategory} />
    </main>
  );
}
