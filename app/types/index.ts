export type DeckColor = 'red' | 'blue' | 'mixed' | 'yellow' | 'green' | 'purple' | 'grey';

export interface Deck {
  id: string;
  title: string;
  description?: string;
  color: DeckColor;
  author: {
    username: string;
  };
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Filter {
  id: DeckColor | 'all';
  label: string;
  color?: string;
  circle?: React.ReactNode;
}