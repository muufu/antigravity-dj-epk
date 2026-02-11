'use client'

import MuxPlayerElement from '@mux/mux-player-react'

interface MuxAudioPlayerProps {
    playbackId: string
    title?: string
}

export default function MuxAudioPlayer({ playbackId, title = 'DJ Mix' }: MuxAudioPlayerProps) {
    return (
        <div className="w-full">
            <MuxPlayerElement
                playbackId={playbackId}
                metadata={{
                    video_title: title,
                }}
                streamType="on-demand"
                audio
                accentColor="#8b5cf6"
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    borderRadius: '12px',
                }}
            />
        </div>
    )
}
