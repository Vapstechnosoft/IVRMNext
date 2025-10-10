'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { masterGradeSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterGrade } from '@/server/exam/exam-module/masters/grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterGradeSchema>;

interface MasterGradeFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function MasterGradeForm({ onSuccess, className = '' }: MasterGradeFormProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterGradeSchema),
        mode: 'onChange',
        defaultValues: {
            ex_GradeName: '',
            ex_GradeDetails: 'percentage',
            gradeDetails: [{ ex_From: '', ex_To: '', ex_Grade: '', ex_GradePoints: '', ex_Remarks: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'gradeDetails'
    });

    const gradeNameValue = watch('ex_GradeName');
    const gradeDetailsValue = watch('gradeDetails');

    useEffect(() => {
        setIsDetailsOpen(!!gradeNameValue?.trim());
    }, [gradeNameValue]);

    // ✅ Check if last row is fully filled
    const canAddNewRow = () => {
        const lastRow = gradeDetailsValue[gradeDetailsValue.length - 1];
        return lastRow.ex_From && lastRow.ex_To && lastRow.ex_Grade && lastRow.ex_GradePoints;
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                gradeDetails: data.gradeDetails.map((row) => ({
                    ...row,
                    ex_From: Number(row.ex_From),
                    ex_To: Number(row.ex_To),
                    ex_GradePoints: Number(row.ex_GradePoints)
                }))
            };

            const response = await addOrUpdateMasterGrade(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                setIsDetailsOpen(false);
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Grade Name & Type */}
                <div className='grid grid-cols-1 items-center justify-center gap-4 md:grid-cols-2'>
                    <InputText label='Grade Name' required {...register('ex_GradeName')} error={errors.ex_GradeName?.message} />
                    <div className='flex flex-col gap-2'>
                        <Label>
                            Type <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ex_GradeDetails'
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
                        {errors.ex_GradeDetails && <FormError>{errors.ex_GradeDetails.message}</FormError>}
                    </div>
                </div>

                {/* Grade Details */}
                {isDetailsOpen && (
                    <CollapsibleSection title='Master Grade Details' defaultOpen>
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
                                                <InputText
                                                    {...register(`gradeDetails.${index}.ex_From` as const)}
                                                    error={errors.gradeDetails?.[index]?.ex_From?.message}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText
                                                    {...register(`gradeDetails.${index}.ex_To` as const)}
                                                    error={errors.gradeDetails?.[index]?.ex_To?.message}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText
                                                    {...register(`gradeDetails.${index}.ex_Grade` as const)}
                                                    error={errors.gradeDetails?.[index]?.ex_Grade?.message}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText
                                                    {...register(`gradeDetails.${index}.ex_GradePoints` as const)}
                                                    error={errors.gradeDetails?.[index]?.ex_GradePoints?.message}
                                                />
                                            </td>

                                            <td className='border px-2 py-1'>
                                                <InputText
                                                    {...register(`gradeDetails.${index}.ex_Remarks` as const)}
                                                    error={errors.gradeDetails?.[index]?.ex_Remarks?.message}
                                                />
                                            </td>

                                            <td className='flex justify-center gap-2 border px-2 py-1'>
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    onClick={() => {
                                                        if (!canAddNewRow()) {
                                                            toast.error('Fill all fields in current row before adding new');
                                                            return;
                                                        }
                                                        append({
                                                            ex_From: '',
                                                            ex_To: '',
                                                            ex_Grade: '',
                                                            ex_GradePoints: '',
                                                            ex_Remarks: ''
                                                        });
                                                    }}>
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
                            <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                                <div className='flex items-center'>
                                    <Save className='mr-2 h-4 w-4' /> Save Grade
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
