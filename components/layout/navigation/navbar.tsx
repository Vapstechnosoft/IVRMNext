import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { SearchIcon } from 'lucide-react';
import { IntelligentAppsMenu } from './intelligent-apps-menu';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import Logo from './logo';
import { OperationTools } from './operation-tools';
import { AIAgentHeader } from './ai-agent-header';
import { NavigationSystem } from './navigation-system';
import { InputText } from '@/components/ui/extension/input-text';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-30 w-full border-border/40 border-b bg-background'>
            <div className='container flex max-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-2'>
                    <Logo size='icon' herf={ROUTES.DASHBOARD} />
                    <div className='flex-1' />
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <span className='-translate-y-1/2 absolute top-1/2 right-5'>
                                <SearchIcon className='text-muted-foreground' size={16} />
                            </span>
                            <InputText
                                placeholder='Search...'
                                required
                                id='search'
                                className='w-[200px] transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                        <IntelligentAppsMenu />
                        <NavigationSystem />
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
