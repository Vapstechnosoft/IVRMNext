'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterExamPaper } from '@/hooks/exam/exammodule/usemasters';
import { masterExamPaperSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterExamPaper } from '@/server/exam/exam-module/masters/exam-paper';
import type { IMasterExamPaper } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterExamPaperSchema.addOrUpdate>;

interface UpdateMasterExamPaperFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterExamPaper;
}

export default function UpdateMasterExamPaperForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterExamPaperFormProps) {
    const { refetchAll } = useMasterExamPaper();

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterExamPaperSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                ex_Id: row.ex_Id,
                ex_ExamPaperType: row.ex_ExamPaperType,
                ex_DisplayColor: row.ex_DisplayColor,
                ex_PaperTypeDescription: row.ex_PaperTypeDescription,
                ex_IsActiveFlag: row.ex_IsActiveFlag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                MI_Id: 30,
                EX_Id: data.ex_Id,
                EX_ExamPaperType: data.ex_ExamPaperType,
                EX_DisplayColor: data.ex_DisplayColor,
                EX_PaperTypeDescription: data.ex_PaperTypeDescription,
                EX_ActiveFlag: data.ex_IsActiveFlag
            };

            const response = await addOrUpdateMasterExamPaper(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Exam Paper Type'
                            required
                            id='ex_ExamPaperType'
                            {...register('ex_ExamPaperType')}
                            defaultValue={row.ex_ExamPaperType}
                            error={errors.ex_ExamPaperType?.message}
                        />
                        <InputText
                            label='Display Color'
                            required
                            id='ex_DisplayColor'
                            {...register('ex_DisplayColor')}
                            defaultValue={row.ex_DisplayColor}
                            error={errors.ex_DisplayColor?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Paper Type Description'
                            required
                            id='ex_PaperTypeDescription'
                            {...register('ex_PaperTypeDescription')}
                            defaultValue={row.ex_PaperTypeDescription}
                            error={errors.ex_PaperTypeDescription?.message}
                        />

                        <div className='mt-2 flex items-center gap-3'>
                            <Label htmlFor='ex_IsActiveFlag'>Active Status</Label>
                            <Controller
                                name='ex_IsActiveFlag'
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='checkbox'
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        id='ex_IsActiveFlag'
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting} className='order-2 w-fit'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'
                        className='order-1 w-fit'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Exam Paper
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
