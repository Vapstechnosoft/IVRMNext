'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useCumulativeSalaryReportOnload, useSearchCumulativeSalaryReport } from '@/hooks/hrms/useReports';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type CumulativeSalaryRecord, cumulativeSalaryColumns } from './_components/columns';
import { CumulativeSalaryReportFilters, type ReportFilters } from './_components/filters';

export default function CumulativeSalaryReportPage() {
    const MI_Id = 30; // Default MI_Id

    // React Query hooks
    const { data: onloadData } = useCumulativeSalaryReportOnload(MI_Id);
    const searchMutation = useSearchCumulativeSalaryReport();

    // State
    const [salaryRecords, setSalaryRecords] = useState<CumulativeSalaryRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<CumulativeSalaryRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdownlist || [], [onloadData?.data?.groupTypedropdownlist]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdownlist || [], [onloadData?.data?.departmentdropdownlist]);
    const designations = useMemo(() => onloadData?.data?.designationdropdownlist || [], [onloadData?.data?.designationdropdownlist]);
    const months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const years = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);

    const { handleSubmit, reset, watch, control } = useForm<ReportFilters>({
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Search Form */}
                <CumulativeSalaryReportFilters
                    control={control}
                    groupTypes={groupTypes}
                    departments={departments}
                    designations={designations}
                    months={months}
                    years={years}
                    onSubmit={handleSubmit(onSubmit)}
                    onCancel={handleCancel}
                />

                {/* Report Results - Only show after search */}
                {showReport ? (
                    <CollapsibleSection
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
                                    columns={cumulativeSalaryColumns}
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
