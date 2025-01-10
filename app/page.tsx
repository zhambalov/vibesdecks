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
       ? 'bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] bg-gradient-to-br from-sky-500/20 to-blue-500/10' 
       : 'bg-gradient-to-br from-sky-50 to-blue-100/50 hover:from-sky-100/80 hover:to-blue-200/50 border-blue-200/20',
     fish: isDarkMode 
       ? 'bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] bg-gradient-to-br from-emerald-500/20 to-green-500/10' 
       : 'bg-gradient-to-br from-emerald-50 to-green-100/50 hover:from-emerald-100/80 hover:to-green-200/50 border-emerald-200/20',
     trending: isDarkMode 
       ? 'bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] bg-gradient-to-br from-amber-500/20 to-orange-500/10' 
       : 'bg-gradient-to-br from-amber-50 to-orange-100/50 hover:from-amber-100/80 hover:to-orange-200/50 border-orange-200/20',
     brain: isDarkMode 
       ? 'bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] bg-gradient-to-br from-purple-500/20 to-violet-500/10' 
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
     <section className="max-w-6xl mx-auto w-full px-4 py-4 sm:py-6">
       <h2 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 flex items-center gap-2">
         <span className="text-xl">⭐</span>
         <span>Featured Collections</span>
       </h2>
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
         {featuredCollections.map((collection) => (
           <Card
             key={collection.title}
             className={`group p-4 sm:p-6 transition-all duration-300 cursor-pointer backdrop-blur-xl ${getCollectionStyle(collection.type)}`}
           >
             <div className="flex flex-col gap-2 sm:gap-3">
               <span className="text-xl sm:text-2xl">{collection.emoji}</span>
               <div>
                 <h3 className={`text-sm sm:text-base font-medium mb-0.5 sm:mb-1 group-hover:translate-x-0.5 transition-transform line-clamp-1 ${
                   isDarkMode ? 'text-gray-100' : ''
                 }`}>
                   {collection.title}
                 </h3>
                 <p className={`text-xs sm:text-sm group-hover:translate-x-0.5 transition-transform ${
                   isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                 }`}>
                   {collection.decks} decks
                 </p>
               </div>
             </div>
           </Card>
         ))}
       </div>
     </section>

     <div className="mt-4 sm:mt-6">
       <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
       <DeckCollection activeCategory={activeCategory} />
     </div>
   </main>
 );
}