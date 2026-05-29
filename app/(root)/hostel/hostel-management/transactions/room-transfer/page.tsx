'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading } from '@/components/layout/heading';
import { Separator } from '@/components/ui/separator';
import RoomTransferTab from './_components/transfer-tab';
import HostelVacateTab from './_components/vacate-tab';

export default function RoomTransferPage() {
    return (
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Transaction &gt; HostelRoomTransfer</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading
                    title="Hostel Room Transfer"
                    description="Manage hostel room transfers and vacations."
                />
                
                <Tabs defaultValue="transfer" className="space-y-4">
                    <TabsList className="bg-primary/5 p-1">
                        <TabsTrigger value="transfer" className="px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-xs">
                            ROOM TRANSFER
                        </TabsTrigger>
                        <TabsTrigger value="vacate" className="px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-xs">
                            HOSTEL VACATE
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="transfer" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <RoomTransferTab />
                    </TabsContent>
                    <TabsContent value="vacate" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <HostelVacateTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
