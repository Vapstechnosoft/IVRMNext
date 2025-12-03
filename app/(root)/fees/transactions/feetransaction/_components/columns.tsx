// app/fee-preadmission-transaction/_components/columns.tsx
'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { Ifeetransaction } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

export const feeTransactionColumns: ColumnDef<Ifeetransaction>[] = [
    {
        accessorKey: 'fP_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const first = row.original.amsT_FirstName || '';
            const middle = row.original.amsT_MiddleName || '';
            const last = row.original.amsT_LastName || '';

            return <div>{`${first} ${middle} ${last}`.trim()}</div>;
        }
    },
    {
        accessorKey: 'classname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('classname')}</div>
    },
    {
        accessorKey: 'sectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' />,
        cell: ({ row }) => <div>{row.getValue('sectionname')}</div>
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        cell: ({ row }) => <div>{row.getValue('amsT_AdmNo')}</div>
    },
    {
        accessorKey: 'fyP_Receipt_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No.' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Receipt_No')}</div>
    },
    {
        accessorKey: 'fyP_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Date' />,
        cell: ({ row }) => <div>{new Date(row.getValue('fyP_Date')).toLocaleDateString()}</div>
    },
    {
        accessorKey: 'fyP_Tot_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Amount' />,
        cell: ({ row }) => <div style={{ textAlign: 'center' }}>{row.getValue('fyP_Tot_Amount')}</div>
    },
    {
        accessorKey: 'fyP_Bank_Or_Cash',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mode of Payment' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Bank_Or_Cash')}</div>
    },

    {
        accessorKey: 'fyP_Id',
        header: 'Action',
        cell: ({ row }) => (
            <div className='flex justify-center gap-2'>
                <button
                    type='button'
                    className='rounded-md p-2 text-primary transition hover:bg-muted'
                    title='View Receipt'
                    onClick={() => console.log('View receipt', row.getValue('fyP_Id'))}>
                    <Eye className='h-4 w-4' />
                </button>
            </div>
        )
    }
];

/* ----------------------------------------------------------- */
// function ActionButtonsCell({ rowData }: { rowData: Ifeetransaction }) {
//   const { openEditForm, openDeleteForm, openDetailsView } =
//     useFormContext<Ifeetransaction>();

//   const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
//   const handleDelete = useCallback(() => openDeleteForm(rowData), [openDeleteForm, rowData]);
//   const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);

//   return (
//     <div className="flex items-center justify-center gap-2">
//       <button
//         type="button"
//         onClick={handleView}
//         className="rounded-md p-2 transition hover:bg-muted"
//         title="View Receipt"
//       >
//         <Eye className="h-4 w-4 text-blue-600" />
//       </button>

//       <ActionButtons
//         rowData={rowData}
//         buttons={{ edit: false, delete: false, toggle: false }}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//       />
//     </div>
//   );
// }
