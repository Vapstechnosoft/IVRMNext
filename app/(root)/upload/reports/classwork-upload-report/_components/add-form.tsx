'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useFeeClassListDefaulterreport } from '@/hooks/fees/useReports';
import type { ApiSearchparams } from '@/types';
import type { IUploadClassDropdownList } from '@/types/upload/reports/classwork-upload-report';
import { toast } from 'sonner';

/* -------------------- Schema -------------------- */
const formSchema = z.object({
    fromdate: z.string().nonempty('From date is required'),
    todate: z.string().nonempty('To date is required'),
    classarray: z.array(z.string()).min(1, 'Please select at least one class')
});

type FormFields = z.infer<typeof formSchema>;

export default function ClassWorkReportForm({
    onSuccess,
    apiSearchParams
}: {
    onSuccess: (payload: any, searchParams: ApiSearchparams) => void;
    apiSearchParams: ApiSearchparams;
}) {
    /* -------------------- Form -------------------- */
    const methods = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromdate: '',
            todate: '',
            classarray: []
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
        }
    }, [classListResponse, classListError]);

    /* -------------------- Submit -------------------- */
    const onSubmit = (values: FormFields) => {
        const payload = {
            fromdate: values.fromdate,
            todate: values.todate,
            classarray: values.classarray.map((id) => ({
                ASMCL_Id: Number(id)
            }))
        };

        onSuccess(payload, apiSearchParams || { page: 1, page_size: 10 });
    };

    const handleCancel = () => {
        reset();
        onSuccess(null, apiSearchParams || { page: 1, page_size: 10 });
    };

    /* -------------------- UI -------------------- */
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <Controller
                        control={control}
                        name='fromdate'
                        render={({ field, fieldState }) => (
                            <DateField field={field} fieldState={fieldState} label='From Date' placeholder='Select From Date' />
                        )}
                    />

                    <Controller
                        control={control}
                        name='todate'
                        render={({ field, fieldState }) => (
                            <DateField field={field} fieldState={fieldState} label='To Date' placeholder='Select To Date' />
                        )}
                    />

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
                                    placeholder={loadingClasses ? 'Loading classes...' : 'Select Classes'}
                                    height='200px'
                                    isSearchRequired
                                    disabled={loadingClasses}
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
