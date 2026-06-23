'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePreAdmissionAcademicYear } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { PreAdmissionAcademicYearSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdatePreAdmissionYear } from '@/server/admission/preadmission/configuration/academic_year_master';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof PreAdmissionAcademicYearSchema.addOrUpdate>;

interface AddMasterAcademicYearFormProps {
    onSuccess?: () => void;
    className?: string;
    institutionList?: { mI_Id: number; mI_Name: string }[];
}

export default function AddMasterAcademicYearForm({ onSuccess, className = '', institutionList = [] }: AddMasterAcademicYearFormProps) {
    const { refetchAll } = usePreAdmissionAcademicYear();
    const [openPopover, setOpenPopover] = useState<string | null>(null);

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
            mI_Id: 0,
            asmaY_ActiveFlag: 0,
            asmaY_Pre_ActiveFlag: false,
            asmaY_ReggularFlg: false,
            asmaY_NewFlg: false,
            asmaY_NewAdmissionFlg: false,
            asmaY_Order: 0,
            asmaY_PreAdm_F_Time: '',
            asmaY_PreAdm_T_Time: ''
        }
    });

    // Watch From/To Year to auto-fill asmaY_Year
    const academicFromYear = useWatch({ control, name: 'academicFromYear' });
    const academicToYear = useWatch({ control, name: 'academicToYear' });

    // Auto-increment logic: when From Year changes, set To Year to From Year + 1 if From Year is a valid number
    useEffect(() => {
        if (academicFromYear && academicFromYear.length === 4 && !Number.isNaN(Number(academicFromYear))) {
            const fromYearNum = Number(academicFromYear);
            const toYearNum = Number(academicToYear);
            // Only auto-set if To Year is empty or not matching From+1
            if (!academicToYear || toYearNum !== fromYearNum + 1) {
                setValue('academicToYear', String(fromYearNum + 1), {
                    shouldValidate: true
                });
            }
        }
    }, [academicFromYear, academicToYear, setValue]);

    // Watch all "From" dates to restrict "To" dates
    const academicFromDate = useWatch({ control, name: 'asmaY_From_Date' });
    const preAdmFromDate = useWatch({ control, name: 'asmaY_PreAdm_F_Date' });
    const transportFromDate = useWatch({ control, name: 'asmaY_TransportSDate' });
    const regularFeeFromDate = useWatch({
        control,
        name: 'asmaY_RegularFeeFDate'
    });

    // Auto-generate asmaY_Year like "2024-2025" and populate dates
    useEffect(() => {
        if (
            academicFromYear &&
            academicFromYear.length === 4 &&
            !Number.isNaN(Number(academicFromYear)) &&
            academicToYear &&
            academicToYear.length === 4 &&
            !Number.isNaN(Number(academicToYear))
        ) {
            const fromYear = Number(academicFromYear);
            const toYear = Number(academicToYear);

            setValue('asmaY_Year', `${academicFromYear}-${academicToYear}`, {
                shouldValidate: true
            });

            // Populate Start Date (June 1st of From Year)
            const startDate = new Date(fromYear, 5, 1); // June is index 5
            setValue('asmaY_From_Date', startDate.toISOString(), { shouldValidate: true });

            // Populate End Date (May 31st of To Year)
            const endDate = new Date(toYear, 4, 31); // May is index 4
            setValue('asmaY_To_Date', endDate.toISOString(), { shouldValidate: true });

            // Populate Pre Admission Start Date (January 1st of From Year)
            const preAdmStartDate = new Date(fromYear, 0, 1); // January is index 0
            setValue('asmaY_PreAdm_F_Date', preAdmStartDate.toISOString(), { shouldValidate: true });

            // Populate Pre Admission End Date (May 31st of To Year)
            setValue('asmaY_PreAdm_T_Date', endDate.toISOString(), { shouldValidate: true });

            // Populate Cut-off Date (June 1st of From Year)
            setValue('asmaY_Cut_Of_Date', startDate.toISOString(), { shouldValidate: true });
        } else {
            setValue('asmaY_Year', '');
        }
    }, [academicFromYear, academicToYear, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ASMAY_Id: 0,
                MI_Id: Number(data.mI_Id),
                ASMAY_Year: data.asmaY_Year,
                ASMAY_From_Date: data.asmaY_From_Date,
                ASMAY_To_Date: data.asmaY_To_Date,
                ASMAY_PreAdm_F_Date: data.asmaY_PreAdm_F_Date,
                ASMAY_PreAdm_T_Date: data.asmaY_PreAdm_T_Date,
                ASMAY_PreAdm_F_Time: data.asmaY_PreAdm_F_Time || null,
                ASMAY_PreAdm_T_Time: data.asmaY_PreAdm_T_Time || null,
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
        window.location.reload();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-6'>
                    {/* Academic Year (Main + Split) */}
                    <div className='space-y-4'>
                        {/* Institution */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='flex flex-col gap-1.5'>
                                <Label>
                                    Institution <span className='text-red-600'>*</span>
                                </Label>
                                <Controller
                                    name='mI_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            id='mI_Id'
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className={cn(
                                                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                                                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                                errors.mI_Id && 'border-red-500'
                                            )}>
                                            <option value=''>--Select Institution--</option>
                                            {institutionList.map((inst) => (
                                                <option key={inst.mI_Id} value={inst.mI_Id}>
                                                    {inst.mI_Name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.mI_Id && <p className='text-red-500 text-sm'>{errors.mI_Id.message}</p>}
                            </div>
                        </div>

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
                                placeholder='e.g., 2024'
                                {...register('asmaY_AcademicYearCode', {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                                    }
                                })}
                                error={errors.asmaY_AcademicYearCode?.message}
                            />

                            <div className='flex flex-col gap-1.5'>
                                <Controller
                                    name='asmaY_Order'
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            label='Academic Year Order'
                                            id='asmaY_Order'
                                            required
                                            value={field.value || 0}
                                            onChange={(value) => field.onChange(Number.isNaN(value) ? 0 : value)}
                                            minValue={0}
                                        />
                                    )}
                                />
                                {errors.asmaY_Order && <FormError>{errors.asmaY_Order.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    {/* Academic Year Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Start Date */}
                            <Controller
                                name='asmaY_From_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Start Date<span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_From_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_From_Date' : null)}>
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
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                    toDate={
                                                        academicToYear
                                                            ? new Date(Number(academicToYear), 11, 31)
                                                            : new Date(new Date().getFullYear() + 10, 11, 31)
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_From_Date && <p className='text-red-500 text-sm'>{errors.asmaY_From_Date.message}</p>}
                                    </div>
                                )}
                            />

                            {/* End Date - Cannot be before Start Date */}
                            <Controller
                                name='asmaY_To_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            End Date<span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_To_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_To_Date' : null)}>
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
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={
                                                        academicFromDate
                                                            ? addDays(new Date(academicFromDate), 1)
                                                            : academicFromYear
                                                              ? new Date(Number(academicFromYear), 0, 1)
                                                              : undefined
                                                    }
                                                    toDate={
                                                        academicToYear
                                                            ? new Date(Number(academicToYear), 11, 31)
                                                            : new Date(new Date().getFullYear() + 10, 11, 31)
                                                    }
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
                                        <Popover
                                            open={openPopover === 'asmaY_PreAdm_F_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_PreAdm_F_Date' : null)}>
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
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                    toDate={
                                                        academicFromDate
                                                            ? new Date(academicFromDate)
                                                            : academicToYear
                                                              ? new Date(Number(academicToYear), 11, 31)
                                                              : new Date(new Date().getFullYear() + 10, 11, 31)
                                                    }
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
                                        <Popover
                                            open={openPopover === 'asmaY_PreAdm_T_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_PreAdm_T_Date' : null)}>
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
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={
                                                        preAdmFromDate
                                                            ? addDays(new Date(preAdmFromDate), 1)
                                                            : academicFromYear
                                                              ? new Date(Number(academicFromYear), 0, 1)
                                                              : undefined
                                                    }
                                                    toDate={
                                                        academicToYear
                                                            ? new Date(Number(academicToYear), 11, 31)
                                                            : new Date(new Date().getFullYear() + 10, 11, 31)
                                                    }
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

                    {/* Pre-Admission Times */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Start Time */}
                            <Controller
                                name='asmaY_PreAdm_F_Time'
                                control={control}
                                render={({ field }) => (
                                    <TimeSpinnerField
                                        label='Pre Admission Start Time'
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        error={errors.asmaY_PreAdm_F_Time?.message}
                                    />
                                )}
                            />
                            {/* End Time */}
                            <Controller
                                name='asmaY_PreAdm_T_Time'
                                control={control}
                                render={({ field }) => (
                                    <TimeSpinnerField
                                        label='Pre Admission End Time'
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        error={errors.asmaY_PreAdm_T_Time?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Cut-off & Reference Dates */}
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
                                        <Popover
                                            open={openPopover === 'asmaY_Cut_Of_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_Cut_Of_Date' : null)}>
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
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                    toDate={
                                                        academicToYear
                                                            ? new Date(Number(academicToYear), 11, 31)
                                                            : new Date(new Date().getFullYear() + 10, 11, 31)
                                                    }
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
                                        <Popover
                                            open={openPopover === 'asmaY_ReferenceDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_ReferenceDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Transport Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_TransportSDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport Start Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_TransportSDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_TransportSDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_TransportEDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport End Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_TransportEDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_TransportEDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={transportFromDate ? addDays(new Date(transportFromDate), 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Financial Year Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_RegularFeeFDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year Start Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_RegularFeeFDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_RegularFeeFDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_RegularFeeTDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year End Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_RegularFeeTDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_RegularFeeTDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={regularFeeFromDate ? addDays(new Date(regularFeeFromDate), 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_AdvanceFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Advance Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_AdvanceFeeDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_AdvanceFeeDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_ArrearFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Arrear Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_ArrearFeeDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_ArrearFeeDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Boolean Flags */}
                    <div className='space-y-4'>
                        <h3 className='font-medium text-lg'>Flags</h3>
                        <div className='flex flex-wrap gap-6'>
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
                                    Preadmission Active Flag
                                </Label>
                            </div>
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-full sm:order-1 sm:w-fit'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'
                        className='order-1 w-full sm:order-2 sm:w-fit'>
                        <Save className='mr-2 h-4 w-4' />
                        Save Academic Year
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Reusable Time Spinner ────────────────────────────────────────────────────
export function TimeSpinnerField({
    label,
    value,
    onChange,
    error
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
}) {
    const hoursRef = useRef<HTMLInputElement>(null);
    const minutesRef = useRef<HTMLInputElement>(null);
    const ampmRef = useRef<HTMLSelectElement>(null);

    // Parse "HH:mm" (24h) → h (1-12), mm, ampm
    function parse(v: string) {
        const [hStr = '12', mStr = '00'] = (v || '').split(':');
        let h = Number(hStr) % 24;
        const m = Math.min(59, Math.max(0, Number(mStr)));
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return { h, m, ampm };
    }

    const { h, m, ampm } = parse(value);

    const [localH, setLocalH] = useState(String(h).padStart(2, '0'));
    const [localM, setLocalM] = useState(String(m).padStart(2, '0'));

    function emit(newH: number, newM: number, newAmpm: string) {
        let h24 = newH % 12;
        if (newAmpm === 'PM') h24 += 12;
        onChange(`${String(h24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
        setLocalH(String(newH).padStart(2, '0'));
        setLocalM(String(newM).padStart(2, '0'));
    }

    // Sync from prop when not active typing
    useEffect(() => {
        if (document.activeElement !== hoursRef.current) {
            setLocalH(String(h).padStart(2, '0'));
        }
    }, [h]);

    useEffect(() => {
        if (document.activeElement !== minutesRef.current) {
            setLocalM(String(m).padStart(2, '0'));
        }
    }, [m]);

    useEffect(() => {
        const handleHoursWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                emit((h % 12) + 1 || 12, m, ampm);
            } else {
                emit(((h - 2 + 12) % 12) + 1, m, ampm);
            }
        };

        const handleMinutesWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                emit(h, (m + 1) % 60, ampm);
            } else {
                emit(h, (m - 1 + 60) % 60, ampm);
            }
        };

        const handleAmpmWheel = (e: WheelEvent) => {
            e.preventDefault();
            emit(h, m, ampm === 'AM' ? 'PM' : 'AM');
        };

        const hEl = hoursRef.current;
        const mEl = minutesRef.current;
        const aEl = ampmRef.current;

        if (hEl) hEl.addEventListener('wheel', handleHoursWheel, { passive: false });
        if (mEl) mEl.addEventListener('wheel', handleMinutesWheel, { passive: false });
        if (aEl) aEl.addEventListener('wheel', handleAmpmWheel, { passive: false });

        return () => {
            if (hEl) hEl.removeEventListener('wheel', handleHoursWheel);
            if (mEl) mEl.removeEventListener('wheel', handleMinutesWheel);
            if (aEl) aEl.removeEventListener('wheel', handleAmpmWheel);
        };
    }, [h, m, ampm]);

    return (
        <div className='flex flex-col gap-1.5'>
            <Label>{label}</Label>
            <div className='flex items-center gap-2'>
                {/* Hours */}
                <div className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit((h % 12) + 1 || 12, m, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <input
                        ref={hoursRef}
                        type='text'
                        maxLength={2}
                        value={localH}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setLocalH(val);
                        }}
                        onBlur={() => {
                            let num = Number(localH);
                            if (Number.isNaN(num) || num < 1 || num > 12) {
                                num = h;
                            }
                            emit(num, m, ampm);
                        }}
                        className='flex h-9 w-12 items-center justify-center rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    />
                    <button type='button' onClick={() => emit(((h - 2 + 12) % 12) + 1, m, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>

                <span className='font-bold text-lg leading-none'>:</span>

                {/* Minutes */}
                <div className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, (m + 1) % 60, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <input
                        ref={minutesRef}
                        type='text'
                        maxLength={2}
                        value={localM}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setLocalM(val);
                        }}
                        onBlur={() => {
                            let num = Number(localM);
                            if (Number.isNaN(num) || num < 0 || num > 59) {
                                num = m;
                            }
                            emit(h, num, ampm);
                        }}
                        className='flex h-9 w-12 items-center justify-center rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    />
                    <button type='button' onClick={() => emit(h, (m - 1 + 60) % 60, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>

                {/* AM / PM select dropdown */}
                <div className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <select
                        ref={ampmRef}
                        value={ampm}
                        onChange={(e) => emit(h, m, e.target.value)}
                        className='flex h-9 w-14 cursor-pointer appearance-none items-center justify-center rounded-md border border-input bg-transparent px-1 text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'>
                        <option value='AM' className='bg-background text-foreground'>
                            AM
                        </option>
                        <option value='PM' className='bg-background text-foreground'>
                            PM
                        </option>
                    </select>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
        </div>
    );
}
