'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterMonths, useMasterYears } from '@/hooks/hrms/useReports';
import { type PFForm5FormFields, PFForm5FormReportSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import PfForm5Columns from './_components/columns';

type FormFields = z.infer<typeof PFForm5FormReportSchema>;

const tableProps = {
    Form5: [
        {
            serialNo: 1,
            accountNo: 'MH/56789/123',
            memberName: 'RAHUL KUMAR SHARMA',
            fatherOrHusbandName: 'Suresh Sharma',
            dateOfLeaving: '2025-01-15',
            reasonForLeaving: 'Resigned',
            remarks: ''
        },
        {
            serialNo: 2,
            accountNo: 'MH/56789/456',
            memberName: 'PRIYA SINGH',
            fatherOrHusbandName: 'Rajesh Singh',
            dateOfLeaving: '2025-01-20',
            reasonForLeaving: 'Retired',
            remarks: 'Completed 60 years'
        }
    ],
    establishmentName: 'Vidya Vikasa Vidya Samsthe (R)',
    establishmentCode: 'PF',
    establishmentAddress: 'Basaveshwara Talkies rd, Gayatri circle, karantaka, 577501'
};

export default function DepartmentSalaryReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    const { data: masterMonths, isLoading: masterMonthsLoading, isError: masterMonthsError } = useMasterMonths();

    const { data: masterYears, isLoading: masterYearsLoading, isError: masterYearsError } = useMasterYears();

    const MonthsOptions =
        masterMonths?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const YearsOptions =
        masterYears?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PFForm5FormReportSchema),
        defaultValues: {
            month: '',
            year: ''
        },
        mode: 'onChange'
    });

    const onSearch = async (data: PFForm5FormFields) => {
        setIsSearching(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Get month and year labels for display
            const monthLabel = MonthsOptions.find((opt: any) => opt.value === data.month)?.label || data.month;
            const yearLabel = YearsOptions.find((opt: any) => opt.value === data.year)?.label || data.year;

            // Store selected values
            setSelectedMonth(monthLabel);
            setSelectedYear(yearLabel);

            // Set the report data (in real scenario, this would come from API)
            setReportData(tableProps);

            toast.success('Report generated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset({
            month: '',
            year: ''
        });
        setReportData(null);
        setSelectedMonth('');
        setSelectedYear('');
        toast.info('Form has been reset');
    };

    const handleCancel = () => {
        setReportData(null);
        setSelectedMonth('');
        setSelectedYear('');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='PF Form 5 Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex justify-center'>
                            <div className='grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='month' className='font-medium text-sm text-white-900'>
                                        Month: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='month'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterMonthsLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : masterMonthsError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        MonthsOptions?.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.month && <FormError>{errors.month.message}</FormError>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='year' className='font-medium text-sm text-white-900'>
                                        Year: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='year'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterYearsLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : masterYearsError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        YearsOptions?.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.year && <FormError>{errors.year.message}</FormError>}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSearching || isSubmitting}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                Reset
                            </Button>
                            <Button
                                type='submit'
                                onClick={handleSubmit(onSearch)}
                                disabled={isSearching || isSubmitting}
                                className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                {isSearching ? (
                                    <>
                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                        Searching...
                                    </>
                                ) : (
                                    <div className='flex items-center'>
                                        <Search className='mr-2 h-4 w-4' />
                                        Search
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* FIXED: Changed from isSearching to reportData */}
                {reportData && (
                    <CollapsibleSection
                        title='PF Form 5 Report Results'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <PfForm5Columns
                            membersLeavingService={reportData.Form5}
                            establishmentName={reportData.establishmentName}
                            establishmentCode={reportData.establishmentCode}
                            establishmentAddress={reportData.establishmentAddress}
                            month={selectedMonth}
                            year={selectedYear}
                            onCancel={handleCancel}
                            onPrint={handlePrint}
                            isLoading={false}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
