'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSalaryIncrementList } from '@/hooks/hrms/useTransactions';
import { deleteSalaryIncrement } from '@/server/hrms/hrmsConfig/transaction/salary-increment';
import type { SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Create delete schema
const deleteSchema = z.object({
    HREIC_Id: z.number().min(1, 'ID is required')
});

type FormFields = z.infer<typeof deleteSchema>;

interface DeleteSalaryIncrementFormProps {
    rowData: SalaryIncrementGridItem;
    onClose: () => void;
}

export default function DeleteSalaryIncrementForm({ rowData, onClose }: DeleteSalaryIncrementFormProps) {
    const { refetchAll } = useSalaryIncrementList(undefined);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(deleteSchema),
        mode: 'onChange',
        defaultValues: {
            HREIC_Id: Number(rowData.HREIC_Id) || 0
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await deleteSalaryIncrement(data.HREIC_Id);

            if (response?.success) {
                toast.success(response.message || 'Salary increment deleted successfully');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || 'Failed to delete salary increment');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete salary increment');
        }
    };

    return (
        <AdaptiveDialog title='Delete Salary Increment' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input
                        type='hidden'
                        {...register('HREIC_Id', {
                            valueAsNumber: true,
                            value: Number(rowData.HREIC_Id) || 0
                        })}
                    />
                    <p>
                        Are you sure you want to delete the salary increment for{' '}
                        <strong>{rowData.EmployeeName || 'this employee'}</strong>? This action cannot be undone.
                    </p>
                    <FormError>{errors.HREIC_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={'destructive'}>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

