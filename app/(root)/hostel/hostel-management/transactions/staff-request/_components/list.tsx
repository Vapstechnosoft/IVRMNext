'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface StaffRequestListProps {
    data: any[];
    onEdit: (data: any) => void;
    onToggle: (data: any) => void;
}

export default function StaffRequestList({ data, onEdit, onToggle }: StaffRequestListProps) {
    return (
        <DataTable
            columns={columns(onEdit, onToggle)}
            data={data}
            searchKey="empName"
        />
    );
}
