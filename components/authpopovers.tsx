import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"
import { useAuth } from '@/contexts/auth-context'

export function AuthPopovers() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      setSuccess('Login successful!')
      setTimeout(() => {
        setIsLoginOpen(false)
        resetForm()
        login(username)
      }, 1000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Invalid username or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess('Registration successful!')
      setTimeout(() => {
        setIsSignupOpen(false)
        resetForm()
        setTimeout(() => setIsLoginOpen(true), 100)
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Username might be taken')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Login Popover */}
      <Popover open={isLoginOpen} onOpenChange={(open: boolean) => {
        setIsLoginOpen(open)
        if (!open) resetForm()
      }}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="rounded-full text-sm sm:text-base">
            login
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[calc(100vw-2rem)] sm:w-80 animate-in zoom-in-95 duration-200" 
          align="end"
          sideOffset={8}
        >
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div className="font-medium text-base sm:text-lg pb-2">Login</div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-50 dark:bg-green-900/10 p-2 rounded">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="w-full p-3 sm:p-2 text-base sm:text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full p-3 sm:p-2 text-base sm:text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              Need an account?{' '}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setIsLoginOpen(false)
                  resetForm()
                  setTimeout(() => setIsSignupOpen(true), 100)
                }}
              >
                Sign up
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      {/* Signup Popover */}
      <Popover open={isSignupOpen} onOpenChange={(open: boolean) => {
        setIsSignupOpen(open)
        if (!open) resetForm()
      }}>
        <PopoverTrigger asChild>
          <Button className="rounded-full text-sm sm:text-base">sign up</Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[calc(100vw-2rem)] sm:w-80 animate-in zoom-in-95 duration-200" 
          align="end"
          sideOffset={8}
        >
          <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
            <div className="font-medium text-base sm:text-lg pb-2">Create Account</div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-50 dark:bg-green-900/10 p-2 rounded">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="w-full p-3 sm:p-2 text-base sm:text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full p-3 sm:p-2 text-base sm:text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full p-3 sm:p-2 text-base sm:text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Sign Up'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setIsSignupOpen(false)
                  resetForm()
                  setTimeout(() => setIsLoginOpen(true), 100)
                }}
              >
                Login
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}