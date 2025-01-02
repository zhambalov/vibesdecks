'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import type { Deck } from '@/app/types';

export function DeckCollection({ activeCategory }: { activeCategory: string }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true; // To avoid state updates after unmounting
    async function fetchDecks() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/decks?category=${activeCategory}`);
        if (!response.ok) throw new Error('Failed to fetch decks');
        const data = await response.json();
        if (isMounted) {
          setDecks(data);
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDecks();

    return () => {
      isMounted = false; // Cleanup to avoid memory leaks
    };
  }, [activeCategory]);

  const isDarkMode = theme === 'dark';

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={`p-4 rounded-xl animate-pulse ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100'
              }`}
            >
              <div
                className={`h-6 w-3/4 rounded mb-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-4 w-1/2 rounded mb-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-4 w-full rounded ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
            </Card>
          ))
        : decks.map((deck) => (
            <Card
              key={deck.id}
              className={`p-4 hover:shadow-lg transition-all cursor-pointer rounded-xl ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{deck.title}</h3>
                  <p
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    by {deck.author.name}
                  </p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    deck.color === 'red'
                      ? 'bg-red-500'
                      : deck.color === 'blue'
                      ? 'bg-blue-500'
                      : deck.color === 'green'
                      ? 'bg-green-500'
                      : deck.color === 'yellow'
                      ? 'bg-yellow-500'
                      : deck.color === 'purple'
                      ? 'bg-purple-500'
                      : 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                  }`}
                ></span>
              </div>
              <p
                className={`text-sm mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {deck.description}
              </p>
              <div
                className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                } flex gap-3`}
              >
                <span>❤️ {deck.likes}</span>
                <span>👀 {deck.views}</span>
              </div>
            </Card>
          ))}
    </section>
  );
}
