'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubject } from '@/server/exam/exam-module/masters/subject';
import type { IMasterSubject } from '@/types/exam/exam-module/masters';
// import { useMasterSubject } from '@/hooks/exam/useMasters';
// import { masterSubjectSchema } from '@/schemas/exam/masters';
// import { addOrUpdateMasterSubject } from '@/server/exam/masters/subject';
// import type { IMasterSubject } from '@/types/exam/master-subject';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubjectSchema.addOrUpdate>;

interface UpdateMasterSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterSubject;
}

export default function UpdateMasterSubjectForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterSubjectFormProps) {
    const { refetchAll } = useMasterSubject();

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                exsuB_Id: row.exsuB_Id,
                exsuB_SubjectName: row.exsuB_SubjectName,
                exsuB_IVRSName: row.exsuB_IVRSName,
                exsuB_SubjectCode: row.exsuB_SubjectCode,
                exsuB_SubjectType: row.exsuB_SubjectType,
                exsuB_MaxMarks: row.exsuB_MaxMarks,
                exsuB_MinMarks: row.exsuB_MinMarks,
                exsuB_PreAdmissionFlag: row.exsuB_PreAdmissionFlag,
                exsuB_AttendanceFlag: row.exsuB_AttendanceFlag,
                exsuB_BatchWiseFlag: row.exsuB_BatchWiseFlag,
                exsuB_ExamFlag: row.exsuB_ExamFlag,
                exsuB_LanguageFlag: row.exsuB_LanguageFlag,
                exsuB_ExtraFeeFlag: row.exsuB_ExtraFeeFlag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                EXSUB_Id: data.exsuB_Id,
                EXSUB_SubjectName: data.exsuB_SubjectName,
                EXSUB_IVRSName: data.exsuB_IVRSName,
                EXSUB_SubjectCode: data.exsuB_SubjectCode,
                EXSUB_SubjectType: data.exsuB_SubjectType,
                EXSUB_MaxMarks: data.exsuB_MaxMarks,
                EXSUB_MinMarks: data.exsuB_MinMarks,
                EXSUB_PreAdmissionFlag: data.exsuB_PreAdmissionFlag,
                EXSUB_AttendanceFlag: data.exsuB_AttendanceFlag,
                EXSUB_BatchWiseFlag: data.exsuB_BatchWiseFlag,
                EXSUB_ExamFlag: data.exsuB_ExamFlag,
                EXSUB_LanguageFlag: data.exsuB_LanguageFlag,
                EXSUB_ExtraFeeFlag: data.exsuB_ExtraFeeFlag,
                EXSUB_ActiveFlag: true
            };

            const response = await addOrUpdateMasterSubject(payload);

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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Subject Name'
                            required
                            id='exsuB_SubjectName'
                            {...register('exsuB_SubjectName')}
                            defaultValue={row.exsuB_SubjectName}
                            error={errors.exsuB_SubjectName?.message}
                        />
                        <InputText
                            label='IVRS Name'
                            required
                            id='exsuB_IVRSName'
                            {...register('exsuB_IVRSName')}
                            defaultValue={row.exsuB_IVRSName}
                            error={errors.exsuB_IVRSName?.message}
                        />
                        <InputText
                            label='Subject Code'
                            required
                            id='exsuB_SubjectCode'
                            {...register('exsuB_SubjectCode')}
                            defaultValue={row.exsuB_SubjectCode}
                            error={errors.exsuB_SubjectCode?.message}
                        />
                        <InputText
                            label='Subject Type'
                            required
                            id='exsuB_SubjectType'
                            {...register('exsuB_SubjectType')}
                            defaultValue={row.exsuB_SubjectType}
                            error={errors.exsuB_SubjectType?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Controller
                            name='exsuB_MaxMarks'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Max Marks'
                                    required
                                    id='exsuB_MaxMarks'
                                    defaultValue={row.exsuB_MaxMarks}
                                    onChange={(value) => field.onChange(value)}
                                    minValue={0}
                                />
                            )}
                        />
                        {errors.exsuB_MaxMarks && <FormError>{errors.exsuB_MaxMarks.message}</FormError>}

                        <Controller
                            name='exsuB_MinMarks'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Min Marks'
                                    required
                                    id='exsuB_MinMarks'
                                    defaultValue={row.exsuB_MinMarks}
                                    onChange={(value) => field.onChange(value)}
                                    minValue={0}
                                />
                            )}
                        />
                        {errors.exsuB_MinMarks && <FormError>{errors.exsuB_MinMarks.message}</FormError>}
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {[
                            { key: 'exsuB_PreAdmissionFlag', label: 'Pre-Admission' },
                            { key: 'exsuB_AttendanceFlag', label: 'Attendance' },
                            { key: 'exsuB_BatchWiseFlag', label: 'Batch Wise' },
                            { key: 'exsuB_ExamFlag', label: 'Exam' },
                            { key: 'exsuB_LanguageFlag', label: 'Language' },
                            { key: 'exsuB_ExtraFeeFlag', label: 'Extra Fee' }
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
                            Save Subject
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
