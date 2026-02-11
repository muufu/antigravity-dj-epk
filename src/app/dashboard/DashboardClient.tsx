'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Profile } from '@/types/database.types'

interface DashboardClientProps {
    profile: Profile
    publicUrl: string
}

export default function DashboardClient({ profile, publicUrl }: DashboardClientProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = publicUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const isPublished = profile.status === 'published'

    return (
        <main className="max-w-lg mx-auto px-4 py-10">
            {/* Status Badge */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50 mb-4">
                    <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-400 shadow-sm shadow-green-400/50' : 'bg-yellow-400 shadow-sm shadow-yellow-400/50'}`} />
                    <span className="text-sm text-gray-300">
                        {isPublished ? 'Published' : 'Draft'}
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-1">{profile.dj_name}</h1>
                <p className="text-gray-500 text-sm">
                    {isPublished ? 'Your EPK is live and shareable' : 'Complete your profile to publish'}
                </p>
            </div>

            {/* Actions Card */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 space-y-4">
                <Link
                    href="/dashboard/edit"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    Edit Profile
                </Link>

                {isPublished && (
                    <>
                        <div className="border-t border-gray-800/50 pt-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your EPK Link</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 px-3 py-2.5 bg-gray-800/50 rounded-lg text-sm text-gray-300 truncate font-mono">
                                    {publicUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-white transition-colors border border-gray-700/50"
                                >
                                    {copied ? (
                                        <span className="flex items-center gap-1 text-green-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            Copied
                                        </span>
                                    ) : (
                                        'Copy'
                                    )}
                                </button>
                            </div>
                        </div>

                        <Link
                            href={`/${profile.slug}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white font-medium text-sm hover:bg-gray-800 transition-all border border-gray-700/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Preview Public Page
                        </Link>
                    </>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Audio</p>
                    <p className="text-sm font-medium text-white">
                        {profile.audio_status === 'ready' ? '✓ Ready' :
                            profile.audio_status === 'processing' ? '⏳ Processing' :
                                profile.audio_status === 'uploading' ? '↑ Uploading' :
                                    profile.audio_status === 'error' ? '✕ Error' : '—  None'}
                    </p>
                </div>
                <div className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Genres</p>
                    <p className="text-sm font-medium text-white">
                        {profile.genres && profile.genres.length > 0
                            ? profile.genres.slice(0, 2).join(', ')
                            : '— None'}
                    </p>
                </div>
            </div>
        </main>
    )
}
