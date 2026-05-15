'use client'
import { useState } from 'react'
import { useDraw } from '@/context/DrawContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const WAVE_URL = process.env.NEXT_PUBLIC_WAVE_PAYMENT_URL || 'https://pay.wave.com/m/M_ci_qj5yNpWbOfPI/c/ci/?amount=11'
const OM_NUMBER = process.env.NEXT_PUBLIC_OM_NUMBER || '+225 07 14 39 45 27'
const PRIX = process.env.NEXT_PUBLIC_PRIX_TIRAGE || '11'
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'kadjanechristemmanuel@gmail.com'

export default function PaymentModal() {
  const { showPaymentModal, setShowPaymentModal } = useDraw()
  const { user, profile } = useAuth()
  const [omOpen, setOmOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!showPaymentModal) return null

  const userEmail = profile?.email ?? user?.email ?? ''

  const copyNumber = () => {
    navigator.clipboard.writeText(OM_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(userEmail)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const logPayment = async (method: 'wave' | 'orange_money') => {
    if (!user) return
    await supabase.from('payments').insert({
      user_id: user.id,
      amount: parseInt(PRIX),
      currency: 'FCFA',
      method,
      status: 'pending',
      tirages_added: 1,
      reference: userEmail,
    })
  }

  const handleWave = async () => {
    await logPayment('wave')
    window.open(WAVE_URL, '_blank')
  }

  const confirmOM = async () => {
    if (!user) return
    setConfirming(true)
    try {
      await logPayment('orange_money')
      setSuccess(true)
      setTimeout(() => {
        setConfirming(false)
        setShowPaymentModal(false)
        setSuccess(false)
      }, 2000)
    } catch(e) {
      setConfirming(false)
      alert('Une erreur est survenue, réessaie.')
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{ padding: '2rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false) }}
    >
      <div style={{
        background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '24px', padding: '2.5rem', width: '100%',
        maxWidth: '420px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '3px', color: '#D4AF37', marginBottom: '0.3rem' }}>
          RECHARGER
        </div>
        <div style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1rem' }}>
          TIRAGES SUPPLÉMENTAIRES
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', lineHeight: 1, margin: '1rem 0' }}>
          <span style={{ color: '#D4AF37' }}>{PRIX}</span> FCFA
        </div>
        <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          1 tirage · Paiement 100% sécurisé · Mobile Money
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ===== WAVE ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button
              onClick={handleWave}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.2rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
                border: '1px solid rgba(0,170,255,0.25)', background: '#111',
                color: '#fff', textAlign: 'left', transition: 'all 0.3s', width: '100%',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg,#0057FF,#00AAFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>🌊</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Wave</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Clique pour payer {PRIX} FCFA</div>
              </div>
              <div style={{ color: '#00AAFF', fontSize: '1.2rem' }}>→</div>
            </button>

            {/* Message après paiement Wave */}
            <div style={{
              background: 'rgba(0,170,255,0.05)', border: '1px solid rgba(0,170,255,0.15)',
              borderRadius: '12px', padding: '1rem', textAlign: 'left',
              fontSize: '0.8rem', color: '#888', lineHeight: 1.7
            }}>
              <div style={{ color: '#00AAFF', fontWeight: 700, marginBottom: '0.4rem' }}>
                📩 Après ton paiement Wave :
              </div>
              <div>
                Envoie ton email à <strong style={{ color: '#fff' }}>{ADMIN_EMAIL}</strong> avec l'objet <strong style={{ color: '#00AAFF' }}>"DROPLUCK WAVE"</strong> pour recevoir ton tirage rapidement.
              </div>
              {userEmail && (
                <div style={{ marginTop: '0.8rem' }}>
                  <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.4rem' }}>TON EMAIL :</div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '0.5rem 0.8rem',
                    fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
                  }}>
                    <span>{userEmail}</span>
                    <button
                      onClick={copyEmail}
                      style={{
                        background: 'rgba(0,170,255,0.15)', border: '1px solid rgba(0,170,255,0.3)',
                        color: '#00AAFF', padding: '0.2rem 0.6rem', borderRadius: '10px',
                        cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0
                      }}
                    >
                      {copiedEmail ? '✓ Copié' : '📋 Copier'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== ORANGE MONEY ===== */}
          <button
            onClick={() => setOmOpen(!omOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.2rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
              border: `1px solid ${omOpen ? 'rgba(255,102,0,0.6)' : 'rgba(255,102,0,0.25)'}`,
              background: '#111', color: '#fff', textAlign: 'left',
              transition: 'all 0.3s', width: '100%',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg,#FF6600,#FF9900)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
            }}>🟠</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Orange Money</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Envoi au numéro ci-dessous</div>
            </div>
            <div style={{ color: '#FF9900', fontSize: '1.2rem' }}>{omOpen ? '↓' : '→'}</div>
          </button>

          {/* Détails Orange Money */}
          {omOpen && (
            <div style={{
              background: 'rgba(255,102,0,0.07)', border: '1px solid rgba(255,102,0,0.25)',
              borderRadius: '14px', padding: '1.2rem', textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                ÉTAPE 1 — ENVOIE {PRIX} FCFA AU NUMÉRO :
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '2px', color: '#FF9900', marginBottom: '0.5rem' }}>
                {OM_NUMBER}
              </div>
              <button
                onClick={copyNumber}
                style={{
                  background: 'rgba(255,102,0,0.15)', border: '1px solid rgba(255,102,0,0.3)',
                  color: '#FF9900', padding: '0.4rem 1rem', borderRadius: '20px',
                  cursor: 'pointer', fontSize: '0.8rem', marginBottom: '1.2rem'
                }}
              >
                {copied ? '✓ Numéro copié !' : '📋 Copier le numéro'}
              </button>

              <div style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                ÉTAPE 2 — MET TON EMAIL EN OBJET DU TRANSFERT :
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '0.8rem', marginBottom: '0.5rem',
                fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all'
              }}>
                {userEmail || 'Connecte-toi pour voir ton email'}
              </div>
              {userEmail && (
                <button
                  onClick={copyEmail}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#888', padding: '0.4rem 1rem', borderRadius: '20px',
                    cursor: 'pointer', fontSize: '0.8rem', marginBottom: '1.2rem'
                  }}
                >
                  {copiedEmail ? '✓ Email copié !' : '📋 Copier mon email'}
                </button>
              )}

              <div style={{
                background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '10px', padding: '0.8rem', marginBottom: '1rem',
                fontSize: '0.75rem', color: '#888', lineHeight: 1.6
              }}>
                💡 Mettre ton email en objet permet à l'admin de <strong style={{ color: '#D4AF37' }}>t'identifier rapidement</strong> et de confirmer ton tirage plus vite.
              </div>

              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.8rem' }}>
                ÉTAPE 3 — Après ton envoi, clique sur <strong style={{ color: '#fff' }}>"J'ai payé"</strong>
              </div>
              <button
                onClick={confirmOM}
                disabled={confirming}
                style={{
                  background: success ? 'rgba(0,200,0,0.2)' : 'linear-gradient(135deg,#FF6600,#FF9900)',
                  border: 'none', color: '#fff', padding: '0.8rem 2rem',
                  borderRadius: '30px', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.9rem', width: '100%', letterSpacing: '1px',
                  opacity: confirming ? 0.7 : 1
                }}
              >
                {success ? '✅ Paiement enregistré !' : confirming ? '⏳ Enregistrement...' : "✅ J'ai payé — Confirmer"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowPaymentModal(false)}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            color: '#888', padding: '0.7rem 2rem', borderRadius: '30px',
            cursor: 'pointer', marginTop: '1.5rem', fontSize: '0.85rem'
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  )
}