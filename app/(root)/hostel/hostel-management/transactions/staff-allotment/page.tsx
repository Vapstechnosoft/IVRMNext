'use client';

import { useEffect, useState } from 'react';
import { getStaffAllotmentLoadData } from '@/server/hostel/transactions/staff-allotment';
import StaffAllotmentForm from './_components/add-form';
import StaffAllotmentList from './_components/list';
import { toast } from 'sonner';

export default function StaffAllotmentPage() {
    const [dropdowns, setDropdowns] = useState<any>({
        hostel_list: [],
        roomcatgry_list: [],
        deptlist: [],
        desglist: [],
        room_list: [],
        student_allotlist: [] // actually staff allotment list
    });

    const loadData = async () => {
        try {
            const res = await getStaffAllotmentLoadData();
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
        // Implement edit logic - likely populate form via a state or context, 
        // For simpler implementation, we might just re-fetch details or pass the row to form.
        // For now, let's keep it simple and maybe just focus on Add. 
        // Complex Edit usually requires fetching 'editdata' endpoint.
        toast.info('Edit functionality to be implemented');
    };

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Staff Allotment</h2>

            <StaffAllotmentForm
                dropdowns={dropdowns}
                onSuccess={loadData}
            />

            <StaffAllotmentList
                data={dropdowns.student_allotlist || []}
                onEdit={handleEdit}
            />
        </div>
    );
}
