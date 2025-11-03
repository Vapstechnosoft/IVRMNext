'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Calculator, Calendar, DollarSign, Download, Printer, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Form 3A data structure (Individual Employee Account Card)
interface Form3ARecord extends BaseEntity {
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
}

interface MonthlyTransaction {
    month: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeeContribution: number;
    employerContribution: number;
    vpfContribution: number;
    interestEarned: number;
    withdrawalAmount: number;
    runningBalance: number;
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

// Employee data for dropdown
interface Employee {
    code: string;
    name: string;
    pfNumber: string;
}

// Report filters
interface Form3AFilters {
    year: string;
    employeeCode: string;
}

export default function PFForm3APage() {
    // Database instances
    const form3ADB = createLocalCrud<Form3ARecord>('report:pf-form3a');

    // State
    const [form3ARecords, setForm3ARecords] = useState<Form3ARecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<Form3ARecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState<Form3AFilters>({
        year: '',
        employeeCode: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Form 3A records
            let recordList = form3ADB.list();
            if (recordList.length === 0) {
                const mockData = generateMockForm3AData();
                mockData.forEach((record) => form3ADB.create(record));
                recordList = form3ADB.list(); // Reload data after creating mock records
            }
            setForm3ARecords(recordList);

            // Extract unique employees for dropdown
            const uniqueEmployees = recordList.map((record) => ({
                code: record.employeeCode,
                name: record.employeeName,
                pfNumber: record.pfNumber
            }));

            // Remove duplicates based on employee code
            const employeeMap = new Map();
            uniqueEmployees.forEach((emp) => {
                if (!employeeMap.has(emp.code)) {
                    employeeMap.set(emp.code, emp);
                }
            });

            setEmployees(Array.from(employeeMap.values()));
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock Form 3A data
    const generateMockForm3AData = (): Omit<Form3ARecord, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                father: 'LATE RANJAN BHADURI',
                dob: '1985-03-15',
                joining: '2020-04-01'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                father: 'MR SUBRATA CHATTERJEE',
                dob: '1988-07-22',
                joining: '2021-06-15'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                father: 'MR DINESH SHAH',
                dob: '1982-11-10',
                joining: '2019-08-20'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                father: 'MR KRISHNA DAS',
                dob: '1990-05-18',
                joining: '2022-01-10'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                father: 'MR BIMAL MUKHERJEE',
                dob: '1987-09-25',
                joining: '2020-11-25'
            }
        ];

        const years = ['2023', '2024', '2025'];
        const months = [
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
            'January',
            'February',
            'March'
        ];
        const mockRecords: Omit<Form3ARecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((emp, empIndex) => {
            years.forEach((year) => {
                const baseOpeningBalance = empIndex * 50000 + Number.parseInt(year) * 1000;
                let runningBalance = baseOpeningBalance;
                const monthlyTransactions: MonthlyTransaction[] = [];

                months.forEach((month, _monthIndex) => {
                    const basicSalary = 30000 + empIndex * 5000 + Math.random() * 3000;
                    const pfEligibleSalary = Math.min(basicSalary, 15000); // PF ceiling
                    const employeeContribution = pfEligibleSalary * 0.12; // 12%
                    const employerContribution = pfEligibleSalary * 0.12; // 12%
                    const vpfContribution = Math.random() > 0.7 ? pfEligibleSalary * 0.05 : 0; // 5% VPF for some
                    const interestEarned = (runningBalance * 0.085) / 12; // Monthly interest at 8.5% p.a.
                    const withdrawalAmount = Math.random() > 0.95 ? Math.random() * 25000 : 0; // Rare withdrawals

                    runningBalance += employeeContribution + employerContribution + vpfContribution + interestEarned - withdrawalAmount;

                    monthlyTransactions.push({
                        month: month,
                        basicSalary: Math.round(basicSalary),
                        pfEligibleSalary: Math.round(pfEligibleSalary),
                        employeeContribution: Math.round(employeeContribution),
                        employerContribution: Math.round(employerContribution),
                        vpfContribution: Math.round(vpfContribution),
                        interestEarned: Math.round(interestEarned),
                        withdrawalAmount: Math.round(withdrawalAmount),
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
                        openingBalance: baseOpeningBalance,
                        closingBalance: runningBalance
                    }),
                    {
                        totalBasicSalary: 0,
                        totalPFEligibleSalary: 0,
                        totalEmployeeContribution: 0,
                        totalEmployerContribution: 0,
                        totalVPFContribution: 0,
                        totalInterestEarned: 0,
                        totalWithdrawals: 0,
                        openingBalance: baseOpeningBalance,
                        closingBalance: Math.round(runningBalance)
                    }
                );

                mockRecords.push({
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    pfNumber: `PF${emp.code.slice(-3)}/${year}`,
                    fatherName: emp.father,
                    dateOfBirth: emp.dob,
                    dateOfJoining: emp.joining,
                    dateOfLeaving: Math.random() > 0.95 ? `${year}-12-31` : undefined, // Rare leavings
                    nomineeDetails: `${emp.father} (Father)`,
                    monthlyTransactions: monthlyTransactions,
                    yearlyTotals: yearlyTotals,
                    year: year
                });
            });
        });

        return mockRecords;
    };

    // Filter records based on selected year and employee
    useEffect(() => {
        if (filters.year && filters.employeeCode) {
            const record = form3ARecords.find((r) => r.year === filters.year && r.employeeCode === filters.employeeCode);
            setSelectedRecord(record || null);
        } else {
            setSelectedRecord(null);
        }
    }, [filters, form3ARecords]);

    const handleFilterChange = (key: keyof Form3AFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = () => {
        if (!filters.year || !filters.employeeCode) {
            toast.error('Please select both year and employee');
            return;
        }
        setShowForm(true);
        toast.success('PF Form 3A generated');
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

    // Table columns for monthly transactions
    const columns: ColumnDef<MonthlyTransaction>[] = [
        {
            accessorKey: 'month',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('month')}</div>,
            enableSorting: false,
            enableHiding: false,
            size: 100
        },
        {
            accessorKey: 'basicSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('basicSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'pfEligibleSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PF Eligible Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('pfEligibleSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employeeContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee PF (12%)' />,
            cell: ({ row }) => <div>₹{(row.getValue('employeeContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employerContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employer PF (12%)' />,
            cell: ({ row }) => <div>₹{(row.getValue('employerContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'vpfContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='VPF' />,
            cell: ({ row }) => <div>₹{(row.getValue('vpfContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'interestEarned',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Interest Earned' />,
            cell: ({ row }) => <div>₹{(row.getValue('interestEarned') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'withdrawalAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Withdrawals' />,
            cell: ({ row }) => <div>₹{(row.getValue('withdrawalAmount') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'runningBalance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Running Balance' />,
            cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('runningBalance') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='PF Form 3A' description='Individual Account Card - Employee wise Provident Fund Statement' />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='PF FORM 3A'
                description='Generate individual employee account card for Provident Fund'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                {/* Year and Employee Selection */}
                <div className='flex items-center justify-center gap-6'>
                    {/* Year Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='year-select' className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger id='year-select' className='w-40'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {['2023', '2024', '2025'].map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Employee Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='employee-select' className='font-medium text-foreground text-sm'>
                            Employee: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.employeeCode} onValueChange={(value) => handleFilterChange('employeeCode', value)}>
                            <SelectTrigger id='employee-select' className='w-80'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.code} value={employee.code}>
                                        {employee.name} ({employee.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-center gap-2 pt-4'>
                    <Button onClick={handleGenerate} className='bg-blue-600 hover:bg-blue-700'>
                        GENERATE
                    </Button>
                    <Button variant='outline' onClick={handleCancel}>
                        CANCEL
                    </Button>
                </div>
            </CollapsibleSection>

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
                                    <span className='font-semibold'>{new Date(selectedRecord.dateOfBirth).toLocaleDateString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Date of Joining:</span>
                                    <span className='font-semibold'>{new Date(selectedRecord.dateOfJoining).toLocaleDateString()}</span>
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
                                isLoading={isLoading}
                                columns={columns}
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
                                <h3 className='font-medium text-base text-foreground'>
                                    Account in the Provident Fund of Individual Employee
                                </h3>
                            </div>

                            <div className='mx-auto max-w-6xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Name of Employee:</strong> {selectedRecord.employeeName}
                                        </div>
                                        <div>
                                            <strong>Employee Code:</strong> {selectedRecord.employeeCode}
                                        </div>
                                        <div>
                                            <strong>PF Account Number:</strong> {selectedRecord.pfNumber}
                                        </div>
                                        <div>
                                            <strong>Father&apos;s Name:</strong> {selectedRecord.fatherName}
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Date of Birth:</strong> {new Date(selectedRecord.dateOfBirth).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <strong>Date of Joining:</strong> {new Date(selectedRecord.dateOfJoining).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <strong>Financial Year:</strong> {filters.year}
                                        </div>
                                        <div>
                                            <strong>Nominee:</strong> {selectedRecord.nomineeDetails}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>ACCOUNT TRANSACTIONS FOR {filters.year}</h3>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full border-collapse border border-gray-300 text-xs'>
                                            <thead>
                                                <tr className='bg-gray-50'>
                                                    <th className='border border-gray-300 p-2 text-left'>Month</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Basic Salary</th>
                                                    <th className='border border-gray-300 p-2 text-left'>PF Eligible</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Employee PF</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Employer PF</th>
                                                    <th className='border border-gray-300 p-2 text-left'>VPF</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Interest</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Withdrawals</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className='border border-gray-300 p-2 font-semibold'>Opening Balance</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2'>-</td>
                                                    <td className='border border-gray-300 p-2 font-semibold'>
                                                        ₹{selectedRecord.yearlyTotals.openingBalance.toLocaleString()}
                                                    </td>
                                                </tr>
                                                {selectedRecord.monthlyTransactions.map((transaction, index) => (
                                                    <tr key={index}>
                                                        <td className='border border-gray-300 p-2'>{transaction.month}</td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.basicSalary.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.pfEligibleSalary.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.employeeContribution.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.employerContribution.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.vpfContribution.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.interestEarned.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.withdrawalAmount.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{transaction.runningBalance.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className='bg-gray-50 font-semibold'>
                                                    <td className='border border-gray-300 p-2'>TOTAL</td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalBasicSalary.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalPFEligibleSalary.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalEmployeeContribution.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalEmployerContribution.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalVPFContribution.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalInterestEarned.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2'>
                                                        ₹{selectedRecord.yearlyTotals.totalWithdrawals.toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-300 p-2 text-green-600'>
                                                        ₹{selectedRecord.yearlyTotals.closingBalance.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='space-y-2 text-sm'>
                                    <div>
                                        <strong>Account Summary:</strong>
                                    </div>
                                    <ul className='list-inside list-disc space-y-1 text-xs'>
                                        <li>This account card shows monthly PF transactions for the selected employee.</li>
                                        <li>Employee and Employer contributions are calculated at 12% each of PF eligible salary.</li>
                                        <li>Interest is calculated monthly at 8.5% per annum on the running balance.</li>
                                        <li>VPF (Voluntary Provident Fund) contributions are additional voluntary contributions.</li>
                                        <li>All withdrawals are subject to EPFO rules and regulations.</li>
                                        <li>This account is maintained as per the Employees&apos; Provident Fund Scheme, 1952.</li>
                                    </ul>
                                </div>

                                <div className='flex justify-between pt-8'>
                                    <div className='text-sm'>
                                        <div className='font-semibold'>Employee Signature</div>
                                        <div className='mt-6 w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>{selectedRecord.employeeName}</div>
                                    </div>
                                    <div className='text-right text-sm'>
                                        <div className='font-semibold'>Authorized Signatory</div>
                                        <div className='mt-6 ml-auto w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>HR Department</div>
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
