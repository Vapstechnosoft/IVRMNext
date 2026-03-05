import Navbar from '@/components/layout/navigation/navbar';
import React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
