'use client';

import { DataTable } from '@/components/ui/data-table';
import { verifiedRecordsColumns } from './columns';

interface VerifiedRecordsGridProps {
    records: any[];
}

export default function VerifiedRecordsGrid({ records }: VerifiedRecordsGridProps) {
    return (
        <div className='rounded-md border p-4 bg-white shadow-sm'>
            <DataTable<any, any>
                columns={verifiedRecordsColumns} 
                data={records} 
                totalItems={records.length}
            />
        </div>
    );
}
