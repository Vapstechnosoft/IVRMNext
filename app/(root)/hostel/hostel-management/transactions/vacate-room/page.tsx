'use client';

import { useEffect, useState } from 'react';
import VacateForm from './_components/vacate-form';
import VacateRoomList from './_components/list';
import { toast } from 'sonner';
import { getDetailsOnType, getVacateLoadData } from '@/server/hostel/hostel-management/transactions/vacate-room';
import { Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/layout/heading';

export default function VacateRoomPage() {
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
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Transaction &gt; HostelVacate</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading 
                    title="Hostel Vacate" 
                    description="Manage hostel room vacations."
                />
                
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <VacateForm
                        initialData={data}
                        onTypeChange={handleTypeChange}
                        onSuccess={handleSuccess}
                    />
                </div>

                <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                    <CardHeader className="bg-[#4255a7] py-1 px-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">VACATE DETAILS LIST</CardTitle>
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
        </div>
    );
}
