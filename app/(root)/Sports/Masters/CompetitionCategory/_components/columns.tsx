'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCompetitionCategory } from '@/types/sports/masters/competition-category';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Power, PowerOff } from 'lucide-react';

export const MasterCompetitionCategoryColumns: ColumnDef<IMasterCompetitionCategory>[] = [
    {
        id: 'serialNumber',
        header: 'SL.NO',
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination;
            return pageIndex * pageSize + row.index + 1;
        }
    },
    {
        accessorKey: 'SPCCMCC_CompitionCategory',
        header: 'Competition Category',
    },
    {
        accessorKey: 'SPCCMCC_CCDesc',
        header: 'Description',
    },
    {
        accessorKey: 'SPCCMCC_CCAgeFlag',
        header: 'Age Flag',
        cell: ({ row }) => (
            row.original.SPCCMCC_CCAgeFlag ? <Badge variant="default" className='bg-blue-600 hover:bg-blue-700'>Yes</Badge> : <Badge variant="outline">No</Badge>
        )
    },
    {
        accessorKey: 'SPCCMCC_FromCCAgeYear',
        header: 'From Year(Age)',
    },
    {
        accessorKey: 'SPCCMCC_ToCCAgeYear',
        header: 'To Year(Age)',
    },
    {
        accessorKey: 'SPCCMCC_FromCCAgeMonth',
        header: 'From Month(Age)',
    },
    {
        accessorKey: 'SPCCMCC_ToCCAgeMonth',
        header: 'To Month(Age)',
    },
    {
        accessorKey: 'SPCCMCC_FromCCAgeDays',
        header: 'From Days(Age)',
    },
    {
        accessorKey: 'SPCCMCC_ToCCAgeDays',
        header: 'To Days(Age)',
    },
    {
        accessorKey: 'SPCCMCC_CCWeightFlag',
        header: 'Weight Flag',
        cell: ({ row }) => (
            row.original.SPCCMCC_CCWeightFlag ? <Badge variant="default" className='bg-blue-600 hover:bg-blue-700'>Yes</Badge> : <Badge variant="outline">No</Badge>
        )
    },
    {
        accessorKey: 'SPCCMCC_CCWeight',
        header: 'Weight',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const { openEditForm, openToggleForm } = useFormContext<IMasterCompetitionCategory>();
            return (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => openEditForm(row.original)}
                        title="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <span className="text-muted-foreground">|</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={row.original.SPCCMCC_ActiveFlag ? "h-8 w-8 text-destructive" : "h-8 w-8 text-green-600"}
                        onClick={() => openToggleForm(row.original)}
                        title={row.original.SPCCMCC_ActiveFlag ? "Deactivate" : "Activate"}
                    >
                        {row.original.SPCCMCC_ActiveFlag ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                </div>
            );
        }
    }
];
