'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { FontSize } from './extensions/font-size'
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
import { 
  Minus, 
  Plus, 
  Download, 
  Bold, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Undo, 
  Redo, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type
} from "lucide-react"
import { useTheme } from 'next-themes'
import './deck-builder.css'
import { ResizableImage } from './extensions/resizable-image'
import Youtube from '@tiptap/extension-youtube'

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

function getYouTubeVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export function DeckBuilder({ mode = 'create', deckId }: Props) {
  const { username } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState<DeckFormData>({
    title: '',
    description: '',
    color: 'RED',
    cards: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [availableCards, setAvailableCards] = useState<CardOption[]>([])
  const [cardSearchQuery, setCardSearchQuery] = useState('')
  const [showMobileCards, setShowMobileCards] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const handleImport = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Clipboard access is only available in the browser');
      }

      if (availableCards.length === 0) {
        toast({
          title: "Error",
          description: "Please wait for cards to load before importing",
          variant: "destructive"
        });
        return;
      }

      let text: string;
      try {
        text = await navigator.clipboard.readText();
        console.log('Clipboard content:', text);
      } catch (clipboardError) {
        console.error('Clipboard access error:', clipboardError);
        toast({
          title: "Error",
          description: "Failed to access clipboard. Please make sure you've copied the deck and granted clipboard permissions.",
          variant: "destructive"
        });
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log('Parsed deck data:', data);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        toast({
          title: "Error",
          description: "Invalid deck format. Please make sure you've copied a valid deck from the game.",
          variant: "destructive"
        });
        return;
      }
      
      if (!data.deckName || !data.counts) {
        throw new Error('Invalid deck format');
      }

      console.log('Available cards:', availableCards);

      // Find cards by name and create the deck structure
      const cardMapping = new Map<string, CardOption>();
      
      // Add all variations of each card name to the mapping
      for (const card of availableCards) {
        const variations = [
          card.name,  // Original name
          card.name.replace(/[\s']/g, ''),  // Remove spaces and apostrophes
          card.name.replace(/[\s'`,]/g, ''), // Remove spaces, apostrophes, backticks, and commas
          card.name.replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
        ];
        
        for (const variation of variations) {
          cardMapping.set(variation, card);
        }
      }

      console.log('Card mapping keys:', Array.from(cardMapping.keys()));

      const importedCards: DeckCard[] = [];
      let notFoundCards: string[] = [];

      // First pass: collect all cards
      for (const [cardName, quantity] of Object.entries(data.counts)) {
        console.log('Processing card:', cardName);
        // Try different variations of the imported card name
        const variations = [
          cardName,  // Original name
          cardName.replace(/[\s']/g, ''),  // Remove spaces and apostrophes
          cardName.replace(/[\s'`,]/g, ''), // Remove spaces, apostrophes, backticks, and commas
          cardName.replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
        ];
        
        let found = false;
        for (const variation of variations) {
          console.log('Trying variation:', variation);
          const card = cardMapping.get(variation);
          if (card) {
            console.log('Found card:', card.name);
            importedCards.push({
              cardId: card.id,
              quantity: quantity as number
            });
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log('Card not found:', cardName);
          notFoundCards.push(cardName);
        }
      }

      if (importedCards.length === 0) {
        throw new Error('No valid cards found in the imported deck');
      }

      // Detect deck color based on most common card color
      const colorCounts = new Map<DeckColor, number>();
      for (const importedCard of importedCards) {
        const card = availableCards.find(c => c.id === importedCard.cardId);
        if (card) {
          const count = colorCounts.get(card.color as DeckColor) || 0;
          colorCounts.set(card.color as DeckColor, count + importedCard.quantity);
        }
      }

      let detectedColor: DeckColor = 'MIXED';
      let maxCount = 0;
      for (const [color, count] of colorCounts.entries()) {
        console.log(`Color ${color}: ${count} cards`);
        if (count > maxCount) {
          maxCount = count;
          detectedColor = color;
        }
      }

      console.log('Detected color:', detectedColor);
      console.log('Imported cards:', importedCards);
      console.log('Setting form data:', {
        title: data.deckName,
        color: detectedColor,
        cards: importedCards
      });

      setFormData(prev => {
        console.log('Previous form data:', prev);
        const newData = {
          ...prev,
          title: data.deckName,
          color: detectedColor,
          cards: importedCards
        };
        console.log('New form data:', newData);
        return newData;
      });

      if (notFoundCards.length > 0) {
        toast({
          title: "Some cards not found",
          description: `The following cards were not found: ${notFoundCards.join(', ')}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Deck imported",
          description: "Deck has been imported successfully"
        });
      }
    } catch (error) {
      console.error('Error importing deck:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import deck. Make sure you've copied a valid deck from the game.",
        variant: "destructive"
      });
    }
  };

  const copyDeckToClipboard = () => {
    if (!formData) return;
    
    const deckData = {
      deckName: formData.title,
      counts: formData.cards.reduce((acc: { [key: string]: number }, card) => {
        const cardDetails = availableCards.find(c => c.id === card.cardId);
        if (!cardDetails) return acc;
        
        // Convert to the exact format needed
        const cardName = cardDetails.name
          .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters but keep spaces
          .split(/\s+/) // Split on whitespace
          .map((word, index) => {
            // Special cases
            const upperWord = word.toUpperCase();
            if (upperWord === 'OK') return 'OK';
            // Small words
            const lowerWord = word.toLowerCase();
            if (lowerWord === 'a' || lowerWord === 'the' || lowerWord === 'of') {
              return lowerWord;
            }
            // For all other words, capitalize first letter only
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

  const editor = useEditor({
    extensions: [
      TextStyle,
      FontSize,
      StarterKit.configure({
        heading: false
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'resizable-image',
        },
      }),
      Youtube.configure({
        width: 480,
        height: 270,
        allowFullscreen: true,
        modestBranding: true,
        controls: true
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline'
        },
        validate: url => {
          // If it's a YouTube URL, we'll handle it specially
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = getYouTubeVideoId(url);
            if (videoId) {
              editor?.commands.setYoutubeVideo({
                src: url
              });
              return false; // Don't create a regular link
            }
          }
          return true; // Create a regular link for non-YouTube URLs
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }))
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[300px] outline-none',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue

            const formData = new FormData()
            formData.append('file', file)

            fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
              .then(response => response.json())
              .then(data => {
                editor?.chain().focus().setImage({ src: data.url }).run()
              })
              .catch(error => {
                console.error('Error uploading pasted image:', error)
                toast({
                  title: "Error",
                  description: "Failed to upload image. Please try again.",
                  variant: "destructive"
                })
              })

            return true
          }
        }

        return false
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          const target = event.target as HTMLElement;
          
          // Handle image resizing
          if (target.classList.contains('resizable-image')) {
            event.preventDefault();
            const startX = event.clientX;
            const startWidth = target.offsetWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const currentX = e.clientX;
              const diff = currentX - startX;
              const newWidth = Math.max(100, startWidth + diff);
              
              // Find the image node and update its width
              const { state } = view;
              const { from } = state.selection;
              const node = state.doc.nodeAt(from);
              
              if (node && node.type.name === 'resizableImage') {
                editor?.chain().focus().setImageWidth(`${newWidth}px`).run();
              }
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return true;
          }
          
          // Handle video resizing
          if (target.closest('.resizable-video')) {
            event.preventDefault();
            const container = target.closest('.resizable-video') as HTMLElement;
            const startX = event.clientX;
            const startWidth = container.offsetWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const currentX = e.clientX;
              const diff = currentX - startX;
              const newWidth = Math.max(320, startWidth + diff); // Minimum width of 320px
              container.style.width = `${newWidth}px`;
              // Maintain 16:9 aspect ratio
              container.style.height = `${(newWidth * 9) / 16}px`;
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return true;
          }

          return false;
        }
      }
    }
  })

  return (
    <div className="container-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Card className="card card-spacing">
            <h2 className="h2 mb-4">{mode === 'edit' ? 'Edit' : 'Create New'} Deck</h2>
            
            {/* Mobile Cards Toggle */}
            <div className="sm:hidden mb-4">
              <Button
                variant="outline"
                className="w-full btn-md"
                onClick={() => setShowMobileCards(!showMobileCards)}
              >
                {showMobileCards ? 'Hide' : 'Show'} Cards ({formData.cards.reduce((total, card) => total + card.quantity, 0)} / 52)
              </Button>
            </div>

            {/* Mobile Cards Section */}
            {showMobileCards && (
              <div className="sm:hidden mb-6">
                <Card className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
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
                        <div className={`absolute left-0 right-0 mt-1 z-10 rounded-md border shadow-lg max-h-60 overflow-y-auto ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
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
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                                  isDarkMode 
                                    ? 'hover:bg-gray-700/50' 
                                    : 'hover:bg-gray-100'
                                }`}
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
                                <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{card.name}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {formData.cards.map((card, index) => {
                      const cardDetails = availableCards.find(c => c.id === card.cardId)
                      return (
                        <div 
                          key={card.cardId}
                          className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
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
                              <span className="font-medium text-sm truncate">{cardDetails?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
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
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{card.quantity}</span>
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
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            <form onSubmit={handleSubmit} className="section-spacing">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Deck Name</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Give your deck a name"
                        maxLength={50}
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium mb-1">&nbsp;</label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleImport}
                        disabled={!isMounted}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
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
                    <div className="border rounded-t-md border-b-0 bg-muted p-1 flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().undo().run()}
                        disabled={!editor?.can().undo()}
                      >
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().redo().run()}
                        disabled={!editor?.can().redo()}
                      >
                        <Redo className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1 my-auto" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`tiptap-toolbar-button ${editor?.isActive('bold') ? 'data-[active=true]' : ''}`}
                        data-active={editor?.isActive('bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`tiptap-toolbar-button ${editor?.isActive('italic') ? 'data-[active=true]' : ''}`}
                        data-active={editor?.isActive('italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className={`tiptap-toolbar-button ${editor?.isActive('underline') ? 'data-[active=true]' : ''}`}
                        data-active={editor?.isActive('underline')}
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className={`tiptap-toolbar-button ${editor?.isActive('strike') ? 'data-[active=true]' : ''}`}
                        data-active={editor?.isActive('strike')}
                      >
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1 my-auto" />
                      <Select
                        value={editor?.isActive('textStyle', { fontSize: '20px' }) ? '20' :
                               editor?.isActive('textStyle', { fontSize: '16px' }) ? '16' :
                               editor?.isActive('textStyle', { fontSize: '14px' }) ? '14' : '16'}
                        onValueChange={(value) => editor?.chain().focus().setFontSize(`${value}px`).run()}
                      >
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue placeholder="16px" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="20">20px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={`border rounded-b-md p-4 min-h-[300px] ${isDarkMode ? 'bg-background' : 'bg-white'}`}>
                      <EditorContent 
                        editor={editor} 
                        className="prose dark:prose-invert max-w-none min-h-[300px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Deck')}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Desktop Cards Section */}
        <div className="hidden sm:block w-72">
          <div className="sticky top-4">
            <Card className="card">
              <h2 className="h2 mb-4 flex justify-between items-center">
                <span>Cards</span>
                <span className="text-sm text-muted-foreground">
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
                    <div className={`absolute left-0 right-0 mt-1 z-10 rounded-md border shadow-lg max-h-60 overflow-y-auto ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
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
                            className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                              isDarkMode 
                                ? 'hover:bg-gray-700/50' 
                                : 'hover:bg-gray-100'
                            }`}
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
                            <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{card.name}</span>
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
                          <span className="font-medium text-sm truncate">{cardDetails?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
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
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{card.quantity}</span>
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
                            <Plus className="h-3 w-3" />
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