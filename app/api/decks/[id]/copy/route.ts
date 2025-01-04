import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { username } = await req.json()
    if (!username) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get original deck with cards
    const deck = await prisma.deck.findUnique({
      where: { id: params.id },
      include: {
        cards: {
          include: { card: true }
        }
      }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Transform deck data into required format
    const formattedDeck = {
      deckName: deck.title,
      counts: deck.cards.reduce((acc, card) => {
        acc[card.card.name] = card.quantity
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json(formattedDeck)
  } catch (error) {
    console.error('Failed to export deck:', error)
    return NextResponse.json({ error: 'Failed to export deck' }, { status: 500 })
  }
}