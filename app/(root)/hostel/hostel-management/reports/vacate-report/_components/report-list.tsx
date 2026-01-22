'use client';

import { ViewDataDataTable } from '@/components/ui/view-data-table/view-data-table';
import { studentReportColumns, staffReportColumns, guestReportColumns } from './columns';

interface VacateReportListProps {
    data: any[];
    type: 'student' | 'staff' | 'guest';
}

export default function VacateReportList({ data, type }: VacateReportListProps) {
    const columns = type === 'student' ? studentReportColumns : (type === 'staff' ? staffReportColumns : guestReportColumns);
    return <ViewDataDataTable columns={columns} data={data} />;
}
