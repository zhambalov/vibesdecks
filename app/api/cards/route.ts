import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CardColor } from '@prisma/client'

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

export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    await prisma.card.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { name, color } = await request.json()

    // Validate input
    if (!name || !color || !Object.values(CardColor).includes(color)) {
      return NextResponse.json(
        { error: 'Invalid card data' },
        { status: 400 }
      )
    }

    // Check for duplicate card names
    const existingCard = await prisma.card.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingCard) {
      return NextResponse.json(
        { error: 'Card with this name already exists' },
        { status: 400 }
      )
    }

    const card = await prisma.card.create({
      data: {
        name,
        color
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
} 