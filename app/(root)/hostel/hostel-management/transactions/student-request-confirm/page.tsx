'use client';

import { useEffect, useState } from 'react';
import StudentConfirmForm from './_components/process-form';
import StudentRequestConfirmList from './_components/list';
import { Separator } from '@/components/ui/separator';
import { getStudentConfirmLoadData } from '@/server/hostel/hostel-management/transactions/student-request-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/layout/heading';
import { Input } from '@/components/ui/input';
import { Search, Minus } from 'lucide-react';

export default function StudentRequestConfirmPage() {
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [approvedList, setApprovedList] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [processData, setProcessData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStudentConfirmLoadData();
        if (data) {
            setPendingList(data.student_RequestList || []);
            setApprovedList(data.student_RequestApp || []);
            setRooms(data.room_list || []);
            setProcessData(null);
        }
    }

    return (
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Transaction &gt; CLGStudentRequestConfirm</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading 
                    title="Student Request Confirm" 
                    description="Confirm Student Requests"
                />
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <StudentConfirmForm
                        processData={processData || {}}
                        rooms={rooms}
                        onSaveSuccess={loadData}
                    />
                </div>

                <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                    <CardHeader className="bg-[#4255a7] py-1 px-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">STUDENT REQUEST LIST</CardTitle>
                        <Minus className="h-3 w-3 text-white cursor-pointer opacity-70" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-8">
                            <StudentRequestConfirmList
                                data={pendingList}
                                onProcess={(data) => {
                                    setProcessData(data);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />

                            {approvedList.length > 0 && (
                                <>
                                    <Separator />
                                    <StudentRequestConfirmList
                                        data={approvedList}
                                        onProcess={() => { /* No processing required on this tab */ }}
                                    />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
