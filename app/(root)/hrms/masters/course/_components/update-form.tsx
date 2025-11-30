'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterCourse } from '@/hooks/hrms/useMasters';
import { COURSE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { CourseDetail, MasterCourseInput } from '@/types/hrms/master-course';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateCourseFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: CourseDetail;
}
export default function UpdateCourseForm({ onSuccess, className = '', selectedRow: row }: UpdateCourseFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterCourse(roleId);
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterCourseInput>({
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                HRMC_Id: row.HRMC_Id,
                MI_Id: row.MI_Id,
                HRMC_QulaificationName: row.HRMC_QulaificationName,
                HRMC_QualificationDesc: row.HRMC_QualificationDesc,
                HRMC_Order: row.HRMC_Order,
                HRMC_ActiveFlag: row.HRMC_ActiveFlag,
                HRMC_DefaultQualFag: row.HRMC_DefaultQualFag,
                HRMC_SpecialisationFlag: row.HRMC_SpecialisationFlag
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterCourseInput) => {
        const sanitizedData: MasterCourseInput = {
            ...data,
            HRMC_QulaificationName: data.HRMC_QulaificationName?.trim() || '',
            HRMC_QualificationDesc: data.HRMC_QualificationDesc?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Course updated successfully');
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to update course');
            }
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                'Failed to update course';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <input type='hidden' {...register('HRMC_Id', { valueAsNumber: true })} />
                    <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMC_QulaificationName'>
                            Qualification Name <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            id='HRMC_QulaificationName'
                            placeholder='Enter qualification name'
                            maxLength={COURSE_VALIDATION.HRMC_QualificationName.maxLength?.value}
                            aria-invalid={errors.HRMC_QulaificationName ? true : undefined}
                            data-error={errors.HRMC_QulaificationName ? 'true' : undefined}
                            defaultValue={row.HRMC_QulaificationName}
                            {...register('HRMC_QulaificationName', COURSE_VALIDATION.HRMC_QualificationName)}
                        />
                        {errors.HRMC_QulaificationName && <FormError>{errors.HRMC_QulaificationName.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMC_QualificationDesc'>
                            Description <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            id='HRMC_QualificationDesc'
                            placeholder='Enter description'
                            maxLength={COURSE_VALIDATION.HRMC_QualificationDescription.maxLength?.value}
                            aria-invalid={errors.HRMC_QualificationDesc ? true : undefined}
                            data-error={errors.HRMC_QualificationDesc ? 'true' : undefined}
                            defaultValue={row.HRMC_QualificationDesc}
                            {...register('HRMC_QualificationDesc', COURSE_VALIDATION.HRMC_QualificationDescription)}
                        />
                        {errors.HRMC_QualificationDesc && <FormError>{errors.HRMC_QualificationDesc.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMC_Order'>Order</Label>
                        <Input id='HRMC_Order' type='number' placeholder='Enter order' {...register('HRMC_Order', { valueAsNumber: true })} />
                    </div>
                    <div className='flex items-center gap-4 pt-7'>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='HRMC_DefaultQualFag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='default-qualification-checkbox' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='default-qualification-checkbox'>Default Qualification</Label>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='HRMC_SpecialisationFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='has-specialization-checkbox' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='has-specialization-checkbox'>Has Specialization</Label>
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Course
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
