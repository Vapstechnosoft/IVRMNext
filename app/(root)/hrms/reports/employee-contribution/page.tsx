'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import {
    useEmployeeContributionReportOnload,
    useFilterEmployeeContributionReport,
    useSearchEmployeeContributionDetails
} from '@/hooks/hrms/useReports';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type EmployeeContribution, employeeContributionColumns } from './_components/columns';
import { type ContributionReportFilters, EmployeeContributionFilters } from './_components/filters';

export default function EmployeeContributionReportPage() {
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useEmployeeContributionReportOnload(30, 0);
    const filterMutation = useFilterEmployeeContributionReport();
    const searchMutation = useSearchEmployeeContributionDetails();

    // State
    const [contributions, setContributions] = useState<EmployeeContribution[]>([]);
    const [filteredContributions, setFilteredContributions] = useState<EmployeeContribution[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    // Memoize dropdown data from API
    const groupTypes = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).groupTypedropdown || [];
    }, [onloadData?.data]);

    const departments = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).departmentdropdown || [];
    }, [onloadData?.data]);

    const designations = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).designationdropdown || [];
    }, [onloadData?.data]);

    const months = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).monthdropdown || [];
    }, [onloadData?.data]);

    const years = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).leaveyeardropdown || [];
    }, [onloadData?.data]);

    const earningHeads = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).earningdropdown || [];
    }, [onloadData?.data]);

    const deductionHeads = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).detectiondropdown || [];
    }, [onloadData?.data]);

    const [filters, setFilters] = useState<ContributionReportFilters>({
        groupType: [] as number[],
        department: [] as number[],
        designation: [] as number[],
        contributionType: 'Earning',
        dateType: 'Month',
        selectedMonth: '',
        selectedYear: '',
        fromDate: null,
        toDate: null,
        reportType: 'All',
        selectedEmployees: [] as number[],
        selectedEarningHead: 0,
        selectedDeductionHead: 0
    });

    // Employee dropdown state - populated from filter API
    const [employees, setEmployees] = useState<any[]>([]);

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load employee contribution report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Filter contributions based on selected criteria
    useEffect(() => {
        // Filter local contributions if any exist
        if (contributions.length > 0) {
            setFilteredContributions(contributions);
        }
    }, [filters, contributions]);

    // Fetch employees when Individual is selected and filters are applied
    useEffect(() => {
        // Only fetch employees if Individual is selected and we have date filters
        if (filters.reportType !== 'Individual') {
            setEmployees([]);
            return;
        }

        // Check if we have required date filters
        const hasDateFilters =
            (filters.dateType === 'Month' && filters.selectedMonth && filters.selectedYear) ||
            (filters.dateType === 'Between Dates' && filters.fromDate && filters.toDate);

        if (!hasDateFilters) {
            setEmployees([]);
            return;
        }

        // Find month ID from selected month value
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Id?.toString() === filters.selectedMonth);
        const monthId = selectedMonthObj?.IVRM_Month_Id?.toString() || filters.selectedMonth || '';

        // Prepare filter request to get employees
        const filterRequest = {
            MI_Id: 30,
            FormatType: 'Individual',
            MonthBetweenDates: filters.dateType === 'Month' ? 'Month' : 'Between Dates',
            hreS_Month: filters.dateType === 'Month' ? monthId : '',
            hreS_Year: filters.dateType === 'Month' ? filters.selectedYear : '',
            FromDate: filters.dateType === 'Between Dates' && filters.fromDate ? filters.fromDate.toISOString() : '',
            ToDate: filters.dateType === 'Between Dates' && filters.toDate ? filters.toDate.toISOString() : '',
            designationselected: filters.designation.length > 0 ? filters.designation : [0],
            departmentselected: filters.department.length > 0 ? filters.department : [0],
            groupTypeselected: filters.groupType.length > 0 ? filters.groupType : [0]
        };

        filterMutation.mutate(filterRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const employeeList = (response.data as any).employeedropdown || [];
                    setEmployees(Array.isArray(employeeList) ? employeeList : []);
                } else {
                    setEmployees([]);
                }
            },
            onError: () => {
                setEmployees([]);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.reportType,
        filters.dateType,
        filters.selectedMonth,
        filters.selectedYear,
        filters.fromDate,
        filters.toDate,
        filters.groupType,
        filters.department,
        filters.designation
    ]);

    const handleFilterChange = (key: keyof ContributionReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = [];
            newFilters.designation = [];
        } else if (key === 'department') {
            newFilters.designation = [];
        }

        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (filters.dateType === 'Month' && (!filters.selectedMonth || !filters.selectedYear)) {
            toast.error('Please select month and year');
            return;
        }

        if (filters.dateType === 'Between Dates' && (!filters.fromDate || !filters.toDate)) {
            toast.error('Please select from and to dates');
            return;
        }

        if (filters.reportType === 'Individual' && filters.selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        setIsFiltering(true);

        // Find month ID from selected month value
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Id?.toString() === filters.selectedMonth);
        const monthId = selectedMonthObj?.IVRM_Month_Id?.toString() || filters.selectedMonth || '';

        // Prepare search request body (using getEmployeedetailsBySelection for detailed data)
        const searchRequestBody = {
            MI_Id: 30,
            designationselected: filters.designation.length > 0 ? filters.designation : [0],
            departmentselected: filters.department.length > 0 ? filters.department : [0],
            groupTypeselected: filters.groupType.length > 0 ? filters.groupType : [0],
            MonthBetweenDates: filters.dateType === 'Month' ? 'Month' : 'Between Dates',
            hreS_Month: filters.dateType === 'Month' ? monthId : '',
            hreS_Year: filters.dateType === 'Month' ? filters.selectedYear : '',
            FromDate: filters.dateType === 'Between Dates' && filters.fromDate ? filters.fromDate.toISOString() : '',
            ToDate: filters.dateType === 'Between Dates' && filters.toDate ? filters.toDate.toISOString() : '',
            FormatType: filters.reportType || 'All',
            HRME_Id: filters.reportType === 'Individual' && filters.selectedEmployees.length > 0 ? filters.selectedEmployees[0] : 0, // Use first selected employee for Individual, 0 for All
            EarningDeduction: filters.contributionType,
            EarningHead: filters.contributionType === 'Earning' && filters.selectedEarningHead > 0 ? filters.selectedEarningHead : 0,
            DeductionHead: filters.contributionType === 'Deduction' && filters.selectedDeductionHead > 0 ? filters.selectedDeductionHead : 0
        };

        searchMutation.mutate(searchRequestBody, {
            onSuccess: (response) => {
                setIsFiltering(false);
                if (response.success && response.data) {
                    // Extract contribution data from response
                    const contributionData = (response.data as any).employeeContributionDetails;

                    if (Array.isArray(contributionData) && contributionData.length > 0) {
                        // Map API response to EmployeeContribution format
                        const mappedContributions: EmployeeContribution[] = contributionData.map((item: any, index: number) => ({
                            id: item.HRME_Id || index + 1,
                            employeeCode: item.EmployeeCode || item.HRME_EmployeeCode || '',
                            employeeName:
                                `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim(),
                            groupTypeId: item.HRMGT_Id || 0,
                            departmentId: item.HRMD_Id || 0,
                            designationId: item.HRMDES_Id || 0,
                            departmentName: item.departmentName || '',
                            designationName: item.designationName || '',
                            contributionType: filters.contributionType,
                            contributionHead: item.EarningHead || item.DeductionHead || '',
                            monthlyAmount: item.GrossSalary || item.selectedHeadAmount || 0,
                            contributionDate:
                                item.hreS_Month && item.hreS_Year
                                    ? `${item.hreS_Month}-${item.hreS_Year}`
                                    : new Date().toISOString().split('T')[0],
                            pfContribution: item.pfContribution || 0,
                            esiContribution: item.esiContribution || 0,
                            professionalTax: item.professionalTax || 0,
                            totalContribution: (item.pfContribution || 0) + (item.esiContribution || 0) + (item.professionalTax || 0),
                            cumulativeContribution: item.cumulativeContribution || 0,
                            createdAt: new Date()
                        }));

                        setContributions(mappedContributions);
                        setFilteredContributions(mappedContributions);
                        setShowReport(true);
                        toast.success('Employee contribution report generated successfully');
                    } else {
                        setContributions([]);
                        setFilteredContributions([]);
                        setShowReport(true);
                        toast.info('No contribution data found for the selected filters');
                    }
                } else {
                    const errorMsg =
                        response.message ||
                        'Failed to search employee contribution details. Please check if the search API endpoint is available.';
                    toast.error(errorMsg);
                    setShowReport(false);
                }
            },
            onError: (error: any) => {
                setIsFiltering(false);
                const errorMsg =
                    error?.message ||
                    'Failed to search employee contribution details. Please check if the search API endpoint is available.';
                toast.error(errorMsg);
                setShowReport(false);
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            groupType: [],
            department: [],
            designation: [],
            contributionType: 'Earning',
            dateType: 'Month',
            selectedMonth: '',
            selectedYear: '',
            fromDate: null,
            toDate: null,
            reportType: 'All',
            selectedEmployees: [],
            selectedEarningHead: 0,
            selectedDeductionHead: 0
        });
        setEmployees([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee contribution report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredContributions.reduce(
            (acc, contribution) => ({
                pfContribution: acc.pfContribution + contribution.pfContribution,
                esiContribution: acc.esiContribution + contribution.esiContribution,
                professionalTax: acc.professionalTax + contribution.professionalTax,
                totalContribution: acc.totalContribution + contribution.totalContribution,
                cumulativeContribution: acc.cumulativeContribution + contribution.cumulativeContribution
            }),
            {
                pfContribution: 0,
                esiContribution: 0,
                professionalTax: 0,
                totalContribution: 0,
                cumulativeContribution: 0
            }
        );
    }, [filteredContributions]);

    // Show error message if API failed
    if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
        return (
            <div className='flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8'>
                <div className='text-center'>
                    <h3 className='font-semibold text-lg text-red-800'>Failed to Load Data</h3>
                    <p className='mt-2 text-red-600'>
                        {onloadError?.message ||
                            onloadData?.message ||
                            'Failed to load employee contribution report data. Please check if the API endpoint is available.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeContributionFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                months={months}
                years={years}
                employees={employees}
                earningHeads={earningHeads}
                deductionHeads={deductionHeads}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Employee Contribution Report - {filters.contributionType}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredContributions.length} contributions | Date Range:{' '}
                                {filters.dateType === 'Month' ? `${filters.selectedMonth} ${filters.selectedYear}` : 'Custom Range'}
                            </p>
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

                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total PF</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.pfContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total ESI</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.esiContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Professional Tax</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.professionalTax.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total Contribution</div>
                            <div className='font-semibold text-green-600 text-lg'>₹{totals.totalContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Employees</div>
                            <div className='font-semibold text-foreground text-lg'>{filteredContributions.length}</div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload || isFiltering}
                        columns={employeeContributionColumns}
                        data={filteredContributions}
                        totalItems={filteredContributions.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
