-- AlterEnum
ALTER TYPE "CardColor" ADD VALUE 'ROD';

-- AlterTable
ALTER TABLE "DeckCard" ADD COLUMN     "notes" TEXT;
