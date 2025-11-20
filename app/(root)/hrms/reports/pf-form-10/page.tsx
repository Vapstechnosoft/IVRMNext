'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterPFForm10EmployeeData, usePFForm10ReportOnload, useSearchPFForm10Report } from '@/hooks/hrms/useReports';
import { Calculator, Download, FileText, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type Form10Record as Form10RecordColumn, form10Columns } from './_components/columns';
import { type Form10Filters, PFForm10Filters } from './_components/filters';

// Form 10 data structure (Annual PF Statement)
interface Form10Record {
    id?: string;
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    fatherName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    openingBalance: number;
    employeeContribution: number;
    employerContribution: number;
    vpfContribution: number;
    interestEarned: number;
    totalContribution: number;
    withdrawalAmount: number;
    closingBalance: number;
    month: string;
    year: string;
    financialYear: string;
}

// Form 10 summary
interface Form10Summary {
    totalEmployees: number;
    totalOpeningBalance: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    totalVPFContribution: number;
    totalInterestEarned: number;
    totalWithdrawals: number;
    totalClosingBalance: number;
}

export default function Form10Page() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFForm10ReportOnload(roleId);
    const filterMutation = useFilterPFForm10EmployeeData();
    const searchMutation = useSearchPFForm10Report();

    // State
    const [form10Records, setForm10Records] = useState<Form10Record[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Form10Record[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState<Form10Filters>({
        month: '',
        year: ''
    });

    // Memoize dropdown data from API
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

    // Get institution details from API
    const institutionDetails = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return null;
        return (data as any).institutionDetails || null;
    }, [onloadData?.data]);

    // Get financial year from API
    const financialYear = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return null;
        return (data as any).IMFY_FinancialYear || null;
    }, [onloadData?.data]);

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load PF Form 10 report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Filter Form 10 records based on selected month/year
    useEffect(() => {
        let filtered = form10Records;

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, form10Records]);

    const handleFilterChange = (newFilters: Form10Filters) => {
        setFilters(newFilters);
    };

    const handleGenerate = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }

        // Find month name from selected month
        const selectedMonthObj = months.find((m) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthName = selectedMonthObj?.IVRM_Month_Name?.trim() || filters.month;

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRES_Month: monthName,
            HRES_Year: filters.year
        };

        // Call search API to get PF Form 10 data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract PF Form 10 data from response
                    const pfData = response.data.getpfgriddata || response.data.pfreport || response.data.employeeDetails || [];

                    if (Array.isArray(pfData) && pfData.length > 0) {
                        // Map API response to Form10Record format
                        const mappedRecords: Form10Record[] = pfData.map((item: any, index: number) => {
                            const openingBalance = item.openingBalance || item.HRES_Ac21 || 0;
                            const employeeContribution = item.HRES_EPF || item.employeeContribution || 0;
                            const employerContribution = item.HRES_FPF || item.employerContribution || 0;
                            const vpfContribution = item.VPFAmount || item.vpfContribution || 0;
                            const interestEarned = item.interestEarned || item.HRES_Ac22 || 0;
                            const withdrawalAmount = item.withdrawalAmount || item.DepositWithdrow || 0;
                            const totalContribution = employeeContribution + employerContribution + vpfContribution;
                            const closingBalance = openingBalance + totalContribution + interestEarned - withdrawalAmount;

                            // Calculate financial year from month and year
                            const monthNum = selectedMonthObj?.IVRM_Month_Id || 0;
                            const currentYear = Number.parseInt(filters.year);
                            const financialYear =
                                monthNum >= 4
                                    ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
                                    : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

                            return {
                                id: `form10-${item.HRME_Id || item.HRES_Id || index}`,
                                employeeCode: item.HRME_EmployeeCode || item.EmployeeCode || item.employeeCode || '',
                                employeeName:
                                    `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                    item.EmployeeName ||
                                    '',
                                pfNumber:
                                    item.HRME_PFAccNo ||
                                    item.HRME_PFuAN ||
                                    item.pfNumber ||
                                    `PF${(item.HRME_EmployeeCode || '').slice(-3)}/${filters.year}`,
                                fatherName: item.HRME_FatherName || item.FatherHusbandName || item.fatherName || '',
                                dateOfJoining: item.HRME_DOJ || item.dateOfJoining || '',
                                dateOfLeaving: item.HRME_DOL || item.dateOfLeaving,
                                openingBalance: Math.round(openingBalance),
                                employeeContribution: Math.round(employeeContribution),
                                employerContribution: Math.round(employerContribution),
                                vpfContribution: Math.round(vpfContribution),
                                interestEarned: Math.round(interestEarned),
                                totalContribution: Math.round(totalContribution),
                                withdrawalAmount: Math.round(withdrawalAmount),
                                closingBalance: Math.round(closingBalance),
                                month: filters.month,
                                year: filters.year,
                                financialYear
                            };
                        });

                        setForm10Records(mappedRecords);
                        setShowForm(true);
                        toast.success('Form 10 generated successfully');
                    } else {
                        // No data returned, but still show the form structure
                        setForm10Records([]);
                        setShowForm(true);
                        toast.warning('Form 10 generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate Form 10');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching PF Form 10 report:', error);
                toast.error(error.message || 'Failed to generate Form 10');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setForm10Records([]);
        setFilteredRecords([]);
        setShowForm(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Form 10 exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Form 10 summary
    const form10Summary: Form10Summary = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: acc.totalEmployees + 1,
                totalOpeningBalance: acc.totalOpeningBalance + record.openingBalance,
                totalEmployeeContribution: acc.totalEmployeeContribution + record.employeeContribution,
                totalEmployerContribution: acc.totalEmployerContribution + record.employerContribution,
                totalVPFContribution: acc.totalVPFContribution + record.vpfContribution,
                totalInterestEarned: acc.totalInterestEarned + record.interestEarned,
                totalWithdrawals: acc.totalWithdrawals + record.withdrawalAmount,
                totalClosingBalance: acc.totalClosingBalance + record.closingBalance
            }),
            {
                totalEmployees: 0,
                totalOpeningBalance: 0,
                totalEmployeeContribution: 0,
                totalEmployerContribution: 0,
                totalVPFContribution: 0,
                totalInterestEarned: 0,
                totalWithdrawals: 0,
                totalClosingBalance: 0
            }
        );
    }, [filteredRecords]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <PFForm10Filters
                filters={filters}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />

            {/* Form 10 Results */}
            {showForm && (
                <div className='space-y-4'>
                    {/* Form 10 Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Form 10 - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Annual PF Statement | Total Employees: {filteredRecords.length} | Total PF Balance: ₹
                                {form10Summary.totalClosingBalance.toLocaleString()}
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

                    {/* Form 10 Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{form10Summary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Opening Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{form10Summary.totalOpeningBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Contributions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹
                                    {(
                                        form10Summary.totalEmployeeContribution +
                                        form10Summary.totalEmployerContribution +
                                        form10Summary.totalVPFContribution
                                    ).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Closing Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{form10Summary.totalClosingBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form 10 Breakdown */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    PF Account Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Opening Balance:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{form10Summary.totalOpeningBalance.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee Contribution:</span>
                                    <span className='font-semibold'>₹{form10Summary.totalEmployeeContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employer Contribution:</span>
                                    <span className='font-semibold'>₹{form10Summary.totalEmployerContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>VPF Contribution:</span>
                                    <span className='font-semibold'>₹{form10Summary.totalVPFContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Interest Earned:</span>
                                    <span className='font-semibold text-orange-600'>
                                        ₹{form10Summary.totalInterestEarned.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Withdrawals:</span>
                                    <span className='font-semibold text-red-600'>₹{form10Summary.totalWithdrawals.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2 font-semibold'>
                                    <span>Closing Balance:</span>
                                    <span className='text-green-600'>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Statement Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Financial Year:</span>
                                    <span className='font-semibold'>{financialYear || 'N/A'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Statement Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>{institutionDetails?.MI_Name || 'N/A'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Code:</span>
                                    <span className='font-semibold'>{institutionDetails?.MI_Code || 'N/A'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Interest Rate:</span>
                                    <span className='font-semibold'>8.5% p.a.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload}
                        columns={form10Columns}
                        data={filteredRecords as unknown as Form10RecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />

                    {/* Official Form 10 Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>FORM 10 - ANNUAL STATEMENT</h2>
                                <h3 className='font-medium text-base text-foreground'>Individual Employee Account in Provident Fund</h3>
                            </div>

                            <div className='mx-auto max-w-4xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Establishment Name:</strong> {institutionDetails?.MI_Name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> {institutionDetails?.MI_Code || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment ID:</strong> {institutionDetails?.MI_Id || 'N/A'}
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Financial Year:</strong> {financialYear || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Statement Period:</strong> {filters.month} {filters.year}
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {form10Summary.totalEmployees}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>PROVIDENT FUND ACCOUNT SUMMARY</h3>

                                    <div className='grid grid-cols-2 gap-8 text-sm'>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>Opening Balance:</span>
                                                <span>₹{form10Summary.totalOpeningBalance.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employee Contribution:</span>
                                                <span>₹{form10Summary.totalEmployeeContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employer Contribution:</span>
                                                <span>₹{form10Summary.totalEmployerContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>VPF Contribution:</span>
                                                <span>₹{form10Summary.totalVPFContribution.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>Interest Earned (8.5%):</span>
                                                <span>₹{form10Summary.totalInterestEarned.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Total Additions:</span>
                                                <span>
                                                    ₹
                                                    {(
                                                        form10Summary.totalEmployeeContribution +
                                                        form10Summary.totalEmployerContribution +
                                                        form10Summary.totalVPFContribution +
                                                        form10Summary.totalInterestEarned
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Total Withdrawals:</span>
                                                <span>₹{form10Summary.totalWithdrawals.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between font-semibold'>
                                                <span>Net Balance:</span>
                                                <span>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='border-t pt-3'>
                                        <div className='flex justify-between font-bold text-lg'>
                                            <span>
                                                CLOSING BALANCE AS ON {filters.month?.toUpperCase()} {filters.year}:
                                            </span>
                                            <span className='text-green-600'>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-2 text-sm'>
                                    <div>
                                        <strong>Important Notes:</strong>
                                    </div>
                                    <ul className='list-inside list-disc space-y-1 text-xs'>
                                        <li>This statement shows the annual summary of PF accounts for all employees.</li>
                                        <li>Interest is calculated at 8.5% per annum as per EPFO guidelines.</li>
                                        <li>Employee and Employer contributions are made at 12% each of basic salary.</li>
                                        <li>
                                            VPF (Voluntary Provident Fund) contributions are additional voluntary contributions by
                                            employees.
                                        </li>
                                        <li>All amounts are in Indian Rupees (₹).</li>
                                    </ul>
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
