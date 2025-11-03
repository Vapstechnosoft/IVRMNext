'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calculator, CalendarIcon, Download, FileText, Printer, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Form 6A data structure (Annual Return of PF Contributions)
interface Form6ARecord extends BaseEntity {
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
    withdrawalAmount: number;
    refundAmount: number;
    transferInAmount: number;
    transferOutAmount: number;
    closingBalance: number;
    contributionMonths: number;
    averageBalance: number;
    period: string;
    financialYear: string;
}

// Form 6A summary
interface Form6ASummary {
    totalEmployees: number;
    totalOpeningBalance: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    totalVPFContribution: number;
    totalInterestEarned: number;
    totalWithdrawals: number;
    totalRefunds: number;
    totalTransferIn: number;
    totalTransferOut: number;
    totalClosingBalance: number;
    netContribution: number;
}

// Report filters
interface Form6AFilters {
    fromDate: Date | undefined;
    toDate: Date | undefined;
}

export default function PFForm6APage() {
    // Database instances
    const form6ADB = createLocalCrud<Form6ARecord>('report:pf-form6a');

    // State
    const [form6ARecords, setForm6ARecords] = useState<Form6ARecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Form6ARecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState<Form6AFilters>({
        fromDate: new Date('2025-04-01'), // Default to financial year start
        toDate: new Date('2025-03-31') // Default to financial year end
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Form 6A records
            let recordList = form6ADB.list();
            if (recordList.length === 0) {
                const mockData = generateMockForm6AData();
                mockData.forEach((record) => form6ADB.create(record));
                recordList = form6ADB.list(); // Reload data after creating mock records
            }
            setForm6ARecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock Form 6A data
    const generateMockForm6AData = (): Omit<Form6ARecord, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                father: 'LATE RANJAN BHADURI',
                joining: '2020-04-01'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                father: 'MR SUBRATA CHATTERJEE',
                joining: '2021-06-15'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                father: 'MR DINESH SHAH',
                joining: '2019-08-20'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                father: 'MR KRISHNA DAS',
                joining: '2022-01-10'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                father: 'MR BIMAL MUKHERJEE',
                joining: '2020-11-25'
            },
            {
                code: 'EMP006',
                name: 'MRS PRIYA SHARMA',
                father: 'MR RAJESH SHARMA',
                joining: '2021-03-12'
            },
            {
                code: 'EMP007',
                name: 'MR RAJESH KUMAR',
                father: 'MR SURESH KUMAR',
                joining: '2020-07-08'
            },
            {
                code: 'EMP008',
                name: 'MS ANITA SINGH',
                father: 'MR VIJAY SINGH',
                joining: '2022-09-05'
            }
        ];

        const mockRecords: Omit<Form6ARecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((emp, empIndex) => {
            const yearsOfService = new Date().getFullYear() - new Date(emp.joining).getFullYear();
            const openingBalance = Math.max(0, (yearsOfService - 1) * 30000 + empIndex * 15000);
            const monthlyContribution = 2000 + empIndex * 300;
            const contributionMonths = 12; // Full year
            const employeeContribution = monthlyContribution * contributionMonths;
            const employerContribution = monthlyContribution * contributionMonths;
            const vpfContribution = Math.random() > 0.6 ? monthlyContribution * 6 : 0; // Some employees have VPF
            const interestEarned = (openingBalance + employeeContribution + employerContribution) * 0.085; // 8.5% interest
            const withdrawalAmount = Math.random() > 0.85 ? Math.random() * 75000 : 0; // Some withdrawals
            const refundAmount = Math.random() > 0.95 ? Math.random() * 25000 : 0; // Rare refunds
            const transferInAmount = Math.random() > 0.9 ? Math.random() * 50000 : 0; // Some transfers in
            const transferOutAmount = Math.random() > 0.9 ? Math.random() * 40000 : 0; // Some transfers out
            const totalAdditions = employeeContribution + employerContribution + vpfContribution + interestEarned + transferInAmount;
            const totalDeductions = withdrawalAmount + refundAmount + transferOutAmount;
            const closingBalance = openingBalance + totalAdditions - totalDeductions;
            const averageBalance = (openingBalance + closingBalance) / 2;

            // Some employees may have left during the year
            const hasLeft = Math.random() > 0.9;
            const dateOfLeaving = hasLeft ? '2024-12-31' : undefined;

            mockRecords.push({
                employeeCode: emp.code,
                employeeName: emp.name,
                pfNumber: `PF${emp.code.slice(-3)}/2024-25`,
                fatherName: emp.father,
                dateOfJoining: emp.joining,
                dateOfLeaving: dateOfLeaving,
                openingBalance: Math.round(openingBalance),
                employeeContribution: Math.round(employeeContribution),
                employerContribution: Math.round(employerContribution),
                vpfContribution: Math.round(vpfContribution),
                interestEarned: Math.round(interestEarned),
                withdrawalAmount: Math.round(withdrawalAmount),
                refundAmount: Math.round(refundAmount),
                transferInAmount: Math.round(transferInAmount),
                transferOutAmount: Math.round(transferOutAmount),
                closingBalance: Math.round(closingBalance),
                contributionMonths: contributionMonths,
                averageBalance: Math.round(averageBalance),
                period: '2024-25',
                financialYear: '2024-25'
            });
        });

        return mockRecords;
    };

    // Filter Form 6A records based on selected date range
    useEffect(() => {
        let filtered = form6ARecords;

        if (filters.fromDate && filters.toDate) {
            filtered = filtered.filter((record) => {
                const recordDate = new Date(record.dateOfJoining);
                return recordDate >= filters.fromDate! && recordDate <= filters.toDate!;
            });
        }

        setFilteredRecords(filtered);
    }, [filters, form6ARecords]);

    const handleDateChange = (key: keyof Form6AFilters, date: Date | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: date }));
    };

    const handleGenerate = () => {
        if (!filters.fromDate || !filters.toDate) {
            toast.error('Please select both from and to dates');
            return;
        }
        if (filters.fromDate > filters.toDate) {
            toast.error('From date cannot be later than to date');
            return;
        }
        setShowForm(true);
        toast.success('PF Form 6A generated');
    };

    const handleCancel = () => {
        setFilters({
            fromDate: undefined,
            toDate: undefined
        });
        setShowForm(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('PF Form 6A exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Form 6A summary
    const form6ASummary: Form6ASummary = useMemo(() => {
        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: acc.totalEmployees + 1,
                totalOpeningBalance: acc.totalOpeningBalance + record.openingBalance,
                totalEmployeeContribution: acc.totalEmployeeContribution + record.employeeContribution,
                totalEmployerContribution: acc.totalEmployerContribution + record.employerContribution,
                totalVPFContribution: acc.totalVPFContribution + record.vpfContribution,
                totalInterestEarned: acc.totalInterestEarned + record.interestEarned,
                totalWithdrawals: acc.totalWithdrawals + record.withdrawalAmount,
                totalRefunds: acc.totalRefunds + record.refundAmount,
                totalTransferIn: acc.totalTransferIn + record.transferInAmount,
                totalTransferOut: acc.totalTransferOut + record.transferOutAmount,
                totalClosingBalance: acc.totalClosingBalance + record.closingBalance,
                netContribution: 0 // Will be calculated after reduce
            }),
            {
                totalEmployees: 0,
                totalOpeningBalance: 0,
                totalEmployeeContribution: 0,
                totalEmployerContribution: 0,
                totalVPFContribution: 0,
                totalInterestEarned: 0,
                totalWithdrawals: 0,
                totalRefunds: 0,
                totalTransferIn: 0,
                totalTransferOut: 0,
                totalClosingBalance: 0,
                netContribution: 0
            }
        );

        // Calculate net contribution
        summary.netContribution = summary.totalEmployeeContribution + summary.totalEmployerContribution + summary.totalVPFContribution;

        return summary;
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<Form6ARecord>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='text-center'>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false,
            size: 80
        },
        {
            accessorKey: 'employeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'pfNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PF Number' />,
            cell: ({ row }) => <div className='font-mono text-xs'>{row.getValue('pfNumber')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'openingBalance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Opening Balance' />,
            cell: ({ row }) => <div>₹{(row.getValue('openingBalance') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employeeContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Contribution' />,
            cell: ({ row }) => <div>₹{(row.getValue('employeeContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employerContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employer Contribution' />,
            cell: ({ row }) => <div>₹{(row.getValue('employerContribution') as number).toLocaleString()}</div>,
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
            accessorKey: 'closingBalance',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Closing Balance' />,
            cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('closingBalance') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <CollapsibleSection
                title='PF FORM 6A'
                description='Generate annual return of PF contributions for the specified period'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                {/* Date Range Selection */}
                <div className='flex items-center justify-center gap-6'>
                    {/* From Date */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>From :</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-[200px] justify-start text-left font-normal',
                                        !filters.fromDate && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : '17-09-2025'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <CalendarYear
                                    mode='single'
                                    selected={filters.fromDate}
                                    onDayClick={(day) => handleDateChange('fromDate', day)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* To Date */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>To :</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-[200px] justify-start text-left font-normal',
                                        !filters.toDate && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : '17-09-2025'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <CalendarYear
                                    mode='single'
                                    selected={filters.toDate}
                                    onDayClick={(day) => handleDateChange('toDate', day)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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

            {/* Form 6A Results */}
            {showForm && (
                <div className='space-y-4'>
                    {/* Form 6A Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                PF Form 6A - {filters.fromDate ? format(filters.fromDate, 'dd/MM/yyyy') : ''} to{' '}
                                {filters.toDate ? format(filters.toDate, 'dd/MM/yyyy') : ''}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Annual Return | Total Employees: {filteredRecords.length} | Total PF Balance: ₹
                                {form6ASummary.totalClosingBalance.toLocaleString()}
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

                    {/* Form 6A Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Users className='h-3 w-3' />
                                    Total Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{form6ASummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Opening Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{form6ASummary.totalOpeningBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <TrendingUp className='h-3 w-3' />
                                    Net Contribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹{form6ASummary.netContribution.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Closing Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{form6ASummary.totalClosingBalance.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form 6A Breakdown */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Contribution Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Opening Balance:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{form6ASummary.totalOpeningBalance.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee Contribution:</span>
                                    <span className='font-semibold'>₹{form6ASummary.totalEmployeeContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employer Contribution:</span>
                                    <span className='font-semibold'>₹{form6ASummary.totalEmployerContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>VPF Contribution:</span>
                                    <span className='font-semibold'>₹{form6ASummary.totalVPFContribution.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Interest Earned:</span>
                                    <span className='font-semibold text-orange-600'>
                                        ₹{form6ASummary.totalInterestEarned.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Transfer In:</span>
                                    <span className='font-semibold text-green-600'>₹{form6ASummary.totalTransferIn.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Deductions Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Withdrawals:</span>
                                    <span className='font-semibold text-red-600'>₹{form6ASummary.totalWithdrawals.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Refunds:</span>
                                    <span className='font-semibold text-red-600'>₹{form6ASummary.totalRefunds.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Transfer Out:</span>
                                    <span className='font-semibold text-red-600'>₹{form6ASummary.totalTransferOut.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Financial Year:</span>
                                    <span className='font-semibold'>2024-25</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>VAPS SCHOOL</span>
                                </div>
                                <div className='flex justify-between border-t pt-2 font-semibold'>
                                    <span>Closing Balance:</span>
                                    <span className='text-green-600'>₹{form6ASummary.totalClosingBalance.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={columns}
                        data={filteredRecords}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />

                    {/* Official Form 6A Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>FORM 6A - ANNUAL RETURN</h2>
                                <h3 className='font-medium text-base text-foreground'>
                                    Annual Return of Contributions and other receipts in respect of Provident Fund
                                </h3>
                            </div>

                            <div className='mx-auto max-w-6xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Name of Establishment:</strong> VAPS SCHOOL
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> WB/KOL/12345
                                        </div>
                                        <div>
                                            <strong>Establishment ID:</strong> WBKOL12345000
                                        </div>
                                        <div>
                                            <strong>Address:</strong> Kolkata, West Bengal
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Financial Year:</strong> 2024-25
                                        </div>
                                        <div>
                                            <strong>Period:</strong> {filters.fromDate ? format(filters.fromDate, 'dd/MM/yyyy') : ''} to{' '}
                                            {filters.toDate ? format(filters.toDate, 'dd/MM/yyyy') : ''}
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {form6ASummary.totalEmployees}
                                        </div>
                                        <div>
                                            <strong>Submission Date:</strong> {format(new Date(), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>ANNUAL RETURN SUMMARY</h3>

                                    <div className='grid grid-cols-2 gap-8 text-sm'>
                                        <div className='space-y-2'>
                                            <h4 className='text-center font-semibold underline'>RECEIPTS</h4>
                                            <div className='flex justify-between'>
                                                <span>Opening Balance:</span>
                                                <span>₹{form6ASummary.totalOpeningBalance.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employee Contribution (12%):</span>
                                                <span>₹{form6ASummary.totalEmployeeContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employer Contribution (12%):</span>
                                                <span>₹{form6ASummary.totalEmployerContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>VPF Contribution:</span>
                                                <span>₹{form6ASummary.totalVPFContribution.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Interest Earned (8.5%):</span>
                                                <span>₹{form6ASummary.totalInterestEarned.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Transfer In:</span>
                                                <span>₹{form6ASummary.totalTransferIn.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between border-t pt-2 font-semibold'>
                                                <span>Total Receipts:</span>
                                                <span>
                                                    ₹
                                                    {(
                                                        form6ASummary.totalOpeningBalance +
                                                        form6ASummary.totalEmployeeContribution +
                                                        form6ASummary.totalEmployerContribution +
                                                        form6ASummary.totalVPFContribution +
                                                        form6ASummary.totalInterestEarned +
                                                        form6ASummary.totalTransferIn
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <h4 className='text-center font-semibold underline'>PAYMENTS</h4>
                                            <div className='flex justify-between'>
                                                <span>Withdrawals:</span>
                                                <span>₹{form6ASummary.totalWithdrawals.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Refunds:</span>
                                                <span>₹{form6ASummary.totalRefunds.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Transfer Out:</span>
                                                <span>₹{form6ASummary.totalTransferOut.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between border-t pt-2 font-semibold'>
                                                <span>Total Payments:</span>
                                                <span>
                                                    ₹
                                                    {(
                                                        form6ASummary.totalWithdrawals +
                                                        form6ASummary.totalRefunds +
                                                        form6ASummary.totalTransferOut
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className='flex justify-between border-t pt-2 font-bold text-lg'>
                                                <span>Closing Balance:</span>
                                                <span className='text-green-600'>
                                                    ₹{form6ASummary.totalClosingBalance.toLocaleString()}
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
                                        I hereby certify that the above return is correct and complete to the best of my knowledge and
                                        belief and that the amounts shown as contributions have been deposited in the Fund in accordance
                                        with the provisions of the Employees&apos; Provident Funds and Miscellaneous Provisions Act, 1952.
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
