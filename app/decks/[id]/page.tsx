'use client'

import type { DeckColor } from '@prisma/client'
import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from "@/hooks/use-toast"
import type { Deck, Card as CardType, DeckCard, Like, Comment } from '@prisma/client'
import { Edit, Eye, Heart, Copy, Plus, Minus } from 'lucide-react'

interface DeckWithDetails extends Omit<Deck, 'description'> {
  author: {
    username: string;
  };
  cards: (DeckCard & {
    card: CardType;
  })[];
  likes: Like[];
  likesCount: number;
  liked: boolean;
  description: string | null;
  _count?: {
    likes: number;
  };
}

interface EditableDeckFields {
  title: string;
  description: string | null;
  color: DeckColor;
  cards?: {
    cardId: string;
    quantity: number;
  }[];
}

interface CommentWithUser extends Comment {
  user: {
    username: string;
  };
  replies?: CommentWithUser[];
}

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return null
  let sessionId = sessionStorage.getItem('deckViewSessionId')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2)
    sessionStorage.setItem('deckViewSessionId', sessionId)
  }
  return sessionId
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DeckPage() {
  const params = useParams()
  const id = params.id as string
  const [deck, setDeck] = useState<DeckWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedDeck, setEditedDeck] = useState<EditableDeckFields>({
    title: '',
    description: null,
    color: 'RED',
  })
  const [editedCards, setEditedCards] = useState<Array<{cardId: string; quantity: number}>>([])
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const { theme } = useTheme()
  const { username } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const isDarkMode = theme === 'dark'
  const [availableCards, setAvailableCards] = useState<CardType[]>([])
  const [cardSearchQuery, setCardSearchQuery] = useState('')
  const [showMobileCards, setShowMobileCards] = useState(false)

  const copyDeckToClipboard = () => {
    if (!deck) return;
    
    const deckData = {
      deckName: deck.title,
      counts: deck.cards.reduce((acc: { [key: string]: number }, card) => {
        const cardName = card.card.name.replace(/[\s']/g, '');
        acc[cardName] = (acc[cardName] || 0) + card.quantity;
        return acc;
      }, {})
    };
    
    navigator.clipboard.writeText(JSON.stringify(deckData));
    toast({
      title: "Copied to clipboard",
      description: "Deck data has been copied to your clipboard"
    });
  };

  useEffect(() => {
    if (deck) {
      setEditedDeck({
        title: deck.title,
        description: deck.description,
        color: deck.color
      })
      setEditedCards(deck.cards.map(dc => ({
        cardId: dc.card.id,
        quantity: dc.quantity
      })))
    }
  }, [deck])

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${id}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    }
  }, [id, toast])

  useEffect(() => {
    async function fetchDeck() {
      try {
        const sessionId = getOrCreateSessionId()
        const response = await fetch(`/api/decks/${id}`, {
          headers: {
            'x-session-id': sessionId || '',
            ...(username && { 'x-username': username })
          }
        })
        if (!response.ok) throw new Error('Failed to fetch deck')
        const data = await response.json()
        setDeck(data)
      } catch (error) {
        console.error('Error fetching deck:', error)
        toast({
          title: "Error",
          description: "Failed to load deck",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeck()
    fetchComments()
  }, [id, username, fetchComments, toast])

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('/api/cards')
        if (!response.ok) throw new Error('Failed to fetch cards')
        const data = await response.json()
        setAvailableCards(data)
      } catch (error) {
        console.error('Error fetching cards:', error)
        toast({
          title: "Error",
          description: "Failed to load cards",
          variant: "destructive"
        })
      }
    }
    if (isEditMode) {
      fetchCards()
    }
  }, [isEditMode, toast])

  const filteredCards = availableCards.filter(card => 
    card.name.toLowerCase().includes(cardSearchQuery.toLowerCase())
  )

  const handleLike = async () => {
    if (!username || !deck) {
      toast({
        title: "Authentication required",
        description: "Please login to like decks",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/decks/${deck.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      
      if (!response.ok) throw new Error('Failed to update like')
      const { liked, likesCount } = await response.json()
      
      setDeck(prev => prev ? {
        ...prev,
        likesCount,
        liked
      } : null)
      
      localStorage.setItem(`deck-${deck.id}-liked-${username}`, liked.toString())
      
      toast({
        title: liked ? "Added to favorites" : "Removed from favorites",
        description: liked ? "Deck added to your favorites" : "Deck removed from your favorites",
      })
    } catch (error) {
      console.error('Error updating like:', error)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !deck) {
      toast({
        title: "Authentication required",
        description: "Please login to comment",
        variant: "destructive",
      })
      return
    }
    
    if (newComment.length > 600) {
      toast({
        title: "Comment too long",
        description: "Comments cannot exceed 600 characters",
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await fetch(`/api/decks/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content: newComment })
      })
      
      if (!response.ok) throw new Error('Failed to post comment')
      
      setNewComment('')
      await fetchComments()
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      })
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    }
  }

  const handleReply = async (commentId: string) => {
    if (!username || !deck) {
      toast({
        title: "Authentication required",
        description: "Please login to reply",
        variant: "destructive",
      })
      return
    }
    
    if (replyContent.length > 600) {
      toast({
        title: "Reply too long",
        description: "Replies cannot exceed 600 characters",
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await fetch(`/api/decks/${deck.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          content: replyContent,
          parentId: commentId
        })
      })
      
      if (!response.ok) throw new Error('Failed to post reply')
      
      setReplyingTo(null)
      setReplyContent('')
      await fetchComments()
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully",
      })
    } catch (error) {
      console.error('Error posting reply:', error)
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    }
  }

  const formatDescription = (text: string, cards: (DeckCard & { card: CardType })[]) => {
    if (!text) return null
    
    const cardNames = cards.map(dc => dc.card.name)
    
    // Split by HTML tags first
    const parts = text.split(/(<\/?[^>]+>|\n•\s+|\n\n)/g)
    
    let inTitle = false
    let inSubtitle = false
    let inBold = false
    
    return parts.map((part, index) => {
      if (!part) return null
      
      // Handle opening tags
      if (part === '<h1>') {
        inTitle = true
        return null
      }
      if (part === '<h2>') {
        inSubtitle = true
        return null
      }
      if (part === '<b>') {
        inBold = true
        return null
      }
      
      // Handle closing tags
      if (part === '</h1>') {
        inTitle = false
        return null
      }
      if (part === '</h2>') {
        inSubtitle = false
        return null
      }
      if (part === '</b>') {
        inBold = false
        return null
      }
      
      // Handle bullet points
      if (part.startsWith('\n• ')) {
        return <li key={index} className="ml-4 mt-1">{part.slice(3)}</li>
      }
      
      // Handle new lines
      if (part === '\n\n') {
        return <br key={index} />
      }
      
      // Handle text with active formatting
      if (part.trim()) {
        let element = (
          <span key={index}>
            {part.split(/(\s+)/).map((word, wordIndex) => {
              const trimmedWord = word.trim()
              if (cardNames.includes(trimmedWord)) {
                return (
                  <span key={wordIndex} className="font-medium text-primary hover:underline cursor-pointer">
                    {word}
                  </span>
                )
              }
              return word
            })}
          </span>
        )
        
        if (inTitle) {
          element = <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{element}</h2>
        } else if (inSubtitle) {
          element = <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{element}</h3>
        } else if (inBold) {
          element = <strong key={index}>{element}</strong>
        }
        
        return element
      }
      
      return null
    }).filter(Boolean)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/decks/${id}/comments`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error('Error fetching comments:', error)
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [id, toast, fetchComments])

  useEffect(() => {
    async function recordView() {
      try {
        const sessionId = getOrCreateSessionId()
        if (!sessionId) return
        
        await fetch(`/api/decks/${id}/views`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })
      } catch (error) {
        console.error('Error recording view:', error)
        toast({
          title: "Error",
          description: "Failed to record view",
          variant: "destructive"
        })
      }
    }
    recordView()
  }, [id, toast])

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev)
  }

  const handleEditClick = () => {
    router.push(`/decks/${deck?.id}/edit`)
    toggleEditMode()
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-700 rounded mb-4" />
            <div className="h-4 w-1/4 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-full bg-gray-700 rounded" />
          </div>
          <div className="w-80">
            <div className="sticky top-4">
              <Card className="h-[calc(100vh-2rem)] animate-pulse bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="p-6">
          <h1 className="text-xl font-bold">Deck not found</h1>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header Section */}
            <div className="flex flex-col gap-4">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold">{deck.title}</h1>
                <div className="flex items-center gap-2">
                  {username === deck.author.username && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditClick}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <span className={`w-3 h-3 rounded-full ${
                    deck.color === 'RED' ? 'bg-red-500' :
                    deck.color === 'BLUE' ? 'bg-blue-500' :
                    deck.color === 'GREEN' ? 'bg-green-500' :
                    deck.color === 'YELLOW' ? 'bg-yellow-500' :
                    deck.color === 'PURPLE' ? 'bg-purple-500' :
                    'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'
                  }`} />
                </div>
              </div>

              {/* Author and Dates */}
              <div className="flex flex-col gap-3 text-sm">
                <span className="font-medium">{deck.author.username}</span>
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <span>Created {new Date(deck.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                  {deck.updatedAt > deck.createdAt && (
                    <span>Last updated {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {username && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={`h-8 px-2 ${deck.liked ? 'bg-red-500/10 hover:bg-red-500/20' : ''}`}
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 mr-1.5 ${deck.liked ? 'fill-current text-red-500' : ''}`}
                      />
                      {deck.likesCount}
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                    {deck.views}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="sm:hidden h-8 px-2"
                    onClick={() => setShowMobileCards(!showMobileCards)}
                  >
                    {showMobileCards ? 'Hide Cards' : 'View Cards'}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={copyDeckToClipboard}
                    className="h-8 px-2"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy Deck
                  </Button>
                </div>
              </div>

              {/* Mobile Cards List */}
              {showMobileCards && (
                <div className="sm:hidden mt-4">
                  <Card className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold">Cards</h2>
                      <span className="text-xs text-muted-foreground">
                        {deck.cards.reduce((total, card) => total + card.quantity, 0)} total
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {deck.cards.map(({ card, quantity }) => (
                        <div 
                          key={card.id}
                          className="p-2 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
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
                              <span className="font-medium text-sm truncate">{card.name}</span>
                            </div>
                            <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-background">
                              x{quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>

          {/* Description Section */}
          {(deck.description || isEditMode) && (
            <Card className={`mt-6 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {isEditMode ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedDeck.description || ''}
                    onChange={(e) => setEditedDeck({ ...editedDeck, description: e.target.value })}
                    placeholder="Add a description of your deck..."
                    className="min-h-[200px] font-medium"
                  />
                </div>
              ) : deck.description && (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  {deck.description.split('\n').map((paragraph, index) => (
                    paragraph && (
                      <div key={index}>
                        {formatDescription(paragraph, deck.cards)}
                      </div>
                    )
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Comments Section */}
          <Card className={`mt-6 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            {username && (
              <form onSubmit={handleComment} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => {
                    if (e.target.value.length <= 600) {
                      setNewComment(e.target.value)
                    }
                  }}
                  placeholder="Write a comment..."
                  className="mb-2"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${newComment.length > 600 ? 'text-red-500' : 'text-gray-500'}`}>
                    {newComment.length}/600 characters
                  </span>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || newComment.length > 600}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{comment.user.username}</p>
                      <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comment.content}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Reply button and form */}
                  {username && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        Reply
                      </Button>

                      {replyingTo === comment.id && (
                        <div className="mt-2">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => {
                              if (e.target.value.length <= 600) {
                                setReplyContent(e.target.value)
                              }
                            }}
                            placeholder="Write a reply..."
                            className="mb-2"
                            rows={2}
                          />
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${replyContent.length > 600 ? 'text-red-500' : 'text-gray-500'}`}>
                              {replyContent.length}/600 characters
                            </span>
                            <div className="space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent('')
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyContent.trim() || replyContent.length > 600}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{reply.user.username}</p>
                              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {reply.content}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Desktop Cards Section */}
        <div className="hidden sm:block w-80">
          <div className="sticky top-4">
            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Cards</h2>
                <span className="text-sm text-muted-foreground">
                  {deck.cards.reduce((total, card) => total + card.quantity, 0)} total
                </span>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {deck.cards.map(({ card, quantity }) => (
                  <div 
                    key={card.id}
                    className="p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
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
                        <span className="font-medium text-sm truncate">{card.name}</span>
                      </div>
                      <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-background">
                        x{quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}