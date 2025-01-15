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
import { Edit, Eye, Heart, Copy, Plus, Minus, Download } from 'lucide-react'

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

  const exportDeck = async () => {
    if (!deck) return;
    
    try {
      const response = await fetch(`/api/decks/${id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) throw new Error('Failed to export deck');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Deck exported",
        description: "Your deck has been exported successfully"
      });
    } catch (error) {
      console.error('Error exporting deck:', error);
      toast({
        title: "Error",
        description: "Failed to export deck",
        variant: "destructive"
      });
    }
  };

  const copyDeckToClipboard = () => {
    if (!deck) return;
    
    const deckData = {
      deckName: deck.title,
      counts: deck.cards.reduce((acc: { [key: string]: number }, card) => {
        // Convert to the exact format needed
        const cardName = card.card.name
          .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters but keep spaces
          .split(/\s+/) // Split on whitespace
          .map((word, index) => {
            // Special cases for small words
            const lowerWord = word.toLowerCase();
            if (lowerWord === 'a' || lowerWord === 'the' || lowerWord === 'of') {
              return lowerWord;
            }
            // For all other words, capitalize first letter
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join('');
        
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
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <Card className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header Section */}
            <div className="flex flex-col gap-3">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold">{deck.title}</h1>
                <div className="flex items-center gap-2">
                  {username === deck.author.username && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditClick}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
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

              {/* Author and Stats */}
              <div className="flex flex-col gap-2">
                <span className="font-medium">{deck.author.username}</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Created {new Date(deck.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                  {deck.updatedAt > deck.createdAt && (
                    <span>· Updated {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  {username && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={`h-8 px-2.5 ${
                        isDarkMode 
                          ? deck.liked 
                            ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20' 
                            : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                          : deck.liked 
                            ? 'bg-red-500/10 hover:bg-red-500/20' 
                            : ''
                      }`}
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
                    onClick={copyDeckToClipboard}
                    className={`h-8 px-2.5 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                        : ''
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy Deck
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`sm:hidden h-8 px-2.5 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                        : ''
                    }`}
                    onClick={() => setShowMobileCards(!showMobileCards)}
                  >
                    {showMobileCards ? 'Hide Cards' : 'View Cards'}
                  </Button>
                </div>
              </div>

              {/* Mobile Cards List */}
              {showMobileCards && (
                <div className="sm:hidden mt-3">
                  <Card className={`p-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold">Cards</h2>
                      <span className="text-xs text-muted-foreground">
                        {deck.cards.reduce((total, card) => total + card.quantity, 0)} total
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
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
                            <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-background">
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
          {deck.description && (
            <Card className={`mt-4 sm:mt-6 p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="prose dark:prose-invert max-w-none text-sm 
                [&_strong]:text-sm [&_strong]:font-semibold [&_strong]:text-blue-500/90 dark:[&_strong]:text-blue-400/90
                [&_b]:text-sm [&_b]:font-medium
                [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2
                [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-1.5"
              >
                {deck.description.split('\n').map((paragraph, index) => (
                  paragraph && (
                    <div key={index} className="mb-3 last:mb-0">
                      {formatDescription(paragraph, deck.cards)}
                    </div>
                  )
                ))}
              </div>
            </Card>
          )}

          {/* Comments Section */}
          <Card className={`mt-4 sm:mt-6 p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-lg font-bold mb-4">Comments</h2>
            
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
                  className="mb-2 min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${newComment.length > 600 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {newComment.length}/600
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || newComment.length > 600}
                  >
                    Post
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{comment.user.username}</p>
                      <p className={`mt-1 text-sm break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comment.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Reply button and form */}
                  {username && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
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
                            className="mb-2 min-h-[80px]"
                          />
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${replyContent.length > 600 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {replyContent.length}/600
                            </span>
                            <div className="space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent('')
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
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
                    <div className="ml-4 sm:ml-6 mt-3 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{reply.user.username}</p>
                              <p className={`mt-1 text-sm break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {reply.content}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
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