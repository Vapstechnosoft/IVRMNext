// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeCustomGroupDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feeAuditSchema } from '@/schemas/fees/reports';
import type { IFeeAuditReport } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeAuditSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeDefaulterReport() {
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        fromDate: new Date(),
        toDate: new Date(),
        breakdown: 'All',
        academicYearId: ''
    });

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeAuditSchema),
        defaultValues: {
            academicYearId: '',

            breakdown: 'All',
            fromDate: undefined,
            toDate: undefined
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);

    const [reportData, setReportData] = useState<IFeeAuditReport[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        const payload = {
            academicYearId: data.academicYearId
        };

        console.log('Filters:', filters);
        // Optional: Keep validation
        // if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        // if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        // if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

        setReportLoading(true);
        setShowReport(false);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // STATIC MOCK DATA - Looks 100% real!
        const mockData: IFeeAuditReport[] = [
            { feeGroup: 'Tuition Fee', totalDue: 12500 },
            { feeGroup: 'Transport + Tuition', totalDue: 28500 },
            { feeGroup: 'Annual Charges', totalDue: 8000 },
            { feeGroup: 'Tuition Fee', totalDue: 15000 },
            { feeGroup: 'Lab + Tuition', totalDue: 42000 },
            { feeGroup: 'Transport Fee', totalDue: 18000 },
            { feeGroup: 'Tuition Fee', totalDue: 12500 },
            { feeGroup: 'All Fees', totalDue: 55000 },
            { feeGroup: 'Exam Fee', totalDue: 5000 },
            { feeGroup: 'Tuition Fee', totalDue: 11000 },
            { feeGroup: 'Science Fee', totalDue: 15000 },
            { feeGroup: 'Transport', totalDue: 20000 },
            { feeGroup: 'Tuition + Lab', totalDue: 30000 }
        ];

        setReportData(mockData);
        setShowReport(true);
        setReportLoading(false);
        setLoading(false);

        toast.success(`Report generated successfully! Found ${mockData.length} defaulters`);

        // Auto scroll to report
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            {/* <h1 className='mb-8 font-bold text-3xl text-gray-900'>Yearly Fee Collection Report</h1> */}

                            <div className='space-y-8'>
                                {/* View Mode + Academic Year */}
                                {/* View Mode + Academic Year + Full Breakdown Radio Group */}
                                <div className='flex flex-wrap gap-8'>
                                    {/* Academic Year */}
                                    <div className='flex min-w-[500px] items-center gap-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year :<span className='text-red-500'>*</span>
                                        </Label>

                                        <Controller
                                            name='academicYearId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    key={field.value || 'empty'}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setFilters((prev) => ({ ...prev, academicYearId: value }));
                                                    }}
                                                    value={field.value?.toString() || undefined}
                                                    disabled={loadingAcademic}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue
                                                            placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'}
                                                        />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value='all'>All</SelectItem>
                                                        {loadingAcademic ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : academicError ? (
                                                            <SelectItem value='error' disabled>
                                                                Failed to load years
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((item) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />

                                        {/* Zod Error */}
                                        {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                    </div>

                                    <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex flex-wrap gap-4'>
                                            {[
                                                { label: 'All', value: 'All' },
                                                { label: 'Cash', value: 'C' },
                                                { label: 'Cheque/DD', value: 'B' },
                                                { label: 'Online Paid', value: 'O' },
                                                { label: 'ECS', value: 'E' },
                                                { label: 'Card', value: 'S' },
                                                { label: 'RTGS', value: 'R' },
                                                { label: 'Trans&Bank', value: 'BT' }
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className='flex cursor-pointer items-center gap-3 whitespace-nowrap'>
                                                    <input
                                                        type='radio'
                                                        name='breakdown'
                                                        checked={filters.breakdown === option.value}
                                                        onChange={() => setFilters((prev) => ({ ...prev, breakdown: option.value }))}
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-sm'>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                <div className='mt-4 flex items-center justify-center rounded border bg-gray-50 p-4 shadow-sm'>
                                    <div className='flex items-center gap-6'>
                                        {/* From Date */}
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='fromDate' className='font-medium'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                id='fromDate'
                                                type='date'
                                                value={filters.fromDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        fromDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                            />
                                        </div>

                                        {/* To Date */}
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='toDate' className='font-medium'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                id='toDate'
                                                type='date'
                                                value={filters.toDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        toDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>

                                        <Button
                                            size='lg'
                                            className='px-12'
                                            type='submit'
                                            // onClick={handleSubmit}
                                            // disabled={
                                            //     reportLoading ||
                                            //     !filters.academicYearId ||
                                            //     filters.feeGroupIds.length === 0 ||
                                            //     filters.termIds.length === 0
                                            // }
                                        >
                                            Generate Report
                                        </Button>
                                    </div>

                                    {/* ==================== REPORT SECTION ==================== */}
                                    {/*                           
                                    <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                     
                                        {reportLoading ? (
                                            <div className='p-24 text-center'>
                                                <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                            </div>
                                        ) : (
                                        
                                            <CollapsibleSection
                                                defaultOpen={true}
                                                variant='default'
                                                size='lg'
                                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                <div className='border-b bg-primary/5 px-8 py-6'>
                                                    <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                </div>
                                                <GenericDataTable<IFeeAuditReport>
                                                    columns={AuditReportColumns}
                                                    data={reportData}
                                                    isLoading={reportLoading}
                                                />
                                            </CollapsibleSection>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
