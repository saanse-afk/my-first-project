import { NextRequest, NextResponse } from 'next/server'
import { ingestAllInstagram, ingestInstagramAccount } from '@/lib/ingestion'
import { getInstagramAccounts } from '@/lib/instagram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { accountId?: string }

    if (body.accountId) {
      const accounts = await getInstagramAccounts()
      const account = accounts.find((a) => a.id === body.accountId)
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      await ingestInstagramAccount(account)
      return NextResponse.json({ success: true, accountId: body.accountId })
    }

    const result = await ingestAllInstagram()
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/instagram/ingest]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
