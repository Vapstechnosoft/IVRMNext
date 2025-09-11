import ThemeToggleSwitch from '@/components/ui/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <div className='fixed right-4 bottom-4'>
                <ThemeToggleSwitch />
            </div>
        </>
    );
}
