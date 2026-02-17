'use client';

import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { eventsStudentSRKVSColumns } from './columns';

export default function EventsStudentSRKVSList() {
    const { gridData } = useEventsStudentSRKVS();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Events Student Mapping List</h2>
            <GenericDataTable
                data={gridData.data?.data || []}
                columns={eventsStudentSRKVSColumns}
                isLoading={gridData.isLoading}
            />
        </div>
    );
}
