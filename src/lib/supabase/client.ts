import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Demo Mode: credentials missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Demo Mode: Supabase credentials missing. Using mock data.')

        const mockUser = {
            id: 'mock-user-id',
            email: 'fu.marissa@gmail.com',
        }

        const mockProfile = {
            id: 'mock-profile-id',
            user_id: 'mock-user-id',
            dj_name: 'Marissa Fu',
            slug: 'marissa-fu',
            status: 'draft',
            audio_status: 'none',
            genres: ['House', 'Techno'],
            cities_played: ['New York', 'Ibiza'],
        }

        return {
            auth: {
                signInWithPassword: () => {
                    // Simulate network delay
                    return new Promise(resolve => setTimeout(() => resolve({ data: { user: mockUser, session: {} }, error: null }), 500))
                },
                signUp: () => Promise.resolve({ data: { user: mockUser, session: {} }, error: null }),
                getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
                signOut: () => Promise.resolve({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            },
            from: (table: string) => ({
                select: () => ({
                    eq: () => ({
                        single: () => Promise.resolve({ data: mockProfile, error: null }),
                        maybeSingle: () => Promise.resolve({ data: mockProfile, error: null }),
                    }),
                    order: () => ({}),
                }),
                insert: () => Promise.resolve({ data: mockProfile, error: null }),
                update: () => Promise.resolve({ data: mockProfile, error: null }),
                upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/500' } }),
            }),
            storage: {
                from: () => ({
                    upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
                    getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/500' } }),
                }),
            }
        } as any
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
