'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface StudentAllotmentListProps {
    data: any[];
}

export default function StudentAllotmentList({ data }: StudentAllotmentListProps) {
    return (
        <div className="mt-6">
            <DataTable columns={columns} data={data} searchKey="studentName" />
        </div>
    );
}
