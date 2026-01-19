'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { useFeeClassListDefaulterreport } from '@/hooks/fees/useReports';
import type { ApiSearchparams } from '@/types';
import type { IUploadClassDropdownList } from '@/types/upload/reports/classwork-upload-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    fromdate: z.string({ required_error: 'From date is required' }).nonempty('From date is required'),
    todate: z.string({ required_error: 'To date is required' }).nonempty('To date is required'),
    classarray: z.array(z.string()).min(1, 'Please select at least one class')
});

type FormFields = z.infer<typeof formSchema>;

export default function HomeWorkReportForm({
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
            todate: ''
        }
    });

    const { control, handleSubmit, reset, formState } = methods;
    const { isSubmitting } = formState;

    /* -------------------- API -------------------- */
    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    /* -------------------- State -------------------- */
    const [classList, setClassList] = useState<{ label: string; value: string }[]>([]);

    /* -------------------- Map API → Dropdown -------------------- */
    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
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
        } else {
            setClassList([]);
        }
    }, [classListResponse, classListError]);

    const onSubmit = async (values: FormFields) => {
        const payload = {
            fromdate: values.fromdate,
            todate: values.todate,
            classarray: values.classarray.map((id) => ({ ASMCL_Id: Number(id) })),
            type: 'HomeWork'
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

                    {/* Class Multi-Select */}
                    <Controller
                        control={control}
                        name='classarray'
                        render={({ field, fieldState }) => (
                            <div className='mt-5 flex flex-col gap-2'>
                                <Label>
                                    Class Name <span className='text-red-500'>*</span>
                                </Label>
                                {loadingClasses ? (
                                    <div>Loading classes...</div>
                                ) : (
                                    <CustomMultiSelectBox
                                        options={classList}
                                        onChange={(selected) => field.onChange(selected)}
                                        value={field.value}
                                        placeholder='Select Classes'
                                        height='200px'
                                        isSearchRequired
                                    />
                                )}
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
