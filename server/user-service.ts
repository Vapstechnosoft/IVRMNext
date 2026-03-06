'use server';

import { api } from '@/lib/apiService';
import type { UserResponseData } from '@/types';

export async function getUserByEmail(username: string, password: string) {
    const url = `/configuration/login?username=${username}&password=${password}`;

    //Send payload to login API to validate login and get user details & token
    return await api.post<UserResponseData>('preadmission', url);
}
