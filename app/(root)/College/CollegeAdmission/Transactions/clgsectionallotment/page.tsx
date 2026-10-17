'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, PlusCircle, ArrowRightLeft, Trash2, GraduationCap, AlertTriangle, Hash } from 'lucide-react';
import { useClgSectionAllotmentInitialData } from '@/hooks/college/useClgSectionAllotment';
import { NewSectionTab } from './_components/new-section-tab';
import { ChangeSectionTab } from './_components/change-section-tab';
import { DeleteSectionTab } from './_components/delete-section-tab';
import { PromotionSectionTab } from './_components/promotion-section-tab';
import { YearLossTab } from './_components/year-loss-tab';
import { UpdateRollNoTab } from './_components/update-roll-no-tab';

export default function ClgSectionAllotmentPage() {
    const [activeTab, setActiveTab] = useState('new');
    const { data: initialResponse, isLoading, refetchAll } = useClgSectionAllotmentInitialData();
    let initialData = initialResponse?.data ?? initialResponse ?? {};
    if (typeof initialData === 'string') {
        try {
            initialData = JSON.parse(initialData);
        } catch {
            initialData = {};
        }
    }

    if (isLoading) {
        return (
            <div className='flex min-h-[50vh] flex-col items-center justify-center space-y-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground animate-pulse'>Loading Section Allotment Details...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen space-y-6 p-4 md:p-6'>
            {/* Page Header */}
            <div className='flex flex-col gap-1.5'>
                <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
                    College Section Allotment
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Allot students to sections, transfer between sections, promote batches, record year losses, and assign roll numbers.
                </p>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <div className='overflow-x-auto pb-1'>
                    <TabsList className='inline-flex h-12 w-auto items-center justify-start rounded-xl bg-muted/80 p-1.5 backdrop-blur-sm'>
                        <TabsTrigger
                            value='new'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                            <PlusCircle className='h-4 w-4' />
                            <span>New Section</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='change'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                            <ArrowRightLeft className='h-4 w-4' />
                            <span>Change Section</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='delete'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-destructive data-[state=active]:shadow-sm'>
                            <Trash2 className='h-4 w-4' />
                            <span>Delete Section</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='promotion'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                            <GraduationCap className='h-4 w-4' />
                            <span>Promotion Section</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='yearloss'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-amber-600 data-[state=active]:shadow-sm'>
                            <AlertTriangle className='h-4 w-4' />
                            <span>Year Loss Section</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='rollno'
                            className='flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                            <Hash className='h-4 w-4' />
                            <span>Update Roll Number</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab 1: New Section */}
                <TabsContent value='new' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <NewSectionTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>

                {/* Tab 2: Change Section */}
                <TabsContent value='change' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <ChangeSectionTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>

                {/* Tab 3: Delete Section */}
                <TabsContent value='delete' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <DeleteSectionTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>

                {/* Tab 4: Promotion Section */}
                <TabsContent value='promotion' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <PromotionSectionTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>

                {/* Tab 5: Year Loss Section */}
                <TabsContent value='yearloss' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <YearLossTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>

                {/* Tab 6: Update Roll Number */}
                <TabsContent value='rollno' className='fade-in slide-in-from-bottom-2 duration-300 animate-in focus-visible:outline-none'>
                    <UpdateRollNoTab initialData={initialData} refetchAll={refetchAll} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
