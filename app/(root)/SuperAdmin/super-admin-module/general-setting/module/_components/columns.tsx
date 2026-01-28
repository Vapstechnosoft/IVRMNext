'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { Switch } from '@/components/ui/switch';
import type { IMasterModule } from '@/types/super-admin/super-admin-module/general-setting/module';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

export const columns: ColumnDef<IMasterModule>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <ColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'ivrmM_ModuleName',
        header: ({ column }) => <ColumnHeader column={column} title='Module Name' />,
    },
    {
        accessorKey: 'ivrmM_ModuleDesc',
        header: ({ column }) => <ColumnHeader column={column} title='Description' />,
    },
    {
        id: 'actions',
        header: 'Edit/Activate/Deactivate',
        cell: ({ row }) => {
            const isActive = row.original.module_ActiveFlag === 1;
            return (
                <div className='flex items-center justify-center gap-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-primary'>
                        <Pencil className='h-4 w-4' />
                    </Button>
                    <span className='text-gray-300'>|</span>
                    {isActive ? (
                        <Button variant='ghost' size='sm' className='text-destructive hover:text-destructive'>
                            Deactivate
                        </Button>
                    ) : (
                        <Button variant='ghost' size='sm' className='text-green-600 hover:text-green-700'>
                            Activate
                        </Button>
                    )}
                </div>
            );
        },
    },
];
