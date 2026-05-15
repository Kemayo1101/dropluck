'use client'
import { useState, useRef } from 'react'
import { useDraw } from '@/context/DrawContext'

const SHIRTS = [
  { id: 'white', label: 'Blanc', dot: '#f0f0f0', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/blanc%20t-shirt.webp' },
  { id: 'black', label: 'Noir', dot: '#1a1a1a', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/noir%20t-shirt.webp' },
  { id: 'beige', label: 'Beige', dot: '#c8a882', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/berge%20t-shirt.webp' },
  { id: 'red', label: 'Rouge', dot: '#cc2200', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/Rouge%20t-shirt.webp' },
  { id: 'green', label: 'Vert', dot: '#1a7a3a', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/vert%20t-shirt.webp' },
  { id: 'purple', label: 'Violet', dot: '#7b2fbe', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/violet%20t-shirt.webp' },
  { id: 'pink', label: 'Rose', dot: '#e91e8c', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/rose%20t-shirt.webp' },
  { id: 'blue', label: 'Bleu', dot: '#1565c0', url: 'https://rdcgxymptajmwojlazyl.supabase.co/storage/v1/object/public/mockup/Bleu%20t-shirt.webp' },
]

export default function TesterModal() {
  const { showTesterModal, setShowTesterModal, currentDesign } = useDraw()
  const [selectedShirt, setSelectedShirt] = useState('white')
  const [position, setPosition] = useState<'front' | 'back'>('front')
  const [designSize, setDesignSize] = useState(3.5)
  const [designPos, setDesignPos] = useState({ x: 0, y: 0 })
  const [downloading, setDownloading] = useState(false)
  const dragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startDesign = useRef({ x: 0, y: 0 })

  if (!showTesterModal || !currentDesign) return null

  const shirt = SHIRTS.find(s => s.id === selectedShirt)!

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
    startDesign.current = { ...designPos }
    e.preventDefault()
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    setDesignPos({
      x: startDesign.current.x + (e.clientX - startPos.current.x),
      y: startDesign.current.y + (e.clientY - startPos.current.y),
    })
  }

  const onMouseUp = () => { dragging.current = false }

  const telechargerAvecShirt = async () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 600
      const ctx = canvas.getContext('2d')!
      const shirtImg = new Image()
      shirtImg.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        shirtImg.onload = resolve
        shirtImg.onerror = reject
        shirtImg.src = shirt.url
      })
      ctx.drawImage(shirtImg, 0, 0, 600, 600)
      if (currentDesign.image_url) {
        const designImg = new Image()
        designImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          designImg.onload = resolve
          designImg.onerror = reject
          designImg.src = currentDesign.image_url!
        })
        const size = designSize * 40 * 2
        const x = 300 + designPos.x - size / 2
        const y = 300 + designPos.y - size / 2
        ctx.drawImage(designImg, x, y, size, size)
      }
      const link = document.createElement('a')
      link.download = `dropluck-${currentDesign.name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch(e) {
      alert('Erreur lors du téléchargement.')
    } finally {
      setDownloading(false)
    }
  }

  const telechargerDesignSeul = () => {
    if (!currentDesign.image_url) return
    const link = document.createElement('a')
    link.href = currentDesign.image_url
    link.download = `dropluck-${currentDesign.name}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div
      className="modal-overlay"
      style={{ overflowY: 'auto', padding: '2rem', alignItems: 'flex-start', paddingTop: '4rem' }}
    >
      <button
        onClick={() => setShowTesterModal(false)}
        style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          background: 'none', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
          fontSize: '1rem', cursor: 'pointer', zIndex: 10
        }}
      >✕</button>

      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '3px', color: '#D4AF37', marginBottom: '2rem' }}>
          TESTER SUR VÊTEMENT
        </div>

        {/* Sélecteur couleur */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {SHIRTS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedShirt(s.id); setDesignPos({ x: 0, y: 0 }) }}
              style={{
                background: '#1a1a1a',
                border: `2px solid ${selectedShirt === s.id ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                color: selectedShirt === s.id ? '#D4AF37' : '#888',
                padding: '0.4rem 0.9rem', borderRadius: '20px',
                cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: s.dot, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Boutons position */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {(['front', 'back'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              style={{
                background: position === p ? 'rgba(212,175,55,0.15)' : '#1a1a1a',
                border: `1px solid ${position === p ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                color: position === p ? '#D4AF37' : '#888',
                padding: '0.6rem 1.5rem', borderRadius: '20px', cursor: 'pointer',
                fontSize: '0.85rem', letterSpacing: '1px', transition: 'all 0.2s'
              }}
            >
              {p === 'front' ? 'DEVANT' : 'DERRIÈRE'}
            </button>
          ))}
        </div>

        {/* Zone mockup */}
        <div
          style={{
            width: '320px', height: '320px', margin: '0 auto 1.5rem',
            position: 'relative', cursor: 'crosshair', userSelect: 'none',
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <img
            src={shirt.url}
            alt={shirt.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', pointerEvents: 'none' }}
          />
          <div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(calc(-50% + ${designPos.x}px), calc(-50% + ${designPos.y}px))`,
              cursor: 'grab', zIndex: 5
            }}
            onMouseDown={onMouseDown}
          >
            {currentDesign.image_url ? (
              <img
                src={currentDesign.image_url}
                alt={currentDesign.name}
                style={{
                  width: `${designSize * 40}px`,
                  height: `${designSize * 40}px`,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                }}
                draggable={false}
              />
            ) : (
              <span style={{ fontSize: `${designSize}rem` }}>{currentDesign.emoji}</span>
            )}
          </div>
        </div>

        {/* Contrôle taille */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Taille du design</span>
          <input
            type="range" min="1" max="6" step="0.1"
            value={designSize}
            onChange={e => setDesignSize(parseFloat(e.target.value))}
            style={{ width: '150px', accentColor: '#D4AF37' }}
          />
          <span style={{ color: '#D4AF37', fontSize: '0.85rem', minWidth: '30px' }}>{designSize.toFixed(1)}x</span>
        </div>

        {/* Boutons téléchargement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <button
            onClick={telechargerAvecShirt}
            disabled={downloading}
            className="btn-gold"
            style={{ padding: '0.9rem 2.5rem', borderRadius: '50px', fontSize: '1rem', letterSpacing: '2px', opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? '⏳ Téléchargement...' : '👕 TÉLÉCHARGER AVEC T-SHIRT'}
          </button>

          <button
            onClick={telechargerDesignSeul}
            style={{
              padding: '0.9rem 2.5rem', borderRadius: '50px',
              fontSize: '1rem', letterSpacing: '2px',
              background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.4)',
              color: '#D4AF37', cursor: 'pointer',
              fontFamily: "'Bebas Neue',sans-serif"
            }}
          >
            ⬇ TÉLÉCHARGER DESIGN SEUL
          </button>
        </div>
      </div>
    </div>
  )
}