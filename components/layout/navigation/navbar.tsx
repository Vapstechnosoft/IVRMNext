import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import Logo from './logo';
import { OperationTools } from './operation-tools';
import { AIAgentHeader } from './ai-agent-header';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-30 w-full border-border/40 border-b bg-background'>
            <div className='container flex max-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-2'>
                    <Logo size='icon' herf={ROUTES.DASHBOARD} />
                    <div className='flex-1' />
                    <div className='flex items-center gap-4'>
                        <OperationTools />
                        <AIAgentHeader />
                        <UserNotificationPage />
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
