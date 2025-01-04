'use client'

import { useSearchParams } from 'next/navigation'
import { DeckCollection } from '@/components/decks/deck-collection'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">
          Search results for "{query}"
        </h1>
        <DeckCollection activeCategory="all" searchQuery={query || ''} />
      </div>
    </div>
  )
} 