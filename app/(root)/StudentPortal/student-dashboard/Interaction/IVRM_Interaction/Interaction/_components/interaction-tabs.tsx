'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getInteractionLoadData } from '../actions';
import type { InteractionMessage } from '../types';
import { ComposeTab } from './compose-tab';
import { InboxTab } from './inbox-tab';

interface InteractionTabsProps {
    initialData: any;
}

export function InteractionTabs({ initialData }: InteractionTabsProps) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState<InteractionMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [_composeMode, setComposeMode] = useState<'Group' | 'Individual'>('Individual');

    const { roletype, configflag, userhrmE_Id } = initialData;
    // Support multiple possible key names for inbox messages
    const inboxMessages = initialData?.getinboxmsg || initialData?.inboxmsg || initialData?.inboxList || initialData?.messageList || [];

    // Determine Role Flag
    const roleFlag = roletype?.[0]?.ivrmrT_Role || 'Student'; // Default or extracted

    useEffect(() => {
        // Initializing inbox messages from server load
        if (Array.isArray(inboxMessages) && inboxMessages.length > 0) {
            setMessages(inboxMessages);
        }
    }, [initialData]);

    const refreshInbox = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getInteractionLoadData();
            // Support multiple possible key names for inbox messages
            const msgs = response?.getinboxmsg || response?.inboxmsg || response?.inboxList || response?.messageList || [];
            setMessages(Array.isArray(msgs) ? msgs : []);
        } catch (error) {
            console.error('Failed to refresh inbox', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'group') {
            setComposeMode('Group');
        } else if (value === 'individual') {
            setComposeMode('Individual');
        } else if (value === 'compose') {
            setComposeMode('Individual'); // Student compose defaults to individual usually
        }
    };

    const handleComposeSuccess = () => {
        setActiveTab('inbox');
        refreshInbox();
    };

    const isStaff = roleFlag === 'Staff' || roleFlag === 'HOD' || roleFlag === 'Principal';

    return (
        <Card className='w-full border-t-4 border-t-primary shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between border-b pb-2'>
                <CardTitle className='font-bold text-2xl text-primary'>Interactions</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
                <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
                    <TabsList className='mx-auto mb-8 grid w-full grid-cols-2 gap-2 md:mx-0 md:w-auto md:grid-cols-4'>
                        <TabsTrigger value='inbox'>Inbox</TabsTrigger>
                        {isStaff && (
                            <>
                                <TabsTrigger value='group'>Group</TabsTrigger>
                                <TabsTrigger value='individual'>Individual</TabsTrigger>
                            </>
                        )}
                        {!isStaff && <TabsTrigger value='compose'>Compose</TabsTrigger>}
                    </TabsList>

                    <TabsContent value='inbox' className='mt-0'>
                        {isLoading ? (
                            <div className='flex justify-center py-10'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            </div>
                        ) : (
                            <InboxTab messages={messages} currentUserId={userhrmE_Id} onRefresh={refreshInbox} />
                        )}
                    </TabsContent>

                    <TabsContent value='group' className='mt-0'>
                        <ComposeTab
                            roleFlg={roleFlag}
                            configFlag={configflag}
                            userHrmIds={userhrmE_Id}
                            onSuccess={handleComposeSuccess}
                            isGroup={true}
                            initialData={initialData}
                        />
                    </TabsContent>

                    <TabsContent value='individual' className='mt-0'>
                        <ComposeTab
                            roleFlg={roleFlag}
                            configFlag={configflag}
                            userHrmIds={userhrmE_Id}
                            onSuccess={handleComposeSuccess}
                            isGroup={false}
                            initialData={initialData}
                        />
                    </TabsContent>

                    <TabsContent value='compose' className='mt-0'>
                        <ComposeTab
                            roleFlg={roleFlag}
                            configFlag={configflag}
                            userHrmIds={userhrmE_Id}
                            onSuccess={handleComposeSuccess}
                            isGroup={false}
                            initialData={initialData}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
