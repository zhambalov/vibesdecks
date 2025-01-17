import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import type { DeckColor } from '@prisma/client'

interface CardUpdate {
  cardId: string;
  quantity: number;
}

async function isAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')

  return (
    username === process.env.ADMIN_USERNAME && 
    password === process.env.ADMIN_PASSWORD
  )
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers()
    const sessionId = (await headersList).get('x-session-id')
    const username = (await headersList).get('x-username')

    const deck = await prisma.deck.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { username: true }
        },
        cards: {
          include: { card: true }
        },
        likes: true,
        _count: {
          select: { likes: true }
        }
      }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Format description if it's plain text
    let formattedDescription = deck.description
    if (formattedDescription && !formattedDescription.includes('<p>') && !formattedDescription.includes('<div>')) {
      formattedDescription = formattedDescription
        .split(/\n\n+/)
        .map(section => {
          const lines = section.split(/\n/)
          return lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('<br />')
        })
        .map(section => `<p>${section}</p>`)
        .join('\n\n')
    }

    if (sessionId && !deck.viewedSessions.includes(sessionId)) {
      await prisma.deck.update({
        where: { id: params.id },
        data: {
          views: { increment: 1 },
          viewedSessions: { push: sessionId }
        }
      })
    }

    let liked = false
    if (username) {
      const user = await prisma.user.findFirst({
        where: { username },
        select: { id: true }
      })
      
      if (user) {
        const like = await prisma.like.findUnique({
          where: {
            userId_deckId: {
              userId: user.id,
              deckId: deck.id
            }
          }
        })
        liked = !!like
      }
    }

    return NextResponse.json({
      ...deck,
      description: formattedDescription,
      liked,
      likesCount: deck._count.likes
    })
  } catch (error) {
    console.error('Failed to fetch deck:', error)
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const body = await req.json()
    const { title, description, color, username, cards } = body as {
      title: string;
      description: string | null;
      color: DeckColor;
      username: string;
      cards?: CardUpdate[];
    }

    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const deck = await prisma.deck.findUnique({
      where: { id }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    if (deck.authorId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updatedDeck = await prisma.$transaction(async (tx) => {
      await tx.deck.update({
        where: { id },
        data: { 
          title, 
          description, 
          color,
          updatedAt: new Date() 
        }
      })

      if (cards) {
        await tx.deckCard.deleteMany({
          where: { deckId: id }
        })

        if (cards.length > 0) {
          await tx.deckCard.createMany({
            data: cards.map((card: CardUpdate) => ({
              deckId: id,
              cardId: card.cardId,
              quantity: card.quantity
            }))
          })
        }
      }

      return tx.deck.findUnique({
        where: { id },
        include: {
          author: {
            select: { username: true }
          },
          cards: {
            include: { card: true }
          },
          likes: true,
          _count: {
            select: { likes: true }
          }
        }
      })
    })

    if (!updatedDeck) {
      return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 })
    }

    return NextResponse.json({
      deck: {
        ...updatedDeck,
        liked: false,
        likesCount: updatedDeck._count.likes
      }
    })
  } catch (error) {
    console.error('Failed to update deck:', error)
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { username } = await request.json()
    if (!username) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the deck and check ownership
    const deck = await prisma.deck.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { username: true }
        }
      }
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Check if the user is the deck creator or an admin
    const isAdmin = await checkIsAdmin(request)
    if (deck.author.username !== username && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this deck' }, { status: 403 })
    }

    // Delete associated records first
    await prisma.$transaction([
      // Delete likes
      prisma.like.deleteMany({
        where: { deckId: params.id }
      }),
      // Delete deck cards
      prisma.deckCard.deleteMany({
        where: { deckId: params.id }
      }),
      // Delete comments
      prisma.comment.deleteMany({
        where: { deckId: params.id }
      }),
      // Finally delete the deck
      prisma.deck.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    )
  }
}

async function checkIsAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')

  return (
    username === process.env.ADMIN_USERNAME && 
    password === process.env.ADMIN_PASSWORD
  )
}