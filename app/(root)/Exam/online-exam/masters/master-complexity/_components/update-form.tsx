'use client';

import { FieldContainer } from '@/components/ui/form/field-container';
import { FormActions } from '@/components/ui/form/form-actions';
import { InputText } from '@/components/ui/form/input-text';
import { useMasterComplexity, useSaveMasterComplexity } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterComplexity } from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    lpmcomP_ComplexityName: z.string().min(1, 'Complexity Name is required'),
    lpmcomP_ComplexityDesc: z.string().optional(),
    lpmcomP_DefaultFlg: z.boolean().default(false)
});

type FormFields = z.infer<typeof formSchema>;

interface UpdateMasterComplexityFormProps {
    rowData: IMasterComplexity;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UpdateMasterComplexityForm({ rowData, onSuccess, onCancel }: UpdateMasterComplexityFormProps) {
    const { refetchAll } = useMasterComplexity(undefined, { enabled: false });
    const saveMutation = useSaveMasterComplexity();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lpmcomP_ComplexityName: rowData.lpmcomP_ComplexityName || '',
            lpmcomP_ComplexityDesc: rowData.lpmcomP_ComplexityDesc || '',
            lpmcomP_DefaultFlg: Boolean(rowData.lpmcomP_DefaultFlg)
        },
        mode: 'onChange'
    });

    useEffect(() => {
        reset({
            lpmcomP_ComplexityName: rowData.lpmcomP_ComplexityName || '',
            lpmcomP_ComplexityDesc: rowData.lpmcomP_ComplexityDesc || '',
            lpmcomP_DefaultFlg: Boolean(rowData.lpmcomP_DefaultFlg)
        });
    }, [rowData, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                LPMCOMP_Id: rowData.lpmcomP_Id,
                LPMCOMP_ComplexityName: data.lpmcomP_ComplexityName,
                LPMCOMP_ComplexityDesc: data.lpmcomP_ComplexityDesc || '',
                LPMCOMP_DefaultFlg: data.lpmcomP_DefaultFlg
            };

            const response = await saveMutation.mutateAsync(payload);

            if (response?.message === 'Duplicate') {
                toast.error('Complexity Name already exists!');
                return;
            }

            if (response?.success !== false && (response?.returnval === true || response?.message === 'Update')) {
                toast.success('Complexity updated successfully!');
                refetchAll();
                onSuccess();
            } else {
                toast.error(response?.message || response?.error || 'Failed to update complexity');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while updating complexity');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Complexity Name */}
                <FieldContainer label='Complexity Name' required error={errors.lpmcomP_ComplexityName?.message}>
                    <InputText {...register('lpmcomP_ComplexityName')} placeholder='e.g., Easy, Medium, Hard' className='w-full' />
                </FieldContainer>

                {/* Default Flag Checkbox */}
                <div className='flex items-center pt-6'>
                    <label className='flex cursor-pointer items-center gap-2 font-medium text-sm'>
                        <input
                            type='checkbox'
                            {...register('lpmcomP_DefaultFlg')}
                            className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                        />
                        Default Complexity Flag
                    </label>
                </div>

                {/* Complexity Description */}
                <div className='md:col-span-2'>
                    <FieldContainer label='Complexity Description' error={errors.lpmcomP_ComplexityDesc?.message}>
                        <textarea
                            {...register('lpmcomP_ComplexityDesc')}
                            rows={3}
                            placeholder='Enter complexity description...'
                            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        />
                    </FieldContainer>
                </div>
            </div>

            {/* Form Actions */}
            <FormActions submitLabel='Update Complexity' isSubmitting={isSubmitting} onCancel={onCancel} />
        </form>
    );
}
