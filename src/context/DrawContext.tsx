'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Design, Theme } from '@/lib/supabase'

type DrawContextType = {
  selectedTheme: Theme | null
  setSelectedTheme: (t: Theme | null) => void
  currentDesign: Design | null
  setCurrentDesign: (d: Design | null) => void
  showTirageModal: boolean
  setShowTirageModal: (v: boolean) => void
  showTesterModal: boolean
  setShowTesterModal: (v: boolean) => void
  showPaymentModal: boolean
  setShowPaymentModal: (v: boolean) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
}

const DrawContext = createContext<DrawContextType>({} as DrawContextType)

export function DrawProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null)
  const [showTirageModal, setShowTirageModal] = useState(false)
  const [showTesterModal, setShowTesterModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  return (
    <DrawContext.Provider value={{
      selectedTheme, setSelectedTheme,
      currentDesign, setCurrentDesign,
      showTirageModal, setShowTirageModal,
      showTesterModal, setShowTesterModal,
      showPaymentModal, setShowPaymentModal,
      favorites, toggleFavorite,
    }}>
      {children}
    </DrawContext.Provider>
  )
}

export const useDraw = () => useContext(DrawContext)
