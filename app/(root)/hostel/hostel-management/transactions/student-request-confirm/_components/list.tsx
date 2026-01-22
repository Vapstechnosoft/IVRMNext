'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface StudentRequestConfirmListProps {
    data: any[];
    onProcess: (data: any) => void;
}

export default function StudentRequestConfirmList({ data, onProcess }: StudentRequestConfirmListProps) {
    return (
        <DataTable
            columns={columns(onProcess)}
            data={data}
            searchKey="studentName"
        />
    );
}
