'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/auth-context'
import { DeckColor, CardColor } from '@prisma/client'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus } from "lucide-react"

interface CardOption {
  id: string
  name: string
  color: CardColor
}

interface DeckCard {
  cardId: string;
  quantity: number;
}

interface DeckFormData {
  title: string
  description: string
  color: DeckColor
  cards: DeckCard[]
}

interface Props {
  mode?: 'create' | 'edit'
  deckId?: string
}

export function DeckBuilder({ mode = 'create', deckId }: Props) {
  const { username } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<DeckFormData>({
    title: '',
    description: '',
    color: 'RED',
    cards: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [availableCards, setAvailableCards] = useState<CardOption[]>([])
  const [cardSearchQuery, setCardSearchQuery] = useState('')

  const fetchDeck = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}`)
      if (!response.ok) throw new Error('Failed to fetch deck')
      const deck = await response.json()
      setFormData({
        title: deck.title,
        description: deck.description || '',
        color: deck.color,
        cards: deck.cards.map((dc: { card: { id: string }, quantity: number }) => ({
          cardId: dc.card.id,
          quantity: dc.quantity
        }))
      })
    } catch (error: unknown) {
      console.error('Error fetching deck:', error)
      toast({
        title: "Error",
        description: "Failed to load deck",
        variant: "destructive"
      })
    }
  }, [deckId])

  useEffect(() => {
    if (mode === 'edit' && deckId) {
      fetchDeck()
    }
  }, [mode, deckId, fetchDeck])

  useEffect(() => {
    async function fetchAvailableCards() {
      try {
        const response = await fetch('/api/cards')
        if (!response.ok) throw new Error('Failed to fetch cards')
        const data = await response.json()
        setAvailableCards(data)
      } catch (error) {
        console.error('Error fetching cards:', error)
        toast({
          title: "Error",
          description: "Failed to load available cards",
          variant: "destructive"
        })
      }
    }

    fetchAvailableCards()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      toast({
        title: "Error",
        description: "Please login to create a deck",
        variant: "destructive"
      })
      return
    }

    const totalCards = formData.cards.reduce((total, card) => total + card.quantity, 0)
    if (totalCards !== 52) {
      toast({
        title: "Invalid deck size",
        description: "Your deck must contain exactly 52 cards",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('Sending deck data:', {
        ...formData,
        username
      })

      const response: Response = await fetch(mode === 'edit' ? `/api/decks/${deckId}` : '/api/decks', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          username
        }),
      })

      const data: { error?: string; deck?: { id: string }; id?: string } = await response.json().catch((e) => {
        console.error('Error parsing response:', e)
        return {}
      })
      
      console.log('Response status:', response.status)
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(
          data?.error || `Failed to ${mode === 'edit' ? 'update' : 'create'} deck (Status: ${response.status})`
        )
      }

      if (!data?.deck?.id && !data?.id) {
        console.error('Invalid response data:', data)
        throw new Error(`Failed to ${mode === 'edit' ? 'update' : 'create'} deck: Invalid response`)
      }

      const resultDeckId = data.deck?.id || data.id
      router.push(`/decks/${resultDeckId}`)
      toast({
        title: "Success",
        description: `Deck ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} deck:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} deck`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{mode === 'edit' ? 'Edit' : 'Create New'} Deck</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deck Name</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your deck a name"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <Select
                    value={formData.color}
                    onValueChange={(value: DeckColor) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RED">Red</SelectItem>
                      <SelectItem value="BLUE">Blue</SelectItem>
                      <SelectItem value="GREEN">Green</SelectItem>
                      <SelectItem value="YELLOW">Yellow</SelectItem>
                      <SelectItem value="PURPLE">Purple</SelectItem>
                      <SelectItem value="GREY">Grey</SelectItem>
                      <SelectItem value="ROD">Rod</SelectItem>
                      <SelectItem value="RELIC">Relic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div className="bg-secondary/20 rounded-lg p-4 mb-2 text-sm space-y-2">
                    <p className="font-medium">Tips for a great deck description:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Start with a brief overview of your deck&apos;s main strategy</li>
                      <li>Explain key card combinations and how they work together</li>
                      <li>Share tips about the mulligan phase and what cards to look for</li>
                      <li>Describe matchups against different deck types</li>
                      <li>Include a section about alternative card choices</li>
                    </ul>
                  </div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={`Example:
It&apos;s not an easy deck to play, but once you learn the combos, it becomes much more manageable.

The first question we always want to answer is about the mulligan. In this deck, the most crucial thing to know is that the mulligan is 70% of your path to victory.

Key Combos:
- Card A + Card B: Explain the interaction
- Card C + Card D: Another key combo

Mulligan Guide:
- Always keep: Card X, Card Y
- Situational keeps: Card Z (explain when)

Alternative Cards:
- If you don't have Card M, you can use Card N
- Card P is also a good option if you face a lot of aggressive decks`}
                    className="min-h-[300px] font-medium"
                  />
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <p>Text Style:</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = document.querySelector('textarea')
                        if (textarea) {
                          const start = textarea.selectionStart
                          const end = textarea.selectionEnd
                          const text = textarea.value
                          const selectedText = text.slice(start, end)
                          const newText = text.slice(0, start) + `<b>${selectedText}</b>` + text.slice(end)
                          setFormData({ ...formData, description: newText })
                          setTimeout(() => {
                            textarea.selectionStart = start + 3
                            textarea.selectionEnd = end + 3
                            textarea.focus()
                          }, 0)
                        }
                      }}
                    >
                      Bold
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = document.querySelector('textarea')
                        if (textarea) {
                          const start = textarea.selectionStart
                          const end = textarea.selectionEnd
                          const text = textarea.value
                          const selectedText = text.slice(start, end)
                          const newText = text.slice(0, start) + `<h1>${selectedText}</h1>` + text.slice(end)
                          setFormData({ ...formData, description: newText })
                          setTimeout(() => {
                            textarea.selectionStart = start + 4
                            textarea.selectionEnd = end + 4
                            textarea.focus()
                          }, 0)
                        }
                      }}
                    >
                      Title
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = document.querySelector('textarea')
                        if (textarea) {
                          const start = textarea.selectionStart
                          const end = textarea.selectionEnd
                          const text = textarea.value
                          const selectedText = text.slice(start, end)
                          const newText = text.slice(0, start) + `<h2>${selectedText}</h2>` + text.slice(end)
                          setFormData({ ...formData, description: newText })
                          setTimeout(() => {
                            textarea.selectionStart = start + 4
                            textarea.selectionEnd = end + 4
                            textarea.focus()
                          }, 0)
                        }
                      }}
                    >
                      Subtitle
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Deck')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="w-80">
          <div className="sticky top-4">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                <span>Cards</span>
                <span className="text-sm text-gray-500">
                  {formData.cards.reduce((total, card) => total + card.quantity, 0)} total
                </span>
              </h2>
              
              {/* Card Selection */}
              <div className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={cardSearchQuery}
                    onChange={(e) => setCardSearchQuery(e.target.value)}
                    placeholder="Search for cards..."
                    className="w-full"
                  />
                  {cardSearchQuery && availableCards.length > 0 && (
                    <div className="absolute top-full mt-1 w-full z-10 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-auto">
                      {availableCards
                        .filter(card => 
                          card.name.toLowerCase().includes(cardSearchQuery.toLowerCase())
                        )
                        .map(card => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            const existingCard = formData.cards.find(c => c.cardId === card.id)
                            const currentTotal = formData.cards.reduce((total, card) => total + card.quantity, 0)

                            if (existingCard) {
                              if (existingCard.quantity >= 4) {
                                toast({
                                  title: "Maximum reached",
                                  description: "You can only have 4 copies of a card",
                                  variant: "destructive"
                                })
                                return
                              }
                              if (currentTotal >= 52) {
                                toast({
                                  title: "Deck is full",
                                  description: "Maximum deck size is 52 cards",
                                  variant: "destructive"
                                })
                                return
                              }
                              setFormData(prev => ({
                                ...prev,
                                cards: prev.cards.map(c => 
                                  c.cardId === card.id 
                                    ? { ...c, quantity: c.quantity + 1 }
                                    : c
                                )
                              }))
                            } else {
                              if (currentTotal >= 52) {
                                toast({
                                  title: "Deck is full",
                                  description: "Maximum deck size is 52 cards",
                                  variant: "destructive"
                                })
                                return
                              }
                              setFormData(prev => ({
                                ...prev,
                                cards: [...prev.cards, { cardId: card.id, quantity: 1 }]
                              }))
                            }
                            setCardSearchQuery('')
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            card.color === 'RED' ? 'bg-red-500' :
                            card.color === 'BLUE' ? 'bg-blue-500' :
                            card.color === 'GREEN' ? 'bg-green-500' :
                            card.color === 'YELLOW' ? 'bg-yellow-500' :
                            card.color === 'PURPLE' ? 'bg-purple-500' :
                            card.color === 'GREY' ? 'bg-gray-500' :
                            card.color === 'ROD' ? 'bg-amber-700' :
                            card.color === 'RELIC' ? 'bg-black' :
                            'bg-gray-500'
                          }`} />
                          <span>{card.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Cards */}
              <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {formData.cards.map((card, index) => {
                  const cardDetails = availableCards.find(c => c.id === card.cardId)
                  return (
                    <div 
                      key={card.cardId}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            cardDetails?.color === 'RED' ? 'bg-red-500' :
                            cardDetails?.color === 'BLUE' ? 'bg-blue-500' :
                            cardDetails?.color === 'GREEN' ? 'bg-green-500' :
                            cardDetails?.color === 'YELLOW' ? 'bg-yellow-500' :
                            cardDetails?.color === 'PURPLE' ? 'bg-purple-500' :
                            cardDetails?.color === 'GREY' ? 'bg-gray-500' :
                            cardDetails?.color === 'ROD' ? 'bg-amber-700' :
                            cardDetails?.color === 'RELIC' ? 'bg-black' :
                            'bg-gray-500'
                          }`} />
                          <span className="font-medium text-sm">{cardDetails?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCards = [...formData.cards]
                              if (newCards[index].quantity > 1) {
                                newCards[index].quantity--
                              } else {
                                newCards.splice(index, 1)
                              }
                              setFormData({...formData, cards: newCards})
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{card.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCards = [...formData.cards]
                              const currentTotal = newCards.reduce((total, card) => total + card.quantity, 0)
                              
                              if (newCards[index].quantity >= 4) {
                                toast({
                                  title: "Maximum reached",
                                  description: "You can only have 4 copies of a card",
                                  variant: "destructive"
                                })
                                return
                              }
                              if (currentTotal >= 52) {
                                toast({
                                  title: "Deck is full",
                                  description: "Maximum deck size is 52 cards",
                                  variant: "destructive"
                                })
                                return
                              }
                              
                              newCards[index].quantity++
                              setFormData({...formData, cards: newCards})
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}