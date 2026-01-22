'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getInitialData } from '@/server/upload/reports/classwork-upload-report';
import type { ApiSearchparams } from '@/types';

const formSchema = z.object({
    fromdate: z.string({ required_error: 'From date is required' }).nonempty('From date is required'),
    todate: z.string({ required_error: 'To date is required' }).nonempty('To date is required'),
    classarray: z.array(z.string()).min(1, 'Please select at least one class'),
});

type FormFields = z.infer<typeof formSchema>;

export default function ClassWorkReportForm({
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
            fromdate: '',
            todate: '',
        },
    });

    const { control, handleSubmit, reset, formState } = methods;
    const { isSubmitting } = formState;

    const [classList, setClassList] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getInitialData(2);
                if (res.data && res.data.classlist) {
                    setClassList(
                        res.data.classlist.map((c: any) => ({
                            label: c.asmcL_ClassName,
                            value: String(c.asmcL_Id),
                        }))
                    );
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (values: FormFields) => {
        const payload = {
            fromdate: values.fromdate,
            todate: values.todate,
            classarray: values.classarray.map((id) => ({ ASMCL_Id: Number(id) })),
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
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
                    <Button type='button' variant='destructive' onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}


