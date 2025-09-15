// types/next-auth.d.ts

import type { Role } from '@/constants';
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        name: string;
        email: string;
        role: Role;
        designation: string;
        token: string;
        user_image: string | null;
        expires: string;
    }

    interface User {
        name: string;
        email: string;
        role: Role;
        designation: string;
        token: string;
        user_image: string | null;
    }

    interface JWT extends User {}
}
