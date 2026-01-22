'use client';

import { useEffect, useState } from 'react';
import { getGuestAllotmentLoadData } from '@/server/hostel/transactions/guest-allotment';
import GuestAllotmentForm from './_components/add-form';
import GuestAllotmentList from './_components/list';
import { toast } from 'sonner';

export default function GuestAllotmentPage() {
    const [dropdowns, setDropdowns] = useState<any>({
        hstllist: [],
        categorylist: [],
        roomlist: [],
        alldata1: []
    });

    const loadData = async () => {
        try {
            const res = await getGuestAllotmentLoadData();
            if (res) {
                setDropdowns(res);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (row: any) => {
        toast.info('Edit functionality to be implemented');
    };

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Guest Allotment</h2>

            <GuestAllotmentForm
                dropdowns={dropdowns}
                onSuccess={loadData}
            />

            <GuestAllotmentList
                data={dropdowns.alldata1 || []}
                onEdit={handleEdit}
            />
        </div>
    );
}
