'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterYears } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Mail, MessageSquare, Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';
import { type MonthlySalaryDetail, getMonthlySalaryDetailColumns } from './_components/columns';

const monthEndReportSchema = z.object({
    year: z.string().min(1, 'Year is required')
});

type FormFields = z.infer<typeof monthEndReportSchema>;

const generateMockSalaryData = (year: string): MonthlySalaryDetail[] => {
    const months = [
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
        'January',
        'February',
        'March'
    ];

    return months.map((month, index) => {
        const basicSalary = 50000 + Math.random() * 10000;
        const hra = basicSalary * 0.4;
        const da = basicSalary * 0.2;
        const otherAllowances = 5000 + Math.random() * 3000;
        const grossSalary = basicSalary + hra + da + otherAllowances;
        const pf = basicSalary * 0.12;
        const tax = grossSalary * 0.1;
        const otherDeductions = 1000 + Math.random() * 500;
        const netSalary = grossSalary - pf - tax - otherDeductions;

        return {
            id: index + 1,
            month,
            year,
            basicSalary: Math.round(basicSalary),
            netSalary: Math.round(netSalary),
            createdAt: new Date().toISOString()
        };
    });
};

export default function HRMSMonthEndReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<MonthlySalaryDetail[] | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<MonthlySalaryDetail | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: masterYears, isLoading: masterYearsLoading, isError: masterYearsError } = useMasterYears();

    const YearsOptions =
        masterYears?.data?.map((item: any) => ({
            value: item.key,
            label: item.value
        })) || [];

    const {
        control,
        watch,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(monthEndReportSchema),
        defaultValues: {
            year: ''
        },
        mode: 'onChange'
    });

    const selectedYear = watch('year');

    const columns = getMonthlySalaryDetailColumns((monthData) => {
        setSelectedMonth(monthData);
    });

    // Auto-generate report when year is selected
    useEffect(() => {
        if (selectedYear) {
            generateReport(selectedYear);
        } else {
            setReportData(null);
            setSelectedMonth(null);
        }
    }, [selectedYear]);

    const generateReport = async (year: string) => {
        setIsSearching(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const mockData = generateMockSalaryData(year);
            setReportData(mockData);
            toast.success('Report generated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setReportData(null);
        setSelectedMonth(null);
        toast.info('Report cleared');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleGenerateSlip = () => {
        if (selectedMonth) {
            toast.success(`Generating salary slip for ${selectedMonth.month}`);
        } else {
            toast.warning('Please select a month to generate slip');
        }
    };

    const handleSendMail = () => {
        if (selectedMonth) {
            toast.success(`Sending email for ${selectedMonth.month} salary`);
        } else {
            toast.warning('Please select a month to send email');
        }
    };

    const handleSendSMS = () => {
        if (selectedMonth) {
            toast.success(`Sending SMS for ${selectedMonth.month} salary`);
        } else {
            toast.warning('Please select a month to send SMS');
        }
    };

    const chartData = reportData?.map((item) => ({
        month: item.month.substring(0, 3),
        'Net Salary': item.netSalary,
        'Basic Salary': item.basicSalary
    }));

    return (
        <div className='min-h-screen p-8'>
            <style>
                {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report, #printable-report * {
              visibility: visible;
            }
            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
            </style>

            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Salary Details'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex flex-row justify-center'>
                            <div className='w-full max-w-md space-y-2'>
                                <Label htmlFor='year' className='font-medium text-gray-900 text-sm'>
                                    Financial Year: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Financial Year' />
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
                </CollapsibleSection>

                {reportData && (
                    <div id='printable-report' ref={printRef}>
                        <CollapsibleSection
                            title='Salary Details'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <GenericDataTable<MonthlySalaryDetail>
                                data={reportData}
                                columns={columns}
                                isLoading={isSearching}
                                showViewOptions={true}
                                columnPinning={{ right: ['viewDetails'] }}
                                loadingMessage='Loading salary details...'
                                noDataTitle='No Salary Data Found'
                                noDataDescription='No salary records available for the selected year'
                                errorTitle='Error Loading Salary Data'
                            />

                            <div className='no-print flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                                <Button
                                    onClick={handleGenerateSlip}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    variant='default'>
                                    <FileText className='h-4 w-4' />
                                    Generate Slip
                                </Button>
                                <Button
                                    onClick={handlePrint}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    variant='default'>
                                    <Printer className='h-4 w-4' />
                                    Print
                                </Button>
                                <Button
                                    onClick={handleSendMail}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    variant='default'>
                                    <Mail className='h-4 w-4' />
                                    Send Mail
                                </Button>
                                <Button
                                    onClick={handleSendSMS}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    variant='default'>
                                    <MessageSquare className='h-4 w-4' />
                                    Send SMS
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    className='w-fit transition-all duration-200 hover:scale-105'
                                    variant='outline'>
                                    <X className='h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title='Salary Analytics'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 mt-4 animate-in shadow-lg duration-300'>
                            <div className='space-y-6 p-6'>
                                <div className='mt-4'>
                                    <h3 className='mb-6 text-center font-semibold text-lg'>Monthly Salary Breakdown</h3>
                                    <ResponsiveContainer width='100%' height={400}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='month' angle={-45} textAnchor='end' height={80} />
                                            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                            <Legend />
                                            <Bar dataKey='Basic Salary' fill='#3b82f6' />
                                            <Bar dataKey='Net Salary' fill='#22c55e' />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
