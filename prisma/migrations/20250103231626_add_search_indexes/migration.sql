/*
  Warnings:

  - The values [GREY,ROD,RELIC] on the enum `DeckColor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeckColor_new" AS ENUM ('RED', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'MIXED');
ALTER TABLE "Deck" ALTER COLUMN "color" TYPE "DeckColor_new" USING ("color"::text::"DeckColor_new");
ALTER TYPE "DeckColor" RENAME TO "DeckColor_old";
ALTER TYPE "DeckColor_new" RENAME TO "DeckColor";
DROP TYPE "DeckColor_old";
COMMIT;

-- CreateIndex
CREATE INDEX "Card_name_idx" ON "Card"("name");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Deck_title_idx" ON "Deck"("title");

-- CreateIndex
CREATE INDEX "Deck_description_idx" ON "Deck"("description");

-- CreateIndex
CREATE INDEX "Deck_color_idx" ON "Deck"("color");

-- CreateIndex
CREATE INDEX "Deck_authorId_idx" ON "Deck"("authorId");

-- CreateIndex
CREATE INDEX "Deck_createdAt_idx" ON "Deck"("createdAt");

-- CreateIndex
CREATE INDEX "Deck_views_idx" ON "Deck"("views");

-- CreateIndex
CREATE INDEX "DeckCard_deckId_idx" ON "DeckCard"("deckId");

-- CreateIndex
CREATE INDEX "DeckCard_cardId_idx" ON "DeckCard"("cardId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_deckId_idx" ON "Like"("deckId");

-- CreateIndex
CREATE INDEX "Like_createdAt_idx" ON "Like"("createdAt");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
