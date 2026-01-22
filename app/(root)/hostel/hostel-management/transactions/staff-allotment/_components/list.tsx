'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import { columns, type StaffAllotmentColumn } from './columns';

interface StaffAllotmentListProps {
    data: StaffAllotmentColumn[];
    onEdit: (row: StaffAllotmentColumn) => void;
}

export default function StaffAllotmentList({ data, onEdit }: StaffAllotmentListProps) {
    return <DataTable columns={columns(onEdit)} data={data} />;
}
