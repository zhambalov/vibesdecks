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

    // Get user
    const user = await prisma.user.findFirst({ 
      where: { username },
      select: { id: true }  // Only select id for performance
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check if like exists using composite unique constraint
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_deckId: {
          userId: user.id,
          deckId: params.id
        }
      }
    })

    let liked: boolean
    let likesCount: number

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_deckId: {
            userId: user.id,
            deckId: params.id
          }
        }
      })
      liked = false
    } else {
      // Create new like
      await prisma.like.create({
        data: {
          userId: user.id,
          deckId: params.id
        }
      })
      liked = true
    }

    // Get accurate count
    likesCount = await prisma.like.count({
      where: { deckId: params.id }
    })

    return NextResponse.json({ liked, likesCount })

  } catch (error) {
    console.error('Failed to update like:', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}