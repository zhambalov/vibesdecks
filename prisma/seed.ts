import { PrismaClient, CardColor } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.deckCard.deleteMany()
  await prisma.card.deleteMany()
  await prisma.deck.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  const testUser = await prisma.user.create({
    data: {
      username: 'testuser',
      password: hashedPassword,
    },
  })

  const testUser2 = await prisma.user.create({
    data: {
      username: 'testuser2',
      password: hashedPassword,
    },
  })

  // Create test cards
  const cards = [
    { name: "Red Card 1", color: CardColor.RED },
    { name: "Blue Card 1", color: CardColor.BLUE },
    { name: "Green Card 1", color: CardColor.GREEN },
    { name: "Yellow Card 1", color: CardColor.YELLOW },
    { name: "Purple Card 1", color: CardColor.PURPLE },
    { name: "Grey Card 1", color: CardColor.GREY }
  ]

  const createdCards = await Promise.all(
    cards.map(card => prisma.card.create({ data: card }))
  )

  // Create a test deck
  const testDeck = await prisma.deck.create({
    data: {
      title: "Test Deck",
      description: "This is a test deck",
      color: "MIXED",
      authorId: testUser.id,
    },
  })

  // Add some cards to the deck
  await Promise.all(
    createdCards.slice(0, 3).map(card =>
      prisma.deckCard.create({
        data: {
          deckId: testDeck.id,
          cardId: card.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      })
    )
  )

  // Create some test likes
  await prisma.like.create({
    data: {
      userId: testUser2.id,
      deckId: testDeck.id,
    },
  })

  // Create some test comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "This is a great deck!",
      userId: testUser2.id,
      deckId: testDeck.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: "Thanks!",
      userId: testUser.id,
      deckId: testDeck.id,
      parentId: comment1.id,
    },
  })

  console.log(`Database has been seeded. 
    Created:
    - ${cards.length} cards
    - 2 users (testuser, testuser2)
    - 1 deck with cards
    - 1 like
    - 2 comments (1 reply)
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })