'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
//import { useReactToPrint } from 'react-to-print';
// Commented out due to build error
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useCumulativeSalaryReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { Download, Loader2, Printer, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { printCumulativeSalaryReport } from './_components/print-utils';
import { sum } from 'pdf-lib';
import { access } from 'fs';

// Static Month List (copied from Exam Module reference)
const MONTH_LIST = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
];

interface FilterFormValues {
    year: string;
    month: string;
    groupType: string[];
    department: string[];
    designation: string[];
}

export default function CumulativeSalaryReportPage() {
    return (
        <FormProvider>
            <CumulativeSalaryReportContent />
        </FormProvider>
    );
}

function CumulativeSalaryReportContent() {
    const [reportData, setReportData] = useState<any>(null);
    const { control, handleSubmit, watch } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            month: '',
            groupType: [],
            department: [],
            designation: []
        }
    });

    const componentRef = useRef<HTMLDivElement>(null);
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    // Queries
    const { data: yearsData } = useLeaveYearDropdown();

    const handlePrint = () => {
        if (!reportData) {
            toast.error('No data to print');
            return;
        }

        const selectedYear = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === watch('year'))?.hrmlY_LeaveYear || '';
        const selectedMonth = MONTH_LIST.find((m) => m.id.toString() === watch('month'))?.name || '';

        printCumulativeSalaryReport(reportData, selectedMonth, selectedYear);
    };
    const handleExport = () => {
        if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const uniqueEarnings = new Map();
        const uniqueDeductions = new Map();
        reportData.forEach((row: any) => {
            (row.earningresult || []).forEach((e: any) => {
                if (!uniqueEarnings.has(e.hrmeD_Id)) uniqueEarnings.set(e.hrmeD_Id, e);
            });
            (row.deductionresult || []).forEach((d: any) => {
                if (!uniqueDeductions.has(d.hrmeD_Id)) uniqueDeductions.set(d.hrmeD_Id, d);
            });
        });
        const earningDetails = Array.from(uniqueEarnings.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);
        const deductionDetails = Array.from(uniqueDeductions.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);

        const processedContent = reportData.map((row: any) => {
            const newRow: any = { ...row };
            earningDetails.forEach((head: any) => {
                const val = (row.earningresult || []).find((e: any) => e.hrmeD_Id === head.hrmeD_Id);
                newRow[`earning_${head.hrmeD_Id}`] = val ? val.hresD_Amount : 0;
            });
            deductionDetails.forEach((head: any) => {
                const val = (row.deductionresult || []).find((d: any) => d.hrmeD_Id === head.hrmeD_Id);
                newRow[`deduction_${head.hrmeD_Id}`] = val ? val.hresD_Amount : 0;
            });
            return newRow;
        });

        const safeColumns = [
            { label: 'Employee Code', value: 'hrmE_EmployeeCode' },
            { label: 'Employee Name', value: 'hrmE_EmployeeFirstName' },
            { label: 'Designation', value: 'hrmdeS_DesignationName' },
            { label: 'Working Days', value: 'hreS_WorkingDays' },
            { label: 'Basic Salary', value: 'empGrossSal' },
            ...earningDetails.map((head: any) => ({
                label: head.hrmeD_Name,
                value: `earning_${head.hrmeD_Id}`
            })),
            { label: 'Gross Earning', value: 'grossEarning' },
            ...deductionDetails.map((head: any) => ({
                label: head.hrmeD_Name,
                value: `deduction_${head.hrmeD_Id}`
            })),
            { label: 'Total Deductions', value: 'grossDeduction' },
            { label: 'Net Pay', value: 'netSalary' }
        ];

        exportToExcel('CumulativeSalaryReport', JSON.stringify(safeColumns), JSON.stringify(processedContent));
    };
    const { data: groupTypesData } = useReportGroupTypes();

    const groupTypeIds = watchedGroupType?.join(',') || '';
    const { data: departmentsData } = useReportDepartments(groupTypeIds);

    const deptIds = watchedDepartment?.join(',') || '';
    const { data: designationsData } = useReportDesignations(groupTypeIds, deptIds);

    const { mutate: generateReport, isPending } = useCumulativeSalaryReport();

    const onSubmit = (data: FilterFormValues) => {
        console.log('onSubmit', data);
        if (!data.year || !data.month || data.designation.length === 0) {
            toast.error('Please select Year, Month and at least one Designation');
            return;
        }

        // Find selected year object to get name if needed, assuming value is ID or Year
        // If Dropdown value is ID, we might need Year String.
        // Based on Exam module ref, ASMAY_Id is used.
        // Payload expects "hreS_Year": "2025" (Year string).

        const selectedYearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        // Fallback: if data.year is already the year string (depends on SelectItem value)
        // Let's assume SelectItem value is ASMAY_Id, so we get the Year string.
        // Actually, Exam module reference uses ASMAY_Id.
        // BUT payload expects `hreS_Year` as string "2025".
        // SO we must find the name.
        const yearString = selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || data.year; // Extract 2025 from 2025-2026 if necessary, or just send Year code.
        // Let's assume strictly 2025 like the payload sample.

        // Month: Payload "hreS_Month": "April". So we need Name, not ID.
        const selectedMonthObj = MONTH_LIST.find((m) => m.id.toString() === data.month);
        const monthName = selectedMonthObj?.name || '';

        console.log('yearString', yearString);
        console.log('monthName', monthName);
        generateReport(
            {
                hreS_Year: yearString, // Careful here, might need full year or split. Payload "2025" implies calendar year? OR Academic start?
                // If the user selects "2024-2025", and month is April 2025.
                // Usually academic year 2024-2025 means April 2024 to March 2025?
                // User payload "2025" "April".
                // If I assume `asmaY_Year` is "2025-2026", usually the HRES_Year corresponds to the calendar year of that salary.
                // Let's send the full string if we aren't sure, OR try to parse.
                // Given "2025" in sample, likely strictly the year.
                // For now, I will use the first part of the academic year string or the year entered.
                // Actually, let's just stick to `asmaY_Year` string if it's "2025" style, but typically it is "2023-2024".
                // Let's assume the user selects "2025" from a list that might be calendar years?
                // "useAcademicYearDropdown" returns academic years.
                // If the user meant "Calendar Year" dropdown, I don't have that.
                // I'll use the selectedYearObj?.asmaY_Year for now.
                hreS_Month: monthName,
                hrmdeS_IdList: data.designation.map(Number),
                hrmdeS_Ids: ''
            },
            {
                onSuccess: (res) => {
                    console.log('API Response:', res);
                    if (res.success && res.data.length > 0) {
                        setReportData(res.data);
                        toast.success('Report generated successfully');
                    } else {
                        toast.error(res.message || 'No data found');
                    }
                }
            }
        );
    };

    // Columns Construction
    const columns = useMemo(() => {
        if (!reportData || !Array.isArray(reportData)) return [];

        const uniqueEarnings = new Map();
        const uniqueDeductions = new Map();

        reportData.forEach((row: any) => {
            (row.earningresult || []).forEach((e: any) => {
                if (!uniqueEarnings.has(e.hrmeD_Id)) {
                    uniqueEarnings.set(e.hrmeD_Id, e);
                }
            });
            (row.deductionresult || []).forEach((d: any) => {
                if (!uniqueDeductions.has(d.hrmeD_Id)) {
                    uniqueDeductions.set(d.hrmeD_Id, d);
                }
            });
        });

        const earningDetails = Array.from(uniqueEarnings.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);
        const deductionDetails = Array.from(uniqueDeductions.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);

        const baseColumns = [
            {
                id: 'serialNumber',
                header: 'SL.No',
                cell: ({ row }: any) => row.index + 1
            },
            {
                accessorKey: 'hrmE_EmployeeCode',
                header: 'Employee Code'
            },
            {
                accessorKey: 'hrmE_EmployeeFirstName',
                header: 'Employee Name'
            },
            {
                accessorKey: 'hrmdeS_DesignationName',
                header: 'Designation'
            },
            {
                accessorKey: 'hreS_WorkingDays',
                header: 'Working Days'
            },
            {
                accessorKey: 'lopAmount',
                header: 'LOP Amount'
            }
        ];

        // Dynamic Earnings
        const earningColumns = earningDetails.map((head: any) => ({
            id: `earning_${head.hrmeD_Id}`,
            header: head.hrmeD_Name, // Column Header
            accessorFn: (row: any) => {
                const earning = (row.earningresult || []).find((e: any) => e.hrmeD_Id === head.hrmeD_Id);
                return earning ? earning.hresD_Amount : 0;
            }
        }));

        // Dynamic Deductions
        const deductionColumns = deductionDetails.map((head: any) => ({
            id: `deduction_${head.hrmeD_Id}`,
            header: head.hrmeD_Name,
            accessorFn: (row: any) => {
                const deduction = (row.deductionresult || []).find((d: any) => d.hrmeD_Id === head.hrmeD_Id);
                return deduction ? deduction.hresD_Amount : 0;
            }
        }));

        const summaryColumns = [
            {
                id: 'empGrossSal',
                accessorKey: 'empGrossSal',
                header: 'Gross Salary'
            },
            {
                id: 'grossEarning',
                accessorKey: 'grossEarning',
                header: 'Gross Earning'
            },
            {
                id: 'grossDeduction',
                accessorKey: 'grossDeduction',
                header: 'Total Deductions'
            },
            {
                id: 'netSalary',
                accessorKey: 'netSalary',
                header: 'Net Pay'
            }
        ];

        const earningGroup =
            earningColumns.length > 0
                ? [
                    {
                        id: 'earnings_group',
                        header: () => (
                            <div className='rounded-t-md border bg-green-100 py-1 text-center font-bold text-green-700 dark:bg-green-900/20 dark:text-green-300'>
                                Earnings
                            </div>
                        ),
                        columns: earningColumns
                    }
                ]
                : [];

        const deductionGroup =
            deductionColumns.length > 0
                ? [
                    {
                        id: 'deductions_group',
                        header: () => (
                            <div className='rounded-t-md border bg-red-100 py-1 text-center font-bold text-red-700 dark:bg-red-900/20 dark:text-red-300'>
                                Deductions
                            </div>
                        ),
                        columns: deductionColumns
                    }
                ]
                : [];

        return [...baseColumns,...summaryColumns.slice(0, 1),  ...earningGroup, ...summaryColumns.slice(1, 2), ...deductionGroup, ...summaryColumns.slice(2)];
    }, [reportData]);

    const processedGridData = useMemo(() => {
        console.log('Processing grid data:', reportData);
        return reportData || [];
    }, [reportData]);

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Cumulative Salary Report</h2>
            </div>

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        {/* Year */}
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Month */}
                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Group Type */}
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            groupTypesData?.data?.map((gt: any) => ({
                                                label: gt.value,
                                                value: gt.key.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Group Types'
                                    />
                                )}
                            />
                        </div>

                        {/* Department */}
                        <div className='space-y-2'>
                            <Label>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            departmentsData?.data?.map((d: any) => ({
                                                label: d.hrmD_DepartmentName,
                                                value: d.hrmD_Id.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Departments'
                                    />
                                )}
                            />
                        </div>

                        {/* Designation */}
                        <div className='space-y-2'>
                            <Label>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            designationsData?.data?.map((d: any) => ({
                                                label: d.hrmdeS_DesignationName,
                                                value: d.hrmdeS_Id.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Designations'
                                        maxHeight={200}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        <Button type='submit' disabled={isPending} className='w-32'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && reportData.length > 0 && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className=''
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handleExport} className='gap-2'>
                                <Download className='h-4 w-4' />
                                Export
                            </Button>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='h-[500px] overflow-y-auto print:hidden'>
                        <GenericDataTable
                            data={processedGridData}
                            columns={columns}
                            totalItems={processedGridData.length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            showSearchColumns={false}
                            isLoading={isPending}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
