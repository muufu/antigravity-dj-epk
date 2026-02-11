import { mux } from '@/lib/mux'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { uploadId } = await request.json()

        if (!uploadId) {
            return NextResponse.json({ error: 'Upload ID required' }, { status: 400 })
        }

        // Demo Mode for Mux
        if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
            // Wait a bit then return success
            await supabase.from('profiles').update({
                audio_status: 'ready',
                mux_playback_id: 'mock-playback-id'
            }).eq('user_id', user.id)

            return NextResponse.json({
                status: 'ready',
                playbackId: 'mock-playback-id'
            })
        }

        // Get upload status from Mux
        const upload = await mux.video.uploads.retrieve(uploadId)

        if (upload.asset_id) {
            // Get asset details
            const asset = await mux.video.assets.retrieve(upload.asset_id)

            if (asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0) {
                // Update profile with playback ID
                await supabase
                    .from('profiles')
                    .update({
                        mux_asset_id: asset.id,
                        mux_playback_id: asset.playback_ids[0].id,
                        audio_status: 'ready',
                    })
                    .eq('user_id', user.id)

                return NextResponse.json({
                    status: 'ready',
                    playbackId: asset.playback_ids[0].id,
                })
            } else if (asset.status === 'errored') {
                await supabase
                    .from('profiles')
                    .update({ audio_status: 'error' })
                    .eq('user_id', user.id)

                return NextResponse.json({ status: 'error' })
            } else {
                // Still processing
                await supabase
                    .from('profiles')
                    .update({ audio_status: 'processing' })
                    .eq('user_id', user.id)

                return NextResponse.json({ status: 'processing' })
            }
        }

        return NextResponse.json({ status: 'uploading' })
    } catch (error) {
        console.error('Asset check error:', error)
        return NextResponse.json({ error: 'Failed to check asset' }, { status: 500 })
    }
}
