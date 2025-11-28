import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export type OpeningBalanceRow = {
    amsT_FirstName?: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    fmoB_Student_Due?: number;
    fmoB_Institution_Due?: number;
    fmoB_EntryDate?: string;
    asmay_id?: number;
    fmC_Id?: number;
    amst_Id?: number;
    fmoB_Id?: number;
    [key: string]: any;
};

export const openingBalanceColumns: ColumnDef<OpeningBalanceRow>[] = [
    {
        accessorKey: 'asmay_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='text-center font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const { amsT_FirstName = '', amsT_MiddleName = '', amsT_LastName = '' } = row.original;
            const fullName = [amsT_FirstName, amsT_MiddleName, amsT_LastName].filter(Boolean).join(' ');
            return <div className='font-medium'>{fullName || '—'}</div>;
        }
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class - Section' />,
        cell: ({ row }) => {
            const { asmcL_ClassName = '', asmC_SectionName = '' } = row.original;
            return (
                <div>
                    {asmcL_ClassName} {asmC_SectionName && `- ${asmC_SectionName}`}
                </div>
            );
        }
    },
    {
        accessorKey: 'fmoB_Student_Due',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Due' />,
        cell: ({ row }) => {
            const value = row.original.fmoB_Student_Due ?? 0;
            return <div className='text-right font-medium'>₹{value.toLocaleString()}</div>;
        }
    },
    {
        accessorKey: 'fmoB_Institution_Due',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institution Due' />,
        cell: ({ row }) => {
            const value = row.original.fmoB_Institution_Due ?? 0;
            return <div className='text-right font-medium'>₹{value.toLocaleString()}</div>;
        }
    },
    {
        id: 'actions',
        header: () => <div className='text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: OpeningBalanceRow }) {
    const { openToggleForm, openDeleteForm } = useFormContext<OpeningBalanceRow>();

    const handleToggle = useCallback(() => openToggleForm(rowData), [rowData, openToggleForm]);
    const handleDelete = useCallback(() => openDeleteForm(rowData), [rowData, openDeleteForm]);

    const hasRecord = !!(rowData.fmC_Id || rowData.fmoB_Id);

    return (
        <div className='flex justify-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{
                    edit: false,
                    toggle: !hasRecord,
                    delete: hasRecord
                }}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        </div>
    );
}
