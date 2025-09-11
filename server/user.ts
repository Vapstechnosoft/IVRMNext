'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import { signIn } from '@/lib/auth';
import type { loginSchema } from '@/schemas/auth';
import type { UserResponseData } from '@/types';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

export async function getUserByEmail(email: string, password: string) {
    // //Create payload for login
    // const payload = {
    //     email: email,
    //     password: password
    // };
    // //Send payload to login API to validate login and get user details & token
    // return await api.post<UserResponseData>('/v1/login', payload);

    const response: ApiResponse<UserResponseData> = {
        success: true,
        message: 'Logged in successfully!!',
        data: {
            user: 'Admin User',
            name: 'Admin User',
            email: email,
            role: 'SUPER_ADMIN',
            designation: 'Super Admin',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJPcmdhbml6YXRpb25JZCI6IjEiLCJDb21wYW55SWQiOiIyIiwiSWQiOiIyNjYiLCJOYW1lIjoiU3RhZmYiLCJFbWFpbCI6InN0YWZmQGdtYWlsLmNvbSIsImp0aSI6IjU2ZTQzM2Q4LWMxYjYtNGVmMy04MWYwLWNlMzZjYzNjMzMzZSIsImV4cCI6MTc1OTkwMzEwNCwiaXNzIjoiVHJhY2tBbmRUcmFjZV9BUEkiLCJhdWQiOiJUcmFja0FuZFRyYWNlX1VzZXJzIn0.TUp80mWiGRJyMNwuoqSxph3FWKyZb_Gu2YRgSuP2r7g',
            user_image: null,
            navItems: []
        }
    };
    return response;
}

interface LoginSceham {
    values: z.infer<typeof loginSchema>;
    callbackUrl?: string | null;
}

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
