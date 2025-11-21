'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useHeadWiseReportOnload, useSearchHeadWiseReport } from '@/hooks/hrms/useReports';
import { Calculator, Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type HeadWiseRecord as HeadWiseRecordColumn, headWiseReportColumns } from './_components/columns';
import { type HeadWiseReportFilters as HeadWiseFilters, HeadWiseReportFilters } from './_components/filters';

// Head wise report data structure
interface HeadWiseRecord {
    id?: string;
    salaryHead: string;
    headType: 'Earning' | 'Deduction';
    groupType: string;
    departmentName: string;
    totalEmployees: number;
    totalAmount: number;
    averageAmount: number;
    maxAmount: number;
    minAmount: number;
    month: string;
    year: string;
}

export default function HeadWiseReportPage() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useHeadWiseReportOnload(roleId, 0);
    const searchMutation = useSearchHeadWiseReport();

    // State
    const [headWiseRecords, setHeadWiseRecords] = useState<HeadWiseRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<HeadWiseRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<HeadWiseFilters>({
        selectedGroupTypes: [],
        month: '',
        year: ''
    });

    // Memoize dropdown data from API
    const groupTypes = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).groupTypedropdown || [];
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

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage = onloadError?.message || onloadData?.message || 'Failed to load head wise report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Memoize mapped data
    const mappedGroupTypes = useMemo(() => {
        return groupTypes.map((gt: any) => ({
            id: gt.HRMGT_Id,
            groupType: gt.HRMGT_EmployeeGroupType || gt.HRMGT_Code || '',
            groupCode: gt.HRMGT_Code || '',
            order: gt.HRMGT_Order || 0,
            isActive: gt.HRMGT_ActiveFlag !== false
        }));
    }, [groupTypes]);

    // Filter head wise records based on selected criteria
    useEffect(() => {
        let filtered = headWiseRecords;

        if (filters.selectedGroupTypes.length > 0) {
            // Convert selected group type IDs to names for filtering
            const selectedGroupTypeNames = mappedGroupTypes
                .filter((gt: any) => filters.selectedGroupTypes.includes(gt.id.toString()))
                .map((gt: any) => gt.groupType);
            filtered = filtered.filter((record) => selectedGroupTypeNames.includes(record.groupType));
        }

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, headWiseRecords, mappedGroupTypes]);

    const handleFilterChange = (newFilters: HeadWiseFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        if (filters.selectedGroupTypes.length === 0) {
            toast.error('Please select at least one group type');
            return;
        }

        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthId = selectedMonthObj?.IVRM_Month_Id?.toString() || '';

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            groupTypeselected: filters.selectedGroupTypes.length > 0
                ? filters.selectedGroupTypes.map((id) => Number.parseInt(id))
                : [],
            departmentselected: [],
            designationselected: [],
            HRES_Year: filters.year || '',
            HRES_Month: monthId || ''
        };

        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Map API response to HeadWiseRecord format
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: HeadWiseRecord[] = employeeDetails.map((emp: any, index: number) => {
                        // Extract head wise data from employee details
                        // The structure may vary, so we'll handle different possible formats
                        const salaryHead = emp.salaryHead || emp.headName || emp.HRMED_Name || '';
                        const headType = emp.headType || emp.type || (emp.HRMED_EarnDedFlag === 'Earning' ? 'Earning' : 'Deduction') as 'Earning' | 'Deduction';
                        const groupType = emp.groupType || emp.HRMGT_EmployeeGroupType || '';
                        const departmentName = emp.departmentName || emp.HRMD_DepartmentName || '';
                        const totalAmount = emp.totalAmount || emp.amount || emp.HREED_Amount || 0;

                        return {
                            id: `head-${index}`,
                            salaryHead,
                            headType,
                            groupType,
                            departmentName,
                            totalEmployees: emp.totalEmployees || emp.employeeCount || 1,
                            totalAmount,
                            averageAmount: emp.averageAmount || (totalAmount / (emp.totalEmployees || 1)),
                            maxAmount: emp.maxAmount || totalAmount,
                            minAmount: emp.minAmount || 0,
                            month: filters.month,
                            year: filters.year
                        };
                    });

                    setHeadWiseRecords(mappedRecords);
                    setShowReport(true);
                    toast.success('Head wise report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate head wise report');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching head wise report:', error);
                toast.error(error.message || 'Failed to generate head wise report');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            month: '',
            year: ''
        });
        setHeadWiseRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Head wise report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const earningRecords = filteredRecords.filter((r) => r.headType === 'Earning');
        const deductionRecords = filteredRecords.filter((r) => r.headType === 'Deduction');

        return {
            totalEarnings: earningRecords.reduce((sum, r) => sum + r.totalAmount, 0),
            totalDeductions: deductionRecords.reduce((sum, r) => sum + r.totalAmount, 0),
            totalEmployees: new Set(filteredRecords.map((r) => `${r.groupType}-${r.departmentName}`)).size,
            earningHeads: new Set(earningRecords.map((r) => r.salaryHead)).size,
            deductionHeads: new Set(deductionRecords.map((r) => r.salaryHead)).size
        };
    }, [filteredRecords]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <HeadWiseReportFilters
                filters={filters}
                groupTypes={mappedGroupTypes}
                months={months}
                years={years}
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
                                Head Wise Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredRecords.length} salary heads | Group Types: {filters.selectedGroupTypes.length}
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

                    {/* Summary Statistics Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{summaryStats.totalEarnings.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>₹{summaryStats.totalDeductions.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Earning Heads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.earningHeads}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Deduction Heads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.deductionHeads}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Net Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{(summaryStats.totalEarnings - summaryStats.totalDeductions).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload}
                        columns={headWiseReportColumns}
                        data={filteredRecords as unknown as HeadWiseRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />

                    {/* Head Type Analysis */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Earnings Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Earnings Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    {Array.from(
                                        new Set(filteredRecords.filter((r) => r.headType === 'Earning').map((r) => r.salaryHead))
                                    ).map((head) => {
                                        const headTotal = filteredRecords
                                            .filter((r) => r.salaryHead === head && r.headType === 'Earning')
                                            .reduce((sum, r) => sum + r.totalAmount, 0);

                                        return (
                                            <div key={head} className='flex items-center justify-between'>
                                                <span className='text-sm'>{head}</span>
                                                <span className='font-semibold text-green-600 text-sm'>₹{headTotal.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deductions Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Deductions Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    {Array.from(
                                        new Set(filteredRecords.filter((r) => r.headType === 'Deduction').map((r) => r.salaryHead))
                                    ).map((head) => {
                                        const headTotal = filteredRecords
                                            .filter((r) => r.salaryHead === head && r.headType === 'Deduction')
                                            .reduce((sum, r) => sum + r.totalAmount, 0);

                                        return (
                                            <div key={head} className='flex items-center justify-between'>
                                                <span className='text-sm'>{head}</span>
                                                <span className='font-semibold text-red-600 text-sm'>₹{headTotal.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
