'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0, todayUsers: 0, totalDraws: 0,
    revenue: 0, pendingPayments: 0, avgRating: 0, totalReviews: 0
  })
  const [payments, setPayments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'users'>('dashboard')

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, loading, isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('draw_history').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'confirmed'),
      supabase.from('payments').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('reviews').select('rating'),
    ]).then(([users, todayU, draws, revenue, pending, reviews]) => {
      const totalRevenue = (revenue.data ?? []).reduce((s: number, p: any) => s + p.amount, 0)
      const avgRating = reviews.data?.length ? (reviews.data.reduce((s: number, r: any) => s + r.rating, 0) / reviews.data.length).toFixed(1) : 0
      setStats({
        totalUsers: users.count ?? 0,
        todayUsers: todayU.count ?? 0,
        totalDraws: draws.count ?? 0,
        revenue: totalRevenue,
        pendingPayments: pending.data?.length ?? 0,
        avgRating: Number(avgRating),
        totalReviews: reviews.data?.length ?? 0,
      })
      setPayments(pending.data ?? [])
    })
  }, [isAdmin])

  const confirmPayment = async (paymentId: string, userId: string) => {
    await supabase.from('payments').update({ status: 'confirmed' }).eq('id', paymentId)
    await supabase.from('profiles')
      .update({ tirages_restants: supabase.rpc('tirages_restants + 1') as any })
      .eq('id', userId)
    // Refresh
    setPayments(prev => prev.filter(p => p.id !== paymentId))
    setStats(prev => ({ ...prev, pendingPayments: prev.pendingPayments - 1, revenue: prev.revenue + 11 }))
  }

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '10rem' }}>Chargement...</div>
  if (!isAdmin) return null

  const statCards = [
    { label: 'Utilisateurs total', val: stats.totalUsers, icon: '👥' },
    { label: 'Nouveaux aujourd\'hui', val: stats.todayUsers, icon: '✨' },
    { label: 'Tirages effectués', val: stats.totalDraws, icon: '🎲' },
    { label: 'Revenus (FCFA)', val: `${stats.revenue} FCFA`, icon: '💰', gold: true },
    { label: 'Paiements en attente', val: stats.pendingPayments, icon: '⏳', warn: stats.pendingPayments > 0 },
    { label: 'Note moyenne', val: `${stats.avgRating}/5 ★`, icon: '⭐' },
  ]

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '3px', color: '#D4AF37' }}>ADMIN PANEL</div>
            <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '2px' }}>
              ACCÈS RESTREINT
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            {(['dashboard', 'payments', 'users'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: activeTab === tab ? 'rgba(212,175,55,0.15)' : '#1a1a1a',
                border: `1px solid ${activeTab === tab ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                color: activeTab === tab ? '#D4AF37' : '#888',
                padding: '0.6rem 1.5rem', borderRadius: '20px', cursor: 'pointer',
                fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}>
                {tab === 'dashboard' ? '📊 Dashboard' : tab === 'payments' ? '💳 Paiements' : '👥 Utilisateurs'}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
              {statCards.map(({ label, val, icon, gold, warn }) => (
                <div key={label} style={{
                  background: '#1a1a1a',
                  border: `1px solid ${warn ? 'rgba(255,165,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '16px', padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{icon}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: gold ? '#D4AF37' : warn ? '#FFA500' : '#fff' }}>{val}</div>
                  <div style={{ color: '#888', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.3rem' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Paiements en attente */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
                PAIEMENTS EN ATTENTE ({payments.length})
              </div>
              {payments.length === 0
                ? <div style={{ color: '#888', textAlign: 'center', padding: '3rem', background: '#1a1a1a', borderRadius: '16px' }}>Aucun paiement en attente ✅</div>
                : payments.map(p => (
                  <div key={p.id} style={{
                    background: '#1a1a1a', border: '1px solid rgba(255,165,0,0.2)',
                    borderRadius: '12px', padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.method === 'wave' ? '🌊' : '🟠'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.method === 'wave' ? 'Wave' : 'Orange Money'}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(p.created_at).toLocaleString('fr-FR')}</div>
                    </div>
                    <div style={{ color: '#D4AF37', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem' }}>{p.amount} FCFA</div>
                    <button
                      onClick={() => confirmPayment(p.id, p.user_id)}
                      style={{
                        background: 'rgba(0,200,0,0.1)', border: '1px solid rgba(0,200,0,0.3)',
                        color: '#4ade80', padding: '0.5rem 1rem', borderRadius: '20px',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700
                      }}
                    >
                      ✓ Confirmer
                    </button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </>
  )
}
