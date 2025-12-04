import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IFeeConcessionStudentConcessionGrid } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const openingBalanceColumns: ColumnDef<IFeeConcessionStudentConcessionGrid>[] = [
    {
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='S.No' />,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.slno}</div>,
        enableSorting: true,
        size: 80
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.studentName || '—'}</div>,
        size: 280
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
        cell: ({ row }) => <div className='text-center'>{row.original.amsT_AdmNo || '—'}</div>,
        size: 120
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.original.asmcL_ClassName || '—'}</div>,
        size: 140
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.original.asmaY_Year}</div>,
        size: 140
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group/Term' />,
        cell: ({ row }) => <div>{row.original.fmG_GroupName || '—'}</div>,
        size: 180
    },
    {
        accessorKey: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Head' />,
        cell: ({ row }) => <div>{row.original.fmH_FeeName || '—'}</div>,
        size: 200
    },
    {
        accessorKey: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div>{row.original.ftI_Name || '—'}</div>,
        size: 160
    },
    {
        accessorKey: 'fmcC_ConcessionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Concession Name' />,
        cell: ({ row }) => <div>{row.original.fmcC_ConcessionName || '—'}</div>,
        size: 200
    },
    {
        accessorKey: 'fsC_ConcessionAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Concession Amount' />,
        cell: ({ row }) => {
            const amount = row.original.fsC_ConcessionAmount || 0;
            return <div className='text-right font-semibold text-green-700'>₹{amount.toLocaleString('en-IN')}</div>;
        },
        size: 160
    },
    {
        id: 'actions',
        header: () => <div className='text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        size: 120,
        meta: {
            align: 'center'
        }
    }
];

function ActionButtonsCell({ rowData }: { rowData: IFeeConcessionStudentConcessionGrid }) {
    const { openToggleForm, openDeleteForm } = useFormContext<IFeeConcessionStudentConcessionGrid>();

    const handleToggle = useCallback(() => openToggleForm(rowData), [rowData, openToggleForm]);
    const handleDelete = useCallback(() => openDeleteForm(rowData), [rowData, openDeleteForm]);

    return (
        <div className='flex justify-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{
                    edit: true,
                    delete: true
                }}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        </div>
    );
}
