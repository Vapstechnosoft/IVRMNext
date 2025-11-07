'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePreAdmissionAcademicYear } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { PreAdmissionAcademicYearSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdatePreAdmissionYear } from '@/server/admission/preadmission/configuration/academic_year_master';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof PreAdmissionAcademicYearSchema.addOrUpdate>;

interface AddMasterAcademicYearFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterAcademicYearForm({ onSuccess, className = '' }: AddMasterAcademicYearFormProps) {
    const { refetchAll } = usePreAdmissionAcademicYear();

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PreAdmissionAcademicYearSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_ActiveFlag: 0,
            asmaY_Pre_ActiveFlag: false,
            asmaY_ReggularFlg: false,
            asmaY_NewFlg: false,
            asmaY_NewAdmissionFlg: false,
            asmaY_Order: 0
        }
    });

    // Watch From/To Year to auto-fill asmaY_Year
    const academicFromYear = useWatch({ control, name: 'academicFromYear' });
    const academicToYear = useWatch({ control, name: 'academicToYear' });

    // Auto-generate asmaY_Year like "2024-2025"
    useEffect(() => {
        if (academicFromYear && academicToYear) {
            setValue('asmaY_Year', `${academicFromYear}-${academicToYear}`, {
                shouldValidate: true
            });
        } else {
            setValue('asmaY_Year', '');
        }
    }, [academicFromYear, academicToYear, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ASMAY_Id: 0,
                ASMAY_Year: data.asmaY_Year,
                ASMAY_From_Date: data.asmaY_From_Date,
                ASMAY_To_Date: data.asmaY_To_Date,
                ASMAY_PreAdm_F_Date: data.asmaY_PreAdm_F_Date,
                ASMAY_PreAdm_T_Date: data.asmaY_PreAdm_T_Date,
                ASMAY_Order: Number(data.asmaY_Order),
                ASMAY_ActiveFlag: 1,
                ASMAY_Cut_Of_Date: data.asmaY_Cut_Of_Date,
                ASMAY_Pre_ActiveFlag: data.asmaY_Pre_ActiveFlag === true ? 1 : 0,
                ASMAY_ReggularFlg: Boolean(data.asmaY_ReggularFlg),
                ASMAY_NewFlg: Boolean(data.asmaY_NewFlg),
                ASMAY_NewAdmissionFlg: Boolean(data.asmaY_NewAdmissionFlg),
                ASMAY_TransportSDate: data.asmaY_TransportSDate,
                ASMAY_TransportEDate: data.asmaY_TransportEDate,
                ASMAY_ReferenceDate: data.asmaY_ReferenceDate,
                ASMAY_AcademicYearCode: data.asmaY_AcademicYearCode,
                ASMAY_AdvanceFeeDate: data.asmaY_AdvanceFeeDate,
                ASMAY_RegularFeeFDate: data.asmaY_RegularFeeFDate,
                ASMAY_RegularFeeTDate: data.asmaY_RegularFeeTDate,
                ASMAY_ArrearFeeDate: data.asmaY_ArrearFeeDate
            };

            const response = await addOrUpdatePreAdmissionYear(payload);

            if (response.success) {
                toast.success(response.message || 'Academic year saved successfully!');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save academic year.');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred.');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-6'>
                    {/* Academic Year (Main + Split) */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                            <InputText
                                label='Academic From Year'
                                required
                                id='academicFromYear'
                                placeholder='e.g., 2024'
                                {...register('academicFromYear')}
                                error={errors.academicFromYear?.message}
                            />

                            <InputText
                                label='Academic To Year'
                                required
                                id='academicToYear'
                                placeholder='e.g., 2025'
                                {...register('academicToYear')}
                                error={errors.academicToYear?.message}
                            />

                            <InputText
                                label='Academic Year Code'
                                required
                                id='asmaY_AcademicYearCode'
                                placeholder='e.g., AY2024'
                                {...register('asmaY_AcademicYearCode')}
                                error={errors.asmaY_AcademicYearCode?.message}
                            />
                            <InputText
                                label='Academic Year Order'
                                required
                                type='number'
                                id='asmaY_Order'
                                placeholder='1'
                                {...register('asmaY_Order', { valueAsNumber: true })}
                                error={errors.asmaY_Order?.message}
                            />
                        </div>
                    </div>

                    {/* Academic Year Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_From_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            {' '}
                                            Start Date<span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_From_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                    required
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_From_Date && <p className='text-red-500 text-sm'>{errors.asmaY_From_Date.message}</p>}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_To_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            End Date<span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_To_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_To_Date && <p className='text-red-500 text-sm'>{errors.asmaY_To_Date.message}</p>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Pre-Admission Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_PreAdm_F_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission Start Date
                                            <span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_PreAdm_F_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_PreAdm_F_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_PreAdm_F_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_PreAdm_T_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission End Date
                                            <span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_PreAdm_T_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_PreAdm_T_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_PreAdm_T_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Transport Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_Cut_Of_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission Age Cut off Date
                                            <span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_Cut_Of_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_Cut_Of_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_Cut_Of_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_ReferenceDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Reference Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_ReferenceDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_ReferenceDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_ReferenceDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Fee Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_TransportSDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_TransportSDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_TransportSDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_TransportSDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_TransportEDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_TransportEDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_TransportEDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_TransportEDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_RegularFeeFDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_RegularFeeFDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_RegularFeeFDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_RegularFeeFDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_RegularFeeTDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_RegularFeeTDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_RegularFeeTDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_RegularFeeTDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Other Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_AdvanceFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Advance Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_AdvanceFeeDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_AdvanceFeeDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_AdvanceFeeDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_ArrearFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Arrear Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_ArrearFeeDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_ArrearFeeDate && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_ArrearFeeDate.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Boolean Flags */}
                    <div className='space-y-4'>
                        <h3 className='font-medium text-lg'>Flags</h3>
                        <div className='flex justify-start gap-4'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_NewAdmissionFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_NewAdmissionFlg' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_NewAdmissionFlg' className='cursor-pointer'>
                                    New Admission Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_ReggularFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_ReggularFlg' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_ReggularFlg' className='cursor-pointer'>
                                    Regular Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_NewFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_NewFlg' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_NewFlg' className='cursor-pointer'>
                                    New Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_Pre_ActiveFlag'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_Pre_ActiveFlag' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_Pre_ActiveFlag' className='cursor-pointer'>
                                    Preadmission Flag
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
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
                        <Save className='mr-2 h-4 w-4' />
                        Save Academic Year
                    </Button>
                </div>
            </form>
        </div>
    );
}
