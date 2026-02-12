import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import Logo from './logo';
import { NavigationSystem } from './navigation-system';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-30 w-full border-border/40 border-b bg-background'>
            <div className='container flex max-h-14 items-center overflow-clip py-2'>
                <div className='flex w-full items-center gap-2'>
                    <Logo size='icon' herf={ROUTES.DASHBOARD} />
                    <NavigationSystem />
                    <div className='flex items-center gap-4'>
                        <div className='flex cursor-pointer items-center gap-1'>
                            <span>
                                <QuestionMarkCircledIcon className='text-muted-foreground' height={16} width={16} />
                            </span>
                            <p>Help</p>
                        </div>
                        <UserNotificationPage />
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
