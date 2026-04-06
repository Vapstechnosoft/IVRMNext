'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Pencil, Trash2 } from 'lucide-react';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import { useDeleteMasterActivity } from '@/hooks/admission/preadmission/useMasterActivity';
import { toast } from 'sonner';

export const masterActivityColumns: any[] = [
    {
        header: 'SL.NO',
        cell: (info: any) => info.row.index + 1,
        size: 80
    },
    {
        header: 'Name',
        accessorKey: 'amA_Activity',
        sortable: true
    },
    {
        header: 'Description',
        accessorKey: 'amA_Activity_Desc',
        sortable: true
    },
    {
        id: 'actions',
        header: 'Action',
        cell: function ActionCell(info: any) {
            const { openEditForm } = useFormContext<IMasterActivityList>();
            const row = info.row.original;
            const deleteMutation = useDeleteMasterActivity();

            const handleDelete = async () => {
                if (window.confirm('Are you sure? Do you want to delete this item?')) {
                    toast.loading('Deleting...', { id: 'delete' });
                    try {
                        const res = await deleteMutation.mutateAsync(row.amA_Id);
                        if (res.message === 'Delete') {
                            toast.error('You Can Not Delete This Record It Is Already Mapped With Student', { id: 'delete' });
                        } else {
                            toast.success('Record Deleted Successfully', { id: 'delete' });
                        }
                    } catch (error) {
                        toast.error('Failed to delete record', { id: 'delete' });
                    }
                }
            };

            return (
                <div className='flex justify-center gap-2'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditForm(row)}
                        className='h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary'>
                        <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleDelete}
                        className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        size: 100
    }
];
