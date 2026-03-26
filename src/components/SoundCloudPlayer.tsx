'use client'

import { useState, useEffect, useRef } from 'react'

interface SoundCloudPlayerProps {
    url: string
}

interface SCWidget {
    bind: (event: string, callback: (data?: unknown) => void) => void
    play: () => void
    pause: () => void
    getDuration: (callback: (duration: number) => void) => void
    seekTo: (ms: number) => void
    getCurrentSound: (callback: (sound: { title: string } | null) => void) => void
}

interface PlayProgressData {
    currentPosition: number
}

declare global {
    interface Window {
        SC?: { Widget: (el: HTMLIFrameElement) => SCWidget }
    }
}

const SC_EVENTS = {
    READY: 'ready',
    PLAY: 'play',
    PAUSE: 'pause',
    FINISH: 'finish',
    PLAY_PROGRESS: 'play_progress',
}

export default function SoundCloudPlayer({ url }: SoundCloudPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const widgetRef = useRef<SCWidget | null>(null)
    const durationRef = useRef<number>(0)

    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [title, setTitle] = useState('')
    const [ready, setReady] = useState(false)

    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=false`

    useEffect(() => {
        const initWidget = () => {
            if (!iframeRef.current || !window.SC) return

            const widget = window.SC.Widget(iframeRef.current)
            widgetRef.current = widget

            widget.bind(SC_EVENTS.READY, () => {
                setReady(true)
                widget.getDuration((d) => {
                    durationRef.current = d
                    setDuration(d)
                })
                widget.getCurrentSound((sound) => {
                    if (sound?.title) setTitle(sound.title)
                })
            })

            widget.bind(SC_EVENTS.PLAY, () => setIsPlaying(true))
            widget.bind(SC_EVENTS.PAUSE, () => setIsPlaying(false))
            widget.bind(SC_EVENTS.FINISH, () => {
                setIsPlaying(false)
                setProgress(0)
                setCurrentTime(0)
            })
            widget.bind(SC_EVENTS.PLAY_PROGRESS, (data) => {
                const d = data as PlayProgressData
                if (d?.currentPosition !== undefined) {
                    setCurrentTime(d.currentPosition)
                    if (durationRef.current > 0) {
                        setProgress((d.currentPosition / durationRef.current) * 100)
                    }
                }
            })
        }

        if (window.SC) {
            initWidget()
        } else {
            const script = document.createElement('script')
            script.src = 'https://w.soundcloud.com/player/api.js'
            script.onload = initWidget
            document.body.appendChild(script)
            return () => {
                if (document.body.contains(script)) document.body.removeChild(script)
            }
        }
    }, [])

    const togglePlay = () => {
        if (!widgetRef.current || !ready) return
        isPlaying ? widgetRef.current.pause() : widgetRef.current.play()
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!widgetRef.current || !durationRef.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        widgetRef.current.seekTo(pct * durationRef.current)
        setProgress(pct * 100)
    }

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000)
        const m = Math.floor(s / 60)
        return `${m}:${String(s % 60).padStart(2, '0')}`
    }

    return (
        <div className="w-full">
            {/* Hidden SoundCloud iframe — provides the audio engine */}
            <iframe
                ref={iframeRef}
                src={embedUrl}
                width="1"
                height="1"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            />

            {/* Custom player UI */}
            <div className="flex items-center gap-4">
                {/* Play / Pause button */}
                <button
                    onClick={togglePlay}
                    disabled={!ready}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-white/10"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Track info + progress */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <p className="text-xs text-gray-400 truncate mb-2">{title}</p>
                    )}

                    {/* Progress bar */}
                    <div
                        className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-white rounded-full transition-none"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Times */}
                    <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                        <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {!ready && (
                <p className="text-xs text-gray-600 mt-2 text-center">Loading player...</p>
            )}
        </div>
    )
}
