# DJ EPK Builder

A mobile-first DJ Electronic Press Kit builder that allows DJs to create shareable profile pages with embedded audio players for cold outreach to venues and bookers.

**Booker clicks link → audio plays immediately → quick credential scan → contact**

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + Postgres + Storage)
- **Mux** (Audio hosting & playback)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Supabase](https://supabase.com/) account (free tier works)
- [Mux](https://mux.com/) account (free tier works)

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd dj-epk-builder
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** and run the contents of `database/schema.sql`
3. Go to **Authentication → Providers** and ensure **Email** is enabled
4. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Mux Setup

1. Create an account at [mux.com](https://mux.com/)
2. Go to **Settings → Access Tokens**
3. Create a new token with **Mux Video** read/write permissions
4. Copy the Token ID and Secret:
   - Token ID → `MUX_TOKEN_ID`
   - Token Secret → `MUX_TOKEN_SECRET`

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload-audio/route.ts    # Mux upload endpoint
│   │   └── check-asset/route.ts     # Mux asset status polling
│   ├── dashboard/
│   │   ├── page.tsx                 # Profile overview
│   │   ├── DashboardClient.tsx      # Client interactivity
│   │   └── edit/page.tsx            # Edit profile form
│   ├── login/page.tsx               # Auth page
│   ├── [slug]/
│   │   ├── page.tsx                 # Public EPK (server)
│   │   └── PublicEPKClient.tsx      # Public EPK (client)
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── Header.tsx                   # App header with logout
│   ├── MuxPlayer.tsx                # Mux audio player
│   └── ProfileForm.tsx              # Edit form component
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   ├── server.ts                # Server Supabase client
│   │   └── middleware.ts            # Auth middleware
│   ├── mux.ts                       # Mux SDK init
│   └── utils.ts                     # Slug generation, image upload
├── types/
│   └── database.types.ts            # TypeScript types
└── middleware.ts                     # Root middleware
database/
└── schema.sql                       # Supabase schema + RLS policies
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com/)
3. Add all environment variables from `.env.local` to Vercel's Environment Variables settings
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

## User Flow

1. DJ signs up / logs in
2. Draft profile is auto-created
3. DJ fills in: name, bio, genres, cities, contact info
4. DJ uploads profile image and logo
5. DJ uploads featured mix (MP3)
6. Audio processes via Mux (~30-60s)
7. DJ publishes EPK
8. DJ copies shareable link and sends to bookers
9. Booker opens link → audio plays inline → sees credentials → books DJ

## License

MIT
