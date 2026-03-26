import { NextResponse } from 'next/server'

export async function POST() {
    return NextResponse.json({ error: 'Audio upload via Mux is not enabled in this version.' }, { status: 501 })
}
