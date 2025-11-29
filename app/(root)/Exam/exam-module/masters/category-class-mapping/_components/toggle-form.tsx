'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { toggleMasterExamCategoryClassSection } from '@/server/exam/exam-module/masters/category-class-mapping';
import type { ICategoryClassMappingDetails } from '@/types/exam/exam-module/masters';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FormFields {
    ecaC_Id: number;
}

interface ToggleCategoryClassMappingFormProps {
    rowData: ICategoryClassMappingDetails;
    onClose: () => void;
}

export default function ToggleCategoryClassMappingForm({
    rowData,
    onClose,
    refetchAll
}: ToggleCategoryClassMappingFormProps & { refetchAll: () => void }) {
    const isActive = rowData.asmC_ActiveFlag;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        defaultValues: { ecaC_Id: rowData.ecaC_Id }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleMasterExamCategoryClassSection(30, Number(rowData.ecaC_Id));
            if (response.success) {
                toast.success(response.message);
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
        <AdaptiveDialog title='Toggle Category-Class Mapping Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ecaC_Id')} defaultValue={rowData.ecaC_Id} />
                    <p>
                        Are you sure you want to <strong>{isActive ? 'deactivate' : 'activate'}</strong> the mapping for{' '}
                        <strong>
                            {rowData.asmcL_ClassName}-{rowData.asmC_SectionName}
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.ecaC_Id?.message}</FormError>
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
