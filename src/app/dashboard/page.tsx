import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import Header from '@/components/Header'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'


export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Auto-create draft profile if none exists
    if (!profile) {
        const defaultName = user.email?.split('@')[0] || 'dj'
        const slug = generateSlug(defaultName)

        await supabase.from('profiles').insert({
            user_id: user.id,
            dj_name: defaultName,
            slug: slug,
            status: 'draft',
        })

        redirect('/dashboard/edit')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const publicUrl = `${appUrl}/${profile.slug}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <Header />
            <DashboardClient profile={profile} publicUrl={publicUrl} />
        </div>
    )
}
