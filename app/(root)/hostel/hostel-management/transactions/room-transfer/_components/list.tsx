'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

interface RoomTransferListProps {
    data: any[];
}

export default function RoomTransferList({ data }: RoomTransferListProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="studentname"
        />
    );
}
