'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { Row } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Power } from 'lucide-react';

interface ActionsCellProps {
    row: Row<EmployeeListItem>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const employee = row.original;
    const { openEditForm, openToggleForm } = useFormContext<EmployeeListItem>();

    const handleEdit = () => {
        openEditForm(employee);
    };

    const handleToggle = () => {
        openToggleForm(employee);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Open menu</span>
                    <MoreHorizontal className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggle}>
                    <Power className='mr-2 h-4 w-4' />
                    {employee.HRME_ActiveFlag ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
