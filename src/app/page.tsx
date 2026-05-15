'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import ThemeCard from '@/components/ThemeCard'
import TirageModal from '@/components/TirageModal'
import TesterModal from '@/components/TesterModal'
import PaymentModal from '@/components/PaymentModal'
import ReviewsSection from '@/components/ReviewsSection'
import { useDraw } from '@/context/DrawContext'
import { useAuth } from '@/context/AuthContext'
import { supabase, Theme } from '@/lib/supabase'
import Link from 'next/link'

export default function HomePage() {
  const { setShowPaymentModal } = useDraw()
  const { profile } = useAuth()
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    supabase.from('themes').select('*').eq('active', true).then(({ data }) => {
      if (data?.length) setThemes(data)
      else setThemes([
        { id: '1', slug: 'streetwear', name: 'Streetwear Urbain', emoji: '🧢', description: '', designs_count: 58, tag: 'TENDANCE' },
        { id: '2', slug: 'christianisme', name: 'Christianisme & Spiritualité', emoji: '✝️', description: '', designs_count: 47, tag: 'INSPIRANT' },
        { id: '3', slug: 'motivation', name: 'Motivation Gagnante', emoji: '⚡', description: '', designs_count: 62, tag: 'POPULAIRE' },
        { id: '4', slug: 'anime', name: 'Anime & Manga', emoji: '⛩️', description: '', designs_count: 74, tag: 'VIRAL' },
      ])
    })
  }, [])

  const scrollToThemes = () => {
    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <TirageModal />
      <TesterModal />
      <PaymentModal />

      {/* Tirages counter */}
      {profile && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50,
          background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '20px', padding: '0.7rem 1.3rem',
          fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: '#888' }}>Tirages :</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#D4AF37' }}>
            {profile.tirages_restants}
          </span>
          {profile.tirages_restants === 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              style={{
                background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37', padding: '0.2rem 0.6rem', borderRadius: '10px',
                cursor: 'pointer', fontSize: '0.7rem'
              }}
            >+ Recharger</button>
          )}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '6rem 2rem 4rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)'
        }} />

        {/* Floating emojis */}
        {['👕','✨','🎨','⚡','🔥'].map((e, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: '3rem', opacity: 0.05,
            top: `${[10, 20, 50, 80, 35][i]}%`,
            left: `${[5, 85, 2, 90, 45][i]}%`,
            animation: `floatUp ${16 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * -3}s`,
            pointerEvents: 'none'
          }}>{e}</span>
        ))}

        <div style={{
          display: 'inline-block', background: 'rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37',
          padding: '0.4rem 1.2rem', borderRadius: '30px',
          fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '2rem'
        }}>✦ DESIGNS EXCLUSIFS ✦</div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(3.5rem, 10vw, 8rem)',
          lineHeight: 0.95, letterSpacing: '2px', marginBottom: '1.5rem'
        }}>
          DÉCOUVRE TON<br />
          <span style={{ color: '#D4AF37' }}>PROCHAIN DESIGN</span><br />
          LÉGENDAIRE
        </h1>

        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', color: '#888',
          maxWidth: '480px', lineHeight: 1.7, marginBottom: '3rem'
        }}>
          Choisis un univers. Tire au sort. Porte le style.<br />
          Chaque tirage est une surprise premium.
        </p>

        <button
          onClick={scrollToThemes}
          className="btn-gold animate-pulse-gold"
          style={{ padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.4rem', letterSpacing: '3px' }}
        >
          COMMENCER ✦
        </button>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { num: '4', label: 'Univers' },
            { num: '200+', label: 'Designs' },
            { num: '11 FCFA', label: 'Par tirage' },
            { num: '4.9★', label: 'Note moyenne' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#D4AF37' }}>{num}</div>
              <div style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== THEMES ===== */}
      <section id="themes" style={{ padding: '5rem 2rem' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,4rem)', textAlign: 'center', letterSpacing: '2px', marginBottom: '0.5rem' }}>
          CHOISIS TON UNIVERS
        </h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '3rem', letterSpacing: '1px' }}>
          {themes.length} univers · Des centaines de designs exclusifs
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {themes.map(t => <ThemeCard key={t.id} theme={t} />)}
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section style={{ padding: '5rem 2rem', background: '#111' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', textAlign: 'center', letterSpacing: '2px', marginBottom: '3rem' }}>
          COMMENT ÇA MARCHE
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', icon: '🎯', title: 'Choisis un thème', desc: 'Streetwear, Spiritualité, Motivation ou Anime' },
            { step: '02', icon: '✉️', title: 'Tire au sort', desc: 'Clique sur TIRER et découvre ton design mystère' },
            { step: '03', icon: '👕', title: 'Teste sur vêtement', desc: 'Visualise ton design sur différents t-shirts' },
            { step: '04', icon: '⬇', title: 'Télécharge', desc: 'Exporte en PNG transparent et fais imprimer' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '3px', marginBottom: '0.5rem' }}>{step}</div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>{title}</div>
              <div style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== AVIS ===== */}
      <ReviewsSection />

      {/* ===== PARRAINAGE ===== */}
      <section id="parrainage" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg,rgba(212,175,55,0.07),rgba(212,175,55,0.02))',
          border: '1px solid rgba(212,175,55,0.2)', borderRadius: '24px',
          padding: '3rem', maxWidth: '600px', margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '3px', color: '#D4AF37', marginBottom: '1rem' }}>
            INVITE UN AMI<br />= 1 TIRAGE GRATUIT
          </div>
          <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '2rem' }}>
            Partage ton lien personnel. Pour chaque ami qui s'inscrit,<br />
            tu gagnes <strong style={{ color: '#D4AF37' }}>1 tirage gratuit</strong>.
          </p>
          <Link href="/parrainage">
            <button className="btn-gold" style={{ padding: '0.9rem 2.5rem', borderRadius: '50px', fontSize: '1rem', letterSpacing: '2px' }}>
              📤 MON LIEN DE PARRAINAGE
            </button>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#D4AF37', letterSpacing: '3px', marginBottom: '1rem' }}>
          DROPLUCK
        </div>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['Accueil', 'Thèmes', 'Avis', 'Parrainage', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}
            >{l}</a>
          ))}
        </div>
        <div style={{ color: '#555', fontSize: '0.75rem' }}>
          © 2025 DropLuck · Tous droits réservés · Abidjan, Côte d'Ivoire
        </div>
      </footer>
    </>
  )
}
