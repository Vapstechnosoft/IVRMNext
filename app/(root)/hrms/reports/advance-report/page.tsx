'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { createLocalCrud } from '@/lib/localdb';
import { Calculator, CreditCard, DollarSign, Download, FileText, Printer, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type EmployeeAdvanceRecord, advanceReportColumns, advanceTypeSummaryColumns } from './_components/columns';
import { type AdvanceFilters, AdvanceReportFilters, type FilterOptions } from './_components/filters';

// Advance Summary
interface AdvanceSummary {
    totalEmployees: number;
    totalAdvanceRequests: number;
    totalAdvanceAmount: number;
    totalApprovedAmount: number;
    totalRecoveredAmount: number;
    totalRemainingAmount: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    fullyRecoveredRequests: number;
    averageAdvanceAmount: number;
}

// Advance Type Summary
interface AdvanceTypeSummary {
    advanceType: string;
    totalRequests: number;
    totalAmount: number;
    approvedRequests: number;
    approvedAmount: number;
    recoveredAmount: number;
    remainingAmount: number;
}

export default function AdvanceReportPage() {
    // Database instances
    const advanceDB = createLocalCrud<EmployeeAdvanceRecord>('report:employee-advance');

    // State
    const [advanceRecords, setAdvanceRecords] = useState<EmployeeAdvanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<EmployeeAdvanceRecord[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        groupTypes: [],
        departments: [],
        designations: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<AdvanceFilters>({
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        month: '',
        year: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Employee Advance records
            let recordList = advanceDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockAdvanceData();
                mockData.forEach((record) => advanceDB.create(record));
                recordList = advanceDB.list(); // Reload data after creating mock records
            }
            setAdvanceRecords(recordList);

            // Extract filter options
            const groupTypes = [...new Set(recordList.map((r) => r.groupType))];
            const departments = [...new Set(recordList.map((r) => r.department))];
            const designations = [...new Set(recordList.map((r) => r.designation))];

            setFilterOptions({
                groupTypes,
                departments,
                designations
            });
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock Employee Advance data
    const generateMockAdvanceData = (): Omit<EmployeeAdvanceRecord, 'id' | 'createdAt'>[] => {
        const groupTypes = ['Test NON Teaching', 'Test Insurance', 'Teaching', 'Owner of the company', 'Non Teaching', 'Administrative'];
        const departments = ['Teaching', 'JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'Service Staff', 'Administrative', 'Principal'];
        const designations = [
            'Assistant Teacher',
            'Principal',
            'Vice Principal',
            'Office Assistant',
            'System Manager',
            'Teacher Helper',
            'Electrician'
        ];
        const advanceTypes: ('Salary Advance' | 'Festival Advance' | 'Medical Advance' | 'Emergency Advance' | 'Travel Advance')[] = [
            'Salary Advance',
            'Festival Advance',
            'Medical Advance',
            'Emergency Advance',
            'Travel Advance'
        ];
        const statuses: ('Pending' | 'Approved' | 'Rejected' | 'Partially Recovered' | 'Fully Recovered')[] = [
            'Pending',
            'Approved',
            'Rejected',
            'Partially Recovered',
            'Fully Recovered'
        ];
        const approvers = ['HR Manager', 'Principal', 'Finance Head', 'Admin Manager'];
        const reasons = [
            'Medical emergency',
            'Festival expenses',
            'Home renovation',
            'Child education fees',
            'Marriage expenses',
            'Travel expenses',
            'Personal loan repayment',
            'Family emergency'
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
            'MRS KAVITA SINGH'
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
        const mockRecords: Omit<EmployeeAdvanceRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((empName, empIndex) => {
            // Generate 1-3 advance requests per employee per year
            const numAdvances = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numAdvances; i++) {
                const month = months[Math.floor(Math.random() * months.length)];
                const basicSalary = 30000 + empIndex * 3000 + Math.random() * 10000;
                const advanceAmount = Math.floor(basicSalary * (0.2 + Math.random() * 0.5)); // 20-70% of basic salary
                const approvedAmount = Math.random() > 0.1 ? advanceAmount : advanceAmount * 0.8; // 90% approval rate
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const advanceType = advanceTypes[Math.floor(Math.random() * advanceTypes.length)];

                const requestDate = `2025-${String(months.indexOf(month) + 1).padStart(
                    2,
                    '0'
                )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
                const approvalDate =
                    status !== 'Pending'
                        ? `2025-${String(months.indexOf(month) + 1).padStart(
                              2,
                              '0'
                          )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
                        : '';

                const totalInstallments = Math.floor(Math.random() * 12) + 1; // 1-12 installments
                const installmentAmount = Math.floor(approvedAmount / totalInstallments);

                let recoveredAmount = 0;
                if (status === 'Fully Recovered') {
                    recoveredAmount = approvedAmount;
                } else if (status === 'Partially Recovered') {
                    recoveredAmount = Math.floor(approvedAmount * (0.1 + Math.random() * 0.8));
                }

                const remainingAmount = approvedAmount - recoveredAmount;
                const advancePercentage = Math.round((advanceAmount / basicSalary) * 100);

                mockRecords.push({
                    employeeCode: `EMP${String(empIndex + 1).padStart(3, '0')}`,
                    employeeName: empName,
                    groupType: groupTypes[empIndex % groupTypes.length],
                    department: departments[empIndex % departments.length],
                    designation: designations[empIndex % designations.length],
                    advanceRequestDate: requestDate,
                    advanceType: advanceType,
                    advanceAmount: Math.round(advanceAmount),
                    approvedAmount: Math.round(approvedAmount),
                    advanceReason: reasons[Math.floor(Math.random() * reasons.length)],
                    approvalDate: approvalDate,
                    approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
                    recoveryStartDate:
                        status === 'Approved' || status.includes('Recovered')
                            ? `2025-${String(months.indexOf(month) + 2).padStart(2, '0')}-01`
                            : '',
                    recoveryEndDate:
                        status === 'Approved' || status.includes('Recovered')
                            ? `2025-${String(months.indexOf(month) + totalInstallments + 1).padStart(2, '0')}-01`
                            : '',
                    totalInstallments: totalInstallments,
                    installmentAmount: installmentAmount,
                    recoveredAmount: Math.round(recoveredAmount),
                    remainingAmount: Math.round(remainingAmount),
                    status: status,
                    month: month,
                    year: '2025',
                    basicSalary: Math.round(basicSalary),
                    advancePercentage: advancePercentage
                });
            }
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = advanceRecords;

        // Filter by group types
        if (filters.selectedGroupTypes.length > 0) {
            filtered = filtered.filter((record) => filters.selectedGroupTypes.includes(record.groupType));
        }

        // Filter by departments
        if (filters.selectedDepartments.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDepartments.includes(record.department));
        }

        // Filter by designations
        if (filters.selectedDesignations.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDesignations.includes(record.designation));
        }

        // Filter by month
        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        // Filter by year
        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, advanceRecords]);

    const handleSearch = () => {
        setShowReport(true);
        toast.success('Employee Advance Report generated');
    };

    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            month: '',
            year: ''
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleFilterChange = (newFilters: AdvanceFilters) => {
        setFilters(newFilters);
    };

    const handleExport = () => {
        toast.success('Employee Advance Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Advance summary
    const advanceSummary: AdvanceSummary = useMemo(() => {
        const uniqueEmployees = [...new Set(filteredRecords.map((record) => record.employeeCode))];
        const pendingRequests = filteredRecords.filter((record) => record.status === 'Pending').length;
        const approvedRequests = filteredRecords.filter(
            (record) => record.status === 'Approved' || record.status.includes('Recovered')
        ).length;
        const rejectedRequests = filteredRecords.filter((record) => record.status === 'Rejected').length;
        const fullyRecoveredRequests = filteredRecords.filter((record) => record.status === 'Fully Recovered').length;

        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: uniqueEmployees.length,
                totalAdvanceRequests: filteredRecords.length,
                totalAdvanceAmount: acc.totalAdvanceAmount + record.advanceAmount,
                totalApprovedAmount: acc.totalApprovedAmount + record.approvedAmount,
                totalRecoveredAmount: acc.totalRecoveredAmount + record.recoveredAmount,
                totalRemainingAmount: acc.totalRemainingAmount + record.remainingAmount,
                pendingRequests: pendingRequests,
                approvedRequests: approvedRequests,
                rejectedRequests: rejectedRequests,
                fullyRecoveredRequests: fullyRecoveredRequests,
                averageAdvanceAmount: 0 // Will be calculated after
            }),
            {
                totalEmployees: 0,
                totalAdvanceRequests: 0,
                totalAdvanceAmount: 0,
                totalApprovedAmount: 0,
                totalRecoveredAmount: 0,
                totalRemainingAmount: 0,
                pendingRequests: 0,
                approvedRequests: 0,
                rejectedRequests: 0,
                fullyRecoveredRequests: 0,
                averageAdvanceAmount: 0
            }
        );

        summary.averageAdvanceAmount = filteredRecords.length > 0 ? Math.round(summary.totalAdvanceAmount / filteredRecords.length) : 0;

        return summary;
    }, [filteredRecords]);

    // Calculate Advance Type summary
    const advanceTypeSummaries: AdvanceTypeSummary[] = useMemo(() => {
        const typeMap = new Map<string, EmployeeAdvanceRecord[]>();

        filteredRecords.forEach((record) => {
            if (!typeMap.has(record.advanceType)) {
                typeMap.set(record.advanceType, []);
            }
            typeMap.get(record.advanceType)!.push(record);
        });

        return Array.from(typeMap.entries())
            .map(([advanceType, records]) => {
                const approvedRecords = records.filter((r) => r.status === 'Approved' || r.status.includes('Recovered'));

                return {
                    advanceType,
                    totalRequests: records.length,
                    totalAmount: records.reduce((sum, r) => sum + r.advanceAmount, 0),
                    approvedRequests: approvedRecords.length,
                    approvedAmount: records.reduce((sum, r) => sum + r.approvedAmount, 0),
                    recoveredAmount: records.reduce((sum, r) => sum + r.recoveredAmount, 0),
                    remainingAmount: records.reduce((sum, r) => sum + r.remainingAmount, 0)
                };
            })
            .sort((a, b) => b.totalAmount - a.totalAmount);
    }, [filteredRecords]);

    return (
        <div className='space-y-6'>

            {/* Report Configuration Section */}
            <AdvanceReportFilters
                filters={filters}
                filterOptions={filterOptions}
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
                                Employee Advance Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Requests: {filteredRecords.length} | Total Amount: ₹
                                {advanceSummary.totalAdvanceAmount.toLocaleString()} | Pending: {advanceSummary.pendingRequests}
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
                                <div className='font-semibold text-foreground text-lg'>{advanceSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <CreditCard className='h-3 w-3' />
                                    Total Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>{advanceSummary.totalAdvanceRequests}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <DollarSign className='h-3 w-3' />
                                    Total Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹{advanceSummary.totalAdvanceAmount.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <TrendingUp className='h-3 w-3' />
                                    Recovered Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{advanceSummary.totalRecoveredAmount.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advance Type Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <CreditCard className='h-4 w-4' />
                                Advance Type Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={advanceTypeSummaryColumns}
                                data={advanceTypeSummaries}
                                totalItems={advanceTypeSummaries.length}
                                showViewOptions={true}
                                columnPinning={{ left: ['advanceType'] }}
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
                                    <span className='text-sm'>Total Advance Amount:</span>
                                    <span className='font-semibold'>₹{advanceSummary.totalAdvanceAmount.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Approved Amount:</span>
                                    <span className='font-semibold text-green-600'>
                                        ₹{advanceSummary.totalApprovedAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Recovered Amount:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{advanceSummary.totalRecoveredAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Remaining Amount:</span>
                                    <span className='font-semibold text-orange-600'>
                                        ₹{advanceSummary.totalRemainingAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Average Advance Amount:</span>
                                    <span className='font-semibold text-purple-600'>
                                        ₹{advanceSummary.averageAdvanceAmount.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Request Status Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Pending Requests:</span>
                                    <span className='font-semibold text-yellow-600'>{advanceSummary.pendingRequests}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Approved Requests:</span>
                                    <span className='font-semibold text-green-600'>{advanceSummary.approvedRequests}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Rejected Requests:</span>
                                    <span className='font-semibold text-red-600'>{advanceSummary.rejectedRequests}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Fully Recovered:</span>
                                    <span className='font-semibold text-blue-600'>{advanceSummary.fullyRecoveredRequests}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Report Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Employee Advance Details Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Users className='h-4 w-4' />
                                Employee Advance Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={advanceReportColumns}
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
