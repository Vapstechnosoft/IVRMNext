'use client';

import { useEffect, useState } from 'react';
import StaffApprovalForm from './_components/process-form';
import StaffApprovalList from './_components/list';
import { getStaffApprovalLoadData } from '@/server/hostel/transactions/staff-request-actions';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export default function StaffApprovalPage() {
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [approvedList, setApprovedList] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [processData, setProcessData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStaffApprovalLoadData();
        if (data) {
            setPendingList(data.staff_RequestList || []);
            setApprovedList(data.staff_ApprovalList || []);
            setRooms(data.room_list || []);
            setProcessData(null);
        }
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading
                    title="Staff Approval List"
                    description="Approve or Reject staff hostel applications."
                />
                <Separator />

                {processData && (
                    <>
                        <StaffApprovalForm
                            processData={processData}
                            rooms={rooms}
                            onSaveSuccess={loadData}
                        />
                        <Separator />
                    </>
                )}

                <Heading title="Pending Requests" description="" />
                <StaffApprovalList
                    data={pendingList}
                    onProcess={(data) => {
                        setProcessData(data);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />

                <Separator />
                <Heading title="Processed Requests" description="" />
                <StaffApprovalList
                    data={approvedList}
                    onProcess={() => { }}
                />
            </div>
        </div>
    );
}
