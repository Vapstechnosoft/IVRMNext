'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import { columns, type GuestAllotmentColumn } from './columns';

interface GuestAllotmentListProps {
    data: GuestAllotmentColumn[];
    onEdit: (row: GuestAllotmentColumn) => void;
}

export default function GuestAllotmentList({ data, onEdit }: GuestAllotmentListProps) {
    return <DataTable columns={columns(onEdit)} data={data} />;
}
