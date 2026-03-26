import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

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
                getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
                getSession: () => Promise.resolve({ data: { session: {} }, error: null }),
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            from: (_table: string) => ({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
}
