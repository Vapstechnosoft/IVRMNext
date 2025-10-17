'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addOrUpdateMasterGrade, getGradeDetailsById } from '@/server/exam/exam-module/masters/grade';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterGradeFormProps {
    gradeData: IMasterGrade;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterGradeForm({ gradeData, onSuccess, className = '' }: UpdateMasterGradeFormProps) {
    const [isLoading, setIsLoading] = useState(true); // ✅ loading state for API fetch

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors, isSubmitting }
    } = useForm<IMasterGrade>({
        defaultValues: {
            ...gradeData,
            sub_list: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'sub_list'
    });

    // ✅ Fetch sub_list on mount
    useEffect(() => {
        async function fetchSubList() {
            if (!gradeData?.emgR_Id) return;
            setIsLoading(true);
            try {
                const response = await getGradeDetailsById(gradeData.emgR_Id);
                if (response.success && Array.isArray(response.data)) {
                    setValue('sub_list', response.data);
                } else {
                    toast.error('Failed to fetch grade details');
                }
            } catch (error: any) {
                toast.error(error.message || 'Error fetching grade details');
            } finally {
                setIsLoading(false);
            }
        }
        fetchSubList();
    }, [gradeData?.emgR_Id, setValue]);

    useEffect(() => {
        if (gradeData) {
            reset({ ...gradeData, sub_list: [] });
        }
    }, [gradeData, reset]);

    const onSubmit: SubmitHandler<IMasterGrade> = async (data) => {
        try {
            const payload = {
                ...data,
                grade_list: data.sub_list.map(({ emgD_Id, ...row }) => ({
                    ...row,
                    emgD_From: Number(row.emgD_From),
                    emgD_To: Number(row.emgD_To),
                    emgD_GradePoints: Number(row.emgD_GradePoints)
                }))
            };

            const response = await addOrUpdateMasterGrade(payload);

            if (response.success) {
                toast.success(response.message);
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        }
    };

    if (isLoading) return <div>Loading grade details...</div>; // ✅ show loader while fetching

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Grade Name + Type */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Grade Name' required {...register('emgR_GradeName')} error={errors.emgR_GradeName?.message} />
                <div>
                    <Label>
                        Marks/Percentage <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='emgR_MarksPerFlag'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='m' id='marks' />
                                    <Label htmlFor='marks'>Marks</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='p' id='percentage' />
                                    <Label htmlFor='percentage'>Percentage</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {errors.emgR_MarksPerFlag && <FormError>{errors.emgR_MarksPerFlag.message}</FormError>}
                </div>
            </div>

            {/* Grade Details */}
            <CollapsibleSection title='Grade Details' defaultOpen>
                <div className='overflow-x-auto'>
                    <table className='w-full border border-gray-200'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='border px-2 py-1'>Sl.No</th>
                                <th className='border px-2 py-1'>Grade Name</th>
                                <th className='border px-2 py-1'>From</th>
                                <th className='border px-2 py-1'>To</th>
                                <th className='border px-2 py-1'>Grade Points</th>
                                <th className='border px-2 py-1'>Remarks</th>
                                <th className='border px-2 py-1'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className='border text-center'>{index + 1}</td>
                                    <td className='border'>
                                        <InputText
                                            {...register(`sub_list.${index}.emgD_Name` as const)}
                                            error={errors.sub_list?.[index]?.emgD_Name?.message}
                                        />
                                    </td>
                                    <td className='border'>
                                        <InputText
                                            {...register(`sub_list.${index}.emgD_From` as const, { valueAsNumber: true })}
                                            error={errors.sub_list?.[index]?.emgD_From?.message}
                                        />
                                    </td>
                                    <td className='border'>
                                        <InputText
                                            {...register(`sub_list.${index}.emgD_To` as const, { valueAsNumber: true })}
                                            error={errors.sub_list?.[index]?.emgD_To?.message}
                                        />
                                    </td>
                                    <td className='border'>
                                        <InputText
                                            {...register(`sub_list.${index}.emgD_GradePoints` as const, { valueAsNumber: true })}
                                            error={errors.sub_list?.[index]?.emgD_GradePoints?.message}
                                        />
                                    </td>
                                    <td className='border'>
                                        <InputText
                                            {...register(`sub_list.${index}.emgD_Remarks` as const)}
                                            error={errors.sub_list?.[index]?.emgD_Remarks?.message}
                                        />
                                    </td>
                                    <td className='flex justify-center gap-2 border px-2 py-1'>
                                        <Button
                                            type='button'
                                            size='sm'
                                            onClick={() => {
                                                const currentRow = getValues(`sub_list.${index}`);

                                                // Check if all required fields are filled
                                                const allFilled =
                                                    currentRow.emgD_Name?.toString().trim() !== '' &&
                                                    currentRow.emgD_From?.toString().trim() !== '' &&
                                                    currentRow.emgD_To?.toString().trim() !== '' &&
                                                    currentRow.emgD_GradePoints?.toString().trim() !== '';

                                                if (!allFilled) {
                                                    toast.error('Please fill all fields before adding a new row');
                                                    return;
                                                }

                                                append({
                                                    emgD_Name: '',
                                                    emgD_From: '',
                                                    emgD_To: '',
                                                    emgD_GradePoints: '',
                                                    emgD_Remarks: ''
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

                <div className='flex gap-3 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={() => reset(gradeData)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Update
                    </Button>
                </div>
            </CollapsibleSection>
        </form>
    );
}
