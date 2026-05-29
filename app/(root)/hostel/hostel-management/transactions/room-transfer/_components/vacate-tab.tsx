'use client';

import { useEffect, useState } from 'react';
import VacateForm from '../../vacate-room/_components/vacate-form';
import VacateRoomList from '../../vacate-room/_components/list';
import { toast } from 'sonner';
import { getDetailsOnType, getVacateLoadData } from '@/server/hostel/hostel-management/transactions/vacate-room';
import { Heading } from '@/components/layout/heading';
import { Separator } from '@/components/ui/separator';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus } from 'lucide-react';

export default function HostelVacateTab() {
    const [type, setType] = useState<'student' | 'staff' | 'guest'>('student');
    const [data, setData] = useState<any>({
        studentdata: [],
        staffdata: [],
        guestdata: [],
        gridlistdata: []
    });

    const loadInitialData = async () => {
        try {
            const res = await getVacateLoadData('student');
            if (res) {
                setData(res);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load initial data');
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleTypeChange = async (newType: any) => {
        setType(newType);
        try {
            const res = await getDetailsOnType(newType);
            if (res) {
                setData((prev: any) => ({
                    ...prev,
                    gridlistdata: res.gridlistdata || []
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSuccess = async (currType: string) => {
        handleTypeChange(currType);
    };

    return (
        <div className="space-y-6">
            <VacateForm
                initialData={data}
                onTypeChange={handleTypeChange}
                onSuccess={handleSuccess}
            />

            <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                <CardHeader className="bg-[#4255a7] py-1 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">HOSTEL VACATE DETAILS</CardTitle>
                    <Minus className="h-3 w-3 text-white cursor-pointer opacity-70" />
                </CardHeader>
                <CardContent className="p-6">
                    <VacateRoomList
                        data={data.gridlistdata || []}
                        type={type}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
