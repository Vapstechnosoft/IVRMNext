'use server';

import { api } from '@/lib/apiService';
import { signIn } from '@/lib/auth';
import type { loginSchema } from '@/schemas/admission/preadmission/masters';
import type { UserResponseData } from '@/types';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

export async function getUserByEmail(username: string, password: string) {
    const url = `/configuration/login?username=${username}&password=${password}`;

    //Send payload to login API to validate login and get user details & token
    return await api.post<UserResponseData>('preadmission', url);
}

interface LoginSceham {
    values: z.infer<typeof loginSchema>;
    callbackUrl?: string | null;
}

export async function login({ values, callbackUrl }: LoginSceham) {
    try {
        const { email, password } = values;

        // Sanitize callbackUrl to ensure it's a relative path
        // This prevents redirection to production URLs when on localhost
        let redirectTo = callbackUrl || '/';
        if (redirectTo.startsWith('http')) {
            try {
                const url = new URL(redirectTo);
                redirectTo = url.pathname + url.search + url.hash;
            } catch (e) {
                redirectTo = '/';
            }
        }

        await signIn('credentials', {
            email,
            password,
            redirectTo,
            redirect: true
        });
        revalidatePath('/');
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: error.message || 'Invalid credentials!' };
                default:
                    return { error: error.message || 'Something went wrong!' };
            }
        }

        throw error;
    }
}
