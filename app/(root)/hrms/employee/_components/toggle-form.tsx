'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useToggleEmployee } from '@/hooks/hrms/useEmployeeRegister';
import type { IEmployeeList } from '@/types/hrms/hrms-config/employee';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface ToggleEmployeeFormProps {
    rowData: IEmployeeList;
    onClose: () => void;
}
export default function ToggleEmployeeForm({ rowData, onClose }: ToggleEmployeeFormProps) {
    const { mutate: toggleEmployee, isPending } = useToggleEmployee();
    const isActive = rowData.hrmE_ActiveFlag;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            hrmE_Id: rowData.hrmE_Id
        }
    });
    function closeDialog() {
        onClose();
        reset();
    }
    const onSubmit: SubmitHandler<any> = async (_data) => {
        try {
            toggleEmployee(rowData.hrmE_Id, {
                onSuccess: () => {
                    closeDialog();
                },
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to update employee status');
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };
    const employeeName =
        `${rowData.hrmE_EmployeeFirstName} ${rowData.hrmE_EmployeeMiddleName || ''} ${rowData.hrmE_EmployeeLastName || ''}`.trim();
    return (
        <AdaptiveDialog title='Toggle Employee Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('hrmE_Id')} defaultValue={rowData.hrmE_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>{employeeName || rowData.hrmE_EmployeeCode}</strong>?
                    </p>
                    <FormError>{errors.hrmE_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting || isPending} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
