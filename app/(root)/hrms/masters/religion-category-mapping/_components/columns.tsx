'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionsCell } from './actions-cell';

export const religionCategoryMappingColumns: ColumnDef<ReligionCategoryMappingDetail>[] = [
    {
        accessorKey: 'IVRMMR_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Religion' />,
        cell: ({ row }) => {
            const religion = row.getValue('IVRMMR_Name') as string;
            return <div className='font-medium'>{religion}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'IMCC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => {
            const category = row.getValue('IMCC_CategoryName') as string;
            return <div className='font-medium'>{category}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'IRCC_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('IRCC_ActiveFlg') as boolean;
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
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
