'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDraw } from '@/context/DrawContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import Link from 'next/link'

export default function ComptePage() {
  const { user, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth()
  const { setShowPaymentModal } = useDraw()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [favs, setFavs] = useState<any[]>([])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '0.9rem 1.2rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit'
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (error) setError(error.message)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/compte`
          }
        })
        if (error) setError(error.message)
        else setError('✅ Compte créé ! Vérifie ton email pour confirmer.')
      }
    } catch(e) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (user && profile) {
    return (
      <>
        <Navbar />
        <PaymentModal />
        <div style={{ minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#D4AF37,rgba(212,175,55,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#080808'
              }}>
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px' }}>{profile.display_name}</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>{profile.email}</div>
              </div>
              <button onClick={() => signOut()} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Déconnexion
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {[
                { label: 'Tirages restants', val: profile.tirages_restants, gold: true },
                { label: 'Total tirages', val: profile.total_tirages },
                { label: 'Code parrainage', val: profile.referral_code, small: true },
              ].map(({ label, val, gold, small }: any) => (
                <div key={label} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: small ? '1.2rem' : '2.5rem', color: gold ? '#D4AF37' : '#fff', letterSpacing: small ? '2px' : '0' }}>{val}</div>
                  <div style={{ color: '#888', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.3rem' }}>{label}</div>
                </div>
              ))}
            </div>

            {profile.tirages_restants === 0 && (
              <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#D4AF37', marginBottom: '0.5rem' }}>PLUS DE TIRAGES</div>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>Recharge pour continuer à tirer des designs premium.</p>
                <button onClick={() => setShowPaymentModal(true)} style={{ background: 'linear-gradient(135deg,#D4AF37,#FFD700)', color: '#080808', padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '1rem', letterSpacing: '2px', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue',sans-serif" }}>
                  RECHARGER — 11 FCFA
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '3px', color: '#D4AF37' }}>DROPLUCK</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
              {mode === 'login' ? 'CONNEXION' : 'CRÉER UN COMPTE'}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>
              {mode === 'login' ? 'Bon retour !' : '2 tirages gratuits à l\'inscription 🎁'}
            </div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'signup' && (
                <input type="text" placeholder="Ton prénom" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              )}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Mot de passe (6 caractères minimum)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>

            {error && (
              <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', background: error.startsWith('✅') ? 'rgba(0,255,0,0.05)' : 'rgba(255,0,0,0.05)', color: error.startsWith('✅') ? '#4ade80' : '#f87171', border: `1px solid ${error.startsWith('✅') ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)'}` }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', letterSpacing: '2px', marginTop: '1.5rem', opacity: loading ? 0.7 : 1, background: 'linear-gradient(135deg,#D4AF37,#FFD700)', color: '#080808', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue',sans-serif" }}
            >
              {loading ? '...' : mode === 'login' ? 'CONNEXION' : 'CRÉER MON COMPTE'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
              {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </>
  )
}