'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterHouseDesignation } from '@/types/sports/masters/house-designation';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterHouseDesignation> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterHouseDesignation>();

    return (
        <ActionButtons
            rowData={data}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(data)}
            onToggle={() => openToggleForm(data)}
            toggleConditionKey='spccmhD_ActiveFlag'
        />
    );
}

/* ============================================
   Master House Designation Columns Definition
   ============================================ */
export const MasterHouseDesignationColumns: ColumnDef<IMasterHouseDesignation>[] = [
    {
        id: 'serialNumber',
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
        accessorKey: 'spccmhD_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation Name' />
    },
    {
        accessorKey: 'spccmhD_DesignationDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation Description' />
    },
    {
        accessorKey: 'spccmhD_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('spccmhD_ActiveFlag');
            return (
                <Badge variant={isActive ? 'success' : 'destructive'} className='font-semibold'>
                    {isActive ? 'Active' : 'Deactivated'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        cell: ActionsCell
    }
];
