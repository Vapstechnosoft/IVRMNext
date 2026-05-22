'use client';

import { useEffect, useState } from 'react';
import RoomTransferForm from './transfer-form';
import RoomTransferList from './list';
import { Heading } from '@/components/layout/heading';
import { getRoomTransferLoadData } from '@/server/hostel/hostel-management/transactions/room-transfer';
import { Separator } from '@/components/ui/separator';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus } from 'lucide-react';

export default function RoomTransferTab() {
    const [listData, setListData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getRoomTransferLoadData('stud'); // Default to stud
        if (data?.gridlistdata) {
            setListData(data.gridlistdata);
        }
    }

    return (
        <div className="space-y-6">
            <RoomTransferForm onSaveSuccess={loadData} />
            
            <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                <CardHeader className="bg-[#4255a7] py-1 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">ROOM TRANSFER HISTORY</CardTitle>
                    <Minus className="h-3 w-3 text-white cursor-pointer opacity-70" />
                </CardHeader>
                <CardContent className="p-6">
                    <RoomTransferList data={listData} />
                </CardContent>
            </Card>
        </div>
    );
}
