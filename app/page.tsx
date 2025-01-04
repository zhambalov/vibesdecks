'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { DeckCollection } from '@/components/decks/deck-collection';
import { CategoryNav } from '@/components/ui/categorynav';
import { Card } from "@/components/ui/card";

export default function Home() {
 const [mounted, setMounted] = useState(false);
 const [activeCategory, setActiveCategory] = useState('all');
 const { theme } = useTheme();

 useEffect(() => {
   setMounted(true);
 }, []);

 if (!mounted) return null;

 const isDarkMode = theme === 'dark';

 const getCollectionStyle = (type: string) => {
   const styles = {
     penguin: isDarkMode 
       ? 'bg-gradient-to-br from-sky-500/5 to-blue-500/10 hover:from-sky-500/10 hover:to-blue-500/15 border-blue-500/10' 
       : 'bg-gradient-to-br from-sky-50 to-blue-100/50 hover:from-sky-100/80 hover:to-blue-200/50 border-blue-200/20',
     fish: isDarkMode 
       ? 'bg-gradient-to-br from-emerald-500/5 to-green-500/10 hover:from-emerald-500/10 hover:to-green-500/15 border-emerald-500/10' 
       : 'bg-gradient-to-br from-emerald-50 to-green-100/50 hover:from-emerald-100/80 hover:to-green-200/50 border-emerald-200/20',
     trending: isDarkMode 
       ? 'bg-gradient-to-br from-amber-500/5 to-orange-500/10 hover:from-amber-500/10 hover:to-orange-500/15 border-orange-500/10' 
       : 'bg-gradient-to-br from-amber-50 to-orange-100/50 hover:from-amber-100/80 hover:to-orange-200/50 border-orange-200/20',
     brain: isDarkMode 
       ? 'bg-gradient-to-br from-purple-500/5 to-violet-500/10 hover:from-purple-500/10 hover:to-violet-500/15 border-violet-500/10' 
       : 'bg-gradient-to-br from-purple-50 to-violet-100/50 hover:from-purple-100/80 hover:to-violet-200/50 border-violet-200/20'
   };
   return styles[type as keyof typeof styles] || styles.penguin;
 };

 const featuredCollections = [
   { title: 'Penguin School', emoji: '📚', decks: 5, type: 'penguin' },
   { title: 'Smol Fish', emoji: '🐟', decks: 3, type: 'fish' },
   { title: 'Trending rn', emoji: '🔥', decks: 4, type: 'trending' },
   { title: 'Galaxy Brain', emoji: '🧠', decks: 6, type: 'brain' }
 ];

 return (
   <main>
     <section className="max-w-6xl mx-auto w-full px-4 py-6">
       <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
         <span className="text-xl">⭐</span>
         <span>Featured Collections</span>
       </h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {featuredCollections.map((collection) => (
           <Card
             key={collection.title}
             className={`group p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm border ${getCollectionStyle(collection.type)}`}
           >
             <div className="flex flex-col gap-3">
               <span className="text-2xl">{collection.emoji}</span>
               <div>
                 <h3 className="font-medium mb-1 group-hover:translate-x-0.5 transition-transform">
                   {collection.title}
                 </h3>
                 <p className="text-sm text-muted-foreground group-hover:translate-x-0.5 transition-transform">
                   {collection.decks} decks
                 </p>
               </div>
             </div>
           </Card>
         ))}
       </div>
     </section>

     <div className="mt-6">
       <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
       <DeckCollection activeCategory={activeCategory} />
     </div>
   </main>
 );
}