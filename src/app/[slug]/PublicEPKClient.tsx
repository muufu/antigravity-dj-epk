'use client'

import { Profile } from '@/types/database.types'
import MuxAudioPlayer from '@/components/MuxPlayer'

interface PublicEPKClientProps {
    profile: Profile
}

export default function PublicEPKClient({ profile }: PublicEPKClientProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Ambient background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <main className="relative z-10 max-w-lg mx-auto px-4 py-10">
                {/* Profile Header */}
                <div className="text-center mb-8">
                    {/* Profile Image */}
                    {profile.profile_image_url && (
                        <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-purple-500/30 ring-offset-4 ring-offset-gray-950 shadow-xl shadow-purple-500/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={profile.profile_image_url}
                                alt={profile.dj_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Logo */}
                    {profile.logo_url && (
                        <div className="w-16 h-16 mx-auto mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={profile.logo_url}
                                alt={`${profile.dj_name} logo`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* DJ Name */}
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                        {profile.dj_name}
                    </h1>

                    {/* Genres inline */}
                    {profile.genres && profile.genres.length > 0 && (
                        <p className="text-gray-400 text-sm">
                            {profile.genres.join(' · ')}
                        </p>
                    )}
                </div>

                {/* Audio Player — Hero Feature */}
                {profile.mux_playback_id && (
                    <div className="mb-8">
                        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                Featured Mix
                            </p>
                            <MuxAudioPlayer
                                playbackId={profile.mux_playback_id}
                                title={`${profile.dj_name} - Mix`}
                            />
                        </div>
                    </div>
                )}

                {/* Bio */}
                {profile.bio && (
                    <div className="mb-6">
                        <div className="bg-gray-900/40 border border-gray-800/30 rounded-2xl p-5">
                            <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">About</h2>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        </div>
                    </div>
                )}

                {/* Genres & Cities */}
                {((profile.genres && profile.genres.length > 0) || (profile.cities_played && profile.cities_played.length > 0)) && (
                    <div className="mb-6 grid gap-3">
                        {profile.genres && profile.genres.length > 0 && (
                            <div className="bg-gray-900/40 border border-gray-800/30 rounded-2xl p-5">
                                <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    🎵 Genres
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.genres.map((genre, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-xs font-medium border border-purple-500/20"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.cities_played && profile.cities_played.length > 0 && (
                            <div className="bg-gray-900/40 border border-gray-800/30 rounded-2xl p-5">
                                <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    📍 Played In
                                </h2>
                                <p className="text-gray-300 text-sm">
                                    {profile.cities_played.join(' · ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Contact */}
                {(profile.contact_email || profile.instagram_url) && (
                    <div className="grid gap-3">
                        {profile.contact_email && (
                            <a
                                href={`mailto:${profile.contact_email}`}
                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white font-medium text-sm hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/15 active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Book Me
                            </a>
                        )}

                        {profile.instagram_url && (
                            <a
                                href={profile.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white font-medium text-sm hover:bg-gray-800 transition-all border border-gray-700/50 active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                                Instagram
                            </a>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 text-xs">
                        Built with DJ EPK Builder
                    </p>
                </div>
            </main>
        </div>
    )
}
