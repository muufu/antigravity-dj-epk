import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-xl">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 mb-8 shadow-2xl shadow-purple-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            DJ EPK
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Builder</span>
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Create a shareable press kit with embedded audio.
            Send it to bookers. Get booked.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started — Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white font-medium hover:bg-gray-800 transition-all border border-gray-700/50"
            >
              Sign In
            </Link>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-4 mt-14 text-center">
            <div>
              <div className="text-2xl mb-1">🎵</div>
              <p className="text-xs text-gray-500">Inline Audio</p>
            </div>
            <div>
              <div className="text-2xl mb-1">📱</div>
              <p className="text-xs text-gray-500">Mobile-First</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🔗</div>
              <p className="text-xs text-gray-500">Share Anywhere</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-xs relative z-10">
        DJ EPK Builder — Built for DJs who want to get booked
      </footer>
    </div>
  )
}
