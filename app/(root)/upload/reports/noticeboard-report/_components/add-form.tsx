'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport } from '@/hooks/fees/useReports';
import type { ApiSearchparams } from '@/types';
import type { IUploadClassDropdownList } from '@/types/upload/reports/classwork-upload-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

/* ----------------------------- Schema ----------------------------- */
const formSchema = z.object({
    asmay_id: z.string().nonempty('Academic Year is required'),
    fromdate: z.string().nonempty('From date is required'),
    todate: z.string().nonempty('To date is required'),
    classarray: z.array(z.string()).min(1, 'Please select at least one class')
});

type FormFields = z.infer<typeof formSchema>;

interface ClassOption {
    label: string;
    value: string;
}

/* --------------------------- Component ----------------------------- */
export default function NoticeBoardReportForm({
    onSuccess,
    apiSearchParams
}: {
    onSuccess: (payload: any, searchParams: ApiSearchparams) => void;
    apiSearchParams: ApiSearchparams;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asmay_id: '',
            fromdate: '',
            todate: '',
            classarray: []
        }
    });

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting }
    } = methods;

    /* ---------------- Academic Year ---------------- */
    const { data: academicResponse, isLoading: academicLoading } = useAcademicYearDropdown();

    // normalize academic years safely
    const academicYears = Array.isArray(academicResponse) ? academicResponse : academicResponse?.data || [];

    /* ---------------- Class List (Dynamic) ---------------- */
    const { data: classListResponse, isLoading: classLoading, error: classError } = useFeeClassListDefaulterreport();

    const [classList, setClassList] = useState<ClassOption[]>([]);

    useEffect(() => {
        if (classError) {
            toast.error(classError?.message || 'Failed to load classes');
            setClassList([]);
            return;
        }

        if (Array.isArray(classListResponse?.data)) {
            setClassList(
                classListResponse.data.map((cls: IUploadClassDropdownList) => ({
                    label: cls.asmcL_ClassName,
                    value: String(cls.asmcL_Id)
                }))
            );
        }
    }, [classListResponse, classError]);

    /* ---------------- Academic Year Change ---------------- */
    const handleYearChange = (value: string) => {
        const year = academicYears.find((y: any) => String(y.asmaY_Id) === value);
        if (year) {
            setValue('asmay_id', value);
            setValue('fromdate', year.asmaY_From_Date);
            setValue('todate', year.asmaY_To_Date);
        }
    };

    /* ---------------- Submit ---------------- */
    const onSubmit = (values: FormFields) => {
        const payload = {
            ASMAY_Id: Number(values.asmay_id),
            fromdate: values.fromdate,
            todate: values.todate,
            classarray: values.classarray.map((id) => ({
                ASMCL_Id: Number(id)
            }))
        };

        onSuccess(payload, apiSearchParams || { page: 1, page_size: 10 });
    };

    /* ---------------- Cancel ---------------- */
    const handleCancel = () => {
        reset();
        onSuccess(null, apiSearchParams || { page: 1, page_size: 10 });
    };

    /* ---------------- UI ---------------- */
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Academic Year */}
                    <Controller
                        control={control}
                        name='asmay_id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={field.value} onValueChange={handleYearChange} disabled={academicLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* From Date */}
                    <Controller
                        control={control}
                        name='fromdate'
                        render={({ field, fieldState }) => (
                            <DateField field={field} fieldState={fieldState} label='From Date' placeholder='Select From Date' />
                        )}
                    />

                    {/* To Date */}
                    <Controller
                        control={control}
                        name='todate'
                        render={({ field, fieldState }) => (
                            <DateField field={field} fieldState={fieldState} label='To Date' placeholder='Select To Date' />
                        )}
                    />

                    {/* Class */}
                    <Controller
                        control={control}
                        name='classarray'
                        render={({ field, fieldState }) => (
                            <div className='mt-5 flex flex-col gap-2'>
                                <Label>
                                    Class Name <span className='text-red-500'>*</span>
                                </Label>
                                <CustomMultiSelectBox
                                    options={classList}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={classLoading ? 'Loading Classes...' : 'Select Classes'}
                                    height='200px'
                                    isSearchRequired
                                />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* Buttons */}
                <div className='flex justify-center gap-3'>
                    <Button type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Generating...' : 'Report'}
                    </Button>
                    <Button type='button' variant='outline' onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
