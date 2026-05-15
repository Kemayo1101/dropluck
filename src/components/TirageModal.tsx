'use client'
import { useState, useEffect } from 'react'
import { useDraw } from '@/context/DrawContext'
import { useAuth } from '@/context/AuthContext'
import { supabase, Design } from '@/lib/supabase'

function launchConfetti() {
  const colors = ['#D4AF37', '#FFD700', '#FFF8DC', '#ffffff', '#ff6b6b', '#60a5fa']
  for (let i = 0; i < 50; i++) {
    const c = document.createElement('div')
    c.className = 'confetti-piece'
    c.style.cssText = `
      left:${Math.random() * 100}vw;top:${Math.random() * 20}vh;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay:${Math.random() * 0.5}s;
      animation-duration:${1.5 + Math.random()}s
    `
    document.body.appendChild(c)
    setTimeout(() => c.remove(), 3000)
  }
}

export default function TirageModal() {
  const { showTirageModal, setShowTirageModal, selectedTheme, currentDesign, setCurrentDesign, setShowTesterModal, setShowPaymentModal, favorites, toggleFavorite } = useDraw()
  const { user, profile, refreshProfile } = useAuth()

  const [phase, setPhase] = useState<'envelope' | 'result'>('envelope')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedTheme) {
      supabase.from('designs').select('*').eq('theme_id', selectedTheme.id).eq('active', true)
        .then(({ data }) => { if (data) setDesigns(data) })
    }
  }, [selectedTheme])

  useEffect(() => {
    if (showTirageModal) {
      setPhase('envelope')
      setEnvelopeOpen(false)
      setCurrentDesign(null)
    }
  }, [showTirageModal])

  if (!showTirageModal) return null

  const tiragesLeft = profile?.tirages_restants ?? 0

  const pickDesign = (): Design | null => {
    if (!designs.length) return null
    const r = Math.random()
    const legendary = designs.filter(d => d.rarity === 'legendary')
    const common = designs.filter(d => d.rarity === 'common')
    if (r < 0.15 && legendary.length) return legendary[Math.floor(Math.random() * legendary.length)]
    return common[Math.floor(Math.random() * common.length)]
  }

  const lancerTirage = async () => {
    if (tiragesLeft <= 0) {
      setShowTirageModal(false)
      setShowPaymentModal(true)
      return
    }
    setLoading(true)
    setEnvelopeOpen(true)

    // Décrémente tirages
    if (user) {
      await supabase.from('profiles')
        .update({ tirages_restants: tiragesLeft - 1, total_tirages: (profile?.total_tirages ?? 0) + 1 })
        .eq('id', user.id)
      await refreshProfile()
    }

    setTimeout(() => {
      const d = pickDesign()
      if (d) {
        setCurrentDesign(d)
        if (d.rarity === 'legendary') launchConfetti()
        // Enregistrer dans l'historique
        if (user) {
          supabase.from('draw_history').insert({
            user_id: user.id, design_id: d.id,
            theme_id: selectedTheme?.id, rarity: d.rarity
          })
        }
      }
      setPhase('result')
      setLoading(false)
    }, 1400)
  }

  const relancer = () => {
    setPhase('envelope')
    setEnvelopeOpen(false)
    setCurrentDesign(null)
  }

  const partager = () => {
    const txt = `J'ai tiré un design ${currentDesign?.rarity === 'legendary' ? 'LÉGENDAIRE' : ''} "${currentDesign?.name}" sur DropLuck 😱 → dropluck.com`
    if (navigator.share) navigator.share({ text: txt, url: 'https://dropluck.com' })
    else navigator.clipboard.writeText(txt).then(() => alert('Texte copié !'))
  }

  return (
    <div className="modal-overlay" style={{ padding: '2rem' }}>
      {/* Bouton fermer */}
      <button
        onClick={() => setShowTirageModal(false)}
        style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          background: 'none', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
          fontSize: '1rem', cursor: 'pointer', zIndex: 10
        }}
      >✕</button>

      {/* PHASE 1: Enveloppe */}
      {phase === 'envelope' && (
        <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease-out' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {selectedTheme?.emoji} {selectedTheme?.name}
          </div>
          <div style={{ color: '#D4AF37', fontSize: '0.75rem', marginBottom: '2rem' }}>
            {tiragesLeft} tirage{tiragesLeft > 1 ? 's' : ''} restant{tiragesLeft > 1 ? 's' : ''}
          </div>

          {/* Enveloppe */}
          <div
            onClick={!envelopeOpen ? lancerTirage : undefined}
            style={{
              width: '220px', height: '160px', margin: '0 auto 2rem',
              cursor: envelopeOpen ? 'default' : 'pointer',
              position: 'relative', perspective: '600px',
              animation: !envelopeOpen ? 'floatUp 3s ease-in-out infinite' : 'none'
            }}
          >
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(160deg,#2a2a2a,#1a1a1a)',
              borderRadius: '8px', border: '1px solid rgba(212,175,55,0.4)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Rabat */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
                background: 'linear-gradient(160deg,#333,#222)',
                clipPath: 'polygon(0 0, 50% 60%, 100% 0)',
                transformOrigin: 'top center', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
                transform: envelopeOpen ? 'rotateX(180deg) scaleY(-1)' : 'rotateX(0deg)',
                zIndex: 2
              }} />
              {/* Sceau */}
              {!envelopeOpen && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: '40px', height: '40px', background: '#D4AF37',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '0.9rem', color: '#080808', zIndex: 3
                }}>DL</div>
              )}
              {/* Lignes déco */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                {[60, 40].map((w, i) => (
                  <div key={i} style={{ width: `${w}px`, height: '2px', background: 'rgba(212,175,55,0.3)', borderRadius: '2px', marginBottom: '4px' }} />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={lancerTirage}
            disabled={loading}
            className="btn-gold animate-pulse-gold"
            style={{ padding: '1.2rem 4rem', borderRadius: '50px', fontSize: '2rem', letterSpacing: '5px' }}
          >
            {loading ? '...' : tiragesLeft > 0 ? 'TIRER' : 'RECHARGER'}
          </button>
          <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '1rem', letterSpacing: '1px' }}>
            {tiragesLeft > 0 ? 'Clique pour révéler ton design' : 'Tu n\'as plus de tirages — recharge !'}
          </div>
        </div>
      )}

      {/* PHASE 2: Résultat */}
      {phase === 'result' && currentDesign && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'slideUp 0.5s ease-out' }}>

          {/* Badge rareté */}
          <div style={{
            padding: '0.5rem 1.5rem', borderRadius: '30px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '3px',
            ...(currentDesign.rarity === 'legendary'
              ? { background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37', color: '#D4AF37', animation: 'glowBadge 1.5s ease-in-out infinite alternate' }
              : { background: 'rgba(136,136,136,0.15)', border: '1px solid rgba(136,136,136,0.3)', color: '#aaa' })
          }}>
            {currentDesign.rarity === 'legendary' ? '✦ LÉGENDAIRE ✦' : 'COMMUN'}
          </div>

          {/* Design card */}
          <div style={{
  width: '220px', height: '220px',
  background: '#1a1a1a', borderRadius: '16px',
  border: currentDesign.rarity === 'legendary' ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.06)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden'
}}>
  {currentDesign.image_url ? (
    <img 
      src={currentDesign.image_url} 
      alt={currentDesign.name}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
    />
  ) : (
    <span style={{ fontSize: '6rem' }}>{currentDesign.emoji}</span>
  )}
</div>

          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '2px', textAlign: 'center' }}>
            {currentDesign.name}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            {[
              { icon: favorites.includes(currentDesign.id) ? '❤️' : '🤍', label: 'Favori', action: () => toggleFavorite(currentDesign.id) },
              { icon: '🔁', label: 'Réessayer', action: relancer },
              { icon: '⬇', label: 'Télécharger', action: () => {} },
              { icon: '📤', label: 'Partager', action: partager },
            ].map(({ icon, label, action }) => (
              <button key={label} onClick={action} style={{
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '30px',
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.color = '#D4AF37' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              >
                {icon} {label}
              </button>
            ))}
            <button
              onClick={() => { setShowTirageModal(false); setShowTesterModal(true) }}
              className="btn-gold"
              style={{ padding: '0.6rem 1.4rem', borderRadius: '30px', fontSize: '0.9rem', letterSpacing: '1px' }}
            >
              👕 Tester sur vêtement
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
