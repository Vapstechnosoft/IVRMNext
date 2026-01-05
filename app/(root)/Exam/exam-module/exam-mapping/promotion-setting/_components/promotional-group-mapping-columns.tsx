'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IPromotionalGroupDetails } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

/* --------------------------------
   PROMOTIONAL GROUP COLUMNS
-------------------------------- */
export const PromotionalGroupMappingColumns: ColumnDef<IPromotionalGroupDetails>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader title='SL NO' column={column} />,
        cell: ({ row }) => row.index + 1,
        enableSorting: false
    },
    {
        accessorKey: 'emcA_CategoryName',
        header: ({ column }) => <DataTableColumnHeader title='Group Name' column={column} />,
        enableSorting: false
    },
    {
        accessorKey: 'emgR_GradeName',
        header: ({ column }) => <DataTableColumnHeader title='Grade Name' column={column} />,
        enableSorting: false
    },
    {
        accessorKey: 'emP_MarksPerFlg',
        header: ({ column }) => <DataTableColumnHeader title='Type' column={column} />,
        cell: ({ row }) => getStatusBadge(row.original.emP_MarksPerFlg === 'M' ? 'marks' : 'percentage'),
        enableSorting: false
    },
    {
        accessorKey: 'emP_BestOf',
        header: ({ column }) => <DataTableColumnHeader title='Best Of' column={column} />,
        cell: ({ row }) => row.original.emP_BestOf ?? '-',
        enableSorting: false
    },
    {
        accessorKey: 'emP_PassToIndSubjectFlg',
        header: ({ column }) => <DataTableColumnHeader title='Pass to Individual' column={column} />,
        cell: ({ row }) => getStatusBadge(row.original.emP_PassToIndSubjectFlg === true ? 'yes' : 'no'),
        enableSorting: false
    },
    {
        accessorKey: 'emP_PassToOverallFlag',
        header: ({ column }) => <DataTableColumnHeader title='Pass to Overall' column={column} />,
        cell: ({ row }) => getStatusBadge(row.original.emP_PassToOverallFlag === true ? 'yes' : 'no'),
        enableSorting: false
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

/* --------------------------------
   VIEW (EYE) CELL
-------------------------------- */
function MappingCell({ rowData }: { rowData: IPromotionalGroupDetails }) {
    const { openMappedview } = useFormContext<IPromotionalGroupDetails>();

    const handleOpenView = useCallback(() => {
        openMappedview(rowData);
    }, [openMappedview, rowData]);

    return (
        <button
            onClick={handleOpenView}
            type='button'
            className='rounded-md p-2 transition hover:bg-muted'
            title='View Group Details'
        >
            <Eye className='h-4 w-4 text-blue-600' />
        </button>
    );
}

/* --------------------------------
   ACTION BUTTONS CELL
-------------------------------- */
function ActionButtonsCell({ rowData }: { rowData: IPromotionalGroupDetails }) {
    const { openToggleForm } = useFormContext<IPromotionalGroupDetails>();

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-1'>
            <MappingCell rowData={rowData} />
            <ActionButtons
                rowData={rowData}
                buttons={{ toggle: true }}
                onToggle={handleToggle}
                toggleConditionKey='emP_ActiveFlag'
            />
        </div>
    );
}
