// app/api/collections/featured/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get most liked decks for each color
    const collections = await Promise.all([
      prisma.deck.findMany({
        where: { color: 'RED' },
        include: {
          _count: {
            select: { likes: true }
          }
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      prisma.deck.findMany({
        where: { color: 'BLUE' },
        include: {
          _count: {
            select: { likes: true }
          }
        },
        orderBy: {
          likes: {
            _count: 'desc'
          }
        },
        take: 5
      }),
    ])

    const featuredCollections = {
      'Penguin School 📚': collections[1], // Blue decks
      'Trending rn 🔥': collections[0], // Red decks
    }

    return NextResponse.json(featuredCollections)
  } catch (error) {
    console.error('Failed to fetch featured collections:', error)
    return NextResponse.json({ error: 'Failed to fetch featured collections' }, { status: 500 })
  }
}