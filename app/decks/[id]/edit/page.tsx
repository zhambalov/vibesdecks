'use client'

import { DeckBuilder } from "@/components/decks/deck-builder"
import { useParams } from "next/navigation"

export default function EditDeckPage() {
  const params = useParams()
  const id = params.id as string
  
  return <DeckBuilder deckId={id} mode="edit" />
} 