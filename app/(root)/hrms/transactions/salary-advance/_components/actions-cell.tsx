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
import { useDeleteSalaryAdvance } from '@/hooks/hrms/useSalaryAdvance';
import type { SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import type { Row } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActionsCellProps {
    row: Row<SalaryAdvanceItem>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const advance = row.original;
    const { openEditForm } = useFormContext<SalaryAdvanceItem>();
    const { mutate: deleteAdvance, isPending } = useDeleteSalaryAdvance();

    const handleEdit = () => {
        openEditForm(advance);
    };

    const handleDelete = () => {
        if (!advance.HRESA_Id) {
            toast.error('Advance ID is missing for deletion.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this salary advance?')) {
            deleteAdvance({
                HRESA_Id: advance.HRESA_Id,
                roleId: 2
            });
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
                <DropdownMenuItem onClick={handleEdit} disabled={isPending}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isPending} className='text-destructive'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
