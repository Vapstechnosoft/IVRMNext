import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { UserNav } from '../user-nav';
import Logo from './logo';
import { ResponsiveNavigation } from './responsive-navigation';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-50 w-full border-border/40 border-b bg-background/95'>
            <div className='container flex min-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-4'>
                    <Logo className='flex-shrink-0 lg:scale-90' herf={ROUTES.DASHBOARD} />
                    <ResponsiveNavigation />
                </div>

                <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
                    <div className='ml-auto flex items-center gap-2 md:ml-auto md:gap-2'>
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
