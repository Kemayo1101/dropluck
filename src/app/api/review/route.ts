import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 }) // 1 heure
    return true
  }
  if (record.count >= 3) return false // Max 3 avis par heure
  record.count++
  return true
}

function sanitize(str: string): string {
  return str
    .replace(/[<>'"`;]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 500)
}

function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop d\'avis. Réessaie dans 1 heure.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const userId = sanitize(body.userId ?? '')
    const comment = sanitize(body.comment ?? '')
    const rating = parseInt(body.rating ?? '0')

    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Utilisateur invalide' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .upsert({
        user_id: userId,
        rating,
        comment,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}