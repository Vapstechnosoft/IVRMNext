'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TERM_DROPDOWN_DATA, useMasterTermsPeriod } from '@/hooks/fees/useMasters';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { masterTermPeriodSchema } from '@/schemas/fees/masters';
import { addOrUpdateTermsPeriod, get_split_year } from '@/server/fees/masters/fee_terms_period';
import type { IMasterTermsPeriodList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterTermPeriodSchema.addOrUpdate>;

interface UpdateMasterTermsPeriodFormProps {
    onSuccess?: () => void;
    feeheadname?: string;
    selectedRow: IMasterTermsPeriodList;
}

export default function UpdateMasterTermsPeriodForm({ onSuccess, feeheadname = '', selectedRow: row }: UpdateMasterTermsPeriodFormProps) {
    const { refetchAll } = useMasterTermsPeriod();

    const { data: academicYear } = useacademicyerdropdowndatafee();
    const { data: terms, isLoading: termsLoading, error: termsError } = TERM_DROPDOWN_DATA();

    const [splitAcademicYear, setSplitAcademicYear] = useState<any[]>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const {
        control,
        reset,
        setValue,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterTermPeriodSchema.addOrUpdate),
        mode: 'onChange',

        defaultValues: {
            // asmay_Id: row.asmay_Id || 0,
            // fmt_id: row.fmt_id || 0,
            asmay_Id: 231,
            fmt_id: 187,
            fmtP_Year: row.fmtP_Year ? String(row.fmtP_Year) : '',
            from_Month: row.fromMonth || '',
            to_Month: row.fmtToMonth || '',
            filterType: row.feeFlag || ''
        }
    });

    function OnReset() {
        refetchAll();
    }

    // Prefill Editing Data (Fixed)
    useEffect(() => {
        if (!row) return;

        console.log('Loaded row data:', row);
        // row.fmt_id = 187; // Temporary fix for term id
        // row.asmay_Id = 231; // Temporary fix for academic year id

        // Reset form data with the row data
        reset({
            asmay_Id: row.asmay_Id,
            fmt_id: row.fmt_id,
            fmtP_Year: row.fmtP_Year ? String(row.fmtP_Year) : '',
            from_Month: row.fromMonth ?? '',
            to_Month: row.fmtToMonth ?? '',
            filterType: row.feeFlag ?? ''
        });

        console.log('Form reset with data:', {
            asmay_Id: row.asmay_Id,
            fmt_id: row.fmt_id,
            fmtP_Year: row.fmtP_Year ? String(row.fmtP_Year) : '',
            from_Month: row.fromMonth ?? '',
            to_Month: row.fmtToMonth ?? '',
            filterType: row.feeFlag ?? ''
        });

        // Set selected academic year and fetch split years
        setSelectedAcademicYear(231);
    }, [row, reset]);

    // Load Split Academic Year
    useEffect(() => {
        if (!selectedAcademicYear) return;

        const fetchSplitYears = async () => {
            try {
                const res = await get_split_year(selectedAcademicYear);
                setSplitAcademicYear(res.data || []);
            } catch (err) {
                console.log('Failed to load split year:', err);
                setSplitAcademicYear([]);
            }
        };

        fetchSplitYears();
    }, [selectedAcademicYear]);

    const handleReset = () => {
        reset();
    };

    // Submit Handler
    const onSubmit = async (data: FormFields) => {
        try {
            const { asmay_Id, fmt_id, filterType } = data;
            const payload = {
                mi_id: 30,
                asmay_Id: asmay_Id,
                fmt_id: fmt_id,
                fmtP_Year: data.fmtP_Year,
                feeflag: filterType,
                fmtP_FROM_MONTH: data.from_Month,
                fmtP_TO_MONTH: data.to_Month,
                user_id: 21602,
                fmtP_Id: row.fmtP_Id
            };

            console.log('Payload JSON:', JSON.stringify(payload));
            const response = await addOrUpdateTermsPeriod(payload);

            if (response.success) {
                toast.success(response.message);
                OnReset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col items-center justify-center space-y-6'>
            {/* Academic Year */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    Academic Year<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='asmay_Id'
                    control={control}
                    render={({ field }) => (
                        <Select
                            value={String(field.value ?? '')}
                            onValueChange={(val) => {
                                field.onChange(Number(val));
                                setSelectedAcademicYear(Number(val)); // Update selected academic year
                            }}>
                            <SelectTrigger className='min-w-[400px] text-center'>
                                <SelectValue placeholder='--Select Academic Year--' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYear?.data?.map((item: any) => (
                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.asmay_Id && <FormError>{errors.asmay_Id.message}</FormError>}
            </div>

            {/* Term */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    Term<span className='text-red-500'>*</span>
                </Label>
                {/* <Controller
                    name="fmt_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            value={String(field.value ?? "")}
                            onValueChange={(value) => field.onChange(Number(value))}
                        >
                            <SelectTrigger className="min-w-[400px] text-center">
                                <SelectValue placeholder="--Select Term--" />
                            </SelectTrigger>
                            <SelectContent>
                                {terms?.data?.map((item) => (
                                    <SelectItem key={item.fmT_Id} value={item.fmT_Id.toString()}>
                                        {item.fmT_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    
                /> */}
                {/* <Controller
                                                name='fmt_id'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(Number(value));
                                                        }}
                                                        value={field.value?.toString() || undefined}>
                                                        <SelectTrigger className="min-w-[400px] text-center">
                                                            <SelectValue placeholder='Select Term' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {termsLoading ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading Terms...
                                                                </SelectItem>
                                                            ) : termsError ? (
                                                                <SelectItem value='error' disabled>
                                                                    Error loading Terms
                                                                </SelectItem>
                                                            ) : (
                                                                terms?.data?.map((item) => (
                                                                    <SelectItem key={item.fmT_Id} value={item.fmT_Id.toString()}>
                                                                        {item.fmT_Name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            /> */}

                <Controller
                    name='fmt_id'
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                            <SelectTrigger className='min-w-[400px]'>
                                <SelectValue placeholder='Select Group' />
                            </SelectTrigger>
                            <SelectContent>
                                {terms?.data?.map((g) => (
                                    <SelectItem key={g.fmT_Id} value={String(g.fmT_Id)}>
                                        {g.fmT_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />

                {errors.fmt_id && <FormError>{errors.fmt_id.message}</FormError>}
            </div>

            {/* Split Year */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    Year<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='fmtP_Year'
                    control={control}
                    render={({ field }) => (
                        <Select
                            value={String(field.value ?? '')}
                            onValueChange={(val) => field.onChange(val)}
                            disabled={!selectedAcademicYear || splitAcademicYear.length === 0}>
                            <SelectTrigger className='min-w-[400px] text-center'>
                                <SelectValue placeholder='--Select Year--' />
                            </SelectTrigger>
                            <SelectContent>
                                {splitAcademicYear.map((item: any) => (
                                    <SelectItem key={item.fmtP_Year} value={String(item.fmtP_Year)}>
                                        {item.fmtP_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.fmtP_Year && <FormError>{errors.fmtP_Year.message}</FormError>}
            </div>

            {/* From Month */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    From Month<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='from_Month'
                    control={control}
                    defaultValue={row.fromMonth ?? ''}
                    render={({ field }) => (
                        <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                            <SelectTrigger className='min-w-[400px] text-center'>
                                <SelectValue placeholder='--Select Month--' />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.from_Month && <FormError>{errors.from_Month.message}</FormError>}
            </div>

            {/* To Month */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    To Month<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='to_Month'
                    control={control}
                    defaultValue={row.fmtToMonth ?? ''}
                    render={({ field }) => (
                        <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                            <SelectTrigger className='min-w-[400px] text-center'>
                                <SelectValue placeholder='--Select Month--' />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.to_Month && <FormError>{errors.to_Month.message}</FormError>}
            </div>

            {/* Fee Type */}
            <div className='flex justify-center'>
                <Controller
                    name='filterType'
                    control={control}
                    render={({ field }) => (
                        <Card className='p-4'>
                            <RadioGroup value={field.value} onValueChange={field.onChange}>
                                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                                    {[
                                        { value: 'N', label: 'New Admission Fee' },
                                        { value: 'F', label: 'Regular Fee' },
                                        { value: 'T', label: 'Transport Fee' },
                                        { value: 'R', label: 'Registration Fee' }
                                    ].map((item) => (
                                        <div key={item.value} className='flex items-center gap-2'>
                                            <RadioGroupItem id={item.value} value={item.value} />
                                            <Label htmlFor={item.value}>{item.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                            {errors.filterType && <FormError className='mt-2'>{errors.filterType.message}</FormError>}
                        </Card>
                    )}
                />
            </div>

            <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:justify-start'>
                <>
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
                            Update
                        </div>
                    </Button>
                </>
            </div>
        </form>
    );
}
