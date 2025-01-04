import { NextResponse } from 'next/server'

export async function POST() {
  try {
    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}