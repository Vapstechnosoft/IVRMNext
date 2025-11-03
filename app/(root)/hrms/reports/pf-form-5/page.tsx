'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Calculator, Download, FileText, Printer, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Form 5 data structure (Register of Employees)
interface Form5Record extends BaseEntity {
    serialNo: number;
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    pfNumber: string;
    designation: string;
    department: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePFRate: number;
    employerPFRate: number;
    vpfRate: number;
    nomineeDetails: string;
    status: 'Active' | 'Left' | 'Resigned' | 'Terminated';
    month: string;
    year: string;
}

// Form 5 summary
interface Form5Summary {
    totalEmployees: number;
    activeEmployees: number;
    leftEmployees: number;
    newJoining: number;
    totalBasicSalary: number;
    totalPFEligibleSalary: number;
    averageSalary: number;
}

// Report filters
interface Form5Filters {
    month: string;
    year: string;
}

export default function Form5Page() {
    // Database instances
    const form5DB = createLocalCrud<Form5Record>('report:form-5');

    // State
    const [form5Records, setForm5Records] = useState<Form5Record[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Form5Record[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState<Form5Filters>({
        month: '',
        year: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load Form 5 records
            let recordList = form5DB.list();
            if (recordList.length === 0) {
                const mockData = generateMockForm5Data();
                mockData.forEach((record) => form5DB.create(record));
                recordList = form5DB.list(); // Reload data after creating mock records
            }
            setForm5Records(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock Form 5 data
    const generateMockForm5Data = (): Omit<Form5Record, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                father: 'LATE RANJAN BHADURI',
                dob: '1985-03-15',
                joining: '2020-04-01',
                designation: 'Senior Teacher',
                department: 'Mathematics'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                father: 'MR SUBRATA CHATTERJEE',
                dob: '1988-07-22',
                joining: '2021-06-15',
                designation: 'Teacher',
                department: 'English'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                father: 'MR DINESH SHAH',
                dob: '1982-11-10',
                joining: '2019-08-20',
                designation: 'Head Teacher',
                department: 'Science'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                father: 'MR KRISHNA DAS',
                dob: '1990-05-18',
                joining: '2022-01-10',
                designation: 'Teacher',
                department: 'Social Studies'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                father: 'MR BIMAL MUKHERJEE',
                dob: '1987-09-25',
                joining: '2020-11-25',
                designation: 'Physical Education Teacher',
                department: 'Sports'
            },
            {
                code: 'EMP006',
                name: 'MRS PRIYA SHARMA',
                father: 'MR RAJESH SHARMA',
                dob: '1989-12-03',
                joining: '2021-03-12',
                designation: 'Art Teacher',
                department: 'Fine Arts'
            },
            {
                code: 'EMP007',
                name: 'MR RAJESH KUMAR',
                father: 'MR SURESH KUMAR',
                dob: '1984-08-14',
                joining: '2020-07-08',
                designation: 'Computer Teacher',
                department: 'Computer Science'
            },
            {
                code: 'EMP008',
                name: 'MS ANITA SINGH',
                father: 'MR VIJAY SINGH',
                dob: '1991-04-30',
                joining: '2022-09-05',
                designation: 'Music Teacher',
                department: 'Music'
            }
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
        const mockRecords: Omit<Form5Record, 'id' | 'createdAt'>[] = [];

        employees.forEach((emp, empIndex) => {
            months.forEach((month, monthIndex) => {
                const basicSalary = 25000 + empIndex * 3000 + Math.random() * 5000;
                const pfEligibleSalary = Math.min(basicSalary, 15000); // PF ceiling
                const employeePFRate = 12; // 12% employee PF rate
                const employerPFRate = 12; // 12% employer PF rate
                const vpfRate = Math.random() > 0.7 ? 5 : 0; // 5% VPF for some employees

                // Some employees may have left during the year
                const hasLeft = Math.random() > 0.9;
                const status = hasLeft
                    ? (['Left', 'Resigned', 'Terminated'][Math.floor(Math.random() * 3)] as 'Left' | 'Resigned' | 'Terminated')
                    : 'Active';
                const dateOfLeaving = hasLeft
                    ? `2024-${String(monthIndex + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
                    : undefined;

                mockRecords.push({
                    serialNo: empIndex + 1,
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    fatherName: emp.father,
                    dateOfBirth: emp.dob,
                    dateOfJoining: emp.joining,
                    dateOfLeaving: dateOfLeaving,
                    pfNumber: `PF${emp.code.slice(-3)}/${month.slice(0, 3).toUpperCase()}/2025`,
                    designation: emp.designation,
                    department: emp.department,
                    basicSalary: Math.round(basicSalary),
                    pfEligibleSalary: Math.round(pfEligibleSalary),
                    employeePFRate: employeePFRate,
                    employerPFRate: employerPFRate,
                    vpfRate: vpfRate,
                    nomineeDetails: `${emp.father} (Father)`,
                    status: status,
                    month: month,
                    year: '2025'
                });
            });
        });

        return mockRecords;
    };

    // Filter Form 5 records based on selected month/year
    useEffect(() => {
        let filtered = form5Records;

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, form5Records]);

    const handleFilterChange = (key: keyof Form5Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        setShowForm(true);
        toast.success('Form 5 generated');
    };

    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setShowForm(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Form 5 exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Form 5 summary
    const form5Summary: Form5Summary = useMemo(() => {
        const activeEmployees = filteredRecords.filter((record) => record.status === 'Active').length;
        const leftEmployees = filteredRecords.filter((record) => record.status !== 'Active').length;
        const newJoining = filteredRecords.filter((record) => {
            if (!filters.month || !filters.year) return false;
            const joiningDate = new Date(record.dateOfJoining);
            const filterMonth = new Date(`${filters.month} 1, ${filters.year}`);
            return joiningDate.getMonth() === filterMonth.getMonth() && joiningDate.getFullYear() === filterMonth.getFullYear();
        }).length;

        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                activeEmployees: activeEmployees,
                leftEmployees: leftEmployees,
                newJoining: newJoining,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalPFEligibleSalary: acc.totalPFEligibleSalary + record.pfEligibleSalary,
                averageSalary: 0 // Will be calculated after reduce
            }),
            {
                totalEmployees: 0,
                activeEmployees: 0,
                leftEmployees: 0,
                newJoining: 0,
                totalBasicSalary: 0,
                totalPFEligibleSalary: 0,
                averageSalary: 0
            }
        );
    }, [filteredRecords, filters.month, filters.year]);

    // Calculate average salary
    form5Summary.averageSalary = filteredRecords.length > 0 ? Math.round(form5Summary.totalBasicSalary / filteredRecords.length) : 0;

    // Table columns
    const columns: ColumnDef<Form5Record>[] = [
        {
            accessorKey: 'serialNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Serial No.' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('serialNo')}</div>,
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
            accessorKey: 'fatherName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
            cell: ({ row }) => <div className='text-sm'>{row.getValue('fatherName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'dateOfBirth',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth' />,
            cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfBirth')).toLocaleDateString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'dateOfJoining',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' />,
            cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfJoining')).toLocaleDateString()}</div>,
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
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='PF Form 5' description='Register of Employees under the Employees Provident Fund Scheme' />
            </div>

            {/* Report Configuration Section */}
            <CollapsibleSection
                title='PF FORM 5'
                description='Generate register of employees for Provident Fund'
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

            {/* Form 5 Results */}
            {showForm && (
                <div className='space-y-4'>
                    {/* Form 5 Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Form 5 - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Employee Register | Total: {filteredRecords.length} | Active: {form5Summary.activeEmployees} | Left:{' '}
                                {form5Summary.leftEmployees}
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

                    {/* Form 5 Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{form5Summary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserPlus className='h-3 w-3' />
                                    Active Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{form5Summary.activeEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserMinus className='h-3 w-3' />
                                    Left Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>{form5Summary.leftEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Average Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{form5Summary.averageSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form 5 Statistics */}
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
                                    <span className='font-semibold'>₹{form5Summary.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total PF Eligible Salary:</span>
                                    <span className='font-semibold'>₹{form5Summary.totalPFEligibleSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Average Basic Salary:</span>
                                    <span className='font-semibold text-blue-600'>₹{form5Summary.averageSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Contribution Rate:</span>
                                    <span className='font-semibold'>12% (Employee) + 12% (Employer)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Register Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Register Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
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
                                    <span className='text-sm'>New Joinings:</span>
                                    <span className='font-semibold text-green-600'>{form5Summary.newJoining}</span>
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
                        columnPinning={{ left: ['serialNo'] }}
                    />

                    {/* Official Form 5 Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>FORM 5 - REGISTER OF EMPLOYEES</h2>
                                <h3 className='font-medium text-base text-foreground'>Under the Employees' Provident Fund Scheme, 1952</h3>
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
                                            <strong>Register Period:</strong> {filters.month} {filters.year}
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {form5Summary.totalEmployees}
                                        </div>
                                        <div>
                                            <strong>Active Employees:</strong> {form5Summary.activeEmployees}
                                        </div>
                                        <div>
                                            <strong>Left Employees:</strong> {form5Summary.leftEmployees}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>EMPLOYEE REGISTER SUMMARY</h3>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full border-collapse border border-gray-300 text-xs'>
                                            <thead>
                                                <tr className='bg-gray-50'>
                                                    <th className='border border-gray-300 p-2 text-left'>S.No.</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Employee Name</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Father&apos;s Name</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Date of Birth</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Date of Joining</th>
                                                    <th className='border border-gray-300 p-2 text-left'>PF Number</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Designation</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Basic Salary</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRecords.slice(0, 10).map((record, index) => (
                                                    <tr key={record.employeeCode}>
                                                        <td className='border border-gray-300 p-2'>{index + 1}</td>
                                                        <td className='border border-gray-300 p-2'>{record.employeeName}</td>
                                                        <td className='border border-gray-300 p-2'>{record.fatherName}</td>
                                                        <td className='border border-gray-300 p-2'>
                                                            {new Date(record.dateOfBirth).toLocaleDateString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            {new Date(record.dateOfJoining).toLocaleDateString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>{record.pfNumber}</td>
                                                        <td className='border border-gray-300 p-2'>{record.designation}</td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{record.basicSalary.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>{record.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredRecords.length > 10 && (
                                        <div className='text-center text-muted-foreground text-sm'>
                                            ... and {filteredRecords.length - 10} more employees
                                        </div>
                                    )}
                                </div>

                                <div className='space-y-2 text-sm'>
                                    <div>
                                        <strong>Important Information:</strong>
                                    </div>
                                    <ul className='list-inside list-disc space-y-1 text-xs'>
                                        <li>This register contains details of all employees covered under the EPF Scheme.</li>
                                        <li>
                                            Employee and Employer contributions are made at 12% each of basic salary (subject to ceiling).
                                        </li>
                                        <li>PF ceiling for contribution is ₹15,000 per month as per current regulations.</li>
                                        <li>
                                            All employees joining after the date of coverage are automatically enrolled in the PF scheme.
                                        </li>
                                        <li>Nominee details are recorded as per employee declarations at the time of joining.</li>
                                        <li>This register should be maintained and updated regularly as per EPFO guidelines.</li>
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
