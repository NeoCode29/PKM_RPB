import { createServerClient } from '@supabase/ssr';
import { headers } from 'next/headers';

export const supabaseServer = async () => {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    const cookie = cookieHeader
                        .split(';')
                        .find((c: string) => c.trim().startsWith(`${name}=`));
                    if (!cookie) return null;
                    const value = cookie.split('=')[1];
                    return decodeURIComponent(value);
                },
                set(name: string, value: string, options: any) {
                    // Cookie management is handled by middleware
                },
                remove(name: string, options: any) {
                    // Cookie management is handled by middleware
                },
            },
        }
    );
}