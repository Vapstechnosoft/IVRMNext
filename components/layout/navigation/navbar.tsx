import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import { AIAgentHeader } from './ai-agent-header';
import { HeaderSearch } from './header-search';
import { IntelligentAppsMenu } from './intelligent-apps-menu';
import Logo from './logo';
import { NavigationSystem } from './navigation-system';
import { OperationTools } from './operation-tools';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-30 w-full border-border/40 border-b bg-background'>
            <div className='container flex max-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-2'>
                    <Logo size='icon' herf={ROUTES.DASHBOARD} />
                    <NavigationSystem />
                    <div className='flex items-center gap-4'>
                        <HeaderSearch />
                        <OperationTools />
                        <IntelligentAppsMenu />
                        <AIAgentHeader />

                        <UserNotificationPage />
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
