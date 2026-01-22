'use client';

import AddInteractionForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-interactions/_components/add-form';
import InboxList from '@/app/(root)/alumni/alumni-module/transactions/alumni-interactions/_components/inbox-list';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAlumniInteractionLoadData } from '@/server/alumni/alumni-interactions';
import type { IAlumniInteraction } from '@/types/alumni/alumni-interactions';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { use, useCallback, useEffect, useState } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function AlumniInteractionsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [activeTab, setActiveTab] = useState('inbox');
    const [inboxData, setInboxData] = useState<IAlumniInteraction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [roleFlg, setRoleFlg] = useState<string>('');
    const [userHrmeId, setUserHrmeId] = useState<number>(0);
    const [asmaY_Id, setAsmaY_Id] = useState<number>(0);
    const [ivrmrT_Id, setIvrmrT_Id] = useState<number>(0);
    const [almsT_Id, setAlmsT_Id] = useState<number>(0);
    const [mI_Id, setMI_Id] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Initialize nuqs state
    const [queryParams, setQueryParams] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        page_size: parseAsInteger.withDefault(10),
        search_query: parseAsString.withDefault(''),
        search_column: parseAsString.withDefault('')
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Pass searchParams to the server action to handle pagination
            const res = await getAlumniInteractionLoadData(searchParams as any);
            console.info('Interactions Response:', res);
            if (res.success && res.data) {
                // The new API returns data as a direct array or inside getinboxmsg
                let msgList: IAlumniInteraction[] = [];

                if (Array.isArray(res.data)) {
                    msgList = res.data;
                } else if (res.data.getinboxmsg && Array.isArray(res.data.getinboxmsg)) {
                    msgList = res.data.getinboxmsg;
                }

                setInboxData(msgList);
                setTotalItems(res.total || res.data.total || msgList.length);

                // Extract metadata if available, otherwise default
                setRoleFlg(res.data.roletype?.[0]?.ivrmrT_Role || '');
                setIvrmrT_Id(res.data.roletype?.[0]?.ivrmrT_Id || 0);
                setUserHrmeId(res.data.userhrmE_Id || 0);
                setAsmaY_Id(res.data.asmaY_Id || 0);
                setAlmsT_Id(res.data.almsT_Id || 0);
                setMI_Id(res.data.mI_Id || 0);
                setError(null);
            } else {
                setInboxData([]);
                setTotalItems(0);
                setError(res.message || 'Failed to load data');
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalPages = Math.ceil(totalItems / queryParams.page_size);

    return (
        <div className='container min-h-screen space-y-4 p-4'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Alumni Interactions</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-3 md:w-[400px]'>
                    <TabsTrigger value='inbox'>Inbox</TabsTrigger>
                    <TabsTrigger value='group'>Group</TabsTrigger>
                    <TabsTrigger value='individual'>Individual</TabsTrigger>
                </TabsList>

                <TabsContent value='inbox' className='mt-4'>
                    <CollapsibleSection title='Message Inbox' defaultOpen={true} variant='default'>
                        {isLoading ? (
                            <div className='flex justify-center p-8'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            </div>
                        ) : error ? (
                            <div className='p-4 text-center text-destructive'>Error loading inbox: {String(error)}</div>
                        ) : (
                            <>
                                <InboxList
                                    messages={inboxData}
                                    userHrmeId={userHrmeId}
                                    asmaY_Id={asmaY_Id}
                                    ivrmrT_Id={ivrmrT_Id}
                                    almsT_Id={almsT_Id}
                                    mI_Id={mI_Id}
                                    roleFlg={roleFlg}
                                    onRefresh={loadData}
                                />

                                <div className='mt-4 flex items-center justify-between border-t py-4'>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-muted-foreground text-sm'>Rows per page</p>
                                        <Select
                                            value={String(queryParams.page_size)}
                                            onValueChange={(value) => setQueryParams({ page_size: Number(value), page: 1 })}>
                                            <SelectTrigger className='h-8 w-[70px]'>
                                                <SelectValue placeholder={String(queryParams.page_size)} />
                                            </SelectTrigger>
                                            <SelectContent side='top'>
                                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={String(pageSize)}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex w-[100px] items-center justify-center font-medium text-sm'>
                                            Page {queryParams.page} of {totalPages || 1}
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Button
                                                variant='outline'
                                                className='h-8 w-8 p-0'
                                                onClick={() => setQueryParams({ page: queryParams.page - 1 })}
                                                disabled={queryParams.page <= 1 || isLoading}>
                                                <span className='sr-only'>Go to previous page</span>
                                                <ChevronLeft className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='outline'
                                                className='h-8 w-8 p-0'
                                                onClick={() => setQueryParams({ page: queryParams.page + 1 })}
                                                disabled={queryParams.page >= totalPages || isLoading}>
                                                <span className='sr-only'>Go to next page</span>
                                                <ChevronRight className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CollapsibleSection>
                </TabsContent>

                <TabsContent value='group' className='mt-4'>
                    <CollapsibleSection title='Compose Group Message' defaultOpen={true} variant='outline'>
                        <AddInteractionForm
                            interactionType='Group'
                            roleFlg={roleFlg}
                            asmaY_Id={asmaY_Id}
                            ivrmrT_Id={ivrmrT_Id}
                            almsT_Id={almsT_Id}
                            mI_Id={mI_Id}
                            userHrmeId={userHrmeId}
                            onSuccess={() => {
                                setActiveTab('inbox');
                                loadData();
                            }}
                        />
                    </CollapsibleSection>
                </TabsContent>

                <TabsContent value='individual' className='mt-4'>
                    <CollapsibleSection title='Compose Individual Message' defaultOpen={true} variant='outline'>
                        <AddInteractionForm
                            interactionType='Individual'
                            roleFlg={roleFlg}
                            asmaY_Id={asmaY_Id}
                            ivrmrT_Id={ivrmrT_Id}
                            almsT_Id={almsT_Id}
                            mI_Id={mI_Id}
                            userHrmeId={userHrmeId}
                            onSuccess={() => {
                                setActiveTab('inbox');
                                loadData();
                            }}
                        />
                    </CollapsibleSection>
                </TabsContent>
            </Tabs>
        </div>
    );
}
