'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const DEMO_REVIEWS = [
  { id: '1', rating: 5, comment: 'J\'ai eu un design Légendaire au premier tirage ! L\'animation est incroyable 😱', profiles: { display_name: 'Koné D.' } },
  { id: '2', rating: 5, comment: 'Le mode Tester est top ! J\'ai pu voir mon design sur le t-shirt violet avant de commander.', profiles: { display_name: 'Awa F.' } },
  { id: '3', rating: 5, comment: 'Le thème Streetwear est 🔥. Les designs sont vraiment premium. Trop addictif !', profiles: { display_name: 'Moussa B.' } },
]

export default function ReviewsSection() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<any[]>(DEMO_REVIEWS)
  const [userRating, setUserRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*, profiles(display_name)')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data)
      })

    // Vérifie si l'utilisateur a déjà mis un avis
    if (user) {
      supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setSubmitted(true)
            setUserRating(data.rating)
            setComment(data.comment ?? '')
          }
        })
    }
  }, [user])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  const submitReview = async () => {
    if (!user) {
      setError('Tu dois être connecté pour laisser un avis.')
      return
    }
    if (userRating === 0) {
      setError('Clique sur les étoiles pour noter !')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          rating: userRating,
          comment: comment,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (err) {
        setError('Erreur : ' + err.message)
      } else {
        setSubmitted(true)
        // Recharger les avis
        const { data } = await supabase
          .from('reviews')
          .select('*, profiles(display_name)')
          .order('created_at', { ascending: false })
          .limit(6)
        if (data && data.length > 0) setReviews(data)
      }
    } catch(e) {
      setError('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="avis" style={{ background: '#111', padding: '5rem 2rem' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,4rem)', textAlign: 'center', letterSpacing: '2px', marginBottom: '0.5rem' }}>
        ILS ONT TIRÉ LÉGENDAIRE
      </h2>
      <div style={{ textAlign: 'center', fontSize: '2rem', color: '#D4AF37', letterSpacing: '4px', margin: '0.5rem 0' }}>
        {'★'.repeat(5)}
      </div>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '3rem' }}>
        {avgRating}/5 · {reviews.length} avis
      </p>

      {/* Grille avis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto 3rem' }}>
        {reviews.slice(0, 3).map(r => (
          <div key={r.id} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#D4AF37,rgba(212,175,55,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', color: '#080808'
              }}>
                {r.profiles?.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.profiles?.display_name ?? 'Anonyme'}</div>
                <div style={{ color: '#D4AF37', fontSize: '0.8rem' }}>{'★'.repeat(r.rating)}</div>
              </div>
            </div>
            <div style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{r.comment}</div>
          </div>
        ))}
      </div>

      {/* Formulaire avis */}
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        {!user ? (
          <div style={{ color: '#888', fontSize: '0.9rem' }}>
            <a href="/compte" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Connecte-toi</a> pour laisser un avis.
          </div>
        ) : submitted ? (
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.3rem', color: '#D4AF37' }}>Merci pour ton avis !</div>
            <button
              onClick={() => setSubmitted(false)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', marginTop: '1rem' }}
            >
              Modifier mon avis
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1rem' }}>
              NOTE TON EXPÉRIENCE
            </div>

            {/* Étoiles */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  onClick={() => setUserRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  style={{ fontSize: '2.5rem', cursor: 'pointer', color: n <= (hover || userRating) ? '#D4AF37' : '#444', transition: 'color 0.2s' }}
                >★</span>
              ))}
            </div>

            {userRating > 0 && (
              <div style={{ color: '#D4AF37', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {['', 'Très mauvais 😞', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent 🔥'][userRating]}
              </div>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ton commentaire (optionnel)..."
              style={{
                width: '100%', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '1rem',
                color: '#fff', fontSize: '0.9rem',
                resize: 'none', height: '80px', marginBottom: '1rem',
                outline: 'none', fontFamily: 'inherit'
              }}
            />

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(255,0,0,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.1)' }}>
                {error}
              </div>
            )}

            <button
              onClick={submitReview}
              disabled={loading || userRating === 0}
              style={{
                background: userRating > 0 ? 'linear-gradient(135deg,#D4AF37,#FFD700)' : '#333',
                border: 'none', color: userRating > 0 ? '#080808' : '#666',
                padding: '0.8rem 2rem', borderRadius: '30px',
                cursor: userRating > 0 ? 'pointer' : 'not-allowed',
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: '1rem', letterSpacing: '2px',
                opacity: loading ? 0.7 : 1, transition: 'all 0.3s'
              }}
            >
              {loading ? '⏳ Envoi...' : 'ENVOYER MON AVIS'}
            </button>
          </>
        )}
      </div>
    </section>
  )
}