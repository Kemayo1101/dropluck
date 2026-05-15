import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { DrawProvider } from '@/context/DrawContext'

export const metadata: Metadata = {
  title: 'DropLuck — Découvre ton design légendaire',
  description: 'Choisis un univers. Tire au sort. Porte le style. Designs premium à imprimer sur vêtements.',
  keywords: 'design, streetwear, t-shirt, tirage, anime, motivation, Côte d\'Ivoire',
  openGraph: {
    title: 'DropLuck — Designs Légendaires',
    description: 'Tire un design premium et porte-le sur ton t-shirt !',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <DrawProvider>
            {children}
          </DrawProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
