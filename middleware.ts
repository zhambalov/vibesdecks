import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      console.log('No auth header provided')
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      })
    }

    try {
      const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':')
        .map(str => str.trim())

      console.log('Attempting login with:', { 
        providedUsername: username,
        expectedUsername: process.env.ADMIN_USERNAME,
        usernameMatch: username.toLowerCase() === process.env.ADMIN_USERNAME?.toLowerCase(),
        passwordMatch: password === process.env.ADMIN_PASSWORD
      })

      if (
        username.toLowerCase() !== process.env.ADMIN_USERNAME?.toLowerCase() || 
        password !== process.env.ADMIN_PASSWORD
      ) {
        console.log('Credentials do not match')
        return new NextResponse(null, {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"'
          }
        })
      }
    } catch (error) {
      console.error('Error processing auth:', error)
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      })
    }
  }

  return NextResponse.next()
} 