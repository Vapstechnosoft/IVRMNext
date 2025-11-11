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

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Logs the user in using their email and password, and redirects them to the specified callback url after a successful login.
 *
 * @param {LoginSceham} - An object containing the email and password to be used for login, and optionally a callback URL.
 * @returns {Promise<{error: string}>} - A promise resolving to an object containing an error string if the login fails.
 */
/*******  dd5ced51-38ed-4a66-88c6-96be01e9e274  *******/
export async function login({ values, callbackUrl }: LoginSceham) {
    try {
        const { email, password } = values;
        await signIn('credentials', {
            email,
            password,
            redirectTo: callbackUrl || '/',
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
