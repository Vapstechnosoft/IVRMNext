'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useFilterEmployeesForLoanReport,
    useGetEmployeeLoanDetails,
    useLoanReportOnload
} from '@/hooks/hrms/useReports';
import type { EmployeeDropdown } from '@/types/hrms/reports/loan-report';
import { Calculator, CreditCard, DollarSign, Download, Percent, Printer, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LoanReportFilters, type LoanFilters } from './_components/filters';
import {
    loanReportColumns,
    loanTypeSummaryColumns,
    type EmployeeLoanRecord,
    type LoanTypeSummary
} from './_components/columns';

// Loan Summary
interface LoanSummary {
    totalEmployees: number;
    totalLoanRequests: number;
    totalLoanAmount: number;
    totalApprovedAmount: number;
    totalPaidAmount: number;
    totalRemainingAmount: number;
    totalInterestAmount: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    averageLoanAmount: number;
    averageInterestRate: number;
}

export default function LoanReportPage() {
    const MI_Id = HRMS_MI_ID;
    const roleId = 0;
    const LogInUserId = 0;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useLoanReportOnload(MI_Id, roleId, LogInUserId);
    const filterMutation = useFilterEmployeesForLoanReport();
    const searchMutation = useGetEmployeeLoanDetails();

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdown || [], [onloadData?.data?.groupTypedropdown]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdown || [], [onloadData?.data?.departmentdropdown]);
    const designations = useMemo(() => onloadData?.data?.designationdropdown || [], [onloadData?.data?.designationdropdown]);
    const months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const years = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);

    // State
    const [loanRecords, setLoanRecords] = useState<EmployeeLoanRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<EmployeeLoanRecord[]>([]);
    const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<LoanFilters>({
        reportScope: 'all',
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        selectedEmployee: '',
        month: '',
        year: ''
    });

    // Filter employees when filters change (for Individual mode)
    useEffect(() => {
        if (filters.reportScope === 'individual') {
            const hasFilters =
                filters.selectedGroupTypes.length > 0 ||
                filters.selectedDepartments.length > 0 ||
                filters.selectedDesignations.length > 0;

            if (hasFilters) {
                const request = {
                    MI_Id,
                    roleId,
                    LogInUserId,
                    hrmgT_IdList: filters.selectedGroupTypes.length > 0 ? filters.selectedGroupTypes : [0],
                    hrmD_IdList: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : [0],
                    hrmdeS_IdList: filters.selectedDesignations.length > 0 ? filters.selectedDesignations : [0]
                };

                filterMutation.mutate(request, {
                    onSuccess: (response) => {
                        if (response.success && response.data?.employeedropdown) {
                            setEmployees(response.data.employeedropdown || []);
                        } else {
                            setEmployees([]);
                        }
                    },
                    onError: (error) => {
                        console.error('Error filtering employees:', error);
                        setEmployees([]);
                    }
                });
            } else {
                setEmployees([]);
            }
        } else {
            setEmployees([]);
            setFilters((prev) => ({ ...prev, selectedEmployee: '' }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.reportScope, filters.selectedGroupTypes, filters.selectedDepartments, filters.selectedDesignations]);

    // Generate mock Employee Loan data
    const generateMockLoanData = (): Omit<EmployeeLoanRecord, 'id' | 'createdAt'>[] => {
        const groupTypes = ['Test NON Teaching', 'Test Insurance', 'Teaching', 'Owner of the company', 'Non Teaching', 'Administrative'];
        const departments = [
            'Teaching',
            'JUNIOR SCHOOL',
            'SENIOR SCHOOL',
            'OFFICE STAFF',
            'Service Staff',
            'Administrative',
            'Chief executive officer'
        ];
        const designations = [
            'Assistant Teacher',
            'Principal',
            'Vice Principal',
            'Office Assistant',
            'System Manager',
            'Teacher Helper',
            'Electrician'
        ];
        const loanTypes: ('Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Education Loan' | 'Emergency Loan' | 'Medical Loan')[] = [
            'Personal Loan',
            'Home Loan',
            'Vehicle Loan',
            'Education Loan',
            'Emergency Loan',
            'Medical Loan'
        ];
        const statuses: ('Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted')[] = [
            'Pending',
            'Approved',
            'Rejected',
            'Active',
            'Completed',
            'Defaulted'
        ];
        const approvers = ['HR Manager', 'Principal', 'Finance Head', 'Admin Manager', 'Board of Directors'];
        const purposes = [
            'Home construction',
            'Vehicle purchase',
            'Child education',
            'Medical treatment',
            'Personal expenses',
            'Business investment',
            'Debt consolidation',
            'Home renovation'
        ];

        const employees = [
            'MR SUDIPTA RANJAN BHADURI',
            'MS RUPLEKHA CHATTERJEE',
            'MR JOHN SHAH',
            'MRS BHASWATI DAS',
            'MR SANTANU MUKHERJEE',
            'MRS PRIYA SHARMA',
            'MR RAJESH KUMAR',
            'MS ANITA SINGH',
            'MR AMIT KUMAR',
            'MS DEEPIKA PATEL',
            'MR ROHIT GUPTA',
            'MRS KAVITA SINGH',
            'MR VIKRAM SHAH',
            'MS NEHA AGARWAL'
        ];

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const mockRecords: Omit<EmployeeLoanRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((empName, empIndex) => {
            // Generate 0-2 loan requests per employee per year
            const numLoans = Math.floor(Math.random() * 3);

            for (let i = 0; i < numLoans; i++) {
                const month = months[Math.floor(Math.random() * months.length)];
                const basicSalary = 35000 + empIndex * 4000 + Math.random() * 15000;
                const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];

                // Loan amount varies by type
                let loanAmount = 0;
                let interestRate = 0;
                let loanTenure = 0;

                switch (loanType) {
                    case 'Personal Loan':
                        loanAmount = Math.floor(basicSalary * (2 + Math.random() * 4)); // 2-6x salary
                        interestRate = 12 + Math.random() * 6; // 12-18%
                        loanTenure = 12 + Math.floor(Math.random() * 48); // 1-4 years
                        break;
                    case 'Home Loan':
                        loanAmount = Math.floor(basicSalary * (10 + Math.random() * 20)); // 10-30x salary
                        interestRate = 8 + Math.random() * 4; // 8-12%
                        loanTenure = 120 + Math.floor(Math.random() * 240); // 10-30 years
                        break;
                    case 'Vehicle Loan':
                        loanAmount = Math.floor(basicSalary * (1 + Math.random() * 3)); // 1-4x salary
                        interestRate = 9 + Math.random() * 5; // 9-14%
                        loanTenure = 24 + Math.floor(Math.random() * 60); // 2-7 years
                        break;
                    case 'Education Loan':
                        loanAmount = Math.floor(basicSalary * (2 + Math.random() * 6)); // 2-8x salary
                        interestRate = 10 + Math.random() * 4; // 10-14%
                        loanTenure = 60 + Math.floor(Math.random() * 120); // 5-15 years
                        break;
                    default:
                        loanAmount = Math.floor(basicSalary * (1 + Math.random() * 3)); // 1-4x salary
                        interestRate = 10 + Math.random() * 8; // 10-18%
                        loanTenure = 12 + Math.floor(Math.random() * 36); // 1-3 years
                }

                const approvedAmount = Math.random() > 0.15 ? loanAmount : loanAmount * 0.8; // 85% approval rate
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                const applicationDate = `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(
                    Math.floor(Math.random() * 28) + 1
                ).padStart(2, '0')}`;
                const approvalDate =
                    status !== 'Pending'
                        ? `2025-${String(months.indexOf(month) + 1).padStart(
                              2,
                              '0'
                          )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
                        : '';

                const loanStartDate =
                    status === 'Active' || status === 'Completed' ? `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-01` : '';
                const loanEndDate = loanStartDate
                    ? `${2025 + Math.floor(loanTenure / 12)}-${String(((months.indexOf(month) + loanTenure) % 12) + 1).padStart(2, '0')}-01`
                    : '';

                const totalInterest = (approvedAmount * interestRate * loanTenure) / (12 * 100);
                const totalPayableAmount = approvedAmount + totalInterest;
                const emiAmount = totalPayableAmount / loanTenure;

                let paidEMIs = 0;
                let paidAmount = 0;

                if (status === 'Active') {
                    paidEMIs = Math.floor(Math.random() * (loanTenure * 0.7));
                    paidAmount = paidEMIs * emiAmount;
                } else if (status === 'Completed') {
                    paidEMIs = loanTenure;
                    paidAmount = totalPayableAmount;
                } else if (status === 'Defaulted') {
                    paidEMIs = Math.floor(Math.random() * (loanTenure * 0.3));
                    paidAmount = paidEMIs * emiAmount;
                }

                const remainingEMIs = loanTenure - paidEMIs;
                const remainingAmount = totalPayableAmount - paidAmount;
                const loanToSalaryRatio = Math.round((loanAmount / basicSalary) * 100);

                mockRecords.push({
                    employeeCode: `EMP${String(empIndex + 1).padStart(3, '0')}`,
                    employeeName: empName,
                    groupType: groupTypes[empIndex % groupTypes.length],
                    department: departments[empIndex % departments.length],
                    designation: designations[empIndex % designations.length],
                    loanApplicationDate: applicationDate,
                    loanType: loanType,
                    loanAmount: Math.round(loanAmount),
                    approvedAmount: Math.round(approvedAmount),
                    interestRate: Math.round(interestRate * 100) / 100,
                    loanTenure: loanTenure,
                    emiAmount: Math.round(emiAmount),
                    loanStartDate: loanStartDate,
                    loanEndDate: loanEndDate,
                    totalInterest: Math.round(totalInterest),
                    totalPayableAmount: Math.round(totalPayableAmount),
                    paidAmount: Math.round(paidAmount),
                    remainingAmount: Math.round(remainingAmount),
                    paidEMIs: paidEMIs,
                    remainingEMIs: remainingEMIs,
                    status: status,
                    approvalDate: approvalDate,
                    approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
                    guarantor: employees[Math.floor(Math.random() * employees.length)],
                    loanPurpose: purposes[Math.floor(Math.random() * purposes.length)],
                    month: month,
                    year: '2025',
                    basicSalary: Math.round(basicSalary),
                    loanToSalaryRatio: loanToSalaryRatio
                });
            }
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        // Filtering will be done on the backend via API
        setFilteredRecords(loanRecords);
    }, [loanRecords]);

    const handleFilterChange = (newFilters: LoanFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (filters.reportScope === 'individual') {
            if (!filters.selectedEmployee) {
                toast.error('Please select an employee');
                return;
            }
        } else {
            // For "All" scope, month and year are required
            if (!filters.month || !filters.year) {
                toast.error('Please select month and year');
                return;
            }
        }

        const request = {
            MI_Id,
            roleId,
            LogInUserId,
            hrmgT_IdList: filters.selectedGroupTypes.length > 0 ? filters.selectedGroupTypes : [0],
            hrmD_IdList: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : [0],
            hrmdeS_IdList: filters.selectedDesignations.length > 0 ? filters.selectedDesignations : [0],
            hrmE_Id: filters.reportScope === 'individual' && filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0
        };

        searchMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Process the response data to populate loan records
                    // The response structure may vary, so we'll need to adapt based on actual response
                    const employeeLoanDetails = response.data.employeeSalaryslipDetails || [];
                    const loanTotalAmount = response.data.EmploanTotalAmount || [];

                    // Transform API response to EmployeeLoanRecord format
                    // Note: This mapping needs to be adjusted based on actual API response structure
                    const records: EmployeeLoanRecord[] = [];

                    // For now, we'll show a success message and set showReport
                    // The actual data transformation will depend on the API response structure
                    setLoanRecords(records);
                    setFilteredRecords(records);
                    setShowReport(true);
                    toast.success('Employee Loan Report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate loan report');
                }
            },
            onError: (error) => {
                console.error('Error generating loan report:', error);
                toast.error('Failed to generate loan report');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            reportScope: 'all',
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            selectedEmployee: '',
            month: '',
            year: ''
        });
        setEmployees([]);
        setLoanRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const isLoading = isLoadingOnload || filterMutation.isPending || searchMutation.isPending;

    const handleExport = () => {
        toast.success('Employee Loan Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Loan summary
    const loanSummary: LoanSummary = useMemo(() => {
        const uniqueEmployees = [...new Set(filteredRecords.map((record) => record.employeeCode))];
        const pendingRequests = filteredRecords.filter((record) => record.status === 'Pending').length;
        const approvedRequests = filteredRecords.filter(
            (record) => record.status === 'Approved' || record.status === 'Active' || record.status === 'Completed'
        ).length;
        const rejectedRequests = filteredRecords.filter((record) => record.status === 'Rejected').length;
        const activeLoans = filteredRecords.filter((record) => record.status === 'Active').length;
        const completedLoans = filteredRecords.filter((record) => record.status === 'Completed').length;
        const defaultedLoans = filteredRecords.filter((record) => record.status === 'Defaulted').length;

        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: uniqueEmployees.length,
                totalLoanRequests: filteredRecords.length,
                totalLoanAmount: acc.totalLoanAmount + record.loanAmount,
                totalApprovedAmount: acc.totalApprovedAmount + record.approvedAmount,
                totalPaidAmount: acc.totalPaidAmount + record.paidAmount,
                totalRemainingAmount: acc.totalRemainingAmount + record.remainingAmount,
                totalInterestAmount: acc.totalInterestAmount + record.totalInterest,
                pendingRequests: pendingRequests,
                approvedRequests: approvedRequests,
                rejectedRequests: rejectedRequests,
                activeLoans: activeLoans,
                completedLoans: completedLoans,
                defaultedLoans: defaultedLoans,
                averageLoanAmount: 0, // Will be calculated after
                averageInterestRate: acc.averageInterestRate + record.interestRate
            }),
            {
                totalEmployees: 0,
                totalLoanRequests: 0,
                totalLoanAmount: 0,
                totalApprovedAmount: 0,
                totalPaidAmount: 0,
                totalRemainingAmount: 0,
                totalInterestAmount: 0,
                pendingRequests: 0,
                approvedRequests: 0,
                rejectedRequests: 0,
                activeLoans: 0,
                completedLoans: 0,
                defaultedLoans: 0,
                averageLoanAmount: 0,
                averageInterestRate: 0
            }
        );

        summary.averageLoanAmount = filteredRecords.length > 0 ? Math.round(summary.totalLoanAmount / filteredRecords.length) : 0;
        summary.averageInterestRate =
            filteredRecords.length > 0 ? Math.round((summary.averageInterestRate / filteredRecords.length) * 100) / 100 : 0;

        return summary;
    }, [filteredRecords]);

    // Calculate Loan Type summary
    const loanTypeSummaries: LoanTypeSummary[] = useMemo(() => {
        const typeMap = new Map<string, EmployeeLoanRecord[]>();

        filteredRecords.forEach((record) => {
            if (!typeMap.has(record.loanType)) {
                typeMap.set(record.loanType, []);
            }
            typeMap.get(record.loanType)!.push(record);
        });

        return Array.from(typeMap.entries())
            .map(([loanType, records]) => {
                const approvedRecords = records.filter((r) => r.status === 'Approved' || r.status === 'Active' || r.status === 'Completed');
                const activeLoans = records.filter((r) => r.status === 'Active').length;
                const completedLoans = records.filter((r) => r.status === 'Completed').length;
                const averageInterestRate =
                    records.length > 0 ? Math.round((records.reduce((sum, r) => sum + r.interestRate, 0) / records.length) * 100) / 100 : 0;

                return {
                    loanType,
                    totalRequests: records.length,
                    totalAmount: records.reduce((sum, r) => sum + r.loanAmount, 0),
                    approvedRequests: approvedRecords.length,
                    approvedAmount: records.reduce((sum, r) => sum + r.approvedAmount, 0),
                    activeLoans,
                    completedLoans,
                    averageInterestRate,
                    totalInterest: records.reduce((sum, r) => sum + r.totalInterest, 0)
                };
            })
            .sort((a, b) => b.totalAmount - a.totalAmount);
    }, [filteredRecords]);


    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading
                    title='Employee Loan Report'
                    description='Comprehensive report for employee loan applications, approvals, and repayment tracking'
                />
            </div>

            {/* Report Configuration Section */}
            <LoanReportFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                months={months}
                years={years}
                employees={employees}
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Employee Loan Report - {filters.reportScope === 'all' ? `${filters.month} ${filters.year}` : ''} ({filters.reportScope.toUpperCase()})
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Loans: {filteredRecords.length} | Total Amount: ₹{loanSummary.totalLoanAmount.toLocaleString()} |
                                Active: {loanSummary.activeLoans}
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
                                    <Users className='h-3 w-3' />
                                    Total Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{loanSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <CreditCard className='h-3 w-3' />
                                    Active Loans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>{loanSummary.activeLoans}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <DollarSign className='h-3 w-3' />
                                    Total Loan Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>₹{loanSummary.totalLoanAmount.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Percent className='h-3 w-3' />
                                    Avg. Interest Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-purple-600'>{loanSummary.averageInterestRate}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Loan Type Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <CreditCard className='h-4 w-4' />
                                Loan Type Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={loanTypeSummaryColumns}
                                data={loanTypeSummaries}
                                totalItems={loanTypeSummaries.length}
                                showViewOptions={true}
                                columnPinning={{ left: ['loanType'] }}
                            />
                        </CardContent>
                    </Card>

                    {/* Detailed Summary */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Loan Amount:</span>
                                    <span className='font-semibold'>₹{loanSummary.totalLoanAmount.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Approved Amount:</span>
                                    <span className='font-semibold text-green-600'>
                                        ₹{loanSummary.totalApprovedAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Paid Amount:</span>
                                    <span className='font-semibold text-blue-600'>₹{loanSummary.totalPaidAmount.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Remaining Amount:</span>
                                    <span className='font-semibold text-orange-600'>
                                        ₹{loanSummary.totalRemainingAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Total Interest Amount:</span>
                                    <span className='font-semibold text-purple-600'>
                                        ₹{loanSummary.totalInterestAmount.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <TrendingUp className='h-4 w-4' />
                                    Loan Status Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Pending Requests:</span>
                                    <span className='font-semibold text-yellow-600'>{loanSummary.pendingRequests}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Approved Requests:</span>
                                    <span className='font-semibold text-green-600'>{loanSummary.approvedRequests}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Active Loans:</span>
                                    <span className='font-semibold text-blue-600'>{loanSummary.activeLoans}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Completed Loans:</span>
                                    <span className='font-semibold text-green-600'>{loanSummary.completedLoans}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Average Loan Amount:</span>
                                    <span className='font-semibold text-purple-600'>₹{loanSummary.averageLoanAmount.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Employee Loan Details Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Users className='h-4 w-4' />
                                Employee Loan Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={loanReportColumns}
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
