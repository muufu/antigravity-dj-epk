import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ProfileForm from '@/components/ProfileForm'

export const dynamic = 'force-dynamic'


export default async function EditProfilePage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!profile) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <Header />
            <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Fill in your details to create your EPK
                    </p>
                </div>
                <ProfileForm profile={profile} userId={user.id} />
            </main>
        </div>
    )
}
