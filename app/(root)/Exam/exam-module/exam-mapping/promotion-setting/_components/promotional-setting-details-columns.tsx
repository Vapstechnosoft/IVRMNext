'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export interface IPromotionalSubjectDetails {
    slNo: number;
    subjectName: string;
    gradeName: string;
    maxMarks: number;
    minMarks: number;
    convertedMarks: number;
    aplResult: boolean;
}

export const PromotionalSettingDetailsColumns: ColumnDef<IPromotionalSubjectDetails>[] = [

    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader title='SLNO' column={column} />,
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'subjectName',
        header: ({ column }) => <DataTableColumnHeader title='Subject Name' column={column} />
    },
    {
        accessorKey: 'gradeName',
        header: ({ column }) => <DataTableColumnHeader title='Grade Name' column={column} />
    },
    {
        accessorKey: 'maxMarks',
        header: ({ column }) => <DataTableColumnHeader title='Max. Marks' column={column} />
    },
    {
        accessorKey: 'minMarks',
        header: ({ column }) => <DataTableColumnHeader title='Min. Marks' column={column} />
    },
    {
        accessorKey: 'convertedMarks',
        header: ({ column }) => <DataTableColumnHeader title='Converted Marks For' column={column} />
    },
    {
        accessorKey: 'aplResult',
        header: ({ column }) => <DataTableColumnHeader title='Apl. Result' column={column} />,
        cell: ({ row }) => <span className="text-green-600 font-bold">✔</span>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];





// -------------------------
// MAPPING CELL
// -------------------------
function MappingCell({ rowData }: { rowData: IPromotionalSubjectDetails }) {
    const showEye = rowData.aplResult || rowData.convertedMarks;
    const { openMappedview } = useFormContext<IPromotionalSubjectDetails>();
    const handleOpenView = useCallback(() => openMappedview(rowData), [openMappedview, rowData]);
    if (!showEye) return <div>-</div>;

    return (
        <button onClick={handleOpenView} type='button' className='rounded-md p-2 transition hover:bg-muted' title='View Mapping Details'>
            <Eye className='h-4 w-4 text-blue-600' />
        </button>
    );
}

// -------------------------
// ACTION BUTTONS CELL
// -------------------------
function ActionButtonsCell({ rowData }: { rowData: IPromotionalSubjectDetails }) {
    const { openToggleForm } = useFormContext<IPromotionalSubjectDetails>();
    const handleToggle = useCallback(() => openToggleForm(rowData), [openToggleForm, rowData]);

    return (
        <div className='flex justify-center'>
            <MappingCell rowData={rowData} />
            <ActionButtons rowData={rowData} buttons={{ toggle: true }} onToggle={handleToggle} toggleConditionKey='eyceS_ActiveFlg' />
        </div>
    );
}
