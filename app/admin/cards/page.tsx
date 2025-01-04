'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardColor } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Trash2 } from 'lucide-react'

interface CardType {
  id: string;
  name: string;
  color: CardColor;
}

interface DeckType {
  id: string;
  name: string;
  description?: string;
  userId: string;
  color: CardColor;
  title: string;
  user: {
    username: string;
  };
}

interface CommentType {
  id: string;
  content: string;
  deckId: string;
  userId: string;
  createdAt: string;
  user: {
    username: string;
  };
  deck: {
    title: string;
  };
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CardType[]>([])
  const [decks, setDecks] = useState<DeckType[]>([])
  const [comments, setComments] = useState<CommentType[]>([])
  const [newCard, setNewCard] = useState<{ name: string; color: CardColor }>({ 
    name: '', 
    color: CardColor.RED 
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCards()
    fetchDecks()
    fetchComments()
  }, [])

  async function fetchCards() {
    try {
      const response = await fetch('/api/cards')
      if (!response.ok) throw new Error('Failed to fetch cards')
      const data = await response.json()
      setCards(data)
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive"
      })
    }
  }

  async function fetchDecks() {
    try {
      const response = await fetch('/api/decks')
      if (!response.ok) throw new Error('Failed to fetch decks')
      const data = await response.json()
      setDecks(data)
    } catch (error) {
      console.error('Error fetching decks:', error)
      toast({
        title: "Error",
        description: "Failed to load decks",
        variant: "destructive"
      })
    }
  }

  async function fetchComments() {
    try {
      const response = await fetch('/api/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('pudgyadmin:bishamdaDurateb123!')}`
        },
        body: JSON.stringify(newCard),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create card')
      }

      await fetchCards()
      setNewCard({ name: '', color: CardColor.RED })
      toast({
        title: "Success",
        description: "Card added successfully",
      })
    } catch (error) {
      console.error('Error creating card:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create card",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return
    }

    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('pudgyadmin:bishamdaDurateb123!')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete card')
      }

      await fetchCards()
      toast({
        title: "Success",
        description: "Card deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting card:', error)
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive"
      })
    }
  }

  const handleDeleteDeck = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) {
      return
    }

    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('pudgyadmin:bishamdaDurateb123!')}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete deck')
      }

      await fetchDecks()
      toast({
        title: "Success",
        description: "Deck deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting deck:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete deck",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAllDecks = async () => {
    if (!confirm('Are you sure you want to delete ALL decks? This action cannot be undone!')) {
      return
    }

    let deletedCount = 0
    let failedCount = 0

    for (const deck of decks) {
      try {
        const response = await fetch(`/api/decks/${deck.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${btoa('pudgyadmin:bishamdaDurateb123!')}`
          }
        })

        if (response.ok) {
          deletedCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Error deleting deck ${deck.id}:`, error)
        failedCount++
      }
    }

    await fetchDecks()
    toast({
      title: "Operation Complete",
      description: `Successfully deleted ${deletedCount} decks. ${failedCount > 0 ? `Failed to delete ${failedCount} decks.` : ''}`,
      variant: failedCount > 0 ? "destructive" : "default"
    })
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('pudgyadmin:bishamdaDurateb123!')}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }

      await fetchComments()
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Manage Cards</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Card Name</label>
            <Input
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              placeholder="Enter card name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <Select
              value={newCard.color}
              onValueChange={(value: CardColor) => setNewCard({ ...newCard, color: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CardColor.RED}>Red</SelectItem>
                <SelectItem value={CardColor.BLUE}>Blue</SelectItem>
                <SelectItem value={CardColor.GREEN}>Green</SelectItem>
                <SelectItem value={CardColor.YELLOW}>Yellow</SelectItem>
                <SelectItem value={CardColor.PURPLE}>Purple</SelectItem>
                <SelectItem value={CardColor.GREY}>Grey</SelectItem>
                <SelectItem value={CardColor.ROD}>Rod</SelectItem>
                <SelectItem value={CardColor.RELIC}>Relic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Card'}
          </Button>
        </form>

        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Cards</h3>
          <div className="grid gap-2">
            {cards.map(card => (
              <div 
                key={card.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="flex items-center gap-2">
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
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{card.color}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(card.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Decks</h2>
          {decks.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllDecks}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete All Decks ({decks.length})
            </Button>
          )}
        </div>
        <div className="grid gap-2">
          {decks.map(deck => (
            <div 
              key={deck.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  deck.color === 'RED' ? 'bg-red-500' :
                  deck.color === 'BLUE' ? 'bg-blue-500' :
                  deck.color === 'GREEN' ? 'bg-green-500' :
                  deck.color === 'YELLOW' ? 'bg-yellow-500' :
                  deck.color === 'PURPLE' ? 'bg-purple-500' :
                  'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                }`} />
                <div>
                  <span className="font-medium">{deck.title}</span>
                  <p className="text-sm text-gray-500">by {deck.user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{deck.color}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDeck(deck.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Manage Comments</h2>
        <div className="grid gap-2">
          {comments.map(comment => (
            <div 
              key={comment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{comment.user.username}</p>
                  <span className="text-xs text-gray-500">
                    on deck: {comment.deck.title}
                  </span>
                </div>
                <p className="text-sm mt-1 break-words">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">No comments to moderate</p>
          )}
        </div>
      </Card>
    </div>
  )
} 