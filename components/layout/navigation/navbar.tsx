import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import Logo from './logo';
import { NavigationSystem } from './navigation-system';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-50 w-full border-border/40 border-b bg-background/95'>
            <div className='container flex min-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-4'>
                    <Logo className='flex-shrink-0 lg:scale-90' herf={ROUTES.DASHBOARD} />
                    <NavigationSystem />
                    <div className='ml-auto flex items-center gap-2 md:ml-auto md:gap-2'>
                        <UserNotificationPage />
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
