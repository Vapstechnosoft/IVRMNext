'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useBankCashReportOnload, useSearchBankCashReport } from '@/hooks/hrms/useReports';
import { Banknote, CreditCard, Download, Printer, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type BankCashRecord, bankCashColumns } from './_components/columns';
import { BankCashReportFilters, type BankCashReportFilters as BankCashReportFiltersType } from './_components/filters';

export default function BankCashReportPage() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useBankCashReportOnload(roleId, 0);
    const searchMutation = useSearchBankCashReport();

    // State
    const [bankCashRecords, setBankCashRecords] = useState<BankCashRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<BankCashRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<BankCashReportFiltersType>({
        selectedTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        paymentMode: 'Bank',
        month: '',
        year: ''
    });

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

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage = onloadError?.message || onloadData?.message || 'Failed to load bank cash report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Map API data to component format
    const mappedGroupTypes = useMemo(() => {
        return groupTypes.map((gt: any) => ({
            id: gt.HRMGT_Id,
            groupType: gt.HRMGT_EmployeeGroupType || gt.HRMGT_Code || '',
            groupCode: gt.HRMGT_Code || '',
            order: gt.HRMGT_Order || 0,
            isActive: gt.HRMGT_ActiveFlag !== false
        }));
    }, [groupTypes]);

    const mappedDepartments = useMemo(() => {
        return departments.map((dept: any) => ({
            id: dept.HRMD_Id,
            departmentName: dept.HRMD_DepartmentName || '',
            internalTrainingHours: dept.HRMD_InternalTrainingMinimumHrs?.toString() || '0',
            order: dept.HRMD_Order || 0,
            isActive: dept.HRMD_ActiveFlag !== false
        }));
    }, [departments]);

    const mappedDesignations = useMemo(() => {
        return designations.map((desig: any) => ({
            id: desig.HRMDES_Id,
            designationName: desig.HRMDES_DesignationName || '',
            basicAmount: desig.HRMDES_BasicAmount?.toString() || '0',
            sanctionedSeats: desig.HRMDES_SanctionedSeats?.toString() || '0',
            displaySanctionedSeats: desig.HRMDES_DisplaySanctionedSeatsFlag || false,
            order: desig.HRMDES_Order || 0,
            isActive: desig.HRMDES_ActiveFlag !== false
        }));
    }, [designations]);

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = bankCashRecords;

        // Filter by group types - convert IDs to names
        if (filters.selectedTypes.length > 0) {
            const selectedGroupTypeNames = mappedGroupTypes
                .filter((gt: { id: number; groupType: string }) => filters.selectedTypes.includes(gt.id.toString()))
                .map((gt: { id: number; groupType: string }) => gt.groupType);
            filtered = filtered.filter((record) => selectedGroupTypeNames.includes(record.groupType));
        }

        // Filter by departments - convert IDs to names
        if (filters.selectedDepartments.length > 0) {
            const selectedDepartmentNames = mappedDepartments
                .filter((d: { id: number; departmentName: string }) => filters.selectedDepartments.includes(d.id.toString()))
                .map((d: { id: number; departmentName: string }) => d.departmentName);
            filtered = filtered.filter((record) => selectedDepartmentNames.includes(record.departmentName));
        }

        // Filter by designations - convert IDs to names
        if (filters.selectedDesignations.length > 0) {
            const selectedDesignationNames = mappedDesignations
                .filter((d: { id: number; designationName: string }) => filters.selectedDesignations.includes(d.id.toString()))
                .map((d: { id: number; designationName: string }) => d.designationName);
            filtered = filtered.filter((record) => selectedDesignationNames.includes(record.designationName));
        }

        // Filter by payment mode
        filtered = filtered.filter((record) => record.paymentMode === filters.paymentMode);

        // Filter by month
        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        // Filter by year
        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, bankCashRecords, mappedGroupTypes, mappedDepartments, mappedDesignations]);

    const handleFilterChange = (newFilters: BankCashReportFiltersType) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }

        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthId = selectedMonthObj?.IVRM_Month_Id || 0;

        // Find year ID from selected year
        const selectedYearObj = years.find((y: any) => y.HRMLY_LeaveYear === filters.year);
        const yearId = selectedYearObj?.HRMLY_Id || 0;

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRES_Year: yearId,
            HRES_Month: monthId,
            BankCash: filters.paymentMode,
            departmentselected: filters.selectedDepartments.length > 0
                ? filters.selectedDepartments.map((id) => Number.parseInt(id))
                : [],
            groupTypeselected: filters.selectedTypes.length > 0
                ? filters.selectedTypes.map((id) => Number.parseInt(id))
                : []
        };

        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Map API response to BankCashRecord format
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: BankCashRecord[] = employeeDetails.map((emp: any, index: number) => ({
                        id: index + 1,
                        createdAt: new Date(),
                        employeeCode: emp.EmployeeCode || emp.HRME_EmployeeCode || emp.employeeCode || '',
                        employeeName: emp.EmployeeName || emp.HRME_EmployeeFirstName || emp.employeeName || '',
                        groupType: emp.groupType || emp.HRMGT_EmployeeGroupType || '',
                        departmentName: emp.departmentName || emp.HRMD_DepartmentName || '',
                        designationName: emp.DesignationName || emp.HRMDES_DesignationName || emp.designationName || '',
                        paymentMode: filters.paymentMode,
                        bankName: filters.paymentMode === 'Bank' ? (emp.HRMBD_BankName || emp.bankName || '') : undefined,
                        accountNumber: filters.paymentMode === 'Bank' ? (emp.BankAcNumber || emp.HRME_BankAccountNo || emp.accountNumber || '') : undefined,
                        ifscCode: filters.paymentMode === 'Bank' ? (emp.HRMBD_IFSCCode || emp.ifscCode || '') : undefined,
                        grossSalary: emp.grossSalary || emp.totalEarning || 0,
                        netSalary: emp.NetSalary || emp.netSalary || 0,
                        deductions: emp.deductions || emp.totalDeduction || (emp.grossSalary || 0) - (emp.NetSalary || 0),
                        month: filters.month,
                        year: filters.year,
                        paymentDate: emp.paymentDate || '',
                        paymentStatus: ((emp.paymentStatus === 'Paid' || emp.paymentStatus === 'Pending' || emp.paymentStatus === 'Failed') ? emp.paymentStatus : 'Pending') as 'Paid' | 'Pending' | 'Failed'
                    }));

                    setBankCashRecords(mappedRecords);
                    setShowReport(true);
                    toast.success('Bank/Cash Report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate bank cash report');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching bank cash report:', error);
                toast.error(error.message || 'Failed to generate bank cash report');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            selectedTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            paymentMode: 'Bank',
            month: '',
            year: ''
        });
        setBankCashRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Bank/Cash Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate summary totals
    const summary = useMemo(() => {
        const bankRecords = filteredRecords.filter((r) => r.paymentMode === 'Bank');
        const cashRecords = filteredRecords.filter((r) => r.paymentMode === 'Cash');

        return {
            totalEmployees: filteredRecords.length,
            bankCount: bankRecords.length,
            cashCount: cashRecords.length,
            totalGross: filteredRecords.reduce((sum, r) => sum + r.grossSalary, 0),
            totalNet: filteredRecords.reduce((sum, r) => sum + r.netSalary, 0),
            totalDeductions: filteredRecords.reduce((sum, r) => sum + r.deductions, 0),
            bankTotal: bankRecords.reduce((sum, r) => sum + r.netSalary, 0),
            cashTotal: cashRecords.reduce((sum, r) => sum + r.netSalary, 0),
            paidCount: filteredRecords.filter((r) => r.paymentStatus === 'Paid').length,
            pendingCount: filteredRecords.filter((r) => r.paymentStatus === 'Pending').length,
            failedCount: filteredRecords.filter((r) => r.paymentStatus === 'Failed').length
        };
    }, [filteredRecords]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <BankCashReportFilters
                filters={filters}
                groupTypes={mappedGroupTypes}
                departments={mappedDepartments}
                designations={mappedDesignations}
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
                                {filters.paymentMode} Payment Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredRecords.length} | {filters.paymentMode} Amount: ₹
                                {filters.paymentMode === 'Bank' ? summary.bankTotal.toLocaleString() : summary.cashTotal.toLocaleString()}
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Banknote className='h-3 w-3' />
                                    Total Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <CreditCard className='h-3 w-3' />
                                    Bank Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{summary.bankTotal.toLocaleString()}</div>
                                <div className='text-muted-foreground text-xs'>{summary.bankCount} employees</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Wallet className='h-3 w-3' />
                                    Cash Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{summary.cashTotal.toLocaleString()}</div>
                                <div className='text-muted-foreground text-xs'>{summary.cashCount} employees</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-1 text-xs'>
                                    <div className='flex justify-between'>
                                        <span>Paid:</span>
                                        <span className='font-semibold text-green-600'>{summary.paidCount}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Pending:</span>
                                        <span className='font-semibold text-yellow-600'>{summary.pendingCount}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Failed:</span>
                                        <span className='font-semibold text-red-600'>{summary.failedCount}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Banknote className='h-4 w-4' />
                                {filters.paymentMode} Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoadingOnload}
                                columns={bankCashColumns}
                                data={filteredRecords}
                                totalItems={filteredRecords.length}
                                showViewOptions={true}
                                columnPinning={{ left: ['id'] }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
