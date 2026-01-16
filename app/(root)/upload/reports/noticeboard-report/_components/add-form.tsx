'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getNoticeBoardInitialData } from '@/server/upload/reports/noticeboard-report';
import type { ApiSearchparams } from '@/types';

const formSchema = z.object({
    asmay_id: z.string({ required_error: 'Academic Year is required' }).nonempty('Academic Year is required'),
    fromdate: z.string({ required_error: 'From date is required' }).nonempty('From date is required'),
    todate: z.string({ required_error: 'To date is required' }).nonempty('To date is required'),
    classarray: z.array(z.string()).min(1, 'Please select at least one class'),
});

type FormFields = z.infer<typeof formSchema>;

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
            classarray: [],
            asmay_id: '',
            fromdate: '',
            todate: '',
        },
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [classList, setClassList] = useState<{ label: string; value: string }[]>([]);
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string; asmaY_From_Date: string; asmaY_To_Date: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getNoticeBoardInitialData(2);
                if (res.data) {
                    if (res.data.classlist) {
                        setClassList(
                            res.data.classlist.map((c: any) => ({
                                label: c.asmcL_ClassName,
                                value: String(c.asmcL_Id),
                            }))
                        );
                    }
                    if (res.data.acayear) {
                        setAcademicYears(res.data.acayear);
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchData();
    }, []);

    const handleYearChange = (value: string) => {
        const selectedYear = academicYears.find((y) => String(y.asmaY_Id) === value);
        if (selectedYear && selectedYear.asmaY_From_Date && selectedYear.asmaY_To_Date) {
            try {
                setValue('fromdate', new Date(selectedYear.asmaY_From_Date).toISOString());
                setValue('todate', new Date(selectedYear.asmaY_To_Date).toISOString());
            } catch (error) {
                console.error('Invalid date format in academic year:', error);
            }
        }
        setValue('asmay_id', value);
    };

    const onSubmit = async (values: FormFields) => {
        const payload = {
            fromdate: values.fromdate,
            todate: values.todate,
            classarray: values.classarray.map((id) => ({ ASMCL_Id: Number(id) })),
            ASMAY_Id: Number(values.asmay_id),
        };
        onSuccess(payload, apiSearchParams || { page: 1, page_size: 10 });
    };

    const handleCancel = () => {
        reset();
        onSuccess(null, apiSearchParams || { page: 1, page_size: 10 });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <Controller
                        control={control}
                        name='asmay_id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2'>
                                <Label>Academic Year <span className='text-red-500'>*</span></Label>
                                <Select onValueChange={handleYearChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year) => (
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

                    <Controller
                        control={control}
                        name='fromdate'
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label='From Date'
                                placeholder='Select From Date'
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='todate'
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label='To Date'
                                placeholder='Select To Date'
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='classarray'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2 mt-5'>
                                <Label>Class Name <span className='text-red-500'>*</span></Label>
                                <CustomMultiSelectBox
                                    options={classList}
                                    onChange={(selected) => field.onChange(selected)}
                                    value={field.value}
                                    placeholder='Select Classes'
                                    height='200px'
                                    isSearchRequired
                                />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                <div className='flex justify-center space-x-2'>
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


