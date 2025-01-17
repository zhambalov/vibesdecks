import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://vibesdecks.com'),
  title: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
  description: 'Create, share, and discover decks for Vibes TCG. The official deck builder for Pudgy Penguins Vibes trading card game. Build your perfect deck and join the community.',
  keywords: ['Vibes TCG', 'Pudgy Penguins Vibes', 'Vibes Decks', 'TCG Deck Builder', 'Trading Card Game', 'Deck Collection', 'Card Game'],
  icons: {
    icon: '/icon.ico'
  },
  openGraph: {
    title: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
    description: 'Create, share, and discover decks for Vibes TCG. The official deck builder for Pudgy Penguins Vibes trading card game.',
    type: 'website',
    url: 'https://vibesdecks.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibesDecks - Pudgy Penguins Vibes TCG Deck Builder',
    description: 'Create, share, and discover decks for Vibes TCG. The official deck builder for Pudgy Penguins Vibes trading card game.',
    images: ['/og-image.png']
  }
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VibesDecks - Vibes TCG Deck Builder',
  description: 'Create, share, and discover decks for Vibes TCG. The official deck builder for Pudgy Penguins Vibes trading card game.',
  url: 'https://vibesdecks.com',
  applicationCategory: 'GameApplication',
  genre: 'Trading Card Game',
  keywords: 'Vibes TCG, Pudgy Penguins Vibes, Vibes Decks, TCG Deck Builder',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  publisher: {
    '@type': 'Organization',
    name: 'VibesDecks',
    url: 'https://vibesdecks.com'
  }
}; 