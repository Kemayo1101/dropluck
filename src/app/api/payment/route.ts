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
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }
  if (record.count >= 5) return false // Max 5 paiements par minute
  record.count++
  return true
}

function sanitize(str: string): string {
  return str.replace(/[<>'"`;]/g, '').trim().slice(0, 200)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Attends 1 minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const userId = sanitize(body.userId ?? '')
    const method = sanitize(body.method ?? '')
    const reference = sanitize(body.reference ?? '')

    // Validations strictes
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'Utilisateur invalide' }, { status: 400 })
    }
    if (!['wave', 'orange_money'].includes(method)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide' }, { status: 400 })
    }
    if (reference && !isValidEmail(reference)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Enregistrer le paiement
    const { error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount: 11,
        currency: 'FCFA',
        method,
        status: 'pending',
        tirages_added: 1,
        reference,
      })

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}