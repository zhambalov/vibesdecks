export type DeckColor = 'red' | 'blue' | 'mixed' | 'yellow' | 'green' | 'purple' | 'all'

export interface Deck {
  id: string
  title: string
  description: string
  color: DeckColor
  author: {
    name: string | null
  }
  likes: number
  views: number
  createdAt: Date
  updatedAt: Date
}

export interface Filter {
  id: DeckColor
  label: string
  dotColor: string
}

export interface FeaturedCategory {
  id: string
  title: string
  count: number
  color: string
}