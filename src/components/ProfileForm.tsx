'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug, uploadImageToSupabase } from '@/lib/utils'
import { Profile, AudioStatus } from '@/types/database.types'
import MuxAudioPlayer from '@/components/MuxPlayer'

interface ProfileFormProps {
    profile: Profile
    userId: string
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
    const router = useRouter()
    const supabase = createClient()

    // Form state
    const [djName, setDjName] = useState(profile.dj_name)
    const [slug, setSlug] = useState(profile.slug)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [bio, setBio] = useState(profile.bio || '')
    const [genres, setGenres] = useState(profile.genres?.join(', ') || '')
    const [citiesPlayed, setCitiesPlayed] = useState(profile.cities_played?.join(', ') || '')
    const [contactEmail, setContactEmail] = useState(profile.contact_email || '')
    const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url || '')
    const [profileImageUrl, setProfileImageUrl] = useState(profile.profile_image_url || '')
    const [logoUrl, setLogoUrl] = useState(profile.logo_url || '')
    const [audioStatus, setAudioStatus] = useState<AudioStatus>(profile.audio_status as AudioStatus)
    const [muxPlaybackId, setMuxPlaybackId] = useState(profile.mux_playback_id || '')

    // UI state
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [slugError, setSlugError] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState<'profile' | 'logo' | null>(null)
    const [uploadingAudio, setUploadingAudio] = useState(false)
    const [audioUploadProgress, setAudioUploadProgress] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Track unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    const markDirty = useCallback(() => {
        setHasUnsavedChanges(true)
        setMessage(null)
    }, [])

    // Auto-generate slug from DJ name
    useEffect(() => {
        if (!slugManuallyEdited && djName) {
            setSlug(generateSlug(djName))
        }
    }, [djName, slugManuallyEdited])

    // Validate slug uniqueness
    const validateSlug = async (slugValue: string) => {
        if (!slugValue) {
            setSlugError('Slug is required')
            return
        }

        if (!/^[a-z0-9-]+$/.test(slugValue)) {
            setSlugError('Only lowercase letters, numbers, and hyphens')
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', slugValue)
            .neq('id', profile.id)
            .maybeSingle()

        if (data) {
            setSlugError('This URL is already taken')
        } else {
            setSlugError(null)
        }
    }

    // Validate form
    const validate = (forPublish: boolean): boolean => {
        const newErrors: Record<string, string> = {}

        if (!djName || djName.trim().length < 2) {
            newErrors.djName = 'DJ name must be at least 2 characters'
        }

        if (!slug) {
            newErrors.slug = 'Slug is required'
        }

        if (slugError) {
            newErrors.slug = slugError
        }

        if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
            newErrors.contactEmail = 'Invalid email format'
        }

        if (instagramUrl && !instagramUrl.startsWith('http')) {
            newErrors.instagramUrl = 'Must be a valid URL starting with http'
        }

        if (forPublish && audioStatus !== 'ready') {
            newErrors.audio = 'Audio must be uploaded and ready before publishing'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Build profile data from form state
    const getFormData = () => ({
        dj_name: djName.trim(),
        slug: slug.trim(),
        bio: bio.trim() || null,
        genres: genres ? genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
        cities_played: citiesPlayed ? citiesPlayed.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
        contact_email: contactEmail.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        profile_image_url: profileImageUrl || null,
        logo_url: logoUrl || null,
    })

    // Save draft
    const handleSaveDraft = async () => {
        if (!validate(false)) return

        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ ...getFormData(), status: 'draft' })
                .eq('id', profile.id)

            if (error) throw error

            setHasUnsavedChanges(false)
            setMessage({ type: 'success', text: 'Draft saved successfully!' })
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' })
        } finally {
            setSaving(false)
        }
    }

    // Publish
    const handlePublish = async () => {
        if (!validate(true)) return

        setPublishing(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ ...getFormData(), status: 'published' })
                .eq('id', profile.id)

            if (error) throw error

            setHasUnsavedChanges(false)
            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to publish' })
        } finally {
            setPublishing(false)
        }
    }

    // Handle image upload
    const handleImageUpload = async (file: File, type: 'profile' | 'logo') => {
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' })
            return
        }

        setUploadingImage(type)
        try {
            const url = await uploadImageToSupabase(supabase, file, userId, type)
            if (url) {
                if (type === 'profile') {
                    setProfileImageUrl(url)
                } else {
                    setLogoUrl(url)
                }
                markDirty()
            } else {
                setMessage({ type: 'error', text: `Failed to upload ${type} image` })
            }
        } catch {
            setMessage({ type: 'error', text: `Failed to upload ${type} image` })
        } finally {
            setUploadingImage(null)
        }
    }

    // Handle audio upload
    const handleAudioUpload = async (file: File) => {
        if (file.size > 200 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Audio file must be less than 200MB' })
            return
        }

        setUploadingAudio(true)
        setAudioStatus('uploading')
        setAudioUploadProgress(0)

        try {
            // 1. Get upload URL from our API
            const response = await fetch('/api/upload-audio', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to create upload')
            }

            const { uploadUrl, uploadId } = await response.json()

            // 2. Upload file directly to Mux
            const xhr = new XMLHttpRequest()

            await new Promise<void>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setAudioUploadProgress(Math.round((e.loaded / e.total) * 100))
                    }
                })

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve()
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`))
                    }
                })

                xhr.addEventListener('error', () => reject(new Error('Upload failed')))

                xhr.open('PUT', uploadUrl)
                xhr.send(file)
            })

            // 3. Poll for asset readiness
            setAudioStatus('processing')
            setUploadingAudio(false)

            pollAssetStatus(uploadId)
        } catch (err) {
            console.error('Audio upload error:', err)
            setAudioStatus('error')
            setUploadingAudio(false)
            setMessage({ type: 'error', text: 'Failed to upload audio' })
        }
    }

    // Poll Mux asset status
    const pollAssetStatus = (uploadId: string) => {
        const maxAttempts = 60 // 5 minutes with 5s intervals
        let attempts = 0

        const interval = setInterval(async () => {
            attempts++

            try {
                const response = await fetch('/api/check-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uploadId }),
                })

                const data = await response.json()

                if (data.status === 'ready') {
                    clearInterval(interval)
                    setAudioStatus('ready')
                    setMuxPlaybackId(data.playbackId)
                    markDirty()
                } else if (data.status === 'error' || attempts >= maxAttempts) {
                    clearInterval(interval)
                    setAudioStatus('error')
                    setMessage({ type: 'error', text: 'Audio processing failed. Please try again.' })
                } else {
                    setAudioStatus(data.status)
                }
            } catch {
                clearInterval(interval)
                setAudioStatus('error')
            }
        }, 5000)
    }

    return (
        <div className="space-y-6">
            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-xl text-sm ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* DJ Name */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Basic Info
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="djName" className="block text-sm text-gray-400 mb-1.5">
                            DJ Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="djName"
                            type="text"
                            value={djName}
                            onChange={(e) => { setDjName(e.target.value); markDirty() }}
                            placeholder="Your DJ name"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                        />
                        {errors.djName && <p className="text-red-400 text-xs mt-1">{errors.djName}</p>}
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm text-gray-400 mb-1.5">
                            URL Slug <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm shrink-0">yoursite.com/</span>
                            <input
                                id="slug"
                                type="text"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                                    setSlugManuallyEdited(true)
                                    markDirty()
                                }}
                                onBlur={() => validateSlug(slug)}
                                placeholder="your-dj-name"
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm font-mono"
                            />
                        </div>
                        {(errors.slug || slugError) && (
                            <p className="text-red-400 text-xs mt-1">{errors.slug || slugError}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm text-gray-400 mb-1.5">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => { setBio(e.target.value.slice(0, 500)); markDirty() }}
                            placeholder="Tell bookers about yourself..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Profile Image */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Profile Photo</label>
                        <div className="relative">
                            {profileImageUrl ? (
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => { setProfileImageUrl(''); markDirty() }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-gray-700/50 hover:border-purple-500/50 bg-gray-800/30 cursor-pointer transition-colors">
                                    {uploadingImage === 'profile' ? (
                                        <svg className="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                            </svg>
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleImageUpload(file, 'profile')
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Logo</label>
                        <div className="relative">
                            {logoUrl ? (
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                                    <button
                                        onClick={() => { setLogoUrl(''); markDirty() }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-gray-700/50 hover:border-blue-500/50 bg-gray-800/30 cursor-pointer transition-colors">
                                    {uploadingImage === 'logo' ? (
                                        <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                            </svg>
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleImageUpload(file, 'logo')
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max 5MB per image</p>
            </div>

            {/* Audio Upload */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Featured Mix <span className="text-red-400 text-xs">* Required to publish</span>
                </h3>

                {audioStatus === 'ready' && muxPlaybackId ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Audio ready
                        </div>
                        <MuxAudioPlayer playbackId={muxPlaybackId} title={djName} />
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white text-sm cursor-pointer transition-colors border border-gray-700/50">
                            Replace audio
                            <input
                                type="file"
                                accept=".mp3,audio/mpeg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleAudioUpload(file)
                                }}
                            />
                        </label>
                    </div>
                ) : audioStatus === 'uploading' || uploadingAudio ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading... {audioUploadProgress}%
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${audioUploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : audioStatus === 'processing' ? (
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing audio... This may take a minute.
                    </div>
                ) : audioStatus === 'error' ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            Processing failed. Please try uploading again.
                        </div>
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white text-sm cursor-pointer transition-colors border border-gray-700/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload MP3
                            <input
                                type="file"
                                accept=".mp3,audio/mpeg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleAudioUpload(file)
                                }}
                            />
                        </label>
                    </div>
                ) : (
                    <div>
                        <label className="flex flex-col items-center justify-center w-full py-10 rounded-xl border-2 border-dashed border-gray-700/50 hover:border-green-500/50 bg-gray-800/20 cursor-pointer transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                            </svg>
                            <span className="text-sm text-gray-400">Drop your MP3 here or click to upload</span>
                            <span className="text-xs text-gray-500 mt-1">Max 200MB</span>
                            <input
                                type="file"
                                accept=".mp3,audio/mpeg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleAudioUpload(file)
                                }}
                            />
                        </label>
                        {errors.audio && <p className="text-red-400 text-xs mt-2">{errors.audio}</p>}
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    Details
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="genres" className="block text-sm text-gray-400 mb-1.5">
                            Genres
                        </label>
                        <input
                            id="genres"
                            type="text"
                            value={genres}
                            onChange={(e) => { setGenres(e.target.value); markDirty() }}
                            placeholder="House, Techno, Deep House..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                    </div>

                    <div>
                        <label htmlFor="cities" className="block text-sm text-gray-400 mb-1.5">
                            Cities Played
                        </label>
                        <input
                            id="cities"
                            type="text"
                            value={citiesPlayed}
                            onChange={(e) => { setCitiesPlayed(e.target.value); markDirty() }}
                            placeholder="New York, Berlin, Tokyo..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Contact
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="contactEmail" className="block text-sm text-gray-400 mb-1.5">
                            Booking Email
                        </label>
                        <input
                            id="contactEmail"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => { setContactEmail(e.target.value); markDirty() }}
                            placeholder="bookings@yourdj.com"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                        />
                        {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                        <label htmlFor="instagram" className="block text-sm text-gray-400 mb-1.5">
                            Instagram URL
                        </label>
                        <input
                            id="instagram"
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => { setInstagramUrl(e.target.value); markDirty() }}
                            placeholder="https://instagram.com/yourdj"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                        />
                        {errors.instagramUrl && <p className="text-red-400 text-xs mt-1">{errors.instagramUrl}</p>}
                    </div>
                </div>
            </div>

            {/* Actions - Fixed bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800/50 p-4">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-white font-medium text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-700/50"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={publishing || audioStatus !== 'ready'}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                    >
                        {publishing ? 'Publishing...' : 'Publish EPK'}
                    </button>
                </div>
            </div>
        </div>
    )
}
