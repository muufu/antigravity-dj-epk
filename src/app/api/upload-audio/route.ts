import { mux } from '@/lib/mux'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Demo Mode for Mux
        if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
            // Mock upload URL - this won't actually work with PUT but satisfies the frontend logic
            await supabase.from('profiles').update({ audio_status: 'uploading' }).eq('user_id', user.id)
            return NextResponse.json({
                uploadUrl: 'https://httpbin.org/put', // dummy endpoint that accepts PUT
                uploadId: 'mock-upload-id'
            })
        }

        // Create Mux direct upload
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ['public'],
            },
            cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        })

        // Update profile with upload status
        await supabase
            .from('profiles')
            .update({
                audio_status: 'uploading',
                mux_asset_id: null,
                mux_playback_id: null,
            })
            .eq('user_id', user.id)

        return NextResponse.json({
            uploadUrl: upload.url,
            uploadId: upload.id,
        })
    } catch (error) {
        console.error('Upload creation error:', error)
        return NextResponse.json({ error: 'Failed to create upload' }, { status: 500 })
    }
}
