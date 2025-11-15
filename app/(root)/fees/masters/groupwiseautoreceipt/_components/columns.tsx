'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterGroupWiseAutoReciptColumns: ColumnDef<IMasterGroupWiseAutoReciptList>[] = [
    {
        accessorKey: 'fyccC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'academicyear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('academicyear')}</div>
    },

    {
        accessorKey: 'fgaR_PrefixName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Prefix' />,
        cell: ({ row }) => {
            const prefix = row.getValue('fgaR_PrefixName') as string;
            return <div className='truncate'>{prefix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'fgaR_SuffixName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Suffix' />,
        cell: ({ row }) => {
            const suffix = row.getValue('fgaR_SuffixName') as string;
            return <div className='truncate'>{suffix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'fgaR_Starting_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Starting Number' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('fgaR_Starting_No')}</div>
    },

    // {
    //   accessorKey: 'fycC_ActiveFlag',
    //   header: ({ column }) => <DataTableColumnHeader column={column} title='Active' className='pl-6 text-left' />,
    //   cell: ({ row }) => {
    //     const isActive = row.getValue('fycC_ActiveFlag');
    //     return (
    //       <div className='flex items-center justify-start pl-6'>
    //         <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>
    //           {isActive ? 'Active' : 'Inactive'}
    //         </span>
    //       </div>
    //     );
    //   },
    //   enableSorting: true,
    //   enableHiding: true,
    //   size: 100,
    // },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterGroupWiseAutoReciptList;
}) {
    const { openToggleForm, openEditForm, openDeleteForm } = useFormContext<IMasterGroupWiseAutoReciptList>();

    const handleToggle = useCallback((data: IMasterGroupWiseAutoReciptList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback((data: IMasterGroupWiseAutoReciptList) => openEditForm(data), [openEditForm]);

    const handleDelete = useCallback((data: IMasterGroupWiseAutoReciptList) => openDeleteForm(data), [openDeleteForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
