'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';

export const columns: ColumnDef<IMasterBoard>[] = [
    {
        accessorKey: 'ivrmmB_Name',
        header: 'Board Name',
    },
    {
        accessorKey: 'ivrmmB_Description',
        header: 'Board Description',
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const masterBoard = row.original;
            const { openEditForm, openDeleteForm } = useFormContext<IMasterBoard>();

            return (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(masterBoard)}
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteForm(masterBoard)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
