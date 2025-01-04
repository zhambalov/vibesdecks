// app/api/decks/search/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    const decks = await prisma.deck.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        author: {
          select: { username: true }
        },
        likes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Failed to search decks:', error)
    return NextResponse.json({ error: 'Failed to search decks' }, { status: 500 })
  }
}