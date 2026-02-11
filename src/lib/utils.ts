import { SupabaseClient } from '@supabase/supabase-js'

export function generateSlug(djName: string): string {
    return djName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function generateRandomSuffix(): string {
    return Math.random().toString(36).substring(2, 6)
}

export async function getUniqueSlug(
    supabase: SupabaseClient,
    baseSlug: string,
): Promise<string> {
    let slug = baseSlug
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (!data) {
            return slug
        }

        slug = `${baseSlug}-${generateRandomSuffix()}`
        attempts++
    }

    throw new Error('Unable to generate unique slug')
}

export async function uploadImageToSupabase(
    supabase: SupabaseClient,
    file: File,
    userId: string,
    type: 'profile' | 'logo'
): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        console.error('Upload error:', error)
        return null
    }

    const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

    return publicUrl
}
