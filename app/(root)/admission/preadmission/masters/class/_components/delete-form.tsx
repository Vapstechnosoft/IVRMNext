'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterClass } from '@/hooks/admission/preadmission/useMasters';
import { masterClassSchema } from '@/schemas/admission/preadmission/masters';
import { deleteMasterClass } from '@/server/admission/preadmission/masters/class';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.delete>;

interface DeleteMasterClassFormProps {
    cell: any;
    onAction?: () => void; // Add this prop
}

export default function DeleteMasterClassForm({ cell, onAction }: DeleteMasterClassFormProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IMasterClassList | null | any>(null);
    const { refetchAll } = useMasterClass();

    const handleEdit = (row: IMasterClassList) => {
        setSelectedRow(row);
        setIsDialogOpen(true);
    };

    function closeDialog() {
        setIsDialogOpen(false);
        reset();
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.delete),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { asmcL_Id } = data;

            const response = await deleteMasterClass(String(asmcL_Id));

            if (response.success) {
                toast.success(response.message);
                onAction?.();
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(cell.getValue());
                }}
                className='cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
            </DropdownMenuItem>

            {selectedRow && (
                <AdaptiveDialog title='Delete Master Class' isOpen={isDialogOpen} onClose={closeDialog}>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                        <AdaptiveBody className='flex flex-col gap-5'>
                            <input type='text' hidden={true} {...register('asmcL_Id')} defaultValue={selectedRow.asmcL_Id} />
                            <p>Are you sure you want to delete {selectedRow.name}?</p>

                            <FormError>{errors.asmcL_Id?.message}</FormError>
                            <FormError>{errors.root?.message}</FormError>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='secondary' onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button type='submit' variant='danger' isLoading={isSubmitting}>
                                Delete
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
