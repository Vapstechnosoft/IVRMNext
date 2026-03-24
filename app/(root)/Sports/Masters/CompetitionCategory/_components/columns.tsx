'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCompetitionCategory } from '@/types/sports/masters/competition-category';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterCompetitionCategory> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterCompetitionCategory>();

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
            toggleConditionKey='spccmcC_ActiveFlag'
        />
    );
}

/* ============================================
   Master Competition Category Columns Definition
   ============================================ */
export const MasterCompetitionCategoryColumns: ColumnDef<IMasterCompetitionCategory>[] = [
    {
        accessorKey: 'spccmcC_Id',
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
        accessorKey: 'spccmcC_CompitionCategory',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Competition Category' />,
    },
    {
        accessorKey: 'spccmcC_CCDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    },
    {
        accessorKey: 'spccmcC_CCAgeFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Age Flag' />,
        cell: ({ row }) => (
            row.original.spccmcC_CCAgeFlag ? <Badge variant="default" className='bg-blue-600 hover:bg-blue-700'>Yes</Badge> : <Badge variant="outline">No</Badge>
        )
    },
    {
        accessorKey: 'spccmcC_FromCCAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Year(Age)' />,
    },
    {
        accessorKey: 'spccmcC_ToCCAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Year(Age)' />,
    },
    {
        accessorKey: 'spccmcC_FromCCAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Month(Age)' />,
    },
    {
        accessorKey: 'spccmcC_ToCCAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Month(Age)' />,
    },
    {
        accessorKey: 'spccmcC_FromCCAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Days(Age)' />,
    },
    {
        accessorKey: 'spccmcC_ToCCAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Days(Age)' />,
    },
    {
        accessorKey: 'spccmcC_CCWeightFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight Flag' />,
        cell: ({ row }) => (
            row.original.spccmcC_CCWeightFlag ? <Badge variant="default" className='bg-blue-600 hover:bg-blue-700'>Yes</Badge> : <Badge variant="outline">No</Badge>
        )
    },
    {
        accessorKey: 'spccmcC_CCWeight',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight' />,
    },
    {
        id: 'actions',
        cell: ActionsCell
    }
];
