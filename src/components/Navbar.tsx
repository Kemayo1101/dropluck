'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useDraw } from '@/context/DrawContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { setShowPaymentModal } = useDraw()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,175,55,0.15)'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#D4AF37', letterSpacing: '3px' }}>
          DROPLUCK
        </span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="hidden md:flex">
        <Link href="/#themes" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px', transition: 'color 0.3s' }}>
          Thèmes
        </Link>
        <Link href="/#avis" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px' }}>
          Avis
        </Link>
        <Link href="/parrainage" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px' }}>
          Parrainage
        </Link>

        {user ? (
          <>
            {/* Tirages restants */}
            <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              ✦ {profile?.tirages_restants ?? 0} tirages
            </span>
            <Link href="/compte" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }}>
              Mon Compte
            </Link>
            <button onClick={() => signOut()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/compte" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px' }}>
              Connexion
            </Link>
            <button
              className="btn-gold"
              style={{ padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.85rem' }}
              onClick={() => setShowPaymentModal(true)}
            >
              RECHARGER
            </button>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'none', background: 'none', border: 'none', color: '#D4AF37', fontSize: '1.5rem', cursor: 'pointer' }}
        className="block md:hidden"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#111', padding: '1rem 2rem', display: 'flex',
          flexDirection: 'column', gap: '1rem', borderBottom: '1px solid rgba(212,175,55,0.1)'
        }}>
          <Link href="/#themes" style={{ color: '#888', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Thèmes</Link>
          <Link href="/#avis" style={{ color: '#888', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Avis</Link>
          <Link href="/parrainage" style={{ color: '#888', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Parrainage</Link>
          {user
            ? <Link href="/compte" style={{ color: '#888', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Mon Compte</Link>
            : <Link href="/compte" style={{ color: '#D4AF37', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Connexion</Link>
          }
        </div>
      )}
    </nav>
  )
}
