'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Building, Calculator, Download, Printer, Search, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Month End Report data structure
interface MonthEndRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupType: string;
    department: string;
    designation: string;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    pfContribution: number;
    esiContribution: number;
    incomeTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leavesTaken: number;
    overtime: number;
    status: 'Active' | 'On Leave' | 'Absent' | 'Resigned';
    month: string;
    year: string;
    ieName: string;
}

// Month End Summary
interface MonthEndSummary {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    absentEmployees: number;
    totalBasicSalary: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    averageNetSalary: number;
}

// Filter options
interface FilterOptions {
    groupTypes: string[];
    departments: string[];
    designations: string[];
}

// Report filters
interface MonthEndFilters {
    selectedGroupTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    month: string;
    year: string;
    ieName: string;
}

export default function HRMSMonthEndReportPage() {
    // Database instances
    const monthEndDB = createLocalCrud<MonthEndRecord>('report:hrms-monthend');

    // State
    const [monthEndRecords, setMonthEndRecords] = useState<MonthEndRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MonthEndRecord[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        groupTypes: [],
        departments: [],
        designations: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<MonthEndFilters>({
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        month: '',
        year: '',
        ieName: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Month End records
            let recordList = monthEndDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockMonthEndData();
                mockData.forEach((record) => monthEndDB.create(record));
                recordList = monthEndDB.list(); // Reload data after creating mock records
            }
            setMonthEndRecords(recordList);

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

    // Generate mock Month End data
    const generateMockMonthEndData = (): Omit<MonthEndRecord, 'id' | 'createdAt'>[] => {
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
        const ieNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];

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
        const mockRecords: Omit<MonthEndRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((empName, empIndex) => {
            months.forEach((month) => {
                const basicSalary = 25000 + empIndex * 3000 + Math.random() * 5000;
                const allowances = basicSalary * 0.3; // 30% allowances
                const grossSalary = basicSalary + allowances;
                const pfContribution = Math.min(basicSalary, 15000) * 0.12; // 12% PF on eligible salary
                const esiContribution = grossSalary <= 21000 ? grossSalary * 0.0075 : 0; // 0.75% ESI if eligible
                const incomeTax = grossSalary > 50000 ? grossSalary * 0.1 : 0; // 10% tax if applicable
                const otherDeductions = Math.random() * 2000; // Random other deductions
                const totalDeductions = pfContribution + esiContribution + incomeTax + otherDeductions;
                const netSalary = grossSalary - totalDeductions;

                const workingDays = 22 + Math.floor(Math.random() * 4); // 22-25 working days
                const absentDays = Math.floor(Math.random() * 3); // 0-2 absent days
                const leavesTaken = Math.floor(Math.random() * 2); // 0-1 leaves
                const presentDays = workingDays - absentDays - leavesTaken;
                const overtime = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0; // Some overtime

                const statuses: ('Active' | 'On Leave' | 'Absent' | 'Resigned')[] = ['Active', 'On Leave', 'Absent', 'Resigned'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                mockRecords.push({
                    employeeCode: `EMP${String(empIndex + 1).padStart(3, '0')}`,
                    employeeName: empName,
                    groupType: groupTypes[empIndex % groupTypes.length],
                    department: departments[empIndex % departments.length],
                    designation: designations[empIndex % designations.length],
                    basicSalary: Math.round(basicSalary),
                    allowances: Math.round(allowances),
                    grossSalary: Math.round(grossSalary),
                    pfContribution: Math.round(pfContribution),
                    esiContribution: Math.round(esiContribution),
                    incomeTax: Math.round(incomeTax),
                    otherDeductions: Math.round(otherDeductions),
                    totalDeductions: Math.round(totalDeductions),
                    netSalary: Math.round(netSalary),
                    workingDays: workingDays,
                    presentDays: presentDays,
                    absentDays: absentDays,
                    leavesTaken: leavesTaken,
                    overtime: overtime,
                    status: status,
                    month: month,
                    year: '2025',
                    ieName: ieNames[empIndex % ieNames.length]
                });
            });
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = monthEndRecords;

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

        // Filter by IE Name
        if (filters.ieName) {
            filtered = filtered.filter(
                (record) =>
                    record.ieName.toLowerCase().includes(filters.ieName.toLowerCase()) ||
                    record.employeeName.toLowerCase().includes(filters.ieName.toLowerCase())
            );
        }

        setFilteredRecords(filtered);
    }, [filters, monthEndRecords]);

    const handleCheckboxChange = (
        category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations',
        value: string,
        checked: boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            [category]: checked ? [...prev[category], value] : prev[category].filter((item) => item !== value)
        }));
    };

    const handleSelectAllChange = (category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations', checked: boolean) => {
        let allOptions: string[] = [];

        switch (category) {
            case 'selectedGroupTypes':
                allOptions = filterOptions.groupTypes;
                break;
            case 'selectedDepartments':
                allOptions = filterOptions.departments;
                break;
            case 'selectedDesignations':
                allOptions = filterOptions.designations;
                break;
        }

        setFilters((prev) => ({
            ...prev,
            [category]: checked ? allOptions : []
        }));
    };

    const handleFilterChange = (key: keyof MonthEndFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        setShowReport(true);
        toast.success('Month End Report generated');
    };

    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            month: '',
            year: '',
            ieName: ''
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Month End Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Month End summary
    const monthEndSummary: MonthEndSummary = useMemo(() => {
        const activeEmployees = filteredRecords.filter((record) => record.status === 'Active').length;
        const onLeaveEmployees = filteredRecords.filter((record) => record.status === 'On Leave').length;
        const absentEmployees = filteredRecords.filter((record) => record.status === 'Absent').length;

        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                activeEmployees: activeEmployees,
                onLeaveEmployees: onLeaveEmployees,
                absentEmployees: absentEmployees,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalGrossSalary: acc.totalGrossSalary + record.grossSalary,
                totalDeductions: acc.totalDeductions + record.totalDeductions,
                totalNetSalary: acc.totalNetSalary + record.netSalary,
                averageNetSalary: 0 // Will be calculated after
            }),
            {
                totalEmployees: 0,
                activeEmployees: 0,
                onLeaveEmployees: 0,
                absentEmployees: 0,
                totalBasicSalary: 0,
                totalGrossSalary: 0,
                totalDeductions: 0,
                totalNetSalary: 0,
                averageNetSalary: 0
            }
        );

        summary.averageNetSalary = filteredRecords.length > 0 ? Math.round(summary.totalNetSalary / filteredRecords.length) : 0;

        return summary;
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<MonthEndRecord>[] = [
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
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div className='text-sm'>{row.getValue('department')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'designation',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
            cell: ({ row }) => <div className='text-sm'>{row.getValue('designation')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'basicSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('basicSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'grossSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('grossSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalDeductions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Deductions' />,
            cell: ({ row }) => <div>₹{(row.getValue('totalDeductions') as number).toLocaleString()}</div>,
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
            accessorKey: 'presentDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Present Days' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('presentDays')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const variant =
                    status === 'Active' ? 'default' : status === 'On Leave' ? 'secondary' : status === 'Absent' ? 'destructive' : 'outline';
                return <Badge variant={variant}>{status}</Badge>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading
                    title='HRMS Month End Report'
                    description='Comprehensive monthly report for employee attendance, salary, and performance'
                />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='HRMS MONTH END REPORT'
                description='Configure filters to generate comprehensive monthly employee attendance and salary reports'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                {/* Filter Sections */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                    {/* Group Type Section */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-foreground text-sm'>Group Type:</span>
                            <span className='text-red-500'>*</span>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='all-groups'
                                    checked={filters.selectedGroupTypes.length === filterOptions.groupTypes.length}
                                    onCheckedChange={(checked) => handleSelectAllChange('selectedGroupTypes', checked as boolean)}
                                />
                                <label htmlFor='all-groups' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {filterOptions.groupTypes.map((groupType) => (
                                <div key={groupType} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`group-${groupType}`}
                                        checked={filters.selectedGroupTypes.includes(groupType)}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange('selectedGroupTypes', groupType, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`group-${groupType}`} className='cursor-pointer text-sm'>
                                        {groupType}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Section */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-foreground text-sm'>Department:</span>
                            <span className='text-red-500'>*</span>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='all-departments'
                                    checked={filters.selectedDepartments.length === filterOptions.departments.length}
                                    onCheckedChange={(checked) => handleSelectAllChange('selectedDepartments', checked as boolean)}
                                />
                                <label htmlFor='all-departments' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {filterOptions.departments.map((department) => (
                                <div key={department} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`dept-${department}`}
                                        checked={filters.selectedDepartments.includes(department)}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange('selectedDepartments', department, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`dept-${department}`} className='cursor-pointer text-sm'>
                                        {department}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Designation Section */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-foreground text-sm'>Designation:</span>
                            <span className='text-red-500'>*</span>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='all-designations'
                                    checked={filters.selectedDesignations.length === filterOptions.designations.length}
                                    onCheckedChange={(checked) => handleSelectAllChange('selectedDesignations', checked as boolean)}
                                />
                                <label htmlFor='all-designations' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {filterOptions.designations.map((designation) => (
                                <div key={designation} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`desig-${designation}`}
                                        checked={filters.selectedDesignations.includes(designation)}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange('selectedDesignations', designation, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`desig-${designation}`} className='cursor-pointer text-sm'>
                                        {designation}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Filters */}
                <div className='flex items-center justify-center gap-6 pt-4'>
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

                    {/* IE Name Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            IE Name: <span className='text-red-500'>*</span>
                        </span>
                        <InputText
                            placeholder='Enter name'
                            value={filters.ieName}
                            onChange={(e) => handleFilterChange('ieName', e.target.value)}
                            className='w-60'
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-center gap-2 pt-4'>
                    <Button onClick={handleSearch}>
                        <Search className='mr-2 h-4 w-4' />
                        SEARCH
                    </Button>
                    <Button variant='outline' onClick={handleCancel}>
                        CANCEL
                    </Button>
                </div>
            </CollapsibleSection>

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Month End Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Active: {monthEndSummary.activeEmployees} | Total Net Salary: ₹
                                {monthEndSummary.totalNetSalary.toLocaleString()}
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
                                <div className='font-semibold text-foreground text-lg'>{monthEndSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserCheck className='h-3 w-3' />
                                    Active Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{monthEndSummary.activeEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <TrendingUp className='h-3 w-3' />
                                    Total Gross Salary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{monthEndSummary.totalGrossSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Net Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹{monthEndSummary.totalNetSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Summary */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Salary Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Basic Salary:</span>
                                    <span className='font-semibold'>₹{monthEndSummary.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Gross Salary:</span>
                                    <span className='font-semibold'>₹{monthEndSummary.totalGrossSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Deductions:</span>
                                    <span className='font-semibold text-red-600'>₹{monthEndSummary.totalDeductions.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Net Salary:</span>
                                    <span className='font-semibold text-green-600'>₹{monthEndSummary.totalNetSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Average Net Salary:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{monthEndSummary.averageNetSalary.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Building className='h-4 w-4' />
                                    Employee Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Active Employees:</span>
                                    <span className='font-semibold text-green-600'>{monthEndSummary.activeEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>On Leave:</span>
                                    <span className='font-semibold text-yellow-600'>{monthEndSummary.onLeaveEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Absent:</span>
                                    <span className='font-semibold text-red-600'>{monthEndSummary.absentEmployees}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Report Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Generated By:</span>
                                    <span className='font-semibold'>{filters.ieName || 'HR Department'}</span>
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
                </div>
            )}
        </div>
    );
}
