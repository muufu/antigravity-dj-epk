import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/database.types'
import PublicEPKClient from './PublicEPKClient'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

    if (!profile) {
        return {
            title: 'DJ Not Found',
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const ogImage = profile.profile_image_url || `${appUrl}/default-og.jpg`

    return {
        title: `${profile.dj_name} - DJ EPK`,
        description: profile.bio || `Listen to ${profile.dj_name}'s DJ mix`,
        openGraph: {
            title: profile.dj_name,
            description: profile.bio || `DJ mix by ${profile.dj_name}`,
            images: [ogImage],
            type: 'music.song',
            url: `${appUrl}/${profile.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: profile.dj_name,
            description: profile.bio || `DJ mix by ${profile.dj_name}`,
            images: [ogImage],
        },
    }
}

export default async function PublicEPKPage({ params }: PageProps) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

    if (!profile) {
        notFound()
    }

    return <PublicEPKClient profile={profile as Profile} />
}
