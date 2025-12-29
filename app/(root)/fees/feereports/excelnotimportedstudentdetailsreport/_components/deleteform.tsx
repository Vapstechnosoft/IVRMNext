'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useFeeThirdParty } from '@/hooks/fees/useTrasactions';
import { excelImportNotDoneReportSchema } from '@/schemas/fees/reports';
import { deleteThirdPartyTrasaction } from '@/server/fees/trasactions/thirdPartyTrasaction';
import type { ExcelNotImportedStudentDetailsReport } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof excelImportNotDoneReportSchema.delete>;

interface ExcelNotImportedStudentDetailsFormProps {
    rowData: ExcelNotImportedStudentDetailsReport;
    onClose: () => void;
}

export default function DeleteExcelNotImportedForm({ rowData, onClose }: ExcelNotImportedStudentDetailsFormProps) {
    const { refetchAll } = useFeeThirdParty();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(excelImportNotDoneReportSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deleteThirdPartyTrasaction(Number(rowData.id));
            if (response?.success) {
                toast.success(response.message || 'Deleted successfully');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || 'Failed to delete');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to delete');
        }
    };

    return (
        <AdaptiveDialog title='Delete ExcelNot Imported Student Details' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('id')} defaultValue={rowData.id} />
                    <p>Are you sure you want to permanently delete the selected data</p>
                    <FormError>{errors.id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant='destructive'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
