'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSalaryAdvanceList } from '@/hooks/hrms/useTransactions';
import { toggleSalaryAdvanceStatus } from '@/server/hrms/hrmsConfig/transaction/salary-advance';
import type { SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    HRESA_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleSalaryAdvanceFormProps {
    rowData: SalaryAdvanceItem;
    onClose: () => void;
}

export default function ToggleSalaryAdvanceForm({ rowData, onClose }: ToggleSalaryAdvanceFormProps) {
    const { refetchAll } = useSalaryAdvanceList(undefined);
    const isActive = rowData.HRESA_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            HRESA_Id: rowData.HRESA_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await toggleSalaryAdvanceStatus(data.HRESA_Id, !isActive);

            if (response?.success) {
                toast.success(response?.message || `Salary advance ${isActive ? 'deactivated' : 'activated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} salary advance`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} salary advance`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Salary Advance Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('HRESA_Id', { valueAsNumber: true })} defaultValue={rowData.HRESA_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} salary advance for employee{' '}
                        <strong>
                            {rowData.HRME_EmployeeFirstName
                                ? `${rowData.HRME_EmployeeFirstName} ${rowData.HRME_EmployeeLastName || ''}`.trim()
                                : `ID: ${rowData.HRME_Id}`}
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.HRESA_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

