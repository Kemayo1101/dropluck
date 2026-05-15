import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Clés SECRÈTES uniquement côté serveur
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limiting simple en mémoire
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (record.count >= maxRequests) return false
  record.count++
  return true
}

// Nettoyage des inputs
function sanitize(str: string): string {
  return str
    .replace(/[<>'"`;]/g, '') // Supprime caractères dangereux
    .trim()
    .slice(0, 200) // Limite la longueur
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    if (!checkRateLimit(ip, 20, 60000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Attends 1 minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const userId = sanitize(body.userId ?? '')
    const themeId = sanitize(body.themeId ?? '')

    if (!userId || !themeId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a des tirages restants
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('tirages_restants, total_tirages')
      .eq('id', userId)
      .single()

    if (!profile || profile.tirages_restants <= 0) {
      return NextResponse.json({ error: 'Plus de tirages disponibles' }, { status: 403 })
    }

    // Récupérer les designs du thème
    const { data: designs } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('theme_id', themeId)
      .eq('active', true)

    if (!designs || designs.length === 0) {
      return NextResponse.json({ error: 'Aucun design disponible' }, { status: 404 })
    }

    // Choisir un design aléatoire
    const legendary = designs.filter((d: any) => d.rarity === 'legendary')
    const common = designs.filter((d: any) => d.rarity === 'common')
    const r = Math.random()
    const design = r < 0.15 && legendary.length
      ? legendary[Math.floor(Math.random() * legendary.length)]
      : common[Math.floor(Math.random() * common.length)]

    // Décrémenter les tirages
    await supabaseAdmin
      .from('profiles')
      .update({
        tirages_restants: profile.tirages_restants - 1,
        total_tirages: (profile.total_tirages ?? 0) + 1
      })
      .eq('id', userId)

    // Enregistrer dans l'historique
    await supabaseAdmin
      .from('draw_history')
      .insert({
        user_id: userId,
        design_id: design.id,
        theme_id: themeId,
        rarity: design.rarity
      })

    return NextResponse.json({ design }, { status: 200 })

  } catch (error) {
    console.error('Tirage error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}