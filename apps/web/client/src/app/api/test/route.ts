import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ 
        message: 'API routing test successful',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
}

export async function POST() {
    return NextResponse.json({ 
        message: 'POST request successful',
        timestamp: new Date().toISOString()
    });
}