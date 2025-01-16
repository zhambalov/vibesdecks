import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { username } = await req.json()

    if (!username) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find the comment and check ownership
    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: {
        user: {
          select: { username: true }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user.username !== username) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 })
    }

    // Delete the comment and its replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id: params.commentId },
          { parentId: params.commentId }
        ]
      }
    })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
} 