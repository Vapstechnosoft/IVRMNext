'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import type { IMasterFacility } from '@/schemas/hostel/masters';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useCallback } from 'react';

const columnHelper = createColumnHelper<IMasterFacility>();

export const masterFacilityColumns: ColumnDef<IMasterFacility, any>[] = [
    columnHelper.display({
        id: 'sn',
        header: 'SL NO',
        cell: (info) => info.row.index + 1,
        enableSorting: false
    }),
    columnHelper.accessor('hlmftY_FacilityName', {
        header: ({ column }) => <ColumnHeader column={column} title='Facility Name' />,
        meta: { title: 'Facility Name' }
    }),
    columnHelper.accessor('hlmftY_FacilityDesc', {
        header: ({ column }) => <ColumnHeader column={column} title='Description' />,
        meta: { title: 'Description' }
    }),
    columnHelper.accessor('hlmftY_ActiveFlag', {
        header: ({ column }) => <ColumnHeader column={column} title='Status' />,
        meta: { title: 'Status' },
        cell: (info) =>
            info.getValue() ? (
                <span className='flex items-center text-green-600 font-medium'>
                    <Check className='mr-1 h-4 w-4' /> Active
                </span>
            ) : (
                <span className='flex items-center text-red-600 font-medium'>
                    <X className='mr-1 h-4 w-4' /> Inactive
                </span>
            )
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    })
];

function ActionButtonsCell({ rowData }: { rowData: IMasterFacility }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterFacility>();

    const handleEdit = useCallback(
        (data: IMasterFacility) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterFacility) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='hlmftY_ActiveFlag'
        />
    );
}
