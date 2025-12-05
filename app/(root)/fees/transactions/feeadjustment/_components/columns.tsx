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
        accessorKey: 'Student Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => row.getValue('Student Name')
    },
    {
        accessorKey: 'Adjusted Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted Amount' />,
        cell: ({ row }) => row.getValue('Adjusted Amount')
    },
    {
        accessorKey: 'Adjusted from Head Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted from Head Name' />,
        cell: ({ row }) => row.getValue('Adjusted from Head Name')
    },
    {
        accessorKey: 'Adjusted from Installment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted from Installment' />,
        cell: ({ row }) => row.getValue('Adjusted from Installment')
    },
    {
        accessorKey: 'Adjusted to Head Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted to Head Name' />,
        cell: ({ row }) => row.getValue('Adjusted to Head Name')
    },
    {
        accessorKey: 'Adjusted to Installment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted to Installment' />,
        cell: ({ row }) => row.getValue('Adjusted to Installment')
    },
    {
        accessorKey: 'Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => row.getValue('Amount')
    },
    {
        accessorKey: 'Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => row.getValue('Date')
    },
    {
        accessorKey: 'actions',
        header: ({ column }) => <div className='text-center'>Actions</div>,
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
