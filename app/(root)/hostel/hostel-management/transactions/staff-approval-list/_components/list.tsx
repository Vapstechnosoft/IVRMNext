'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface StaffApprovalListProps {
    data: any[];
    onProcess: (data: any) => void;
}

export default function StaffApprovalList({ data, onProcess }: StaffApprovalListProps) {
    return (
        <DataTable
            columns={columns(onProcess)}
            data={data}
            searchKey="empName"
        />
    );
}
