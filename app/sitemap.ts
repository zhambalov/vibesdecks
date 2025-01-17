import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vibesdecks.com'

  // Get all public decks
  const decks = await prisma.deck.findMany({
    where: {
      isPrivate: false
    },
    select: {
      id: true,
      updatedAt: true
    }
  })

  const deckUrls = decks.map(deck => ({
    url: `${baseUrl}/decks/${deck.id}`,
    lastModified: deck.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${baseUrl}/decks/new`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    ...deckUrls
  ]
} 