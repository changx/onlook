import { trackEvent } from '@/utils/analytics/server';
import { Routes } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { api } from '~/trpc/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Get the correct base URL for redirects
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    const baseURL = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

    if (error) {
        console.error(`OAuth error: ${error}`);
        return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
    }

    if (code) {
        const supabase = await createClient();
        
        try {
            // Use the newer method for PKCE flow
            const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
                console.error(`Error exchanging code for session: ${exchangeError.message}`);
                return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
            }

            if (!data.user) {
                console.error('No user returned from OAuth exchange');
                return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
            }

            const user = await api.user.upsert({
                id: data.user.id,
            });

            if (!user) {
                console.error(`Failed to create user for id: ${data.user.id}`, { user });
                return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
            }

            trackEvent({
                distinctId: data.user.id,
                event: 'user_signed_in',
                properties: {
                    name: data.user.user_metadata.name,
                    email: data.user.email,
                    avatar_url: data.user.user_metadata.avatar_url,
                    $set_once: {
                        signup_date: new Date().toISOString(),
                    }
                }
            });

            // Redirect to the redirect page which will handle the return URL
            return NextResponse.redirect(`${baseURL}${Routes.AUTH_REDIRECT}`);
            
        } catch (err) {
            console.error('Unexpected error during OAuth callback:', err);
            return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${baseURL}/auth/auth-code-error`);
}
