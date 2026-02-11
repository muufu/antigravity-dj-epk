export type AudioStatus = 'none' | 'uploading' | 'processing' | 'ready' | 'error'
export type ProfileStatus = 'draft' | 'published'

export interface Profile {
    id: string
    user_id: string
    dj_name: string
    slug: string
    profile_image_url: string | null
    logo_url: string | null
    bio: string | null
    genres: string[]
    cities_played: string[]
    contact_email: string | null
    instagram_url: string | null
    mux_asset_id: string | null
    mux_playback_id: string | null
    audio_status: AudioStatus
    status: ProfileStatus
    created_at: string
    updated_at: string
}

export interface ProfileInsert {
    user_id: string
    dj_name: string
    slug: string
    profile_image_url?: string | null
    logo_url?: string | null
    bio?: string | null
    genres?: string[]
    cities_played?: string[]
    contact_email?: string | null
    instagram_url?: string | null
    mux_asset_id?: string | null
    mux_playback_id?: string | null
    audio_status?: AudioStatus
    status?: ProfileStatus
}

export interface ProfileUpdate {
    dj_name?: string
    slug?: string
    profile_image_url?: string | null
    logo_url?: string | null
    bio?: string | null
    genres?: string[]
    cities_played?: string[]
    contact_email?: string | null
    instagram_url?: string | null
    mux_asset_id?: string | null
    mux_playback_id?: string | null
    audio_status?: AudioStatus
    status?: ProfileStatus
}

// Supabase Database type helper
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: ProfileInsert
                Update: ProfileUpdate
            }
        }
    }
}
