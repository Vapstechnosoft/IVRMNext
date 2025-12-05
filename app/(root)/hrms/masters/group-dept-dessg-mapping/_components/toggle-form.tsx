'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useGroupDeptDessgMappingCRUD } from '@/hooks/hrms/useMasters';
import type { GroupDeptDessgMappingDetail } from '@/types/hrms/group-dept-dessg-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    HRGTDDS_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleGroupDeptDessgMappingFormProps {
    rowData: GroupDeptDessgMappingDetail;
    onClose: () => void;
}

export default function ToggleGroupDeptDessgMappingForm({ rowData, onClose }: ToggleGroupDeptDessgMappingFormProps) {
    const { toggleMutation, refetchAll } = useGroupDeptDessgMappingCRUD();
    const isActive = rowData.HRGTDDS_ActiveFlg;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            HRGTDDS_Id: rowData.HRGTDDS_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleMutation.mutateAsync(rowData.HRGTDDS_Id);

            if (response?.success) {
                toast.success(response?.message || `Mapping ${!isActive ? 'activated' : 'deactivated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} mapping`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} mapping`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Group-Dept-Designation Mapping Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('HRGTDDS_Id', { valueAsNumber: true })} defaultValue={rowData.HRGTDDS_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} mapping for{' '}
                        <strong>
                            {rowData.HRMGT_EmployeeGroupType} - {rowData.HRMD_DepartmentName} - {rowData.HRMDES_DesignationName}
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.HRGTDDS_Id?.message}</FormError>
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
