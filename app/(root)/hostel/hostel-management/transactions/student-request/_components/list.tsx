'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface StudentRequestListProps {
    data: any[];
    onEdit: (data: any) => void;
    onToggle: (data: any) => void;
}

export default function StudentRequestList({ data, onEdit, onToggle }: StudentRequestListProps) {
    return (
        <DataTable
            columns={columns(onEdit, onToggle)}
            data={data}
            searchKey="studentName"
        />
    );
}
