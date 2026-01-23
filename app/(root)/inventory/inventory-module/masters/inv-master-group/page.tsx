'use client';

import { Heading } from '@/components/layout/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvMasterGroup } from '@/hooks/inventory/masters/use-inv-master-group';
import { use } from 'react';
import ItemGroupTab from './_components/item-group-tab';
import MainGroupTab from './_components/main-group-tab';
import UserGroupTab from './_components/user-group-tab';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvMasterGroupPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading } = useInvMasterGroup(searchParams);

    const mainGroups = response?.data?.get_maingroup || [];
    const userGroups = response?.data?.get_usergroup || [];
    const itemGroups = response?.data?.get_itemgroup || [];

    if (isLoading) {
        return <div className='p-8'>Loading...</div>; // Ideally use a Skeleton loader
    }

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Master Groups' description='Manage Main Groups, User Groups and Item Groups' />
                    </div>
                </div>

                <Tabs defaultValue='mainGroup' className='w-full space-y-4'>
                    <TabsList className='grid grid-cols-3 w-full max-w-md'>
                        <TabsTrigger value='mainGroup'>Main Group</TabsTrigger>
                        <TabsTrigger value='userGroup'>User Group</TabsTrigger>
                        <TabsTrigger value='itemGroup'>Item Group</TabsTrigger>
                    </TabsList>

                    <TabsContent value='mainGroup' className='space-y-4'>
                        <MainGroupTab data={mainGroups} />
                    </TabsContent>

                    <TabsContent value='userGroup' className='space-y-4'>
                        <UserGroupTab data={userGroups} />
                    </TabsContent>

                    <TabsContent value='itemGroup' className='space-y-4'>
                        <ItemGroupTab data={itemGroups} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
