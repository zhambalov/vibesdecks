'use client'

interface CategoryNavProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  isDarkMode: boolean;
}

export function CategoryNav({ activeCategory, setActiveCategory, isDarkMode }: CategoryNavProps) {
  const categories = [
    { id: 'all', label: 'All decks' },
    { id: 'mixed', label: 'Mixed', gradient: 'from-red-500 via-blue-500 to-green-500' },
    { id: 'red', label: 'Red', color: 'bg-red-500' },
    { id: 'yellow', label: 'Yellow', color: 'bg-yellow-400' },
    { id: 'green', label: 'Green', color: 'bg-green-500' },
    { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', label: 'Purple', color: 'bg-purple-500' }
  ]

  return (
    <div className={`flex items-center justify-center gap-8 p-4 rounded-full mb-12 ${
      isDarkMode ? 'bg-slate-800/90' : 'bg-white'
    } shadow-sm`}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`relative px-4 py-2 transition-all rounded-full flex items-center gap-2 ${
            activeCategory === category.id 
            ? isDarkMode ? 'text-white bg-white/10' : 'text-slate-900 bg-slate-100' 
            : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${
            category.gradient 
              ? `bg-gradient-to-r ${category.gradient}`
              : category.color
          }`} />
          {category.label}
        </button>
      ))}
    </div>
  )
}