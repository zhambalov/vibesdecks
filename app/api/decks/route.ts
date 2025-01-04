// /app/api/decks/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            username: true
          }
        },
        likes: true
      }
    })

    // Transform the data to ensure consistent structure
    const transformedDecks = decks.map(deck => ({
      ...deck,
      user: {
        username: deck.author.username
      }
    }))

    return NextResponse.json(transformedDecks)
  } catch (error) {
    console.error('Failed to fetch decks:', error)
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, color, username, cards } = await req.json()

    console.log('Creating deck for username:', username)

    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const deck = await prisma.$transaction(async (tx) => {
      // Create the deck
      const newDeck = await tx.deck.create({
        data: {
          title,
          description,
          color,
          authorId: user.id
        }
      })

      // Create deck-card relationships if cards are provided
      if (cards && cards.length > 0) {
        await tx.deckCard.createMany({
          data: cards.map((card: { cardId: string; quantity: number }) => ({
            deckId: newDeck.id,
            cardId: card.cardId,
            quantity: card.quantity
          }))
        })
      }

      // Return the deck with all relationships
      return tx.deck.findUnique({
        where: { id: newDeck.id },
        include: {
          author: {
            select: {
              username: true
            }
          },
          cards: {
            include: {
              card: true
            }
          }
        }
      })
    })

    return NextResponse.json({ deck })
  } catch (error) {
    console.error('Failed to create deck:', error)
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }
}