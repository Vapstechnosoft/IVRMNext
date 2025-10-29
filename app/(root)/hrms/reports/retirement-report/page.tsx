'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { differenceInYears, format } from 'date-fns';
import { Calculator, Calendar as CalendarIcon, Clock, Download, Printer, Search, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Retirement Report data structure
interface RetirementRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    mobileNo: string;
    emailId: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    employeeType: string;
    department: string;
    designation: string;
    basicSalary: number;
    currentAge: number;
    serviceYears: number;
    retirementDate: string;
    yearsToRetirement: number;
    pfBalance: number;
    gratuityAmount: number;
    leaveBalance: number;
    status: 'Working' | 'Left' | 'Retired';
    retirementEligible: boolean;
}

// Retirement Summary
interface RetirementSummary {
    totalEmployees: number;
    workingEmployees: number;
    leftEmployees: number;
    retiredEmployees: number;
    eligibleForRetirement: number;
    retiringThisYear: number;
    totalPFBalance: number;
    totalGratuityAmount: number;
    averageServiceYears: number;
}

// Header fields for selection
const headerFields = [
    'Employee Code',
    'Employee Name',
    'Father Name',
    'Mobile No.',
    'Email Id',
    'Date Of Birth',
    'Employee Type',
    'Department',
    'Designation',
    'Date of Joining',
    'Date of Leaving',
    'Service Years',
    'Current Age',
    'Retirement Date',
    'PF Balance',
    'Gratuity Amount'
];

// Report filters
interface RetirementFilters {
    selectedHeaders: string[];
    format: 'format1' | 'format2';
    dateFilter: 'dateOfBirth' | 'dateOfJoining' | 'dateOfLeaving';
    fromDate: Date | undefined;
    toDate: Date | undefined;
    employeeStatus: 'working' | 'left';
    reportScope: 'all' | 'individual';
}

export default function RetirementReportPage() {
    // Database instances
    const retirementDB = createLocalCrud<RetirementRecord>('report:retirement');

    // State
    const [retirementRecords, setRetirementRecords] = useState<RetirementRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<RetirementRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<RetirementFilters>({
        selectedHeaders: [],
        format: 'format1',
        dateFilter: 'dateOfBirth',
        fromDate: new Date('2025-01-01'),
        toDate: new Date('2025-12-31'),
        employeeStatus: 'working',
        reportScope: 'all'
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Retirement records
            let recordList = retirementDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockRetirementData();
                mockData.forEach((record) => retirementDB.create(record));
                recordList = retirementDB.list(); // Reload data after creating mock records
            }
            setRetirementRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock Retirement data
    const generateMockRetirementData = (): Omit<RetirementRecord, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                father: 'LATE RANJAN BHADURI',
                mobile: '9876543210',
                email: 'sudipta.bhaduri@vapsschool.com',
                dob: '1960-03-15',
                joining: '1985-04-01',
                type: 'Teaching',
                dept: 'Mathematics',
                desig: 'Senior Teacher'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                father: 'MR SUBRATA CHATTERJEE',
                mobile: '9876543211',
                email: 'ruplekha.chatterjee@vapsschool.com',
                dob: '1965-07-22',
                joining: '1990-06-15',
                type: 'Teaching',
                dept: 'English',
                desig: 'Teacher'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                father: 'MR DINESH SHAH',
                mobile: '9876543212',
                email: 'john.shah@vapsschool.com',
                dob: '1958-11-10',
                joining: '1982-08-20',
                type: 'Teaching',
                dept: 'Science',
                desig: 'Head Teacher'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                father: 'MR KRISHNA DAS',
                mobile: '9876543213',
                email: 'bhaswati.das@vapsschool.com',
                dob: '1962-05-18',
                joining: '1988-01-10',
                type: 'Teaching',
                dept: 'Social Studies',
                desig: 'Teacher'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                father: 'MR BIMAL MUKHERJEE',
                mobile: '9876543214',
                email: 'santanu.mukherjee@vapsschool.com',
                dob: '1963-09-25',
                joining: '1990-11-25',
                type: 'Non Teaching',
                dept: 'Sports',
                desig: 'Physical Education Teacher'
            },
            {
                code: 'EMP006',
                name: 'MRS PRIYA SHARMA',
                father: 'MR RAJESH SHARMA',
                mobile: '9876543215',
                email: 'priya.sharma@vapsschool.com',
                dob: '1964-12-03',
                joining: '1992-03-12',
                type: 'Teaching',
                dept: 'Fine Arts',
                desig: 'Art Teacher'
            }
        ];

        const mockRecords: Omit<RetirementRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((emp) => {
            const dobDate = new Date(emp.dob);
            const joiningDate = new Date(emp.joining);
            const currentDate = new Date();
            const retirementAge = 60; // Assuming retirement age is 60
            const retirementDate = new Date(dobDate);
            retirementDate.setFullYear(dobDate.getFullYear() + retirementAge);

            const currentAge = differenceInYears(currentDate, dobDate);
            const serviceYears = differenceInYears(currentDate, joiningDate);
            const yearsToRetirement = Math.max(0, differenceInYears(retirementDate, currentDate));
            const retirementEligible = currentAge >= 58; // Eligible 2 years before retirement
            const hasLeft = Math.random() > 0.8; // 20% chance of having left
            const hasRetired = currentAge >= retirementAge;

            const status: 'Working' | 'Left' | 'Retired' = hasRetired ? 'Retired' : hasLeft ? 'Left' : 'Working';
            const basicSalary = 45000 + Math.random() * 25000;
            const pfBalance = serviceYears * 50000 + Math.random() * 100000;
            const gratuityAmount = serviceYears > 5 ? (serviceYears * basicSalary * 15) / 26 : 0;
            const leaveBalance = Math.floor(Math.random() * 30);

            mockRecords.push({
                employeeCode: emp.code,
                employeeName: emp.name,
                fatherName: emp.father,
                mobileNo: emp.mobile,
                emailId: emp.email,
                dateOfBirth: emp.dob,
                dateOfJoining: emp.joining,
                dateOfLeaving: hasLeft && !hasRetired ? '2024-12-31' : undefined,
                employeeType: emp.type,
                department: emp.dept,
                designation: emp.desig,
                basicSalary: Math.round(basicSalary),
                currentAge: currentAge,
                serviceYears: serviceYears,
                retirementDate: format(retirementDate, 'yyyy-MM-dd'),
                yearsToRetirement: yearsToRetirement,
                pfBalance: Math.round(pfBalance),
                gratuityAmount: Math.round(gratuityAmount),
                leaveBalance: leaveBalance,
                status: status,
                retirementEligible: retirementEligible
            });
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = retirementRecords;

        // Filter by employee status
        if (filters.employeeStatus === 'working') {
            filtered = filtered.filter((record) => record.status === 'Working');
        } else if (filters.employeeStatus === 'left') {
            filtered = filtered.filter((record) => record.status === 'Left' || record.status === 'Retired');
        }

        // Filter by date range
        if (filters.fromDate && filters.toDate) {
            filtered = filtered.filter((record) => {
                let compareDate: Date;

                switch (filters.dateFilter) {
                    case 'dateOfBirth':
                        compareDate = new Date(record.dateOfBirth);
                        break;
                    case 'dateOfJoining':
                        compareDate = new Date(record.dateOfJoining);
                        break;
                    case 'dateOfLeaving':
                        if (!record.dateOfLeaving) return false;
                        compareDate = new Date(record.dateOfLeaving);
                        break;
                    default:
                        compareDate = new Date(record.dateOfBirth);
                }

                return compareDate >= filters.fromDate! && compareDate <= filters.toDate!;
            });
        }

        setFilteredRecords(filtered);
    }, [filters, retirementRecords]);

    const handleHeaderChange = (header: string, checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            selectedHeaders: checked ? [...prev.selectedHeaders, header] : prev.selectedHeaders.filter((h) => h !== header)
        }));
    };

    const handleHeaderSelectAll = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            selectedHeaders: checked ? headerFields : []
        }));
    };

    const handleFilterChange = (key: keyof RetirementFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (key: 'fromDate' | 'toDate', date: Date | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: date }));
    };

    const handleSearch = () => {
        if (filters.selectedHeaders.length === 0) {
            toast.error('Please select at least one header field');
            return;
        }
        if (!filters.fromDate || !filters.toDate) {
            toast.error('Please select both from and to dates');
            return;
        }
        setShowReport(true);
        toast.success('Retirement Report generated');
    };

    const handleCancel = () => {
        setFilters({
            selectedHeaders: [],
            format: 'format1',
            dateFilter: 'dateOfBirth',
            fromDate: undefined,
            toDate: undefined,
            employeeStatus: 'working',
            reportScope: 'all'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Retirement Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Retirement summary
    const retirementSummary: RetirementSummary = useMemo(() => {
        const workingEmployees = filteredRecords.filter((record) => record.status === 'Working').length;
        const leftEmployees = filteredRecords.filter((record) => record.status === 'Left').length;
        const retiredEmployees = filteredRecords.filter((record) => record.status === 'Retired').length;
        const eligibleForRetirement = filteredRecords.filter((record) => record.retirementEligible).length;
        const retiringThisYear = filteredRecords.filter((record) => record.yearsToRetirement <= 1 && record.yearsToRetirement >= 0).length;

        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                workingEmployees: workingEmployees,
                leftEmployees: leftEmployees,
                retiredEmployees: retiredEmployees,
                eligibleForRetirement: eligibleForRetirement,
                retiringThisYear: retiringThisYear,
                totalPFBalance: acc.totalPFBalance + record.pfBalance,
                totalGratuityAmount: acc.totalGratuityAmount + record.gratuityAmount,
                averageServiceYears: 0 // Will be calculated after
            }),
            {
                totalEmployees: 0,
                workingEmployees: 0,
                leftEmployees: 0,
                retiredEmployees: 0,
                eligibleForRetirement: 0,
                retiringThisYear: 0,
                totalPFBalance: 0,
                totalGratuityAmount: 0,
                averageServiceYears: 0
            }
        );

        summary.averageServiceYears =
            filteredRecords.length > 0
                ? Math.round(filteredRecords.reduce((sum, record) => sum + record.serviceYears, 0) / filteredRecords.length)
                : 0;

        return summary;
    }, [filteredRecords]);

    // Dynamic table columns based on selected headers
    const columns: ColumnDef<RetirementRecord>[] = useMemo(() => {
        const baseColumns: ColumnDef<RetirementRecord>[] = [
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
            }
        ];

        // Add selected header columns
        filters.selectedHeaders.forEach((header) => {
            switch (header) {
                case 'Employee Code':
                    baseColumns.push({
                        accessorKey: 'employeeCode',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
                        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Employee Name':
                    baseColumns.push({
                        accessorKey: 'employeeName',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
                        cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Father Name':
                    baseColumns.push({
                        accessorKey: 'fatherName',
                        header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
                        cell: ({ row }) => <div className='text-sm'>{row.getValue('fatherName')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Mobile No.':
                    baseColumns.push({
                        accessorKey: 'mobileNo',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile No.' />,
                        cell: ({ row }) => <div className='font-mono text-sm'>{row.getValue('mobileNo')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Email Id':
                    baseColumns.push({
                        accessorKey: 'emailId',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Email Id' />,
                        cell: ({ row }) => <div className='text-sm'>{row.getValue('emailId')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Date Of Birth':
                    baseColumns.push({
                        accessorKey: 'dateOfBirth',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth' />,
                        cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfBirth')).toLocaleDateString()}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Date of Joining':
                    baseColumns.push({
                        accessorKey: 'dateOfJoining',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' />,
                        cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfJoining')).toLocaleDateString()}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Current Age':
                    baseColumns.push({
                        accessorKey: 'currentAge',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Current Age' />,
                        cell: ({ row }) => <div className='text-center'>{row.getValue('currentAge')} years</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Service Years':
                    baseColumns.push({
                        accessorKey: 'serviceYears',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Service Years' />,
                        cell: ({ row }) => <div className='text-center'>{row.getValue('serviceYears')} years</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Retirement Date':
                    baseColumns.push({
                        accessorKey: 'retirementDate',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Retirement Date' />,
                        cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('retirementDate')).toLocaleDateString()}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'PF Balance':
                    baseColumns.push({
                        accessorKey: 'pfBalance',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='PF Balance' />,
                        cell: ({ row }) => <div>₹{(row.getValue('pfBalance') as number).toLocaleString()}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Gratuity Amount':
                    baseColumns.push({
                        accessorKey: 'gratuityAmount',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Gratuity Amount' />,
                        cell: ({ row }) => <div>₹{(row.getValue('gratuityAmount') as number).toLocaleString()}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Department':
                    baseColumns.push({
                        accessorKey: 'department',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
                        cell: ({ row }) => <div className='text-sm'>{row.getValue('department')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
                case 'Designation':
                    baseColumns.push({
                        accessorKey: 'designation',
                        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
                        cell: ({ row }) => <div className='text-sm'>{row.getValue('designation')}</div>,
                        enableSorting: true,
                        enableHiding: true
                    });
                    break;
            }
        });

        // Always add status column
        baseColumns.push({
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const variant = status === 'Working' ? 'default' : status === 'Retired' ? 'secondary' : 'destructive';
                return <Badge variant={variant}>{status}</Badge>;
            },
            enableSorting: true,
            enableHiding: true
        });

        return baseColumns;
    }, [filters.selectedHeaders]);

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading
                    title='Employee Retirement Report'
                    description='Comprehensive report for employee retirement planning and benefits calculation'
                />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='EMPLOYEE RETIREMENT REPORT'
                description='Configure filters to analyze employee retirement data and projections'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Header Selection */}
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <label className='font-medium text-foreground text-sm'>Header:</label>
                                <span className='text-red-500'>*</span>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='all-headers'
                                        checked={filters.selectedHeaders.length === headerFields.length}
                                        onCheckedChange={(checked) => handleHeaderSelectAll(checked as boolean)}
                                    />
                                    <label htmlFor='all-headers' className='cursor-pointer text-sm'>
                                        All
                                    </label>
                                </div>
                            </div>
                            <div className='h-40 space-y-2 overflow-y-auto rounded-lg border p-3'>
                                {headerFields.map((header) => (
                                    <div key={header} className='flex items-center gap-2'>
                                        <Checkbox
                                            id={`header-${header}`}
                                            checked={filters.selectedHeaders.includes(header)}
                                            onCheckedChange={(checked) => handleHeaderChange(header, checked as boolean)}
                                        />
                                        <label htmlFor={`header-${header}`} className='cursor-pointer text-sm'>
                                            {header}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        {/* Format Selection */}
                        <div className='space-y-3'>
                            <label className='font-medium text-foreground text-sm'>Format:</label>
                            <RadioGroup
                                value={filters.format}
                                onValueChange={(value) => handleFilterChange('format', value)}
                                className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='format1' id='format1' />
                                    <label htmlFor='format1' className='cursor-pointer text-sm'>
                                        Format 1
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='format2' id='format2' />
                                    <label htmlFor='format2' className='cursor-pointer text-sm'>
                                        Format 2
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Date Filter Selection */}
                        <div className='space-y-3'>
                            <label className='font-medium text-foreground text-sm'>Date Filter:</label>
                            <RadioGroup
                                value={filters.dateFilter}
                                onValueChange={(value) => handleFilterChange('dateFilter', value)}
                                className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='dateOfBirth' id='dateOfBirth' />
                                    <label htmlFor='dateOfBirth' className='cursor-pointer text-sm'>
                                        Date of Birth
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='dateOfJoining' id='dateOfJoining' />
                                    <label htmlFor='dateOfJoining' className='cursor-pointer text-sm'>
                                        Date of Joining
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='dateOfLeaving' id='dateOfLeaving' />
                                    <label htmlFor='dateOfLeaving' className='cursor-pointer text-sm'>
                                        Date of Leaving
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Date Range Selection */}
                        <div className='flex items-center gap-4'>
                            <div className='space-y-2'>
                                <label className='font-medium text-foreground text-sm'>From:</label>
                                <span className='text-red-500'>*</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-[140px] justify-start text-left font-normal',
                                                !filters.fromDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : '17-09-2025'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <Calendar
                                            mode='single'
                                            selected={filters.fromDate}
                                            onSelect={(date) => handleDateChange('fromDate', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='space-y-2'>
                                <label className='font-medium text-foreground text-sm'>To:</label>
                                <span className='text-red-500'>*</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-[140px] justify-start text-left font-normal',
                                                !filters.toDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : '17-09-2025'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <Calendar
                                            mode='single'
                                            selected={filters.toDate}
                                            onSelect={(date) => handleDateChange('toDate', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Employee Status */}
                        <div className='space-y-3'>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='working'
                                        checked={filters.employeeStatus === 'working'}
                                        onCheckedChange={(checked) => checked && handleFilterChange('employeeStatus', 'working')}
                                    />
                                    <label htmlFor='working' className='cursor-pointer text-sm'>
                                        Working
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='left'
                                        checked={filters.employeeStatus === 'left'}
                                        onCheckedChange={(checked) => checked && handleFilterChange('employeeStatus', 'left')}
                                    />
                                    <label htmlFor='left' className='cursor-pointer text-sm'>
                                        Left
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Report Scope */}
                        <div className='space-y-3'>
                            <label className='font-medium text-foreground text-sm'>Report Scope:</label>
                            <RadioGroup
                                value={filters.reportScope}
                                onValueChange={(value) => handleFilterChange('reportScope', value)}
                                className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='all' id='all' />
                                    <label htmlFor='all' className='cursor-pointer text-sm'>
                                        All
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='individual' id='individual' />
                                    <label htmlFor='individual' className='cursor-pointer text-sm'>
                                        Individual
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>
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
                                Employee Retirement Report - {filters.format.toUpperCase()}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Eligible for Retirement:{' '}
                                {retirementSummary.eligibleForRetirement} | Retiring This Year: {retirementSummary.retiringThisYear}
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
                                <div className='font-semibold text-foreground text-lg'>{retirementSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserCheck className='h-3 w-3' />
                                    Working Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{retirementSummary.workingEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Clock className='h-3 w-3' />
                                    Eligible for Retirement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>{retirementSummary.eligibleForRetirement}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Retiring This Year</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>{retirementSummary.retiringThisYear}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Summary */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Retirement Benefits Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total PF Balance:</span>
                                    <span className='font-semibold'>₹{retirementSummary.totalPFBalance.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Gratuity Amount:</span>
                                    <span className='font-semibold'>₹{retirementSummary.totalGratuityAmount.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Average Service Years:</span>
                                    <span className='font-semibold'>{retirementSummary.averageServiceYears} years</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Total Retirement Benefits:</span>
                                    <span className='font-semibold text-green-600'>
                                        ₹{(retirementSummary.totalPFBalance + retirementSummary.totalGratuityAmount).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <CalendarIcon className='h-4 w-4' />
                                    Employee Status Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Working:</span>
                                    <span className='font-semibold text-green-600'>{retirementSummary.workingEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Left:</span>
                                    <span className='font-semibold text-red-600'>{retirementSummary.leftEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Retired:</span>
                                    <span className='font-semibold text-blue-600'>{retirementSummary.retiredEmployees}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Report Format:</span>
                                    <span className='font-semibold'>{filters.format.toUpperCase()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Date Filter:</span>
                                    <span className='font-semibold capitalize'>{filters.dateFilter.replace(/([A-Z])/g, ' $1').trim()}</span>
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
