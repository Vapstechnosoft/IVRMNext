'use client';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClassWork } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { createColumnHelper } from '@tanstack/react-table';
import { Database } from 'lucide-react'; // Added Database icon
import { useCallback } from 'react';

const columnHelper = createColumnHelper<IClassWork>();

function ActionButtonsCell({ rowData }: { rowData: IClassWork }) {
    const { openDetailsView } = useFormContext<IClassWork>();

    const handleMarksEntry = useCallback(
        (data: IClassWork) => {
            openDetailsView(data);
        },
        [openDetailsView]
    );

    return (
        <div className='flex items-center gap-2'>
            {/* Show only Enter Marks button for verification page */}
            <Button
                variant='ghost'
                size='icon'
                onClick={() => handleMarksEntry(rowData)}
                title='Enter Marks'
                className='hover:text-primary'>
                <Database className='h-4 w-4' />
            </Button>
        </div>
    );
}
