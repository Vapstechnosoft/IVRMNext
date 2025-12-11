'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterReligionCategoryMappingList } from '@/types/hrms/hrms-config/master';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
export const religionCategoryMappingColumns: ColumnDef<IMasterReligionCategoryMappingList>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'ivrmmR_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Religion' />,
        cell: ({ row }) => {
            const religion = row.getValue('ivrmmR_Name') as string;
            return <div className='font-medium'>{religion}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'imcC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => {
            const category = row.getValue('imcC_CategoryName') as string;
            return <div className='font-medium'>{category}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'ircC_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('ircC_ActiveFlg') as boolean;
            return (
                <Badge variant={isActive ? 'default' : 'secondary'} className='font-medium'>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: IMasterReligionCategoryMappingList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterReligionCategoryMappingList>();

    const handleEdit = useCallback(
        (data: IMasterReligionCategoryMappingList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterReligionCategoryMappingList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ircC_ActiveFlg'
        />
    );
}
