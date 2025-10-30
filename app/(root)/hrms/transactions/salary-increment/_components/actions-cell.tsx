'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
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
import { useDeleteSalaryIncrement } from '@/hooks/hrms/useSalaryIncrement';
import type { SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import type { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface ActionsCellProps {
    row: Row<SalaryIncrementGridItem>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const { openEditForm } = useFormContext<SalaryIncrementGridItem>();
    const { mutate: deleteIncrement, isPending: isDeleting } = useDeleteSalaryIncrement();

    const handleDelete = () => {
        deleteIncrement(
            {
                HREIC_Id: row.original.HREIC_Id,
                MI_Id: 30,
                roleId: 2
            },
            {
                onSuccess: () => {
                    toast.success('Salary increment deleted successfully!');
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to delete salary increment.');
                }
            }
        );
    };

    return (
        <div className='flex justify-end'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                        <span className='sr-only'>Open menu</span>
                        <MoreHorizontal className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => {
                            openEditForm(row.original);
                        }}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the salary increment record.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
