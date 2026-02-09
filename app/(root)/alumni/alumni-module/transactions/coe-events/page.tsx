'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Layers, Loader2 } from 'lucide-react';
import { getMasterCOEInitialData } from '@/server/alumni/master-coe';
import { FormProvider } from '@/components/ui/form/form-provider';
import MasterEventsContent from './_components/master-events/master-events-content';
import EventsMappingContent from './_components/events-mapping/events-mapping-content';
import type { IMasterEvent, IEventsMapping } from '@/types/alumni/master-coe';

export default function MasterCOEPage() {
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        try {
            const res = await getMasterCOEInitialData();
            console.log('🔍 Master COE API Response:', res);
            setInitialData(res);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container space-y-6 p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Master COE</h1>
                    <p className="text-muted-foreground">Manage events and their mappings to academic years.</p>
                </div>
            </div>

            <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="events" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Events
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Events Map
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-6 space-y-4">
                    <FormProvider<IMasterEvent>>
                        <MasterEventsContent
                            initialData={initialData}
                            refreshData={fetchInitialData}
                        />
                    </FormProvider>
                </TabsContent>

                <TabsContent value="map" className="mt-6 space-y-4">
                    <FormProvider<IEventsMapping>>
                        <EventsMappingContent
                            initialData={initialData}
                        />
                    </FormProvider>
                </TabsContent>
            </Tabs>
        </div>
    );
}
