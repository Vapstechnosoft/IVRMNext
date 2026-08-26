'use client';

import ForgotPasswordModal from './ForgotPasswordModal';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const router = useRouter();

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-slate-100'>
            <ForgotPasswordModal isOpen={true} onClose={() => router.push('/sign-in')} />
        </div>
    );
}
