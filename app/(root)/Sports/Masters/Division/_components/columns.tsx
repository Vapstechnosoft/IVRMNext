'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterDivision } from '@/types/sports/masters/division';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { deactivateMasterDivision } from '@/server/sports/masters/division';
import { useMasterDivisions } from '@/hooks/sports/useMasterDivisions';
import { useFormContext } from '@/components/ui/form/form-provider';
import { toast } from 'sonner';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterDivision> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterDivision>();

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
            toggleConditionKey='spccmD_ActiveFlag'
        />
    );
}

export const MasterDivisionColumns: ColumnDef<IMasterDivision>[] = [
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
        accessorKey: 'spccmD_DivisionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Division Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmD_DivisionName')}</div>
    },
    {
        accessorKey: 'spccmD_DivisionDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => (
            <div className='max-w-[400px] truncate' title={row.getValue('spccmD_DivisionDescription')}>
                {row.getValue('spccmD_DivisionDescription')}
            </div>
        )
    },
    {
        accessorKey: 'spccmD_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('spccmD_ActiveFlag');
            return (
                <Badge variant={isActive ? 'success' : 'destructive'} className='font-semibold'>
                    {isActive ? 'Active' : 'Deactivated'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
