'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import TirageModal from '@/components/TirageModal'
import TesterModal from '@/components/TesterModal'
import PaymentModal from '@/components/PaymentModal'
import { useDraw } from '@/context/DrawContext'
import { supabase, Theme, Design } from '@/lib/supabase'

export default function ThemePageClient({ slug }: { slug: string }) {
  const { setSelectedTheme, setShowTirageModal } = useDraw()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [designs, setDesigns] = useState<Design[]>([])

  useEffect(() => {
    supabase.from('themes').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        if (data) {
          setTheme(data)
          supabase.from('designs').select('*').eq('theme_id', data.id).then(({ data: d }) => {
            if (d) setDesigns(d)
          })
        }
      })
  }, [slug])

  const handleTirer = () => {
    if (theme) { setSelectedTheme(theme); setShowTirageModal(true) }
  }

  return (
    <>
      <Navbar />
      <TirageModal />
      <TesterModal />
      <PaymentModal />
      <div style={{ minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {theme ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{theme.emoji}</div>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', letterSpacing: '3px', marginBottom: '1rem' }}>
                  {theme.name}
                </h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>{theme.designs_count} designs disponibles</p>
                <button onClick={handleTirer} className="btn-gold animate-pulse-gold" style={{ padding: '1.2rem 4rem', borderRadius: '50px', fontSize: '2rem', letterSpacing: '5px' }}>
                  TIRER
                </button>
              </div>

              {designs.length > 0 && (
                <>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
                    APERÇU DES DESIGNS
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '1rem' }}>
                    {designs.map(d => (
                      <div key={d.id} style={{
                        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
                        position: 'relative'
                      }}>
                        {d.rarity === 'legendary' && (
                          <div style={{
                            position: 'absolute', top: '0.5rem', right: '0.5rem',
                            background: 'rgba(212,175,55,0.2)', color: '#D4AF37',
                            fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '10px', letterSpacing: '1px'
                          }}>✦ LÉGENDAIRE</div>
                        )}
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{d.emoji}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3 }}>{d.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#888', padding: '5rem' }}>Chargement...</div>
          )}
        </div>
      </div>
    </>
  )
}
