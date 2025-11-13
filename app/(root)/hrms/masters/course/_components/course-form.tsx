import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterCourse } from '@/hooks/hrms/useMasters';
import { COURSE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { CourseDetail, MasterCourseInput } from '@/types/hrms/master-course';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CourseFormProps {
    selectedRow?: CourseDetail;
    onSuccess?: () => void;
}

export default function CourseForm({ selectedRow, onSuccess }: CourseFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterCourse(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty }
    } = useForm<MasterCourseInput>({
        defaultValues: {
            MI_Id: roleId,
            HRMC_QulaificationName: '',
            HRMC_QualificationDesc: '',
            HRMC_Order: 0,
            HRMC_ActiveFlag: true,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMC_Id: selectedRow.HRMC_Id,
                MI_Id: selectedRow.MI_Id,
                HRMC_QulaificationName: selectedRow.HRMC_QulaificationName,
                HRMC_QualificationDesc: selectedRow.HRMC_QualificationDesc,
                HRMC_Order: selectedRow.HRMC_Order,
                HRMC_ActiveFlag: selectedRow.HRMC_ActiveFlag,
                HRMC_DefaultQualFag: selectedRow.HRMC_DefaultQualFag,
                HRMC_SpecialisationFlag: selectedRow.HRMC_SpecialisationFlag
            });
        } else {
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterCourseInput) => {
        if (isEditMode && !data.HRMC_Id) {
        }

        try {
            const res = await saveMutation.mutateAsync(data);

            if (res?.success) {
                const successMsg = res?.message || (isEditMode ? 'Course updated successfully' : 'Course added successfully');
                toast.success(successMsg);

                // Reset form if in add mode
                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                // Call success callback (closes the form)
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update course' : 'Failed to add course');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 Error object:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error data:', error?.response?.data);

            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                (isEditMode ? 'Failed to update course' : 'Failed to add course');
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden fields for IDs */}
            {isEditMode && <input type='hidden' {...register('HRMC_Id', { valueAsNumber: true })} />}
            <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMC_QulaificationName'>
                    Qualification Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMC_QulaificationName'
                    placeholder='Enter qualification name'
                    {...register('HRMC_QulaificationName', COURSE_VALIDATION.courseName)}
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
                    {...register('HRMC_QualificationDesc', COURSE_VALIDATION.courseDescription)}
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
            <div className='col-span-full flex gap-2'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                {isEditMode && !isDirty && <span className='mt-2 flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
