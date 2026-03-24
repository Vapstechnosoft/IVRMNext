'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSportsCCNameUOM } from '@/types/sports/masters/sports-cc-name-uom';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterSportsCCNameUOM> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterSportsCCNameUOM>();

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
            toggleConditionKey='spccmsccuoM_ActiveFlag'
        />
    );
}

/* ============================================
   Master Sports CC Name UOM Columns Definition
   ============================================ */
export const MasterSportsCCNameUOMColumns: ColumnDef<IMasterSportsCCNameUOM>[] = [
    {
        accessorKey: 'spccmsccuoM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'sportsCCName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sports Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'uomName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='UOM' />,
        enableSorting: true
    },
    {
        id: 'actions',
        cell: ActionsCell
    }
];
