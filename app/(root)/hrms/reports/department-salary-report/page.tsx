'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Building, Calculator, DollarSign, Download, Printer, Search, TrendingUp, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Department Salary Report data structure
interface DepartmentSalaryRecord extends BaseEntity {
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
    professionalTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    overtimeAmount: number;
    bonusAmount: number;
    incrementAmount: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leavesTaken: number;
    month: string;
    year: string;
}

// Department Summary
interface DepartmentSummary {
    department: string;
    totalEmployees: number;
    totalBasicSalary: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    averageNetSalary: number;
    highestSalary: number;
    lowestSalary: number;
}

// Overall Summary
interface OverallSummary {
    totalEmployees: number;
    totalDepartments: number;
    totalBasicSalary: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    averageNetSalary: number;
    totalOvertimeAmount: number;
    totalBonusAmount: number;
    totalIncrementAmount: number;
}

// Filter options
interface FilterOptions {
    groupTypes: string[];
    departments: string[];
    designations: string[];
}

// Report filters
interface DepartmentSalaryFilters {
    selectedGroupTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    month: string;
    year: string;
}

export default function DepartmentSalaryReportPage() {
    // Database instances
    const deptSalaryDB = createLocalCrud<DepartmentSalaryRecord>('report:department-salary');

    // State
    const [salaryRecords, setSalaryRecords] = useState<DepartmentSalaryRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<DepartmentSalaryRecord[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        groupTypes: [],
        departments: [],
        designations: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<DepartmentSalaryFilters>({
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
            // Load Department Salary records
            let recordList = deptSalaryDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockDepartmentSalaryData();
                mockData.forEach((record) => deptSalaryDB.create(record));
                recordList = deptSalaryDB.list(); // Reload data after creating mock records
            }
            setSalaryRecords(recordList);

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

    // Generate mock Department Salary data
    const generateMockDepartmentSalaryData = (): Omit<DepartmentSalaryRecord, 'id' | 'createdAt'>[] => {
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
            'MS NEHA AGARWAL',
            'MR SANJAY KUMAR',
            'MRS SUNITA VERMA'
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
        const mockRecords: Omit<DepartmentSalaryRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((empName, empIndex) => {
            months.forEach((month) => {
                const basicSalary = 30000 + empIndex * 2500 + Math.random() * 8000;
                const allowances = basicSalary * (0.25 + Math.random() * 0.15); // 25-40% allowances
                const grossSalary = basicSalary + allowances;

                const pfContribution = Math.min(basicSalary, 15000) * 0.12; // 12% PF on eligible salary
                const esiContribution = grossSalary <= 21000 ? grossSalary * 0.0075 : 0; // 0.75% ESI if eligible
                const incomeTax = grossSalary > 50000 ? grossSalary * 0.1 : grossSalary > 30000 ? grossSalary * 0.05 : 0;
                const professionalTax = grossSalary > 20000 ? 200 : 150; // PT based on salary slab
                const otherDeductions = Math.random() * 1500; // Random other deductions
                const totalDeductions = pfContribution + esiContribution + incomeTax + professionalTax + otherDeductions;
                const netSalary = grossSalary - totalDeductions;

                const overtimeAmount = Math.random() > 0.7 ? Math.random() * 5000 : 0; // Some overtime
                const bonusAmount = Math.random() > 0.8 ? Math.random() * 10000 : 0; // Some bonus
                const incrementAmount = Math.random() > 0.9 ? Math.random() * 3000 : 0; // Some increment

                const workingDays = 22 + Math.floor(Math.random() * 4); // 22-25 working days
                const absentDays = Math.floor(Math.random() * 3); // 0-2 absent days
                const leavesTaken = Math.floor(Math.random() * 2); // 0-1 leaves
                const presentDays = workingDays - absentDays - leavesTaken;

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
                    professionalTax: Math.round(professionalTax),
                    otherDeductions: Math.round(otherDeductions),
                    totalDeductions: Math.round(totalDeductions),
                    netSalary: Math.round(netSalary),
                    overtimeAmount: Math.round(overtimeAmount),
                    bonusAmount: Math.round(bonusAmount),
                    incrementAmount: Math.round(incrementAmount),
                    workingDays: workingDays,
                    presentDays: presentDays,
                    absentDays: absentDays,
                    leavesTaken: leavesTaken,
                    month: month,
                    year: '2025'
                });
            });
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = salaryRecords;

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
    }, [filters, salaryRecords]);

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

    const handleFilterChange = (key: keyof DepartmentSalaryFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        setShowReport(true);
        toast.success('Department Salary Report generated');
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

    const handleExport = () => {
        toast.success('Department Salary Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Overall summary
    const overallSummary: OverallSummary = useMemo(() => {
        const uniqueDepartments = [...new Set(filteredRecords.map((record) => record.department))];

        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                totalDepartments: uniqueDepartments.length,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalGrossSalary: acc.totalGrossSalary + record.grossSalary,
                totalDeductions: acc.totalDeductions + record.totalDeductions,
                totalNetSalary: acc.totalNetSalary + record.netSalary,
                averageNetSalary: 0, // Will be calculated after
                totalOvertimeAmount: acc.totalOvertimeAmount + record.overtimeAmount,
                totalBonusAmount: acc.totalBonusAmount + record.bonusAmount,
                totalIncrementAmount: acc.totalIncrementAmount + record.incrementAmount
            }),
            {
                totalEmployees: 0,
                totalDepartments: 0,
                totalBasicSalary: 0,
                totalGrossSalary: 0,
                totalDeductions: 0,
                totalNetSalary: 0,
                averageNetSalary: 0,
                totalOvertimeAmount: 0,
                totalBonusAmount: 0,
                totalIncrementAmount: 0
            }
        );

        summary.averageNetSalary = filteredRecords.length > 0 ? Math.round(summary.totalNetSalary / filteredRecords.length) : 0;

        return summary;
    }, [filteredRecords]);

    // Calculate Department-wise summary
    const departmentSummaries: DepartmentSummary[] = useMemo(() => {
        const departmentMap = new Map<string, DepartmentSalaryRecord[]>();

        filteredRecords.forEach((record) => {
            if (!departmentMap.has(record.department)) {
                departmentMap.set(record.department, []);
            }
            departmentMap.get(record.department)!.push(record);
        });

        return Array.from(departmentMap.entries())
            .map(([department, records]) => {
                const totalBasicSalary = records.reduce((sum, r) => sum + r.basicSalary, 0);
                const totalGrossSalary = records.reduce((sum, r) => sum + r.grossSalary, 0);
                const totalDeductions = records.reduce((sum, r) => sum + r.totalDeductions, 0);
                const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);
                const salaries = records.map((r) => r.netSalary);

                return {
                    department,
                    totalEmployees: records.length,
                    totalBasicSalary,
                    totalGrossSalary,
                    totalDeductions,
                    totalNetSalary,
                    averageNetSalary: Math.round(totalNetSalary / records.length),
                    highestSalary: Math.max(...salaries),
                    lowestSalary: Math.min(...salaries)
                };
            })
            .sort((a, b) => b.totalNetSalary - a.totalNetSalary);
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<DepartmentSalaryRecord>[] = [
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
            cell: ({ row }) => <div className='font-medium text-sm'>{row.getValue('department')}</div>,
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
            cell: ({ row }) => <div className='text-red-600'>₹{(row.getValue('totalDeductions') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'netSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
            cell: ({ row }) => (
                <div className='font-semibold text-green-600'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>
            ),
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'presentDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Present Days' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('presentDays')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    // Department summary columns
    const departmentColumns: ColumnDef<DepartmentSummary>[] = [
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div className='font-semibold'>{row.getValue('department')}</div>,
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'totalEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Employees' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('totalEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalBasicSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Basic Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('totalBasicSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalNetSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Net Salary' />,
            cell: ({ row }) => (
                <div className='font-semibold text-green-600'>₹{(row.getValue('totalNetSalary') as number).toLocaleString()}</div>
            ),
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'averageNetSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Average Net Salary' />,
            cell: ({ row }) => <div>₹{(row.getValue('averageNetSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'highestSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Highest Salary' />,
            cell: ({ row }) => <div className='text-blue-600'>₹{(row.getValue('highestSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'lowestSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Lowest Salary' />,
            cell: ({ row }) => <div className='text-orange-600'>₹{(row.getValue('lowestSalary') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Department Salary Report' description='Comprehensive departmental salary analysis and breakdown report' />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='DEPARTMENT SALARY REPORT'
                description='Configure filters to generate departmental salary analysis'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-6'>
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
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-2 pt-4'>
                        <Button onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' />
                            SEARCH
                        </Button>
                        <Button variant='outline' onClick={handleCancel}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Department Salary Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Departments: {overallSummary.totalDepartments} | Total Salary: ₹
                                {overallSummary.totalNetSalary.toLocaleString()}
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
                                <div className='font-semibold text-foreground text-lg'>{overallSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Building className='h-3 w-3' />
                                    Total Departments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>{overallSummary.totalDepartments}</div>
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
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹{overallSummary.totalGrossSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <DollarSign className='h-3 w-3' />
                                    Total Net Salary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{overallSummary.totalNetSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Building className='h-4 w-4' />
                                Department-wise Salary Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={departmentColumns}
                                data={departmentSummaries}
                                totalItems={departmentSummaries.length}
                                showViewOptions={true}
                                columnPinning={{ left: ['department'] }}
                            />
                        </CardContent>
                    </Card>

                    {/* Detailed Summary */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Overall Salary Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Basic Salary:</span>
                                    <span className='font-semibold'>₹{overallSummary.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Gross Salary:</span>
                                    <span className='font-semibold'>₹{overallSummary.totalGrossSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Deductions:</span>
                                    <span className='font-semibold text-red-600'>₹{overallSummary.totalDeductions.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Net Salary:</span>
                                    <span className='font-semibold text-green-600'>₹{overallSummary.totalNetSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Average Net Salary:</span>
                                    <span className='font-semibold text-blue-600'>₹{overallSummary.averageNetSalary.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <TrendingUp className='h-4 w-4' />
                                    Additional Components
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Overtime Amount:</span>
                                    <span className='font-semibold text-purple-600'>
                                        ₹{overallSummary.totalOvertimeAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Bonus Amount:</span>
                                    <span className='font-semibold text-green-600'>
                                        ₹{overallSummary.totalBonusAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Increment Amount:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{overallSummary.totalIncrementAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Report Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Generated On:</span>
                                    <span className='font-semibold'>{new Date().toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Employee Details Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Users className='h-4 w-4' />
                                Employee-wise Salary Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                isLoading={isLoading}
                                columns={columns}
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
