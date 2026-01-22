'use client';

import { useEffect, useState } from 'react';
import StudentRequestForm from './_components/add-form';
import StudentRequestList from './_components/list';
import { getStudentRequestLoadData, toggleStudentRequestStatus } from '@/server/hostel/transactions/student-request-actions';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function StudentRequestPage() {
    const [listData, setListData] = useState<any[]>([]);
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStudentRequestLoadData();
        if (data && data.all_requestdata) {
            setListData(data.all_requestdata);
        }
    }

    const handleEdit = (data: any) => {
        setEditData(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (data: any) => {
        const res = await toggleStudentRequestStatus(data);
        if (res?.ret) {
            toast.success("Status updated!");
            loadData();
        }
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading
                    title="Hostel Student Request"
                    description="Students can apply for hostel rooms here."
                />
                <Separator />
                <StudentRequestForm
                    onSaveSuccess={() => { loadData(); setEditData(null); }}
                    editData={editData}
                />
                <Separator />
                <Heading title="Your Requests" description="" />
                <StudentRequestList
                    data={listData}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                />
            </div>
        </div>
    );
}
