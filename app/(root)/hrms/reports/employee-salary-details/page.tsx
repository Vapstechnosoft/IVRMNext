'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { BarChart3, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Monthly salary data structure
interface MonthlySalaryDetail extends BaseEntity {
    month: string;
    year: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    grossSalary: number;
    netSalary: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    overtimeHours: number;
    overtimeAmount: number;
    bonuses: number;
    pfDeduction: number;
    esiDeduction: number;
    professionalTax: number;
}

export default function EmployeeSalaryDetailsReportPage() {
    // Database instances
    const salaryDetailsDB = createLocalCrud<MonthlySalaryDetail>('report:employee-salary-details');

    // State
    const [salaryDetails, setSalaryDetails] = useState<MonthlySalaryDetail[]>([]);
    const [filteredDetails, setFilteredDetails] = useState<MonthlySalaryDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinancialYear, setSelectedFinancialYear] = useState('2030');

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load salary details
            let detailsList = salaryDetailsDB.list();
            if (detailsList.length === 0) {
                const mockData = generateMockSalaryDetails();
                mockData.forEach((detail) => salaryDetailsDB.create(detail));
                detailsList = salaryDetailsDB.list(); // Reload data after creating mock records
            }
            setSalaryDetails(detailsList);
            setFilteredDetails(detailsList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock salary details data
    const generateMockSalaryDetails = (): Omit<MonthlySalaryDetail, 'id' | 'createdAt'>[] => {
        const months = [
            { name: 'JANUARY', netSalary: 14664 },
            { name: 'FEBRUARY', netSalary: 45200 },
            { name: 'MARCH', netSalary: 47800 },
            { name: 'APRIL', netSalary: 46500 },
            { name: 'MAY', netSalary: 48200 },
            { name: 'JUNE', netSalary: 44800 },
            { name: 'JULY', netSalary: 49100 },
            { name: 'AUGUST', netSalary: 47600 },
            { name: 'SEPTEMBER', netSalary: 139054 },
            { name: 'OCTOBER', netSalary: 451111 },
            { name: 'NOVEMBER', netSalary: 46900 },
            { name: 'DECEMBER', netSalary: 48700 }
        ];

        return months.map((month, index) => {
            const basicSalary = month.netSalary / 0.85; // Assuming net is ~85% of basic
            const allowances = basicSalary * 0.3;
            const grossSalary = basicSalary + allowances;
            const deductions = grossSalary - month.netSalary;

            return {
                month: month.name,
                year: '2030',
                basicSalary: Math.round(basicSalary),
                allowances: Math.round(allowances),
                deductions: Math.round(deductions),
                grossSalary: Math.round(grossSalary),
                netSalary: month.netSalary,
                workingDays: 26,
                presentDays: 24 + Math.floor(Math.random() * 3),
                absentDays: Math.floor(Math.random() * 3),
                overtimeHours: Math.floor(Math.random() * 10),
                overtimeAmount: Math.floor(Math.random() * 2000),
                bonuses: index % 3 === 0 ? Math.floor(Math.random() * 5000) : 0,
                pfDeduction: Math.round(basicSalary * 0.12),
                esiDeduction: Math.round(basicSalary * 0.0175),
                professionalTax: 200
            };
        });
    };

    // Filter salary details based on search term and financial year
    useEffect(() => {
        let filtered = salaryDetails.filter((detail) => detail.year === selectedFinancialYear);

        if (searchTerm) {
            filtered = filtered.filter((detail) => detail.month.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredDetails(filtered);
    }, [searchTerm, selectedFinancialYear, salaryDetails]);

    const handleViewDetails = (monthData: MonthlySalaryDetail) => {
        toast.info(`Viewing details for ${monthData.month} ${monthData.year}`);
    };

    // Calculate yearly totals
    const yearlyTotals = useMemo(() => {
        return filteredDetails.reduce(
            (acc, detail) => ({
                basicSalary: acc.basicSalary + detail.basicSalary,
                allowances: acc.allowances + detail.allowances,
                deductions: acc.deductions + detail.deductions,
                grossSalary: acc.grossSalary + detail.grossSalary,
                netSalary: acc.netSalary + detail.netSalary,
                bonuses: acc.bonuses + detail.bonuses,
                pfDeduction: acc.pfDeduction + detail.pfDeduction,
                esiDeduction: acc.esiDeduction + detail.esiDeduction,
                professionalTax: acc.professionalTax + detail.professionalTax
            }),
            {
                basicSalary: 0,
                allowances: 0,
                deductions: 0,
                grossSalary: 0,
                netSalary: 0,
                bonuses: 0,
                pfDeduction: 0,
                esiDeduction: 0,
                professionalTax: 0
            }
        );
    }, [filteredDetails]);

    // Prepare chart data
    const chartData = useMemo(() => {
        return filteredDetails.map((detail) => ({
            month: detail.month.substring(0, 3), // Short month name
            netSalary: detail.netSalary
        }));
    }, [filteredDetails]);

    // Table columns
    const columns: ColumnDef<MonthlySalaryDetail>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' />,
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
            accessorKey: 'month',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('month')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'netSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
            cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'viewDetails',
            header: 'View Details',
            cell: ({ row }) => (
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleViewDetails(row.original)}
                    className='text-blue-600 hover:text-blue-700'>
                    <Eye className='h-4 w-4' />
                </Button>
            ),
            enableSorting: false,
            enableHiding: false
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Employee Salary Details' description='View detailed salary information with monthly breakdown and charts' />
            </div>

            {/* Salary Details Section */}
            <CollapsibleSection
                title='SALARY DETAILS'
                description='Select financial year to view detailed salary breakdown'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-4'>
                    {/* Financial Year Selection */}
                    <div className='flex items-center justify-center gap-4'>
                        <label className='font-medium text-foreground text-sm'>Financial Year :</label>
                        <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                            <SelectTrigger className='w-48'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + 5 - i;
                                    return (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Monthwise Salary Details Section */}
            <CollapsibleSection
                title='MONTHWISE SALARY DETAILS'
                description='Detailed monthly salary breakdown with search functionality'
                defaultOpen={true}
                variant='outline'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-4'>
                    <div className='mb-4 flex items-center justify-end'>
                        <Input
                            placeholder='search here...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-64'
                        />
                    </div>

                    {/* Summary Cards */}
                    <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Basic Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>₹{yearlyTotals.basicSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Allowances</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>₹{yearlyTotals.allowances.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>₹{yearlyTotals.deductions.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Net Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{yearlyTotals.netSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={columns}
                        data={filteredDetails}
                        totalItems={filteredDetails.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'], right: ['viewDetails'] }}
                    />
                </div>

                {/* Graph Section */}
                <div className='space-y-4 rounded-lg border bg-card p-4'>
                    <div className='flex items-center gap-2 font-semibold text-foreground text-lg'>
                        <BarChart3 className='h-5 w-5' />
                        GRAPH
                    </div>

                    {/* Simple Chart Representation */}
                    <div className='space-y-4'>
                        <div className='text-center text-muted-foreground text-sm'>
                            Monthly Net Salary Trend for Financial Year {selectedFinancialYear}
                        </div>

                        {/* Chart Container */}
                        <div className='h-64 rounded-lg border bg-background p-4'>
                            <div className='flex h-full items-end justify-around gap-2'>
                                {chartData.map((data, index) => {
                                    const maxSalary = Math.max(...chartData.map((d) => d.netSalary));
                                    const height = (data.netSalary / maxSalary) * 100;
                                    const colors = ['#0ea5e9', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
                                    const color = colors[index % colors.length];

                                    return (
                                        <div key={data.month} className='flex flex-1 flex-col items-center gap-2'>
                                            <div className='text-muted-foreground text-xs'>₹{(data.netSalary / 1000).toFixed(0)}K</div>
                                            <div
                                                className='w-full rounded-t-md transition-all duration-300 hover:opacity-80'
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: color,
                                                    minHeight: '20px'
                                                }}
                                                title={`${data.month}: ₹${data.netSalary.toLocaleString()}`}
                                            />
                                            <div className='font-medium text-foreground text-xs'>{data.month}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chart Legend */}
                        <div className='flex items-center justify-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <div className='h-3 w-3 rounded bg-blue-500' />
                                <span className='text-muted-foreground text-xs'>DataSeries 1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Salary Breakdown (shown when View Details is clicked) */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-sm'>Earnings Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                                <span>Basic Salary:</span>
                                <span>₹{yearlyTotals.basicSalary.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>Allowances:</span>
                                <span>₹{yearlyTotals.allowances.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>Bonuses:</span>
                                <span>₹{yearlyTotals.bonuses.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between border-t pt-2 font-semibold text-sm'>
                                <span>Total Earnings:</span>
                                <span>₹{yearlyTotals.grossSalary.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='text-sm'>Deductions Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                                <span>PF Deduction:</span>
                                <span>₹{yearlyTotals.pfDeduction.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>ESI Deduction:</span>
                                <span>₹{yearlyTotals.esiDeduction.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>Professional Tax:</span>
                                <span>₹{yearlyTotals.professionalTax.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between border-t pt-2 font-semibold text-sm'>
                                <span>Total Deductions:</span>
                                <span>₹{yearlyTotals.deductions.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='text-sm'>Annual Summary</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                                <span>Gross Salary:</span>
                                <span>₹{yearlyTotals.grossSalary.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>Total Deductions:</span>
                                <span>₹{yearlyTotals.deductions.toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span>Months Paid:</span>
                                <span>{filteredDetails.length}</span>
                            </div>
                            <div className='flex justify-between border-t pt-2 font-semibold text-green-600 text-sm'>
                                <span>Net Annual Salary:</span>
                                <span>₹{yearlyTotals.netSalary.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CollapsibleSection>
        </div>
    );
}
