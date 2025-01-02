import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { LogOut } from "lucide-react"
  import { useTheme } from 'next-themes'
  
  interface UserProfileProps {
    username: string
    onLogout: () => void
  }
  
  export function UserProfile({ username, onLogout }: UserProfileProps) {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div 
            className="relative h-10 w-10 rounded-full cursor-pointer select-none outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-200 rounded-full overflow-hidden">
              <img 
                src="/penguin-avatar.svg" 
                alt="Profile"
                className="w-full h-full scale-[2.5] translate-y-1 pointer-events-none"
                draggable="false"
              />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className={`w-48 overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-3">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden select-none bg-gradient-to-br from-blue-400 to-blue-200">
                <img 
                  src="/penguin-avatar.svg" 
                  alt="Profile"
                  className="w-full h-full scale-[2.5] translate-y-1 pointer-events-none"
                  draggable="false"
                />
              </div>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-100' : 'text-gray-700'
              }`}>
                {username}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className={`w-full mt-1 ${
                  isDarkMode 
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-950/50' 
                    : 'text-red-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }