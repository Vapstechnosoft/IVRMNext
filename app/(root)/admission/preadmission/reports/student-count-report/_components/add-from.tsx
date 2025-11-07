'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegisteredListDropDown } from '@/hooks/admission/preadmission/useReports';
import { masterStudentCountReportSchema } from '@/schemas/admission/preadmission/reports';
import { addOrUpdateStudentCountReport } from '@/server/admission/preadmission/reports/student_count_report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Label } from 'react-aria-components';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterStudentCountReportSchema.addOrUpdate>;

interface AddStudentCountReportFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddStudentCountReportForm({ onSuccess, className = '' }: AddStudentCountReportFormProps) {
    // const {
    //   data: registeredCode,
    //   isLoading: registeredCodeLoading,
    //   error: registeredCodeError,
    //   refetchAll: refetchregisteredCode,
    // } = useRegisteredListDropDown();

    const { refetchAll } = useRegisteredListDropDown();
    const [reportType, setReportType] = useState<string>('registered-list');
    const [rangeType, setRangeType] = useState<string>('between');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterStudentCountReportSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { imcC_CategoryCode, imcC_CategoryName, imcC_CategoryDesc } = data;
            const payload = {
                IMCC_ID: 0,
                IMCC_CategoryCode: imcC_CategoryCode,
                IMCC_CategoryName: imcC_CategoryName,
                IMCC_CategoryDesc: imcC_CategoryDesc
            };

            const response = await addOrUpdateStudentCountReport(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                // refetchregisteredCode();
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
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Left column - report select */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Select Report Type</Label>
                                <Select onValueChange={(v) => setReportType(v)} defaultValue={reportType}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select report type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='registered-list'>Registered List</SelectItem>
                                        <SelectItem value='registered-count'>Registered Count</SelectItem>
                                        <SelectItem value='payment-report'>Payment Report</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className='mt-2 text-primary text-xs'>Registered students who completed the application form</p>
                            </div>

                            {/* Middle column - range radio + dates */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Select Range</Label>
                                <div className='mb-3 flex items-center gap-6'>
                                    <RadioGroup
                                        value={rangeType}
                                        onValueChange={(v) => setRangeType(v)}
                                        className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value='yearwise' id='rg-year' />
                                            <label htmlFor='rg-year' className='text-sm'>
                                                Year wise
                                            </label>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value='between' id='rg-between' />
                                            <label htmlFor='rg-between' className='text-sm'>
                                                Between Dates
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {rangeType === 'between' && (
                                    <div className='flex gap-2'>
                                        <Input
                                            type='date'
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className='w-1/2'
                                        />
                                        <Input type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} className='w-1/2' />
                                    </div>
                                )}

                                {rangeType === 'yearwise' && (
                                    <div className='group flex flex-col gap-1.5'>
                                        <label
                                            aria-label='Academic Range'
                                            htmlFor='academic_range'
                                            className='mb-2 block font-medium text-gray-700 text-sm'>
                                            Academic Range <span className='ml-1 text-red-500'>*</span>
                                        </label>
                                        <Select onValueChange={(v) => setSelectedYear(v)} value={selectedYear}>
                                            <SelectTrigger key={selectedYear || 'empty'} className='w-48'>
                                                <SelectValue placeholder='Select range' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='01-06/31-05'>01-06 / 31-05</SelectItem>
                                                <SelectItem value='01-07/30-06'>01-07 / 30-06</SelectItem>
                                                <SelectItem value='01-04/31-03'>01-04 / 31-03</SelectItem>
                                                <SelectItem value='01-09/31-08'>01-09 / 31-08</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            search
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
