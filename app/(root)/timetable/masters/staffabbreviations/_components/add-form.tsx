'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterBuilding } from '@/hooks/timetable/useMasters';
import { staffabbreviationsSchema } from '@/schemas/timetable/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof staffabbreviationsSchema.addOrUpdate>;

interface AddMasterDayProps {
    onSuccess?: () => void;
    buildingname?: string;
}

export default function AddStaffAbbreviationForm({ onSuccess, buildingname = '' }: AddMasterDayProps) {
    const { refetchAll } = useMasterBuilding();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(staffabbreviationsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        // try {
        //     const { ttmB_BuildingName } = data;
        //     const payload = {
        //         ttmD_Id: 0,
        //         mi_id: 30,
        //         ttmB_BuildingName: ttmB_BuildingName,
        //     };
        //     console.log(payload);
        //     const response = await addOrUpdateMasterDay(payload);
        //     if (response.success) {
        //         toast.success(response.message);
        //         reset();
        //         refetchAll();
        //         onSuccess?.();
        //     } else {
        //         toast.error(response.message);
        //     }
        // } catch (error: any) {
        //     toast.error(error.message);
        // }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${buildingname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='space-y-4'>
                        {/* Row 1 */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='w-full'>
                                <InputText
                                    label='Staff Name'
                                    required
                                    id='HRME_Id'
                                    {...register('HRME_Id')}
                                    error={errors.HRME_Id?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                            <div className='w-full'>
                                <InputText
                                    label='Staff Abbreviation'
                                    required
                                    id='TTMSAB_Abbreviation'
                                    {...register('TTMSAB_Abbreviation')}
                                    error={errors.TTMSAB_Abbreviation?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='w-full'>
                                <InputText
                                    label='Max. Day Deputation'
                                    id='TTMSAB_PerDayMaxDeputation'
                                    {...register('TTMSAB_PerDayMaxDeputation')}
                                    error={errors.TTMSAB_PerDayMaxDeputation?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                            <div className='w-full'>
                                <InputText
                                    label='Max. Weekly Deputation'
                                    id='TTMSAB_PerWeekMaxDeputation'
                                    {...register('TTMSAB_PerWeekMaxDeputation')}
                                    error={errors.TTMSAB_PerWeekMaxDeputation?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='w-full'>
                                <InputText
                                    label='Max. Monthly Deputation'
                                    id='TTMSAB_PerMonthMaxDeputation'
                                    {...register('TTMSAB_PerMonthMaxDeputation')}
                                    error={errors.TTMSAB_PerMonthMaxDeputation?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                            <div className='w-full'>
                                <InputText
                                    label='Max. Yearly Deputation'
                                    required
                                    id='TTMSAB_PerYearMaxDeputation'
                                    {...register('TTMSAB_PerYearMaxDeputation')}
                                    error={errors.TTMSAB_PerYearMaxDeputation?.message}
                                    className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        </div>

                        {/* Add more rows as needed following the same pattern */}

                        {errors.root && <FormError className='text-center'>{errors.root.message}</FormError>}
                    </div>
                </div>

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
                            Save Master Day
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
