'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterExam } from '@/hooks/exam/exammodule/usemasters';
import { masterExamSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterExam } from '@/server/exam/exam-module/masters/exam';
import type { IMasterExam } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterExamSchema.addOrUpdate>;

interface UpdateMasterExamFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterExam;
}

export default function UpdateMasterExamForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterExamFormProps) {
    const { refetchAll } = useMasterExam();

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterExamSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                ex_Id: row.ex_Id,
                ex_ExamName: row.ex_ExamName,
                ex_IVRSExamName: row.ex_IVRSExamName,
                ex_ExamDescription: row.ex_ExamDescription,
                ex_ExamCode: row.ex_ExamCode,
                ex_ExamOrder: row.ex_ExamOrder,
                ex_FinalExamFlag: row.ex_FinalExamFlag,
                ex_SubjectWiseMarksPublishFlag: row.ex_SubjectWiseMarksPublishFlag,
                ex_IsActiveFlag: row.ex_IsActiveFlag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                EX_Id: data.ex_Id,
                EX_ExamName: data.ex_ExamName,
                EX_IVRSExamName: data.ex_IVRSExamName,
                EX_ExamDescription: data.ex_ExamDescription,
                EX_ExamCode: data.ex_ExamCode,
                EX_ExamOrder: data.ex_ExamOrder,
                EX_FinalExamFlag: data.ex_FinalExamFlag,
                EX_SubjectWiseMarksPublishFlag: data.ex_SubjectWiseMarksPublishFlag,
                EX_ActiveFlag: data.ex_IsActiveFlag
            };

            const response = await addOrUpdateMasterExam(payload);

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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Exam Name'
                            required
                            id='ex_ExamName'
                            {...register('ex_ExamName')}
                            defaultValue={row.ex_ExamName}
                            error={errors.ex_ExamName?.message}
                        />
                        <InputText
                            label='IVRS Exam Name'
                            required
                            id='ex_IVRSExamName'
                            {...register('ex_IVRSExamName')}
                            defaultValue={row.ex_IVRSExamName}
                            error={errors.ex_IVRSExamName?.message}
                        />
                        <InputText
                            label='Exam Code'
                            required
                            id='ex_ExamCode'
                            {...register('ex_ExamCode')}
                            defaultValue={row.ex_ExamCode}
                            error={errors.ex_ExamCode?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Exam Description'
                            required
                            id='ex_ExamDescription'
                            {...register('ex_ExamDescription')}
                            defaultValue={row.ex_ExamDescription}
                            error={errors.ex_ExamDescription?.message}
                        />

                        <Controller
                            name='ex_ExamOrder'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Exam Order'
                                    required
                                    id='ex_ExamOrder'
                                    defaultValue={row.ex_ExamOrder}
                                    onChange={(value) => field.onChange(value)}
                                    minValue={0}
                                />
                            )}
                        />
                        {errors.ex_ExamOrder && <FormError>{errors.ex_ExamOrder.message}</FormError>}
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {[
                            { key: 'ex_FinalExamFlag', label: 'Final Exam' },
                            { key: 'ex_SubjectWiseMarksPublishFlag', label: 'Subject Wise Marks Publish' }
                        ].map((flag) => (
                            <div key={flag.key} className='group flex flex-col gap-1.5'>
                                <Label htmlFor={flag.key}>
                                    {flag.label} <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <RadioGroup
                                    defaultValue={String((row as any)[flag.key])}
                                    onValueChange={(value) => setValue(flag.key as any, Number(value))}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id={`${flag.key}_yes`} />
                                        <Label htmlFor={`${flag.key}_yes`}>Yes</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id={`${flag.key}_no`} />
                                        <Label htmlFor={`${flag.key}_no`}>No</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ))}
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
                            Save Exam
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
