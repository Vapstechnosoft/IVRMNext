import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { SearchIcon } from 'lucide-react';
import { IntelligentAppsMenu } from './header-intelligent-apps';
import { UserNav } from '../user-nav';
import UserNotificationPage from '../user-notification';
import Logo from './logo';
import { OperationTools } from './operation-tools';
import { AIAgentHeader } from './ai-agent-header';
import { NavigationSystem } from './navigation-system';
import { InputText } from '@/components/ui/extension/input-text';

export default async function Navbar() {
    // Force Rebuild: Refreshing Navbar structure
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
                            <input
                                key="navbar-search-input-v2"
                                placeholder='Search...'
                                required
                                id='search'
                                className='w-[200px] transition-colors focus:ring-2 focus:ring-primary/20 flex h-9 rounded-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                            />
                        </div>
                        <IntelligentAppsMenu key="intelligent-apps-menu-v2" />
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
