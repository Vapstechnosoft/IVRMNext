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
import { useDeleteEmployeeLoan } from '@/hooks/hrms/useEmployeeLoan';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import type { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface ActionsCellProps {
    row: Row<EmployeeLoanItem>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const { onOpenChange, setSelectedRow } = useFormContext<EmployeeLoanItem>();
    const { mutate: deleteLoan, isPending: isDeleting } = useDeleteEmployeeLoan();

    const handleDelete = () => {
        deleteLoan(
            {
                HREL_Id: row.original.HREL_Id,
                HREL_ActiveFlag: false,
                roleId: 2
            },
            {
                onSuccess: () => {
                    toast.success('Employee loan deleted successfully!');
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to delete employee loan.');
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
                            setSelectedRow(row.original);
                            onOpenChange(true, 'update');
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
                                    This action cannot be undone. This will permanently delete the employee loan record for{' '}
                                    <span className='font-medium'>
                                        {row.original.HRME_EmployeeFirstName} {row.original.HRME_EmployeeLastName}
                                    </span>
                                    .
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
