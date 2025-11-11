'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useReligionCategoryMappingCRUD } from '@/hooks/hrms/useMasters';
import type { ReligionCategoryMappingDetail, ReligionCategoryMappingResponse } from '@/types/hrms/religion-category-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const religionCategoryMappingColumns: ColumnDef<ReligionCategoryMappingDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: ReligionCategoryMappingDetail }) {
    const { openEditForm } = useFormContext<ReligionCategoryMappingResponse>();
    const { toggleMutation } = useReligionCategoryMappingCRUD();

    const handleEdit = useCallback(
        (data: ReligionCategoryMappingDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: ReligionCategoryMappingDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    ...data,
                    IRCC_ActiveFlg: newState
                });
                // Toast is handled in the mutation's onSuccess/onError
            } catch (_error) {
                // Error toast is handled in the mutation's onError
            }
        },
        [toggleMutation]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='IRCC_ActiveFlg'
        />
    );
}
