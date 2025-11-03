'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Calculator, Download, FileText, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// PF challan data structure
interface PFChallanRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePF: number;
    employerPF: number;
    totalPF: number;
    vpfContribution: number;
    pensionContribution: number;
    administrationCharges: number;
    month: string;
    year: string;
}

// PF challan summary
interface PFChallanSummary {
    totalEmployees: number;
    totalBasicSalary: number;
    totalEmployeePF: number;
    totalEmployerPF: number;
    totalVPF: number;
    totalPension: number;
    totalAdminCharges: number;
    grandTotal: number;
}

// Report filters
interface PFChallanFilters {
    month: string;
    year: string;
}

export default function PFChallanPage() {
    // Database instances
    const pfChallanDB = createLocalCrud<PFChallanRecord>('report:pf-challan');

    // State
    const [pfRecords, setPFRecords] = useState<PFChallanRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PFChallanRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showChallan, setShowChallan] = useState(false);

    const [filters, setFilters] = useState<PFChallanFilters>({
        month: '',
        year: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load PF records
            let recordList = pfChallanDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockPFData();
                mockData.forEach((record) => pfChallanDB.create(record));
                recordList = pfChallanDB.list(); // Reload data after creating mock records
            }
            setPFRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock PF data
    const generateMockPFData = (): Omit<PFChallanRecord, 'id' | 'createdAt'>[] => {
        const employees = [
            { code: 'EMP001', name: 'MR SUDIPTA RANJAN BHADURI' },
            { code: 'EMP002', name: 'MS RUPLEKHA CHATTERJEE' },
            { code: 'EMP003', name: 'MR JOHN SHAH' },
            { code: 'EMP004', name: 'MRS BHASWATI DAS' },
            { code: 'EMP005', name: 'MR SANTANU MUKHERJEE' },
            { code: 'EMP006', name: 'MRS PRIYA SHARMA' },
            { code: 'EMP007', name: 'MR RAJESH KUMAR' },
            { code: 'EMP008', name: 'MS ANITA SINGH' }
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
        const mockRecords: Omit<PFChallanRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((emp, empIndex) => {
            months.forEach((month) => {
                const basicSalary = 25000 + empIndex * 5000 + Math.random() * 10000;
                const pfEligibleSalary = Math.min(basicSalary, 15000); // PF ceiling
                const employeePF = pfEligibleSalary * 0.12; // 12% employee contribution
                const employerPF = pfEligibleSalary * 0.12; // 12% employer contribution
                const vpfContribution = Math.random() > 0.7 ? pfEligibleSalary * 0.05 : 0; // 5% VPF (optional)
                const pensionContribution = pfEligibleSalary * 0.0833; // 8.33% pension
                const administrationCharges = pfEligibleSalary * 0.005; // 0.5% admin charges
                const totalPF = employeePF + employerPF + vpfContribution + pensionContribution + administrationCharges;

                mockRecords.push({
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    pfNumber: `PF${emp.code.slice(-3)}${month.slice(0, 3).toUpperCase()}`,
                    basicSalary: Math.round(basicSalary),
                    pfEligibleSalary: Math.round(pfEligibleSalary),
                    employeePF: Math.round(employeePF),
                    employerPF: Math.round(employerPF),
                    totalPF: Math.round(totalPF),
                    vpfContribution: Math.round(vpfContribution),
                    pensionContribution: Math.round(pensionContribution),
                    administrationCharges: Math.round(administrationCharges),
                    month: month,
                    year: '2025'
                });
            });
        });

        return mockRecords;
    };

    // Filter PF records based on selected month/year
    useEffect(() => {
        let filtered = pfRecords;

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, pfRecords]);

    const handleFilterChange = (key: keyof PFChallanFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        setShowChallan(true);
        toast.success('PF Challan generated');
    };

    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setShowChallan(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('PF Challan exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate PF summary
    const pfSummary: PFChallanSummary = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: acc.totalEmployees + 1,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalEmployeePF: acc.totalEmployeePF + record.employeePF,
                totalEmployerPF: acc.totalEmployerPF + record.employerPF,
                totalVPF: acc.totalVPF + record.vpfContribution,
                totalPension: acc.totalPension + record.pensionContribution,
                totalAdminCharges: acc.totalAdminCharges + record.administrationCharges,
                grandTotal: acc.grandTotal + record.totalPF
            }),
            {
                totalEmployees: 0,
                totalBasicSalary: 0,
                totalEmployeePF: 0,
                totalEmployerPF: 0,
                totalVPF: 0,
                totalPension: 0,
                totalAdminCharges: 0,
                grandTotal: 0
            }
        );
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<PFChallanRecord>[] = [
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
            cell: ({ row }) => <div className='font-mono'>{row.getValue('pfNumber')}</div>,
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
            accessorKey: 'employeePF',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee PF (12%)' />,
            cell: ({ row }) => <div>₹{(row.getValue('employeePF') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employerPF',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employer PF (12%)' />,
            cell: ({ row }) => <div>₹{(row.getValue('employerPF') as number).toLocaleString()}</div>,
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
            accessorKey: 'pensionContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Pension (8.33%)' />,
            cell: ({ row }) => <div>₹{(row.getValue('pensionContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalPF',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total PF' />,
            cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('totalPF') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='PF Challan' description='Generate Provident Fund challan for monthly contributions' />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='PF CHALLAN'
                description='Generate Provident Fund challan for employee and employer contributions'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                {/* Simple Month/Year Selection */}
                <div className='flex items-center justify-center gap-6'>
                    {/* Month Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger className='w-40'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {[
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
                                ].map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger className='w-32'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => {
                                    const year = new Date().getFullYear() - 2 + i;
                                    return (
                                        <SelectItem key={`year-${year}`} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
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

            {/* Challan Results */}
            {showChallan && (
                <div className='space-y-4'>
                    {/* Challan Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                PF Challan - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Total PF Amount: ₹{pfSummary.grandTotal.toLocaleString()}
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

                    {/* PF Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{pfSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employee PF (12%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{pfSummary.totalEmployeePF.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employer PF (12%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>₹{pfSummary.totalEmployerPF.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total PF Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{pfSummary.grandTotal.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PF Breakdown */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    PF Contribution Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee PF (12%):</span>
                                    <span className='font-semibold text-blue-600'>₹{pfSummary.totalEmployeePF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employer PF (12%):</span>
                                    <span className='font-semibold text-orange-600'>₹{pfSummary.totalEmployerPF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>VPF Contribution:</span>
                                    <span className='font-semibold'>₹{pfSummary.totalVPF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Pension (8.33%):</span>
                                    <span className='font-semibold'>₹{pfSummary.totalPension.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Admin Charges (0.5%):</span>
                                    <span className='font-semibold'>₹{pfSummary.totalAdminCharges.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2 font-semibold'>
                                    <span>Total PF Amount:</span>
                                    <span className='text-green-600'>₹{pfSummary.grandTotal.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Challan Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Challan Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Due Date:</span>
                                    <span className='font-semibold'>15th of next month</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>VAPS SCHOOL</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Code:</span>
                                    <span className='font-semibold'>WB/KOL/12345</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Establishment ID:</span>
                                    <span className='font-semibold'>WBKOL12345000</span>
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

                    {/* Official PF Challan Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>MONTHLY CONTRIBUTION CHALLAN</h2>
                            </div>

                            <div className='mx-auto max-w-4xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Establishment Name:</strong> VAPS SCHOOL
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> WB/KOL/12345
                                        </div>
                                        <div>
                                            <strong>Establishment ID:</strong> WBKOL12345000
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Challan Period:</strong> {filters.month} {filters.year}
                                        </div>
                                        <div>
                                            <strong>Due Date:</strong> 15th of next month
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {pfSummary.totalEmployees}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>CONTRIBUTION DETAILS</h3>
                                    <div className='grid grid-cols-2 gap-8 text-sm'>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>Total Basic Salary:</span>
                                                <span>₹{pfSummary.totalBasicSalary.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employee Share (12%):</span>
                                                <span>₹{pfSummary.totalEmployeePF.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employer Share (12%):</span>
                                                <span>₹{pfSummary.totalEmployerPF.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>VPF Contribution:</span>
                                                <span>₹{pfSummary.totalVPF.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Pension Contribution:</span>
                                                <span>₹{pfSummary.totalPension.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Admin Charges:</span>
                                                <span>₹{pfSummary.totalAdminCharges.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='border-t pt-3'>
                                        <div className='flex justify-between font-bold text-lg'>
                                            <span>TOTAL AMOUNT PAYABLE:</span>
                                            <span className='text-green-600'>₹{pfSummary.grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='text-center text-muted-foreground text-sm'>
                                    This challan should be submitted to the nearest PF office along with the payment by the due date.
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
