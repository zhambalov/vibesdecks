'use client'

import React from 'react'

type AuthContextType = {
  username: string | null
  login: (username: string) => void
  logout: () => Promise<void>
}

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider(props: AuthProviderProps): React.ReactElement {
  const [username, setUsername] = React.useState<string | null>(null)

  React.useEffect(() => {
    console.log('Loading username from localStorage')
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('username')
      console.log('Saved username:', savedUsername)
      if (savedUsername) {
        setUsername(savedUsername)
      }
    }
  }, [])

  const login = (newUsername: string) => {
    setUsername(newUsername)
    localStorage.setItem('username', newUsername)
  }

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (!res.ok) {
        throw new Error('Logout failed')
      }
      
      setUsername(null)
      localStorage.removeItem('username')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = React.useMemo(
    () => ({
      username,
      login,
      logout
    }),
    [username]
  )

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}