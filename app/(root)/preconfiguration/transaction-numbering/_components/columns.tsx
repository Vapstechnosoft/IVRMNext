'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterTransactionNumberingList } from '@/types/admission/preadmission/configaration';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const registrationNumberingColumns: ColumnDef<IMasterTransactionNumberingList>[] = [
    {
        accessorKey: 'imN_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row }) => {
            return <div className='w-full pl-6'>{row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'imN_StartingNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Starting Number' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            return <div>{rowData.imN_StartingNo ?? rowData.IMN_StartingNo ?? 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_WidthNumeric',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Width of Numeric' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            return <div>{rowData.imN_WidthNumeric ?? rowData.IMN_WidthNumeric ?? 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_ZeroPrefixFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Zero Prefix' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = rowData.imN_ZeroPrefixFlag ?? rowData.IMN_ZeroPrefixFlag;
            return <div>{val === 'Y' || val === 'Yes' || val === true ? 'Yes' : 'No'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_RestartNumFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Restart Numbering' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = rowData.imN_RestartNumFlag ?? rowData.IMN_RestartNumFlag;
            return <div>{val === 'Y' || val === 'Yearly' ? 'Yearly' : val === 'M' || val === 'Monthly' ? 'Monthly' : 'Never'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_AutoManualFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Auto/Manual' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = rowData.imN_AutoManualFlag ?? rowData.IMN_AutoManualFlag;
            return <div>{val === 'M' || val === 'Manual' ? 'Manual' : 'Auto'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_SuffixAcadYearCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year Suffix' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const suffixVal = rowData.imN_SuffixParticular || rowData.IMN_SuffixParticular || (rowData.imN_SuffixAcadYearCode || rowData.IMN_SuffixAcadYearCode ? 'Academic Year' : '');
            return <div>{suffixVal || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imN_PrefixAcadYearCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Prefix' className='font-bold text-black' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const prefixVal = rowData.imN_PrefixParticular || rowData.IMN_PrefixParticular || (rowData.imN_PrefixAcadYearCode || rowData.IMN_PrefixAcadYearCode ? 'Academic Year' : '');
            return <div>{prefixVal || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterTransactionNumberingList;
}) {
    const { openEditForm } = useFormContext<IMasterTransactionNumberingList>();

    const handleEdit = useCallback(
        (data: IMasterTransactionNumberingList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
