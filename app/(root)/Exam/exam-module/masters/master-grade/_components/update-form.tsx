'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterGradeDetails } from '@/hooks/exam/exammodule/usemasters';
import { addOrUpdateMasterGrade } from '@/server/exam/exam-module/masters/grade';
import type { IGradeDetails, IMasterGrade } from '@/types/exam/exam-module/masters';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterGradeFormProps {
    GradeData: IMasterGrade;
    onSuccess?: () => void;
    className?: string;
}

interface FormFields {
    gradeName: string;
    type: 'percentage' | 'marks';
    gradeDetails: IGradeDetails[];
}

export default function UpdateMasterGradeForm({ GradeData, onSuccess, className = '' }: UpdateMasterGradeFormProps) {
    const { data: response, isLoading, error } = useMasterGradeDetails(30, GradeData.ex_Id);
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        defaultValues: {
            gradeName: '',
            type: 'percentage',
            gradeDetails: [{ ex_Id: 0, ex_From: 0, ex_To: 0, ex_Grade: '', ex_GradePoints: 0, ex_Remarks: '', ex_IsActiveFlag: true }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'gradeDetails' });

    // Watch gradeName and open details dynamically
    const gradeNameValue = watch('gradeName');
    useEffect(() => {
        setIsDetailsOpen(!!gradeNameValue?.trim());
    }, [gradeNameValue]);

    // Populate form with API data
    useEffect(() => {
        if (response?.data) {
            const gradeDetails = response.data.map((detail) => ({
                ex_Id: detail.ex_Id || 0,
                ex_From: Number(detail.ex_From),
                ex_To: Number(detail.ex_To),
                ex_Grade: detail.ex_Grade || '',
                ex_GradePoints: Number(detail.ex_GradePoints),
                ex_Remarks: detail.ex_Remarks || '',
                ex_IsActiveFlag: detail.ex_IsActiveFlag ?? true
            }));

            reset({
                gradeName: GradeData.ex_GradeName,
                type: 'percentage', // or use GradeData type if exists
                gradeDetails
            });
        }
    }, [response, GradeData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                gradeName: data.gradeName,
                type: data.type,
                gradeDetails: data.gradeDetails.map((row) => ({
                    ex_Id: row.ex_Id,
                    ex_From: row.ex_From,
                    ex_To: row.ex_To,
                    ex_Grade: row.ex_Grade,
                    ex_GradePoints: row.ex_GradePoints,
                    ex_Remarks: row.ex_Remarks,
                    ex_IsActiveFlag: row.ex_IsActiveFlag
                }))
            };

            const res = await addOrUpdateMasterGrade(payload);

            if (res.success) {
                toast.success(res.message);
                reset();
                setIsDetailsOpen(false);
                onSuccess?.();
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleReset = () => {
        reset();
        setIsDetailsOpen(false);
    };

    if (isLoading) return <div>Loading grade details...</div>;
    if (error) return <div className='text-red-500'>Error loading grade details</div>;

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Grade Name & Type */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InputText
                        label='Grade Name'
                        required
                        {...register('gradeName', { required: 'Grade Name is required' })}
                        error={errors.gradeName?.message}
                    />
                    <div className='flex flex-col gap-2'>
                        <Label>Type</Label>
                        <Controller
                            name='type'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='percentage' id='type-percentage' />
                                        <Label htmlFor='type-percentage'>Percentage</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='marks' id='type-marks' />
                                        <Label htmlFor='type-marks'>Marks</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.type && <FormError>{errors.type.message}</FormError>}
                    </div>
                </div>

                {/* Collapsible Grade Details */}
                {isDetailsOpen && (
                    <CollapsibleSection title='Grade Details' defaultOpen>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto border border-gray-200'>
                                <thead className='bg-gray-100'>
                                    <tr>
                                        <th className='border px-2 py-1'>Sl.No</th>
                                        <th className='border px-2 py-1'>From</th>
                                        <th className='border px-2 py-1'>To</th>
                                        <th className='border px-2 py-1'>Grade</th>
                                        <th className='border px-2 py-1'>Grade Points</th>
                                        <th className='border px-2 py-1'>Remarks</th>
                                        <th className='border px-2 py-1'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className='border px-2 py-1 text-center'>{index + 1}</td>

                                            <td className='border px-2 py-1'>
                                                <Controller
                                                    name={`gradeDetails.${index}.ex_From` as const}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <InputNumber {...field} value={field.value ?? 0} onChange={field.onChange} />
                                                    )}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <Controller
                                                    name={`gradeDetails.${index}.ex_To` as const}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <InputNumber {...field} value={field.value ?? 0} onChange={field.onChange} />
                                                    )}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText {...register(`gradeDetails.${index}.ex_Grade` as const)} />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <Controller
                                                    name={`gradeDetails.${index}.ex_GradePoints` as const}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <InputNumber {...field} value={field.value ?? 0} onChange={field.onChange} />
                                                    )}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText {...register(`gradeDetails.${index}.ex_Remarks` as const)} />
                                            </td>

                                            <td className='flex justify-center gap-2 border px-2 py-1'>
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    onClick={() =>
                                                        append({
                                                            ex_Id: 0,
                                                            ex_From: 0,
                                                            ex_To: 0,
                                                            ex_Grade: '',
                                                            ex_GradePoints: 0,
                                                            ex_Remarks: '',
                                                            ex_IsActiveFlag: true
                                                        })
                                                    }>
                                                    <Plus className='h-3 w-3' />
                                                </Button>
                                                {fields.length > 1 && (
                                                    <Button type='button' size='sm' variant='destructive' onClick={() => remove(index)}>
                                                        <Trash className='h-3 w-3' />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                            <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting}>
                                Reset
                            </Button>
                            <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                                <div className='flex items-center'>
                                    <Save className='mr-2 h-4 w-4' /> Update Grade
                                </div>
                            </Button>
                        </div>
                    </CollapsibleSection>
                )}

                {errors.root && <FormError>{errors.root.message}</FormError>}
            </form>
        </div>
    );
}
