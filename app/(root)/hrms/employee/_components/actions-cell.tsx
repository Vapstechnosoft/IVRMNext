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
import { useDeleteEmployee } from '@/hooks/hrms/useEmployee';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { Row } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

interface ActionsCellProps {
    row: Row<EmployeeListItem>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const employee = row.original;
    const { openEditForm } = useFormContext<EmployeeListItem>();
    const { mutate: deleteEmployee } = useDeleteEmployee();

    const handleEdit = () => {
        openEditForm(employee);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this employee?')) {
            deleteEmployee(employee.HRME_Id);
        }
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
                <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
