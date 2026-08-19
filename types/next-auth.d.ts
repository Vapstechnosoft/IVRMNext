// types/next-auth.d.ts

import type { Role } from '@/constants';
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        mi_id: number;
        name: string;
        email: string;
        token: string;
        role: Role;
        roleId?: number;
        designation: string;
        user_image: string | null;
        expires: string;
        amst_id?: number;
        mi_name?: string;
        username?: string;
        mi_logo?: string;
        expires_at?: number;
    }

    interface User {
        mi_id: number;
        name: string;
        email: string;
        token: string;
        role: Role;
        roleId?: number;
        designation: string;
        user_image: string | null;
        amst_id?: number;
        mi_name?: string;
        username?: string;
        mi_logo?: string;
        expires_in?: number | string;
        expires_at?: number;
    }

    interface JWT extends User {}
}
