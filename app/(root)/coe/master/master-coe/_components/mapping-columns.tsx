'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { MappedEventCoe } from '@/types/coe/master-coe';
import type { ColumnDef } from '@tanstack/react-table';
import { Briefcase, Eye, FileImage, FileVideo, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const mappingColumns: ColumnDef<MappedEventCoe>[] = [
    {
        accessorKey: 'index',
        header: ({ column }) => <DataTableColumnHeader column={column} className='w-full pl-6' title='Sl. No' />,
        cell: ({ row }) => <div className='w-full pl-6'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
    },
    {
        accessorKey: 'coemE_EventName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Name' />,
        cell: ({ row }) => <div>{row.getValue('coemE_EventName')}</div>,
    },
    {
        accessorKey: 'images',
        header: 'Images',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-green-600'>
                <FileImage className='h-4 w-4' />
            </Button>
        ),
    },
    {
        accessorKey: 'videos',
        header: 'Videos',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                <FileVideo className='h-4 w-4' />
            </Button>
        ),
    },
    {
        accessorKey: 'classes',
        header: 'Classes',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                <Eye className='h-4 w-4' />
            </Button>
        ),
    },
    {
        accessorKey: 'employees',
        header: 'Employees',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-orange-600'>
                <Briefcase className='h-4 w-4' />
            </Button>
        ),
    },
    {
        accessorKey: 'others',
        header: 'Others',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-red-600'>
                <Users className='h-4 w-4' />
            </Button>
        ),
    },
    {
        accessorKey: 'alumni',
        header: 'Alumni',
        cell: ({ row }) => (
            <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                <GraduationCap className='h-4 w-4' />
            </Button>
        ),
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: MappedEventCoe }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<MappedEventCoe>();

    const handleEdit = useCallback(
        (data: MappedEventCoe) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: MappedEventCoe) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: MappedEventCoe) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='coeE_ActiveFlag'
        />
    );
}


