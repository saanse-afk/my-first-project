import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ds_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return res
}
