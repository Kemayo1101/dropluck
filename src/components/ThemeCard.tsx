'use client'
import { useDraw } from '@/context/DrawContext'
import { Theme } from '@/lib/supabase'

export default function ThemeCard({ theme }: { theme: Theme }) {
  const { setSelectedTheme, setShowTirageModal } = useDraw()

  const handleClick = () => {
    setSelectedTheme(theme)
    setShowTirageModal(true)
  }

  return (
    <div
      onClick={handleClick}
      className="card-dark"
      style={{ padding: '2rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.3s',
        background: 'radial-gradient(circle at 50% 50%,rgba(212,175,55,0.08),transparent 70%)'
      }} className="card-glow" />
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>{theme.emoji}</span>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
        {theme.name}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888' }}>{theme.designs_count} designs disponibles</div>
      {theme.tag && (
        <div style={{
          display: 'inline-block', background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
          padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem',
          marginTop: '0.8rem', letterSpacing: '1px'
        }}>
          {theme.tag}
        </div>
      )}
    </div>
  )
}
