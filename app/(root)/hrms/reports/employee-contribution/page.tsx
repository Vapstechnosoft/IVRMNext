'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Data interfaces from employee-category masters
interface GroupType extends BaseEntity {
    groupType: string;
    groupCode: string;
    order: number;
    isActive: boolean;
}

interface Department extends BaseEntity {
    departmentName: string;
    internalTrainingHours: string;
    order: number;
    isActive: boolean;
}

interface Designation extends BaseEntity {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
    order: number;
    isActive: boolean;
}

// Employee contribution data structure
interface EmployeeContribution extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    contributionType: 'Earning' | 'Deduction';
    contributionHead: string;
    monthlyAmount: number;
    contributionDate: string;
    pfContribution: number;
    esiContribution: number;
    professionalTax: number;
    totalContribution: number;
    cumulativeContribution: number;
}

// Report filters
interface ContributionReportFilters {
    groupType: string;
    department: string;
    designation: string;
    contributionType: 'Earning' | 'Deduction';
    dateType: 'Month' | 'Between Dates';
    selectedMonth: string;
    selectedYear: string;
    fromDate: Date | null;
    toDate: Date | null;
    reportType: 'All' | 'Individual';
}

export default function EmployeeContributionReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const contributionDB = createLocalCrud<EmployeeContribution>('report:employee-contribution');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [contributions, setContributions] = useState<EmployeeContribution[]>([]);
    const [filteredContributions, setFilteredContributions] = useState<EmployeeContribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<ContributionReportFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        contributionType: 'Earning',
        dateType: 'Month',
        selectedMonth: '',
        selectedYear: '',
        fromDate: null,
        toDate: null,
        reportType: 'All'
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            setGroupTypes(groupTypeDB.list().filter((g) => g.isActive));
            setDepartments(departmentDB.list().filter((d) => d.isActive));
            setDesignations(designationDB.list().filter((d) => d.isActive));

            // Load contribution data
            let contributionList = contributionDB.list();
            if (contributionList.length === 0) {
                const mockData = generateMockContributions();
                mockData.forEach((contribution) => contributionDB.create(contribution));
                contributionList = contributionDB.list(); // Reload data after creating mock records
            }
            setContributions(contributionList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock contribution data
    const generateMockContributions = (): Omit<EmployeeContribution, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                deptName: 'JUNIOR SCHOOL',
                desigName: 'Assistant Teacher'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                groupTypeId: 1,
                departmentId: 2,
                designationId: 2,
                deptName: 'OFFICE STAFF',
                desigName: 'Principal'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                groupTypeId: 2,
                departmentId: 1,
                designationId: 1,
                deptName: 'JUNIOR SCHOOL',
                desigName: 'Assistant Teacher'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                groupTypeId: 2,
                departmentId: 2,
                designationId: 2,
                deptName: 'SENIOR SCHOOL',
                desigName: 'Teacher Helper'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 2,
                deptName: 'SERVICE STAFF',
                desigName: 'System Manager'
            }
        ];

        const mockContributions: Omit<EmployeeContribution, 'id' | 'createdAt'>[] = [];
        const contributionTypes: ('Earning' | 'Deduction')[] = ['Earning', 'Deduction'];

        employees.forEach((emp, empIndex) => {
            contributionTypes.forEach((type) => {
                const monthlyAmount = 40000 + empIndex * 5000;
                const pfContribution = monthlyAmount * 0.12;
                const esiContribution = monthlyAmount * 0.0175;
                const professionalTax = 200;

                mockContributions.push({
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    groupTypeId: emp.groupTypeId,
                    departmentId: emp.departmentId,
                    designationId: emp.designationId,
                    departmentName: emp.deptName,
                    designationName: emp.desigName,
                    contributionType: type,
                    contributionHead: type === 'Earning' ? 'Basic Pay' : 'PF Contribution',
                    monthlyAmount: Math.round(monthlyAmount),
                    contributionDate: '2025-09-17',
                    pfContribution: Math.round(pfContribution),
                    esiContribution: Math.round(esiContribution),
                    professionalTax: professionalTax,
                    totalContribution: Math.round(pfContribution + esiContribution + professionalTax),
                    cumulativeContribution: Math.round((pfContribution + esiContribution + professionalTax) * 6) // 6 months cumulative
                });
            });
        });

        return mockContributions;
    };

    // Cascading filter logic
    const availableDepartments = useMemo(() => {
        if (filters.groupType === 'All') return departments;
        // In a real app, departments would be filtered by groupType relationship
        return departments;
    }, [filters.groupType, departments]);

    const availableDesignations = useMemo(() => {
        if (filters.department === 'All') return designations;
        // In a real app, designations would be filtered by department relationship
        return designations;
    }, [filters.department, designations]);

    // Filter contributions based on selected criteria
    useEffect(() => {
        let filtered = contributions;

        if (filters.groupType !== 'All') {
            const selectedGroupType = groupTypes.find((g) => g.groupType === filters.groupType);
            if (selectedGroupType) {
                filtered = filtered.filter((contribution) => contribution.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department !== 'All') {
            const selectedDepartment = departments.find((d) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((contribution) => contribution.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation !== 'All') {
            const selectedDesignation = designations.find((d) => d.designationName === filters.designation);
            if (selectedDesignation) {
                filtered = filtered.filter((contribution) => contribution.designationId === selectedDesignation.id);
            }
        }

        // Filter by contribution type
        filtered = filtered.filter((contribution) => contribution.contributionType === filters.contributionType);

        setFilteredContributions(filtered);
    }, [filters, contributions, groupTypes, departments, designations]);

    const handleFilterChange = (key: keyof ContributionReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
        } else if (key === 'department') {
            newFilters.designation = 'All';
        }

        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (filters.dateType === 'Month' && (!filters.selectedMonth || !filters.selectedYear)) {
            toast.error('Please select month and year');
            return;
        }

        if (filters.dateType === 'Between Dates' && (!filters.fromDate || !filters.toDate)) {
            toast.error('Please select from and to dates');
            return;
        }

        setShowReport(true);
        toast.success('Employee contribution report generated');
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            contributionType: 'Earning',
            dateType: 'Month',
            selectedMonth: '',
            selectedYear: '',
            fromDate: null,
            toDate: null,
            reportType: 'All'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee contribution report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredContributions.reduce(
            (acc, contribution) => ({
                pfContribution: acc.pfContribution + contribution.pfContribution,
                esiContribution: acc.esiContribution + contribution.esiContribution,
                professionalTax: acc.professionalTax + contribution.professionalTax,
                totalContribution: acc.totalContribution + contribution.totalContribution,
                cumulativeContribution: acc.cumulativeContribution + contribution.cumulativeContribution
            }),
            {
                pfContribution: 0,
                esiContribution: 0,
                professionalTax: 0,
                totalContribution: 0,
                cumulativeContribution: 0
            }
        );
    }, [filteredContributions]);

    // Table columns
    const columns: ColumnDef<EmployeeContribution>[] = [
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
            accessorKey: 'departmentName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div>{row.getValue('departmentName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'designationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
            cell: ({ row }) => <div>{row.getValue('designationName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'contributionHead',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Contribution Head' />,
            cell: ({ row }) => <div>{row.getValue('contributionHead')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'monthlyAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Monthly Amount' />,
            cell: ({ row }) => <div>₹{(row.getValue('monthlyAmount') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'pfContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='PF Contribution' />,
            cell: ({ row }) => <div>₹{(row.getValue('pfContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'esiContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Contribution' />,
            cell: ({ row }) => <div>₹{(row.getValue('esiContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'professionalTax',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Professional Tax' />,
            cell: ({ row }) => <div>₹{(row.getValue('professionalTax') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Contribution' />,
            cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('totalContribution') as number).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'cumulativeContribution',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Cumulative' />,
            cell: ({ row }) => (
                <div className='font-semibold text-blue-600'>₹{(row.getValue('cumulativeContribution') as number).toLocaleString()}</div>
            ),
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <CollapsibleSection
                title='EMPLOYEE CONTRIBUTION REPORT'
                description='Configure filters to generate employee contribution analysis'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-6'>
                    {/* Filter Section - Row 1: Cascading Dropdowns */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Group Type Filter */}
                        <div className='space-y-2'>
                            <Label htmlFor='groupType' className='font-medium text-foreground text-sm'>
                                Group Type: <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={filters.groupType} onValueChange={(value) => handleFilterChange('groupType', value)}>
                                <SelectTrigger id='groupType'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='All'>All</SelectItem>
                                    {groupTypes.map((group) => (
                                        <SelectItem key={group.id} value={group.groupType}>
                                            {group.groupType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department Filter */}
                        <div className='space-y-2'>
                            <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                                Department: <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                                <SelectTrigger id='department'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='All'>All</SelectItem>
                                    {availableDepartments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.departmentName}>
                                            {dept.departmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Designation Filter */}
                        <div className='space-y-2'>
                            <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                                Designation: <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={filters.designation} onValueChange={(value) => handleFilterChange('designation', value)}>
                                <SelectTrigger id='designation'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='All'>All</SelectItem>
                                    {availableDesignations.map((desig) => (
                                        <SelectItem key={desig.id} value={desig.designationName}>
                                            {desig.designationName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filter Section - Row 2: Radio Button Groups */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Earning/Deduction Selection */}
                        <div className='space-y-3'>
                            <span className='font-medium text-foreground text-sm'>Contribution Type:</span>
                            <div className='flex items-center gap-6'>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='contributionType'
                                        value='Earning'
                                        checked={filters.contributionType === 'Earning'}
                                        onChange={(e) => handleFilterChange('contributionType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    Earning <span className='text-red-500'>*</span>
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='contributionType'
                                        value='Deduction'
                                        checked={filters.contributionType === 'Deduction'}
                                        onChange={(e) => handleFilterChange('contributionType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    Deduction <span className='text-red-500'>*</span>
                                </label>
                            </div>
                        </div>

                        {/* Date Type Selection */}
                        <div className='space-y-3'>
                            <span className='font-medium text-foreground text-sm'>Date Range:</span>
                            <div className='flex items-center gap-6'>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='dateType'
                                        value='Month'
                                        checked={filters.dateType === 'Month'}
                                        onChange={(e) => handleFilterChange('dateType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    Month <span className='text-red-500'>*</span>
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='dateType'
                                        value='Between Dates'
                                        checked={filters.dateType === 'Between Dates'}
                                        onChange={(e) => handleFilterChange('dateType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    Between Dates <span className='text-red-500'>*</span>
                                </label>
                            </div>
                        </div>

                        {/* Report Type Selection */}
                        <div className='space-y-3'>
                            <span className='font-medium text-foreground text-sm'>Report Type:</span>
                            <div className='flex items-center gap-6'>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='reportType'
                                        value='All'
                                        checked={filters.reportType === 'All'}
                                        onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    All <span className='text-red-500'>*</span>
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        name='reportType'
                                        value='Individual'
                                        checked={filters.reportType === 'Individual'}
                                        onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                        className='text-primary focus:ring-primary'
                                    />
                                    Individual <span className='text-red-500'>*</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Date Selection */}
                    {filters.dateType === 'Month' ? (
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                                    Month
                                </Label>
                                <Select value={filters.selectedMonth} onValueChange={(value) => handleFilterChange('selectedMonth', value)}>
                                    <SelectTrigger id='month'>
                                        <SelectValue placeholder='Select Month' />
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
                            <div className='space-y-2'>
                                <Label htmlFor='year' className='font-medium text-foreground text-sm'>
                                    Year
                                </Label>
                                <Select value={filters.selectedYear} onValueChange={(value) => handleFilterChange('selectedYear', value)}>
                                    <SelectTrigger id='year'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
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
                    ) : (
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>From Date</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !filters.fromDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <CalendarYear
                                            mode='single'
                                            selected={filters.fromDate || undefined}
                                            onDayClick={(day) => handleFilterChange('fromDate', day)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>To Date</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !filters.toDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <CalendarYear
                                            mode='single'
                                            selected={filters.toDate || undefined}
                                            onDayClick={(day) => handleFilterChange('toDate', day)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex gap-2 pt-4'>
                        <Button onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' />
                            SEARCH
                        </Button>
                        <Button variant='outline' onClick={handleCancel} prefix={<X className='size-4' />}>
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
                                Employee Contribution Report - {filters.contributionType}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredContributions.length} contributions | Date Range:{' '}
                                {filters.dateType === 'Month' ? `${filters.selectedMonth} ${filters.selectedYear}` : 'Custom Range'}
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total PF</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.pfContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total ESI</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.esiContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Professional Tax</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.professionalTax.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total Contribution</div>
                            <div className='font-semibold text-green-600 text-lg'>₹{totals.totalContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Employees</div>
                            <div className='font-semibold text-foreground text-lg'>{filteredContributions.length}</div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={columns}
                        data={filteredContributions}
                        totalItems={filteredContributions.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
