'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterGroup } from '@/hooks/fees/useMasters';
import { type masterGroupSchema, masterModeOfPaymentSchema } from '@/schemas/fees/masters';
import { addOrUpdateModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import type { IMasterGroupList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterGroupSchema.addOrUpdate>;

interface UpdateMasterGroupFormProps {
    onSuccess?: () => void;
    ivrmmoD_ModeOfPayment?: string;
    selectedRow: IMasterGroupList;
}

export default function UpdateMasterGroupForm({ onSuccess, ivrmmoD_ModeOfPayment = '', selectedRow: row }: UpdateMasterGroupFormProps) {
    const { refetchAll } = useMasterGroup();

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterModeOfPaymentSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                ivrmmoD_Id: row.ivrmmoD_Id,
                ivrmmoD_MasterGroup: row.ivrmmoD_MasterGroup,
                ivrmmoD_MasterGroup_Code: row.ivrmmoD_MasterGroup_Code
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { ivrmmoD_MasterGroup, ivrmmoD_MasterGroup_Code, ivrmmoD_Id, transportHostelType, studentType, ivrmmoD_Compulsory } =
                data;
            const payload = {
                mi_id: 30,
                ivrmmoD_MasterGroup: ivrmmoD_MasterGroup,
                ivrmmoD_MasterGroup_Code: ivrmmoD_MasterGroup_Code,
                IVRMMOD_Id: ivrmmoD_Id,
                IVRMMOD_Transport: transportHostelType === 'transport',
                IVRMMOD_Hostel: transportHostelType === 'hostel',
                IVRMMOD_Regular: studentType === 'regular',
                IVRMMOD_NewStudent: studentType === 'newstudent',
                IVRMMOD_Compulsory: ivrmmoD_Compulsory
            };
            const response = await addOrUpdateModeOfPayment(payload);

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
        <div className={`${ivrmmoD_ModeOfPayment}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                    <InputText
                        label='Fee Group'
                        required
                        id='ivrmmoD_MasterGroup'
                        {...register('ivrmmoD_MasterGroup')}
                        error={errors.ivrmmoD_MasterGroup?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />
                    <div className='group flex flex-col gap-1.5'>
                        <InputText
                            label='Remarks'
                            required
                            id='ivrmmoD_MasterGroup_Code'
                            {...register('ivrmmoD_MasterGroup_Code')}
                            error={errors.ivrmmoD_MasterGroup_Code?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        {errors.ivrmmoD_MasterGroup_Code && <FormError>{errors.ivrmmoD_MasterGroup_Code.message}</FormError>}
                    </div>
                    <div className='flex flex-row items-center justify-center space-x-4'>
                        <Controller
                            name='transportHostelType'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-4'>
                                    <div className='flex items-center justify-center gap-1'>
                                        <RadioGroupItem value='transport' id='transport' />
                                        <Label htmlFor='transport' className='cursor-pointer text-gray-600 text-sm'>
                                            Transport
                                        </Label>
                                    </div>

                                    <div className='flex items-center justify-center gap-1'>
                                        <RadioGroupItem value='hostel' id='hostel' />
                                        <Label htmlFor='hostel' className='cursor-pointer text-gray-600 text-sm'>
                                            Hostel
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />

                        <div className='flex items-center gap-1'>
                            <Controller
                                name='ivrmmoD_Compulsory'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Checkbox id='compulsory' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='compulsory' className='cursor-pointer text-gray-600 text-sm'>
                                            Compulsory
                                        </Label>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row items-center justify-center space-x-4'>
                        <Controller
                            name='studentType'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-4'>
                                    <div className='flex items-center justify-center gap-1'>
                                        <RadioGroupItem value='regular' id='regular' />
                                        <Label htmlFor='regular' className='cursor-pointer text-gray-600 text-sm'>
                                            Regular
                                        </Label>
                                    </div>

                                    <div className='flex items-center justify-center gap-1'>
                                        <RadioGroupItem value='newstudent' id='newstudent' />
                                        <Label htmlFor='newstudent' className='cursor-pointer text-gray-600 text-sm'>
                                            New Student
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Mode Of
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
