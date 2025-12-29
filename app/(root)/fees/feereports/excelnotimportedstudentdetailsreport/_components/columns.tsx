'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ExcelNotImportedStudentDetailsReport } from '@/types/fees/reports/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const excelnotimportedstudentColumns: ColumnDef<ExcelNotImportedStudentDetailsReport>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'academicyear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('academicyear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'admissionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No' />,
        cell: ({ row }) => <div>{row.getValue('admissionNo')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'paiddate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Date' />,
        cell: ({ row }) => <div>{row.getValue('paiddate')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => <div>₹{Number(row.getValue('amount')).toLocaleString('en-IN')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div>{row.getValue('remarks')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'paymentmode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Payment Mode' />,
        cell: ({ row }) => <div>{row.getValue('paymentmode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: ExcelNotImportedStudentDetailsReport;
}) {
    const { openDeleteForm } = useFormContext<ExcelNotImportedStudentDetailsReport>();

    const handleDelete = useCallback((data: ExcelNotImportedStudentDetailsReport) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='justify-left flex gap-2'>
            <ActionButtons rowData={rowData} buttons={{ delete: true }} onDelete={handleDelete} />
        </div>
    );
}
