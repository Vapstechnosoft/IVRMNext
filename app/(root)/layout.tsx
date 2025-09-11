import Navbar from '@/components/layout/navigation/navbar';
import type React from 'react';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
