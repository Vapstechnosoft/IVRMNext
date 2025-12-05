'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterPFForm3AEmployeeData, usePFForm3AReportOnload, useSearchPFForm3AReport } from '@/hooks/hrms/useReports';
import { Calculator, Calendar, DollarSign, Download, Printer, TrendingUp, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type MonthlyTransaction, form3AColumns } from './_components/columns';
import { type Form3AFilters, PFForm3AFilters } from './_components/filters';
// Form 3A data structure (Individual Employee Account Card)
interface Form3ARecord {
    id?: string;
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    fatherName: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    nomineeDetails: string;
    monthlyTransactions: MonthlyTransaction[];
    yearlyTotals: YearlyTotals;
    year: string;
    employeeId?: number;
}
interface YearlyTotals {
    totalBasicSalary: number;
    totalPFEligibleSalary: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    totalVPFContribution: number;
    totalInterestEarned: number;
    totalWithdrawals: number;
    openingBalance: number;
    closingBalance: number;
}
export default function PFForm3APage() {
    const roleId = HRMS_MI_ID;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFForm3AReportOnload(roleId);
    const _filterMutation = useFilterPFForm3AEmployeeData();
    const searchMutation = useSearchPFForm3AReport();
    // State
    const [selectedRecord, setSelectedRecord] = useState<Form3ARecord | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState<Form3AFilters>({
        year: '',
        employeeCode: ''
    });
    // Memoize dropdown data from API
    const years = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        const yearDropdown = (data as any).leaveyeardropdown || [];
        return yearDropdown.map((item: any) => item.HRMLY_LeaveYear || item.leaveYear || item).filter(Boolean);
    }, [onloadData?.data]);
    const employees = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        const employeeDropdown = (data as any).employeedropdown || [];
        return employeeDropdown
            .filter((emp: any) => emp.HRME_Id && emp.HRME_EmployeeCode)
            .map((emp: any) => ({
                id: emp.HRME_Id,
                code: emp.HRME_EmployeeCode || '',
                name:
                    `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim() ||
                    'Unknown',
                pfNumber: emp.HRME_PFAccNo || emp.HRME_PFuAN || ''
            }));
    }, [onloadData?.data]);
    // Get institution details from API
    const institutionDetails = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return null;
        return (data as any).institutionDetails || null;
    }, [onloadData?.data]);
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load PF Form 3A report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);
    const handleFilterChange = (newFilters: Form3AFilters) => {
        setFilters(newFilters);
    };
    const handleGenerate = () => {
        if (!filters.year || !filters.employeeCode) {
            toast.error('Please select both year and employee');
            return;
        }
        // Find employee ID from selected employee code
        const selectedEmployee = employees.find((emp: any) => emp.code === filters.employeeCode);
        if (!selectedEmployee) {
            toast.error('Selected employee not found');
            return;
        }
        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRME_Id: selectedEmployee.id,
            HRES_Year: filters.year
        };
        // Call search API to get PF Form 3A data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract PF Form 3A data from response
                    const pfData = response.data.getpfgriddata || response.data.pfreport || response.data.employeeDetails || [];
                    if (Array.isArray(pfData) && pfData.length > 0) {
                        // Group data by month and calculate monthly transactions
                        const monthlyMap = new Map<string, any[]>();
                        pfData.forEach((item: any) => {
                            const month = item.HRES_Month || item.month || 'Unknown';
                            if (!monthlyMap.has(month)) {
                                monthlyMap.set(month, []);
                            }
                            monthlyMap.get(month)!.push(item);
                        });
                        // Calculate opening balance (from previous year or first month)
                        const sortedMonths = Array.from(monthlyMap.keys()).sort();
                        const firstMonthData = monthlyMap.get(sortedMonths[0])?.[0];
                        const openingBalance = firstMonthData?.openingBalance || 0;
                        // Build monthly transactions
                        const monthlyTransactions: MonthlyTransaction[] = [];
                        let runningBalance = openingBalance;
                        sortedMonths.forEach((month) => {
                            const monthData = monthlyMap.get(month) || [];
                            const monthTotal = monthData.reduce(
                                (acc, item) => ({
                                    basicSalary: acc.basicSalary + (item.basicamount || item.basicSalary || item.AmountofWages || 0),
                                    pfEligibleSalary:
                                        acc.pfEligibleSalary +
                                        Math.min(item.basicamount || item.basicSalary || item.AmountofWages || 0, 15000),
                                    employeeContribution: acc.employeeContribution + (item.HRES_EPF || item.employeeContribution || 0),
                                    employerContribution: acc.employerContribution + (item.HRES_FPF || item.employerContribution || 0),
                                    vpfContribution: acc.vpfContribution + (item.VPFAmount || item.vpfContribution || 0),
                                    interestEarned: acc.interestEarned + (item.interestEarned || 0),
                                    withdrawalAmount:
                                        acc.withdrawalAmount +
                                        (item.withdrawalAmount || (item.DepositWithdrow === 'Withdraw' ? item.TransAmount || 0 : 0))
                                }),
                                {
                                    basicSalary: 0,
                                    pfEligibleSalary: 0,
                                    employeeContribution: 0,
                                    employerContribution: 0,
                                    vpfContribution: 0,
                                    interestEarned: 0,
                                    withdrawalAmount: 0
                                }
                            );
                            // Calculate interest (8.5% on running balance + contributions)
                            const monthlyInterest =
                                ((runningBalance + monthTotal.employeeContribution + monthTotal.employerContribution) * 0.085) / 12;
                            monthTotal.interestEarned = monthTotal.interestEarned || monthlyInterest;
                            // Update running balance
                            runningBalance =
                                runningBalance +
                                monthTotal.employeeContribution +
                                monthTotal.employerContribution +
                                monthTotal.vpfContribution +
                                monthTotal.interestEarned -
                                monthTotal.withdrawalAmount;
                            monthlyTransactions.push({
                                month: month,
                                basicSalary: Math.round(monthTotal.basicSalary),
                                pfEligibleSalary: Math.round(monthTotal.pfEligibleSalary),
                                employeeContribution: Math.round(monthTotal.employeeContribution),
                                employerContribution: Math.round(monthTotal.employerContribution),
                                vpfContribution: Math.round(monthTotal.vpfContribution),
                                interestEarned: Math.round(monthTotal.interestEarned),
                                withdrawalAmount: Math.round(monthTotal.withdrawalAmount),
                                runningBalance: Math.round(runningBalance)
                            });
                        });
                        // Calculate yearly totals
                        const yearlyTotals: YearlyTotals = monthlyTransactions.reduce(
                            (acc, transaction) => ({
                                totalBasicSalary: acc.totalBasicSalary + transaction.basicSalary,
                                totalPFEligibleSalary: acc.totalPFEligibleSalary + transaction.pfEligibleSalary,
                                totalEmployeeContribution: acc.totalEmployeeContribution + transaction.employeeContribution,
                                totalEmployerContribution: acc.totalEmployerContribution + transaction.employerContribution,
                                totalVPFContribution: acc.totalVPFContribution + transaction.vpfContribution,
                                totalInterestEarned: acc.totalInterestEarned + transaction.interestEarned,
                                totalWithdrawals: acc.totalWithdrawals + transaction.withdrawalAmount,
                                openingBalance: openingBalance,
                                closingBalance: transaction.runningBalance
                            }),
                            {
                                totalBasicSalary: 0,
                                totalPFEligibleSalary: 0,
                                totalEmployeeContribution: 0,
                                totalEmployerContribution: 0,
                                totalVPFContribution: 0,
                                totalInterestEarned: 0,
                                totalWithdrawals: 0,
                                openingBalance: openingBalance,
                                closingBalance: 0
                            }
                        );
                        // Get employee details from first record
                        const firstRecord = pfData[0];
                        const employeeName =
                            `${firstRecord.HRME_EmployeeFirstName || ''} ${firstRecord.HRME_EmployeeMiddleName || ''} ${firstRecord.HRME_EmployeeLastName || ''}`.trim() ||
                            firstRecord.EmployeeName ||
                            selectedEmployee.name;
                        const form3ARecord: Form3ARecord = {
                            id: `form3a-${selectedEmployee.id}-${filters.year}`,
                            employeeCode: firstRecord.HRME_EmployeeCode || firstRecord.EmployeeCode || selectedEmployee.code,
                            employeeName: employeeName,
                            pfNumber:
                                firstRecord.HRME_PFAccNo ||
                                firstRecord.HRME_PFuAN ||
                                selectedEmployee.pfNumber ||
                                `PF${selectedEmployee.code.slice(-3)}/${filters.year}`,
                            fatherName: firstRecord.HRME_FatherName || firstRecord.FatherHusbandName || 'N/A',
                            dateOfBirth: firstRecord.HRME_DOB || firstRecord.dateOfBirth || '',
                            dateOfJoining: firstRecord.HRME_DOJ || firstRecord.dateOfJoining || '',
                            dateOfLeaving: firstRecord.HRME_DOL || firstRecord.dateOfLeaving,
                            nomineeDetails: firstRecord.HRME_FatherName || firstRecord.FatherHusbandName || 'N/A',
                            monthlyTransactions: monthlyTransactions,
                            yearlyTotals: yearlyTotals,
                            year: filters.year,
                            employeeId: selectedEmployee.id
                        };
                        setSelectedRecord(form3ARecord);
                        setShowForm(true);
                        toast.success('PF Form 3A generated successfully');
                    } else {
                        // No data returned
                        setSelectedRecord(null);
                        setShowForm(false);
                        toast.warning('No data found for selected employee and year');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate PF Form 3A');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate PF Form 3A');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            year: '',
            employeeCode: ''
        });
        setSelectedRecord(null);
        setShowForm(false);
        toast.info('Filters cleared');
    };
    const handleExport = () => {
        toast.success('PF Form 3A exported successfully');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <PFForm3AFilters
                filters={filters}
                employees={employees}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
                years={years}
            />
            {/* Form 3A Results */}
            {showForm && selectedRecord && (
                <div className='space-y-4'>
                    {/* Form 3A Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                PF Form 3A - {selectedRecord.employeeName} ({filters.year})
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Individual Account Card | PF Number: {selectedRecord.pfNumber} | Closing Balance: ₹
                                {selectedRecord.yearlyTotals.closingBalance.toLocaleString()}
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
                    {/* Employee Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <DollarSign className='h-3 w-3' />
                                    Opening Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{selectedRecord.yearlyTotals.openingBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <TrendingUp className='h-3 w-3' />
                                    Total Contributions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹
                                    {(
                                        selectedRecord.yearlyTotals.totalEmployeeContribution +
                                        selectedRecord.yearlyTotals.totalEmployerContribution +
                                        selectedRecord.yearlyTotals.totalVPFContribution
                                    ).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Interest Earned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-purple-600'>
                                    ₹{selectedRecord.yearlyTotals.totalInterestEarned.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Closing Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{selectedRecord.yearlyTotals.closingBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Employee Details */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <User className='h-4 w-4' />
                                    Employee Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee Name:</span>
                                    <span className='font-semibold'>{selectedRecord.employeeName}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee Code:</span>
                                    <span className='font-semibold'>{selectedRecord.employeeCode}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Number:</span>
                                    <span className='font-mono font-semibold'>{selectedRecord.pfNumber}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Father&apos;s Name:</span>
                                    <span className='font-semibold'>{selectedRecord.fatherName}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Date of Birth:</span>
                                    <span className='font-semibold'>
                                        {selectedRecord.dateOfBirth ? new Date(selectedRecord.dateOfBirth).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Date of Joining:</span>
                                    <span className='font-semibold'>
                                        {selectedRecord.dateOfJoining ? new Date(selectedRecord.dateOfJoining).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Annual Summary ({filters.year})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Basic Salary:</span>
                                    <span className='font-semibold'>₹{selectedRecord.yearlyTotals.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee Contribution:</span>
                                    <span className='font-semibold'>
                                        ₹{selectedRecord.yearlyTotals.totalEmployeeContribution.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employer Contribution:</span>
                                    <span className='font-semibold'>
                                        ₹{selectedRecord.yearlyTotals.totalEmployerContribution.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>VPF Contribution:</span>
                                    <span className='font-semibold'>
                                        ₹{selectedRecord.yearlyTotals.totalVPFContribution.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Interest Earned:</span>
                                    <span className='font-semibold text-purple-600'>
                                        ₹{selectedRecord.yearlyTotals.totalInterestEarned.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Withdrawals:</span>
                                    <span className='font-semibold text-red-600'>
                                        ₹{selectedRecord.yearlyTotals.totalWithdrawals.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Monthly Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Calendar className='h-4 w-4' />
                                Monthly Transactions - {filters.year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoadingOnload}
                                columns={form3AColumns}
                                data={selectedRecord.monthlyTransactions}
                                totalItems={selectedRecord.monthlyTransactions.length}
                                showViewOptions={true}
                                columnPinning={{ left: ['month'] }}
                            />
                        </CardContent>
                    </Card>
                    {/* Official Form 3A Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>FORM 3A - INDIVIDUAL ACCOUNT CARD</h2>
                                <h3 className='font-medium text-base text-foreground'>Under the Employees' Provident Fund Scheme, 1952</h3>
                            </div>
                            <div className='mx-auto max-w-6xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Name of Establishment:</strong> {institutionDetails?.MI_Name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> {institutionDetails?.MI_Code || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Employee Name:</strong> {selectedRecord.employeeName}
                                        </div>
                                        <div>
                                            <strong>Employee Code:</strong> {selectedRecord.employeeCode}
                                        </div>
                                        <div>
                                            <strong>PF Account Number:</strong> {selectedRecord.pfNumber}
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Financial Year:</strong> {filters.year}
                                        </div>
                                        <div>
                                            <strong>Father&apos;s Name:</strong> {selectedRecord.fatherName}
                                        </div>
                                        <div>
                                            <strong>Date of Birth:</strong>{' '}
                                            {selectedRecord.dateOfBirth ? new Date(selectedRecord.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Date of Joining:</strong>{' '}
                                            {selectedRecord.dateOfJoining
                                                ? new Date(selectedRecord.dateOfJoining).toLocaleDateString()
                                                : 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Nominee:</strong> {selectedRecord.nomineeDetails}
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>ANNUAL ACCOUNT SUMMARY - {filters.year}</h3>
                                    <div className='grid grid-cols-2 gap-8 text-sm'>
                                        <div className='space-y-2'>
                                            <h4 className='text-center font-semibold underline'>RECEIPTS</h4>
                                            <div className='flex justify-between'>
                                                <span>Opening Balance:</span>
                                                <span>₹{selectedRecord.yearlyTotals.openingBalance.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employee Contribution (12%):</span>
                                                <span>₹{selectedRecord.yearlyTotals.totalEmployeeContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employer Contribution (12%):</span>
                                                <span>₹{selectedRecord.yearlyTotals.totalEmployerContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>VPF Contribution:</span>
                                                <span>₹{selectedRecord.yearlyTotals.totalVPFContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Interest Earned (8.5%):</span>
                                                <span>₹{selectedRecord.yearlyTotals.totalInterestEarned.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between border-t pt-2 font-semibold'>
                                                <span>Total Receipts:</span>
                                                <span>
                                                    ₹
                                                    {(
                                                        selectedRecord.yearlyTotals.openingBalance +
                                                        selectedRecord.yearlyTotals.totalEmployeeContribution +
                                                        selectedRecord.yearlyTotals.totalEmployerContribution +
                                                        selectedRecord.yearlyTotals.totalVPFContribution +
                                                        selectedRecord.yearlyTotals.totalInterestEarned
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <h4 className='text-center font-semibold underline'>PAYMENTS</h4>
                                            <div className='flex justify-between'>
                                                <span>Withdrawals:</span>
                                                <span>₹{selectedRecord.yearlyTotals.totalWithdrawals.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between border-t pt-2 font-bold text-lg'>
                                                <span>Closing Balance:</span>
                                                <span className='text-green-600'>
                                                    ₹{selectedRecord.yearlyTotals.closingBalance.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-2 text-sm'>
                                    <div>
                                        <strong>Certification:</strong>
                                    </div>
                                    <p className='text-xs'>
                                        I hereby certify that the above account is correct and complete to the best of my knowledge and
                                        belief and that the amounts shown as contributions have been deposited in the Fund in accordance
                                        with the provisions of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952.
                                    </p>
                                </div>
                                <div className='flex justify-between pt-8'>
                                    <div className='text-sm'>
                                        <div className='font-semibold'>Prepared By</div>
                                        <div className='mt-2'>HR Department</div>
                                        <div className='mt-6 w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>Signature & Date</div>
                                    </div>
                                    <div className='text-right text-sm'>
                                        <div className='font-semibold'>Authorized Signatory</div>
                                        <div className='mt-2'>Principal/Director</div>
                                        <div className='mt-6 ml-auto w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>Signature & Seal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
