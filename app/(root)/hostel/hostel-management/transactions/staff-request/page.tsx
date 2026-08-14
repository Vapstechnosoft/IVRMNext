'use client';

import { useEffect, useState } from 'react';
import StaffRequestForm from './_components/add-form';
import StaffRequestList from './_components/list';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getStaffRequestLoadData, toggleStaffRequestStatus } from '@/server/hostel/hostel-management/transactions/staff-request-actions';
import { Heading } from '@/components/layout/heading';

export default function StaffRequestPage() {
    const [listData, setListData] = useState<any[]>([]);
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStaffRequestLoadData();
        if (data?.all_requestdata) {
            setListData(data.all_requestdata as any[]);
        }
    }

    const handleEdit = (data: any) => {
        setEditData(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (data: any) => {
        const res = await toggleStaffRequestStatus(data);
        if (res?.ret) {
            toast.success("Status updated!");
            loadData();
        }
    };

    return (
        <div className="flex-col min-h-screen bg-slate-50/50">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50 border-b">
                <span>Transaction &gt; StaffRequest</span>
            </div>
            <div className="flex-1 space-y-6 p-8">
                <StaffRequestForm
                    onSaveSuccess={() => { loadData(); setEditData(null); }}
                    editData={editData}
                />
                <StaffRequestList
                    data={listData}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                />
            </div>
        </div>
    );
}
