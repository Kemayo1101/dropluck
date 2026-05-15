'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RefPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  useEffect(() => {
    // Stocker le code parrainage dans localStorage pour l'utiliser à l'inscription
    if (code) {
      localStorage.setItem('dropluck_ref', code)
    }
    router.push('/compte')
  }, [code])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#D4AF37', letterSpacing: '3px' }}>DROPLUCK</div>
        <div style={{ color: '#888', marginTop: '1rem' }}>Redirection...</div>
      </div>
    </div>
  )
}
