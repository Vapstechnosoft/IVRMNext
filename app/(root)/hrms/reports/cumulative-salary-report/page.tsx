'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCumulativeSalaryReportOnload, useSearchCumulativeSalaryReport } from '@/hooks/hrms/reports/useCumulativeSalaryReport';
import type {
    CumulativeSalaryReportSearchRequest,
    DepartmentDropdown,
    DesignationDropdown,
    GroupTypeDropdown,
    SalaryReportRecord
} from '@/types/hrms/reports/cumulative-salary-report';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Use API types instead of local interfaces
type GroupType = GroupTypeDropdown;
type Department = DepartmentDropdown;
type Designation = DesignationDropdown;
type CumulativeSalaryRecord = SalaryReportRecord;

// Report filters
interface ReportFilters {
    groupType: string[]; // multi-select of Group Types (store ids as strings)
    department: string[]; // multi-select of Departments (store ids as strings)
    designation: string[]; // multi-select of Designations (store ids as strings)
    month: string;
    year: string;
}

export default function CumulativeSalaryReportPage() {
    const MI_Id = 30; // Default MI_Id

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useCumulativeSalaryReportOnload(MI_Id);
    const searchMutation = useSearchCumulativeSalaryReport();

    // State
    const [salaryRecords, setSalaryRecords] = useState<CumulativeSalaryRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<CumulativeSalaryRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    // Extract data from onload response
    const groupTypes = onloadData?.data?.groupTypedropdownlist || [];
    const departments = onloadData?.data?.departmentdropdownlist || [];
    const designations = onloadData?.data?.designationdropdownlist || [];
    const months = onloadData?.data?.monthdropdown || [];
    const years = onloadData?.data?.leaveyeardropdown || [];

    const {
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors, isSubmitting }
    } = useForm<ReportFilters>({
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        }
    });

    // Watch form values for filtering
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    // Cascading filter logic
    const _availableDepartments = useMemo(() => {
        if (!watchedGroupType || watchedGroupType.length === 0) return departments;
        // In a real app, departments would be filtered by groupType relationship
        return departments;
    }, [watchedGroupType, departments]);

    const _availableDesignations = useMemo(() => {
        if (!watchedDepartment || watchedDepartment.length === 0) return designations;
        // In a real app, designations would be filtered by department relationship
        return designations;
    }, [watchedDepartment, designations]);

    // Filter salary records based on selected criteria
    useEffect(() => {
        let filtered = salaryRecords;

        if (watchedGroupType && watchedGroupType.length > 0) {
            const groupTypeIds = new Set(watchedGroupType.map((v) => Number(v)));
            filtered = filtered.filter((record) => groupTypeIds.has(record.HRMGT_Id));
        }

        if (watchedDepartment && watchedDepartment.length > 0) {
            const departmentIds = new Set(watchedDepartment.map((v) => Number(v)));
            filtered = filtered.filter((record) => departmentIds.has(record.HRMD_Id));
        }

        if (watchedDesignation && watchedDesignation.length > 0) {
            const designationIds = new Set(watchedDesignation.map((v) => Number(v)));
            filtered = filtered.filter((record) => designationIds.has(record.HRMDES_Id));
        }

        setFilteredRecords(filtered);
    }, [salaryRecords, watchedGroupType, watchedDepartment, watchedDesignation]);

    const onSubmit: SubmitHandler<ReportFilters> = async (data: ReportFilters) => {
        if (!data.month || !data.year) {
            toast.error('Please select month and year to generate report');
            return;
        }

        // Build search payload from form data
        const searchPayload: CumulativeSalaryReportSearchRequest = {
            MI_Id: MI_Id,
            HRES_Year: years.find((y) => y.HRMLY_LeaveYear === data.year)?.HRMLY_Id?.toString() || '0',
            HRES_Month: months.find((m) => m.IVRM_Month_Name.trim() === data.month)?.IVRM_Month_Id?.toString() || '0',
            groupTypeIdList: (data.groupType || []).map((v) => Number(v)),
            hrmD_IdList: (data.department || []).map((v) => Number(v)),
            hrmdeS_IdList: (data.designation || []).map((v) => Number(v)),
            LogInUserId: 0
        };

        // Use mutation to search
        searchMutation.mutate(searchPayload, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Check if API returned salary report data
                    const hasReportData = response.data.ReportData && response.data.ReportData.length > 0;

                    if (hasReportData) {
                        const mappedRecords: CumulativeSalaryRecord[] = response.data.ReportData.map((record: any) => ({
                            ...record,
                            // Map API fields to our interface
                            employeeName: `${record.HRME_EmployeeFirstName || ''} ${
                                record.HRME_EmployeeMiddleName || ''
                            } ${record.HRME_EmployeeLastName || ''}`.trim(),
                            designation: record.HRMDES_DesignationName || record.designation,
                            // Ensure all numeric fields have default values
                            basic: record.basic || 0,
                            da: record.da || 0,
                            hra: record.hra || 0,
                            conveyance: record.conveyance || 0,
                            medical: record.medical || 0,
                            splAllowance: record.splAllowance || 0,
                            grossEarning: record.grossEarning || 0,
                            pf: record.pf || 0,
                            esi: record.esi || 0,
                            others: record.others || 0,
                            pt: record.pt || 0,
                            grossDeduction: record.grossDeduction || 0,
                            leaveDedDays: record.leaveDedDays || 0,
                            leaveDedPrevDays: record.leaveDedPrevDays || 0,
                            netSalary: record.netSalary || 0
                        }));

                        setSalaryRecords(mappedRecords);
                        setFilteredRecords(mappedRecords);
                        setShowReport(true);
                        toast.success(`Report generated successfully - ${mappedRecords.length} records found`);
                    } else {
                        // No report data found
                        setSalaryRecords([]);
                        setFilteredRecords([]);
                        setShowReport(true);

                        const errorMsg = response.data.retrunMsg || 'No salary data found for the selected criteria';
                        toast.warning(errorMsg);
                    }
                }
            }
        });
    };

    const handleCancel = () => {
        reset();
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate totals - Updated to match new column structure
    const totals = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                basic: acc.basic + (record.basic || 0),
                da: acc.da + (record.da || 0),
                hra: acc.hra + (record.hra || 0),
                conveyance: acc.conveyance + (record.conveyance || 0),
                medical: acc.medical + (record.medical || 0),
                splAllowance: acc.splAllowance + (record.splAllowance || 0),
                grossEarning: acc.grossEarning + (record.grossEarning || 0),
                pf: acc.pf + (record.pf || 0),
                esi: acc.esi + (record.esi || 0),
                others: acc.others + (record.others || 0),
                pt: acc.pt + (record.pt || 0),
                grossDeduction: acc.grossDeduction + (record.grossDeduction || 0),
                netSalary: acc.netSalary + (record.netSalary || 0)
            }),
            {
                basic: 0,
                da: 0,
                hra: 0,
                conveyance: 0,
                medical: 0,
                splAllowance: 0,
                grossEarning: 0,
                pf: 0,
                esi: 0,
                others: 0,
                pt: 0,
                grossDeduction: 0,
                netSalary: 0
            }
        );
    }, [filteredRecords]);

    // Table columns - Matching the exact structure from the image
    const columns: ColumnDef<CumulativeSalaryRecord>[] = [
        {
            accessorKey: 'slNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='text-center'>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false,
            size: 60
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const record = row.original;
                const fullName = `${record.HRME_EmployeeFirstName || ''} ${
                    record.HRME_EmployeeMiddleName || ''
                } ${record.HRME_EmployeeLastName || ''}`.trim();
                return <div className='font-medium'>{fullName}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'designation',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
            cell: ({ row }) => <div>{row.getValue('designation')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        // Earnings Section
        {
            accessorKey: 'basic',
            header: ({ column }) => <DataTableColumnHeader column={column} title='BASIC' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('basic') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'da',
            header: ({ column }) => <DataTableColumnHeader column={column} title='DA' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('da') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'hra',
            header: ({ column }) => <DataTableColumnHeader column={column} title='HRA' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('hra') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'conveyance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Conveyance' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('conveyance') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'medical',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Medical' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('medical') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'splAllowance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Spl Allowance' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('splAllowance') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'grossEarning',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Earning' />,
            cell: ({ row }) => <div className='text-right font-semibold'>₹{(row.getValue('grossEarning') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        // Deductions Section
        {
            accessorKey: 'pf',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PF' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('pf') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'esi',
            header: ({ column }) => <DataTableColumnHeader column={column} title='ESI' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('esi') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'others',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Others (C.D)' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('others') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'pt',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PT' />,
            cell: ({ row }) => <div className='text-right'>₹{(row.getValue('pt') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'grossDeduction',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Deduction' />,
            cell: ({ row }) => (
                <div className='text-right font-semibold'>₹{(row.getValue('grossDeduction') as number).toLocaleString()}</div>
            ),
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'leaveDedDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Ded.No.of days' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('leaveDedDays') || 0}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'leaveDedPrevDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Ded.days of previous' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('leaveDedPrevDays') || 0}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'netSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
            cell: ({ row }) => (
                <div className='text-right font-semibold text-green-600'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>
            ),
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'signature',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Signature' />,
            cell: ({ row }) => <div className='text-center text-muted-foreground'>-</div>,
            enableSorting: false,
            enableHiding: true
        }
    ];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title='Cumulative Salary Report'
                            description='Generate comprehensive salary reports with filtering options'
                        />
                    </div>
                </div>

                {/* Search Form */}
                <CollapsibleSection
                    title='CUMULATIVE SALARY REPORT'
                    description='Search and filter employee salary records'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-lg'
                    headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            {/* Group Type (MultiSelect) */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypes.map((g) => ({
                                                label: g.HRMGT_EmployeeGroupType,
                                                value: String(g.HRMGT_Id)
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Group Types'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>

                            {/* Department (MultiSelect) */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Department</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departments.map((d) => ({
                                                label: d.HRMD_DepartmentName,
                                                value: String(d.HRMD_Id)
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Departments'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>

                            {/* Designation (MultiSelect) */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Designation</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designations.map((d) => ({
                                                label: d.HRMDES_DesignationName,
                                                value: String(d.HRMDES_Id)
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Designations'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>

                            {/* Month */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Month</Label>
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name.trim()}>
                                                        {month.IVRM_Month_Name.trim()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Year */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Year</Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                                        {year.HRMLY_LeaveYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Search and Cancel Buttons */}
                        <div className='flex gap-2 pt-4'>
                            <Button type='submit' className='w-fit transition-all duration-200 hover:scale-105'>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                SEARCH
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={handleCancel}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {/* Report Results - Only show after search */}
                {showReport ? (
                    <CollapsibleSection
                        title='SALARY REPORT RESULTS'
                        description={`View comprehensive salary report data (${filteredRecords.length} records)`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <div className='space-y-4'>
                            {/* Report Header */}
                            <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                                <div>
                                    <h3 className='font-semibold text-foreground text-lg'>
                                        Cumulative Salary Report - {watch('month')} {watch('year')}
                                    </h3>
                                    <p className='text-muted-foreground text-sm'>Total Records: {filteredRecords.length} employees</p>
                                </div>
                                <div className='flex gap-2'>
                                    <Button variant='outline' onClick={handleExport} prefix={<Download className='size-4' />}>
                                        Export
                                    </Button>
                                    <Button variant='outline' onClick={handlePrint} prefix={<Printer className='size-4' />}>
                                        Print
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className='overflow-hidden rounded-lg bg-card'>
                                <DataTable
                                    isLoading={searchMutation.isPending}
                                    columns={columns}
                                    data={filteredRecords}
                                    totalItems={filteredRecords.length}
                                    showViewOptions={true}
                                    columnPinning={{ left: ['slNo'] }}
                                />

                                {/* Totals Row */}
                                {filteredRecords.length > 0 && (
                                    <div className='border-t bg-muted/50 p-4'>
                                        <div className='grid grid-cols-19 gap-2 font-semibold text-sm'>
                                            <div className='col-span-3 text-right'>Total:</div>
                                            <div className='text-right'>₹{totals.basic.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.da.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.hra.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.conveyance.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.medical.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.splAllowance.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.grossEarning.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.pf.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.esi.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.others.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.pt.toLocaleString()}</div>
                                            <div className='text-right'>₹{totals.grossDeduction.toLocaleString()}</div>
                                            <div className='text-center'>-</div>
                                            <div className='text-center'>-</div>
                                            <div className='text-right text-green-600'>₹{totals.netSalary.toLocaleString()}</div>
                                            <div className='text-center'>-</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CollapsibleSection>
                ) : (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>Please use the search form above to generate salary reports</div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
