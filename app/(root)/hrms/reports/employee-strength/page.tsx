'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { BarChart3, CalendarIcon, Download, Printer, Search, X } from 'lucide-react';
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

// Employee strength data structure
interface EmployeeStrengthRecord extends BaseEntity {
    departmentName: string;
    designationName: string;
    groupType: string;
    totalEmployees: number;
    activeEmployees: number;
    leftEmployees: number;
    newJoinees: number;
    maleEmployees: number;
    femaleEmployees: number;
    dateRange: string;
}

// Report filters
interface StrengthReportFilters {
    groupType: string;
    department: string;
    designation: string;
    employeeCategories: {
        allEmployee: boolean;
        departmentWise: boolean;
        leftEmployee: boolean;
    };
    fromDate: Date | null;
    toDate: Date | null;
}

export default function EmployeeStrengthReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const strengthDB = createLocalCrud<EmployeeStrengthRecord>('report:employee-strength');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [strengthRecords, setStrengthRecords] = useState<EmployeeStrengthRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<EmployeeStrengthRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<StrengthReportFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        employeeCategories: {
            allEmployee: false,
            departmentWise: false,
            leftEmployee: false
        },
        fromDate: new Date('2025-09-17'),
        toDate: new Date('2025-09-17')
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

            // Load strength records
            let recordList = strengthDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockStrengthData();
                mockData.forEach((record) => strengthDB.create(record));
                recordList = strengthDB.list(); // Reload data after creating mock records
            }
            setStrengthRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock employee strength data
    const generateMockStrengthData = (): Omit<EmployeeStrengthRecord, 'id' | 'createdAt'>[] => {
        const departments = ['JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'SERVICE STAFF', 'ADMINISTRATIVE'];
        const designations = ['Assistant Teacher', 'Principal', 'Vice Principal', 'Office Assistant', 'System Manager', 'Teacher Helper'];
        const groupTypes = ['Teaching', 'Non Teaching', 'Administrative'];

        const mockRecords: Omit<EmployeeStrengthRecord, 'id' | 'createdAt'>[] = [];

        departments.forEach((dept, _deptIndex) => {
            designations.forEach((desig, _desigIndex) => {
                groupTypes.forEach((group, _groupIndex) => {
                    const totalEmployees = 5 + Math.floor(Math.random() * 15);
                    const leftEmployees = Math.floor(Math.random() * 3);
                    const activeEmployees = totalEmployees - leftEmployees;
                    const newJoinees = Math.floor(Math.random() * 4);
                    const maleEmployees = Math.floor(totalEmployees * 0.6);
                    const femaleEmployees = totalEmployees - maleEmployees;

                    mockRecords.push({
                        departmentName: dept,
                        designationName: desig,
                        groupType: group,
                        totalEmployees,
                        activeEmployees,
                        leftEmployees,
                        newJoinees,
                        maleEmployees,
                        femaleEmployees,
                        dateRange: '17-09-2025 to 17-09-2025'
                    });
                });
            });
        });

        return mockRecords;
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

    // Filter strength records based on selected criteria
    useEffect(() => {
        let filtered = strengthRecords;

        if (filters.groupType !== 'All') {
            filtered = filtered.filter((record) => record.groupType === filters.groupType);
        }

        if (filters.department !== 'All') {
            filtered = filtered.filter((record) => record.departmentName === filters.department);
        }

        if (filters.designation !== 'All') {
            filtered = filtered.filter((record) => record.designationName === filters.designation);
        }

        // Apply employee category filters
        if (
            !filters.employeeCategories.allEmployee &&
            !filters.employeeCategories.departmentWise &&
            !filters.employeeCategories.leftEmployee
        ) {
            // If no categories selected, show all
            setFilteredRecords(filtered);
            return;
        }

        let categoryFiltered: EmployeeStrengthRecord[] = [];

        if (filters.employeeCategories.allEmployee) {
            categoryFiltered = [...filtered];
        }

        if (filters.employeeCategories.departmentWise) {
            // Group by department for department-wise view
            categoryFiltered = [...filtered];
        }

        if (filters.employeeCategories.leftEmployee) {
            // Filter to show only records with left employees
            categoryFiltered = filtered.filter((record) => record.leftEmployees > 0);
        }

        setFilteredRecords(categoryFiltered);
    }, [filters, strengthRecords]);

    const handleFilterChange = (key: keyof Omit<StrengthReportFilters, 'employeeCategories' | 'fromDate' | 'toDate'>, value: string) => {
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

    const handleCategoryChange = (category: keyof StrengthReportFilters['employeeCategories'], checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            employeeCategories: {
                ...prev.employeeCategories,
                [category]: checked
            }
        }));
    };

    const handleSearch = () => {
        if (!filters.fromDate || !filters.toDate) {
            toast.error('Please select from and to dates');
            return;
        }
        setShowReport(true);
        toast.success('Employee strength report generated');
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            employeeCategories: {
                allEmployee: false,
                departmentWise: false,
                leftEmployee: false
            },
            fromDate: new Date('2025-09-17'),
            toDate: new Date('2025-09-17')
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee strength report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: acc.totalEmployees + record.totalEmployees,
                activeEmployees: acc.activeEmployees + record.activeEmployees,
                leftEmployees: acc.leftEmployees + record.leftEmployees,
                newJoinees: acc.newJoinees + record.newJoinees,
                maleEmployees: acc.maleEmployees + record.maleEmployees,
                femaleEmployees: acc.femaleEmployees + record.femaleEmployees
            }),
            {
                totalEmployees: 0,
                activeEmployees: 0,
                leftEmployees: 0,
                newJoinees: 0,
                maleEmployees: 0,
                femaleEmployees: 0
            }
        );
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<EmployeeStrengthRecord>[] = [
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
            accessorKey: 'departmentName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('departmentName')}</div>,
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
            accessorKey: 'groupType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />,
            cell: ({ row }) => <div>{row.getValue('groupType')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
            cell: ({ row }) => <div className='font-semibold'>{row.getValue('totalEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'activeEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
            cell: ({ row }) => <div className='font-medium text-green-600'>{row.getValue('activeEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'leftEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Left' />,
            cell: ({ row }) => <div className='font-medium text-red-600'>{row.getValue('leftEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'newJoinees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='New Joinees' />,
            cell: ({ row }) => <div className='font-medium text-blue-600'>{row.getValue('newJoinees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'maleEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Male' />,
            cell: ({ row }) => <div>{row.getValue('maleEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'femaleEmployees',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Female' />,
            cell: ({ row }) => <div>{row.getValue('femaleEmployees')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Employee Strength Report' description='Analyze employee strength across departments and designations' />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='EMPLOYEE STRENGTH REPORT'
                description='Configure filters to analyze employee strength distribution'
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

                    {/* Filter Section - Row 2: Employee Categories */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex items-center gap-2 text-sm'>
                            <Checkbox
                                id='employeeCategoryAll'
                                checked={filters.employeeCategories.allEmployee}
                                onCheckedChange={(checked) => handleCategoryChange('allEmployee', !!checked)}
                            />
                            <Label htmlFor='employeeCategoryAll' className='cursor-pointer'>
                                All Employee
                            </Label>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                            <Checkbox
                                id='employeeCategoryDeptWise'
                                checked={filters.employeeCategories.departmentWise}
                                onCheckedChange={(checked) => handleCategoryChange('departmentWise', !!checked)}
                            />
                            <Label htmlFor='employeeCategoryDeptWise' className='cursor-pointer'>
                                Department wise
                            </Label>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                            <Checkbox
                                id='employeeCategoryLeft'
                                checked={filters.employeeCategories.leftEmployee}
                                onCheckedChange={(checked) => handleCategoryChange('leftEmployee', !!checked)}
                            />
                            <Label htmlFor='employeeCategoryLeft' className='cursor-pointer'>
                                Left Employee
                            </Label>
                        </div>
                    </div>

                    {/* Date Range Selection */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>From :</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !filters.fromDate && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : <span>17-09-2025</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={filters.fromDate || undefined}
                                        onSelect={(date) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                fromDate: date || null
                                            }))
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>To :</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !filters.toDate && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : <span>17-09-2025</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={filters.toDate || undefined}
                                        onSelect={(date) => setFilters((prev) => ({ ...prev, toDate: date || null }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

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
                            <h3 className='font-semibold text-foreground text-lg'>Employee Strength Report</h3>
                            <p className='text-muted-foreground text-sm'>
                                Date Range: {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : ''} to{' '}
                                {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : ''} | Records: {filteredRecords.length}
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

                    {/* Summary Statistics Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Active</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{summaryStats.activeEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Left</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>{summaryStats.leftEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>New Joinees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>{summaryStats.newJoinees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Male</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.maleEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Female</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.femaleEmployees}</div>
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

                    {/* Visual Chart */}
                    <div className='rounded-lg border bg-card p-4'>
                        <div className='mb-4 flex items-center gap-2 font-semibold text-foreground text-lg'>
                            <BarChart3 className='h-5 w-5' />
                            Employee Strength Distribution
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Department-wise Chart */}
                            <div>
                                <h4 className='mb-3 font-medium text-foreground text-sm'>Department-wise Distribution</h4>
                                <div className='space-y-2'>
                                    {Array.from(new Set(filteredRecords.map((r) => r.departmentName))).map((dept, index) => {
                                        const deptTotal = filteredRecords
                                            .filter((r) => r.departmentName === dept)
                                            .reduce((sum, r) => sum + r.totalEmployees, 0);
                                        const maxTotal = Math.max(
                                            ...Array.from(new Set(filteredRecords.map((r) => r.departmentName))).map((d) =>
                                                filteredRecords
                                                    .filter((r) => r.departmentName === d)
                                                    .reduce((sum, r) => sum + r.totalEmployees, 0)
                                            )
                                        );
                                        const width = (deptTotal / maxTotal) * 100;
                                        const colors = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

                                        return (
                                            <div key={dept} className='space-y-1'>
                                                <div className='flex justify-between text-sm'>
                                                    <span>{dept}</span>
                                                    <span className='font-medium'>{deptTotal}</span>
                                                </div>
                                                <div className='h-2 w-full rounded-full bg-gray-200'>
                                                    <div
                                                        className='h-2 rounded-full transition-all duration-300'
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: colors[index % colors.length]
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Distribution */}
                            <div>
                                <h4 className='mb-3 font-medium text-foreground text-sm'>Status Distribution</h4>
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between rounded-lg border p-3'>
                                        <span className='text-sm'>Active Employees</span>
                                        <span className='font-semibold text-green-600 text-lg'>{summaryStats.activeEmployees}</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg border p-3'>
                                        <span className='text-sm'>Left Employees</span>
                                        <span className='font-semibold text-lg text-red-600'>{summaryStats.leftEmployees}</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg border p-3'>
                                        <span className='text-sm'>New Joinees</span>
                                        <span className='font-semibold text-blue-600 text-lg'>{summaryStats.newJoinees}</span>
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
