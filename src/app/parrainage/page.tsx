'use client'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { useState } from 'react'

export default function ParrainagePage() {
  const { user, profile } = useAuth()
  const [copied, setCopied] = useState(false)

  const refLink = profile
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://dropluck.com'}/ref/${profile.referral_code}`
    : 'Connecte-toi pour obtenir ton lien'

  const copy = () => {
    if (!profile) return
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const share = (platform: string) => {
    const msg = `🎨 Découvre DropLuck et tire des designs légendaires pour ton t-shirt ! Inscris-toi avec mon lien et reçois des tirages gratuits → ${refLink}`
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`)
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', letterSpacing: '3px', color: '#D4AF37', marginBottom: '1rem' }}>
            PROGRAMME<br />PARRAINAGE
          </h1>
          <p style={{ color: '#888', lineHeight: 1.8, marginBottom: '3rem', fontSize: '1rem' }}>
            Invite tes amis sur DropLuck et gagne des tirages gratuits.<br />
            <strong style={{ color: '#fff' }}>1 ami inscrit = 1 tirage gratuit</strong> pour toi.
          </p>

          {/* Comment ça marche */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '3rem' }}>
            {[
              { n: '1', icon: '📤', txt: 'Partage ton lien' },
              { n: '2', icon: '👤', txt: 'Ton ami s\'inscrit' },
              { n: '3', icon: '✦', txt: 'Tu gagnes 1 tirage' },
            ].map(({ n, icon, txt }) => (
              <div key={n} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', color: '#D4AF37', letterSpacing: '2px' }}>ÉTAPE {n}</div>
                <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{icon}</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>{txt}</div>
              </div>
            ))}
          </div>

          {/* Lien parrainage */}
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '2px', marginBottom: '1rem' }}>
              TON LIEN PERSONNEL
            </div>
            <div style={{
              background: '#111', borderRadius: '12px', padding: '1rem',
              fontFamily: 'monospace', fontSize: '0.85rem', color: '#888',
              wordBreak: 'break-all', marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {user ? refLink : <span style={{ color: '#555' }}>Connecte-toi pour voir ton lien</span>}
            </div>
            <button
              onClick={copy}
              disabled={!user}
              className="btn-gold"
              style={{ padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '0.95rem', letterSpacing: '2px', opacity: user ? 1 : 0.4 }}
            >
              {copied ? '✓ Copié !' : '📋 COPIER MON LIEN'}
            </button>
          </div>

          {/* Partage réseaux */}
          {user && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => share('whatsapp')} style={{
                background: '#25D366', border: 'none', color: '#fff',
                padding: '0.8rem 1.5rem', borderRadius: '30px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>📱 WhatsApp</button>
              <button onClick={() => share('twitter')} style={{
                background: '#1DA1F2', border: 'none', color: '#fff',
                padding: '0.8rem 1.5rem', borderRadius: '30px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>🐦 Twitter</button>
            </div>
          )}

          {!user && (
            <div style={{ marginTop: '2rem', color: '#888' }}>
              <a href="/compte" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Connecte-toi</a> pour accéder à ton lien de parrainage.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
