import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ThemePageClient from './ThemePageClient'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase.from('themes').select('*').eq('slug', params.slug).single()
  return {
    title: `${data?.name ?? 'Thème'} — DropLuck`,
    description: `Découvre des designs ${data?.name} premium sur DropLuck. Tire au sort et porte le style.`,
  }
}

export default function ThemePage({ params }: Props) {
  return <ThemePageClient slug={params.slug} />
}
