import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function AuthPopovers() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      if (!res.ok) {
        throw new Error('Login failed')
      }
      
      setIsLoginOpen(false)
      // Handle successful login
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        throw new Error('Signup failed')
      }

      setIsSignupOpen(false)
      setIsLoginOpen(true)
    } catch (err) {
      setError('Username might be taken')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Login Popover */}
      <Popover open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="rounded-full">
            login
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="font-medium text-lg pb-2">Login</div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
            <div className="text-center text-sm text-gray-500">
              Need an account?{' '}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setIsLoginOpen(false)
                  setIsSignupOpen(true)
                }}
              >
                Sign up
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      {/* Signup Popover */}
      <Popover open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <PopoverTrigger asChild>
          <Button className="rounded-full">sign up</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="font-medium text-lg pb-2">Create Account</div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign Up</Button>
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setIsSignupOpen(false)
                  setIsLoginOpen(true)
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