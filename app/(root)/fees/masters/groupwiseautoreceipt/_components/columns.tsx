'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterGroupWiseAutoReciptColumns: ColumnDef<IMasterGroupWiseAutoReciptList>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='rounded border shadow-md transition-all duration-200'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='rounded border shadow-md transition-all duration-200'
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'fyccC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'fmcC_ClassCategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Category' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('fmcC_ClassCategoryName')}</div>
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => {
            const classNames = row.getValue('asmcL_ClassName') as string;
            try {
                const parsed = JSON.parse(classNames);
                const displayText = Array.isArray(parsed) ? parsed.join(', ') : classNames;
                return <div className='truncate'>{displayText}</div>;
            } catch {
                return <div className='truncate'>{classNames}</div>;
            }
        }
    },
    {
        accessorKey: 'prefix',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Prefix' />,
        cell: ({ row }) => {
            const prefix = row.getValue('prefix') as string;
            return <div className='truncate'>{prefix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'suffix',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Suffix' />,
        cell: ({ row }) => {
            const suffix = row.getValue('suffix') as string;
            return <div className='truncate'>{suffix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'startingNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Starting Number' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('startingNumber')}</div>
    },
    {
        accessorKey: 'groups',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Groups' />,
        cell: ({ row }) => {
            const groups = row.getValue('groups') as string;
            try {
                const parsed = JSON.parse(groups);
                const displayText = Array.isArray(parsed) ? parsed.join(', ') : groups;
                return <div className='truncate'>{displayText}</div>;
            } catch {
                return <div className='truncate'>{groups}</div>;
            }
        }
    },
    {
        accessorKey: 'autoGroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Auto Group Name' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('autoGroupName')}</div>
    },
    {
        accessorKey: 'address',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Address' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('address') || 'N/A'}</div>
    },
    {
        accessorKey: 'receiptTemplateFormat',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt Template Format' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('receiptTemplateFormat') || 'N/A'}</div>
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

function ActionButtonsCell({ rowData }: { rowData: IMasterGroupWiseAutoReciptList }) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterGroupWiseAutoReciptList>();

    const handleToggle = useCallback((data: IMasterGroupWiseAutoReciptList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback((data: IMasterGroupWiseAutoReciptList) => openEditForm(data), [openEditForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
