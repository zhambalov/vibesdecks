import { Deck, User, Comment } from '@prisma/client'

interface DeckWithDetails extends Deck {
  author: Pick<User, 'id' | 'username'>
  likes: Array<{ userId: string }>
  comments: Array<Comment & { author: Pick<User, 'username'> }>
}

interface Props {
  deck: DeckWithDetails
}

export function DeckPage({ deck }: Props) {
  return (
    <div className="container-lg p-4">
      <h1 className="text-3xl font-bold mb-4">{deck.title}</h1>
      <div className="flex items-center gap-2 text-muted-foreground mb-6">
        <span>by {deck.author.username}</span>
        <span>•</span>
        <span>{deck.likes.length} likes</span>
        <span>•</span>
        <span>{deck.comments.length} comments</span>
      </div>
      
      {deck.description && (
        <div className="prose dark:prose-invert mb-8" 
          dangerouslySetInnerHTML={{ __html: deck.description }} 
        />
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        {deck.comments.map(comment => (
          <div key={comment.id} className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{comment.author.username}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 