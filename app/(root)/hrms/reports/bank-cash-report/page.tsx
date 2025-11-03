'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { Banknote, CreditCard, Download, Printer, Search, Wallet, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Data interfaces
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

// Bank cash report data structure
interface BankCashRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupType: string;
    departmentName: string;
    designationName: string;
    paymentMode: 'Bank' | 'Cash';
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    grossSalary: number;
    netSalary: number;
    deductions: number;
    month: string;
    year: string;
    paymentDate: string;
    paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

// Report filters
interface BankCashReportFilters {
    selectedTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    paymentMode: 'Bank' | 'Cash';
    month: string;
    year: string;
}

export default function BankCashReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const bankCashDB = createLocalCrud<BankCashRecord>('report:bank-cash');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [bankCashRecords, setBankCashRecords] = useState<BankCashRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<BankCashRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<BankCashReportFilters>({
        selectedTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        paymentMode: 'Bank',
        month: '',
        year: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load master data
            const groupTypeList = groupTypeDB.list();
            const departmentList = departmentDB.list();
            const designationList = designationDB.list();

            setGroupTypes(groupTypeList);
            setDepartments(departmentList);
            setDesignations(designationList);

            // Load or generate bank cash records
            let recordList = bankCashDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockBankCashData(groupTypeList, departmentList, designationList);
                mockData.forEach((record) => bankCashDB.create(record));
                recordList = bankCashDB.list();
            }
            setBankCashRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock bank cash data
    const generateMockBankCashData = (
        groupTypes: GroupType[],
        departments: Department[],
        designations: Designation[]
    ): Omit<BankCashRecord, 'id' | 'createdAt'>[] => {
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
            'MS DEEPIKA PATEL'
        ];

        const banks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
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
        const paymentStatuses: ('Paid' | 'Pending' | 'Failed')[] = ['Paid', 'Pending', 'Failed'];
        const mockRecords: Omit<BankCashRecord, 'id' | 'createdAt'>[] = [];

        employees.forEach((empName, index) => {
            const isBankPayment = Math.random() > 0.3; // 70% bank, 30% cash
            const grossSalary = 30000 + index * 5000 + Math.random() * 10000;
            const deductions = grossSalary * (0.1 + Math.random() * 0.1); // 10-20% deductions
            const netSalary = grossSalary - deductions;

            const month = months[Math.floor(Math.random() * months.length)];
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

            const groupType = groupTypes[index % groupTypes.length];
            const department = departments[index % departments.length];
            const designation = designations[index % designations.length];

            mockRecords.push({
                employeeCode: `EMP${String(index + 1).padStart(3, '0')}`,
                employeeName: empName,
                groupType: groupType?.groupType || 'Default',
                departmentName: department?.departmentName || 'Default Department',
                designationName: designation?.designationName || 'Default Designation',
                paymentMode: isBankPayment ? 'Bank' : 'Cash',
                bankName: isBankPayment ? banks[Math.floor(Math.random() * banks.length)] : undefined,
                accountNumber: isBankPayment ? `${Math.floor(Math.random() * 900000000000) + 100000000000}` : undefined,
                ifscCode: isBankPayment
                    ? `${banks[Math.floor(Math.random() * banks.length)].substring(0, 4).toUpperCase()}0001234`
                    : undefined,
                grossSalary: Math.round(grossSalary),
                netSalary: Math.round(netSalary),
                deductions: Math.round(deductions),
                month: month,
                year: '2025',
                paymentDate: `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-28`,
                paymentStatus: paymentStatus
            });
        });

        return mockRecords;
    };

    // Filter records based on selected criteria
    useEffect(() => {
        let filtered = bankCashRecords;

        // Filter by group types
        if (filters.selectedTypes.length > 0) {
            filtered = filtered.filter((record) => filters.selectedTypes.includes(record.groupType));
        }

        // Filter by departments
        if (filters.selectedDepartments.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDepartments.includes(record.departmentName));
        }

        // Filter by designations
        if (filters.selectedDesignations.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDesignations.includes(record.designationName));
        }

        // Filter by payment mode
        filtered = filtered.filter((record) => record.paymentMode === filters.paymentMode);

        // Filter by month
        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        // Filter by year
        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, bankCashRecords]);

    const handleCheckboxChange = (
        category: 'selectedTypes' | 'selectedDepartments' | 'selectedDesignations',
        value: string,
        checked: boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            [category]: checked ? [...prev[category], value] : prev[category].filter((item) => item !== value)
        }));
    };

    const handleSelectAllChange = (
        category: 'selectedTypes' | 'selectedDepartments' | 'selectedDesignations',
        checked: boolean,
        allOptions: string[]
    ) => {
        setFilters((prev) => ({
            ...prev,
            [category]: checked ? allOptions : []
        }));
    };

    const handleFilterChange = (key: keyof BankCashReportFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        setShowReport(true);
        toast.success('Bank/Cash Report generated');
    };

    const handleCancel = () => {
        setFilters({
            selectedTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            paymentMode: 'Bank',
            month: '',
            year: ''
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Bank/Cash Report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate summary totals
    const summary = useMemo(() => {
        const bankRecords = filteredRecords.filter((r) => r.paymentMode === 'Bank');
        const cashRecords = filteredRecords.filter((r) => r.paymentMode === 'Cash');

        return {
            totalEmployees: filteredRecords.length,
            bankCount: bankRecords.length,
            cashCount: cashRecords.length,
            totalGross: filteredRecords.reduce((sum, r) => sum + r.grossSalary, 0),
            totalNet: filteredRecords.reduce((sum, r) => sum + r.netSalary, 0),
            totalDeductions: filteredRecords.reduce((sum, r) => sum + r.deductions, 0),
            bankTotal: bankRecords.reduce((sum, r) => sum + r.netSalary, 0),
            cashTotal: cashRecords.reduce((sum, r) => sum + r.netSalary, 0),
            paidCount: filteredRecords.filter((r) => r.paymentStatus === 'Paid').length,
            pendingCount: filteredRecords.filter((r) => r.paymentStatus === 'Pending').length,
            failedCount: filteredRecords.filter((r) => r.paymentStatus === 'Failed').length
        };
    }, [filteredRecords]);

    // Table columns
    const columns: ColumnDef<BankCashRecord>[] = [
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
            cell: ({ row }) => <div className='text-sm'>{row.getValue('departmentName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'designationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
            cell: ({ row }) => <div className='text-sm'>{row.getValue('designationName')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'paymentMode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Payment Mode' />,
            cell: ({ row }) => {
                const mode = row.getValue('paymentMode') as string;
                return (
                    <div
                        className={cn(
                            'inline-flex items-center rounded px-2 py-1 font-medium text-xs',
                            mode === 'Bank' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        )}>
                        {mode === 'Bank' ? <CreditCard className='mr-1 h-3 w-3' /> : <Wallet className='mr-1 h-3 w-3' />}
                        {mode}
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'bankName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' />,
            cell: ({ row }) => <div>{row.getValue('bankName') || '-'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'accountNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Account Number' />,
            cell: ({ row }) => <div className='font-mono text-sm'>{row.getValue('accountNumber') || '-'}</div>,
            enableSorting: false,
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
            accessorKey: 'deductions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Deductions' />,
            cell: ({ row }) => <div className='text-red-600'>₹{(row.getValue('deductions') as number).toLocaleString()}</div>,
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
            accessorKey: 'paymentStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('paymentStatus') as string;
                const statusColors = {
                    Paid: 'bg-green-100 text-green-700',
                    Pending: 'bg-yellow-100 text-yellow-700',
                    Failed: 'bg-red-100 text-red-700'
                };
                return (
                    <div
                        className={cn(
                            'inline-flex rounded px-2 py-1 font-medium text-xs',
                            statusColors[status as keyof typeof statusColors]
                        )}>
                        {status}
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <CollapsibleSection
                title='BANK/CASH REPORT CONFIGURATION'
                description='Configure filters to generate bank and cash payment reports'
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
                                        checked={filters.selectedTypes.length === groupTypes.length}
                                        onCheckedChange={(checked) =>
                                            handleSelectAllChange(
                                                'selectedTypes',
                                                checked as boolean,
                                                groupTypes.map((g) => g.groupType)
                                            )
                                        }
                                    />
                                    <label htmlFor='all-groups' className='cursor-pointer text-sm'>
                                        All
                                    </label>
                                </div>
                            </div>
                            <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                                {groupTypes.map((groupType) => (
                                    <div key={groupType.id} className='flex items-center gap-2'>
                                        <Checkbox
                                            id={`group-${groupType.id}`}
                                            checked={filters.selectedTypes.includes(groupType.groupType)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange('selectedTypes', groupType.groupType, checked as boolean)
                                            }
                                        />
                                        <label htmlFor={`group-${groupType.id}`} className='cursor-pointer text-sm'>
                                            {groupType.groupType}
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
                                        checked={filters.selectedDepartments.length === departments.length}
                                        onCheckedChange={(checked) =>
                                            handleSelectAllChange(
                                                'selectedDepartments',
                                                checked as boolean,
                                                departments.map((d) => d.departmentName)
                                            )
                                        }
                                    />
                                    <label htmlFor='all-departments' className='cursor-pointer text-sm'>
                                        All
                                    </label>
                                </div>
                            </div>
                            <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                                {departments.map((department) => (
                                    <div key={department.id} className='flex items-center gap-2'>
                                        <Checkbox
                                            id={`dept-${department.id}`}
                                            checked={filters.selectedDepartments.includes(department.departmentName)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange('selectedDepartments', department.departmentName, checked as boolean)
                                            }
                                        />
                                        <label htmlFor={`dept-${department.id}`} className='cursor-pointer text-sm'>
                                            {department.departmentName}
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
                                        checked={filters.selectedDesignations.length === designations.length}
                                        onCheckedChange={(checked) =>
                                            handleSelectAllChange(
                                                'selectedDesignations',
                                                checked as boolean,
                                                designations.map((d) => d.designationName)
                                            )
                                        }
                                    />
                                    <label htmlFor='all-designations' className='cursor-pointer text-sm'>
                                        All
                                    </label>
                                </div>
                            </div>
                            <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                                {designations.map((designation) => (
                                    <div key={designation.id} className='flex items-center gap-2'>
                                        <Checkbox
                                            id={`desig-${designation.id}`}
                                            checked={filters.selectedDesignations.includes(designation.designationName)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    'selectedDesignations',
                                                    designation.designationName,
                                                    checked as boolean
                                                )
                                            }
                                        />
                                        <label htmlFor={`desig-${designation.id}`} className='cursor-pointer text-sm'>
                                            {designation.designationName}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className='flex items-center justify-center gap-6 pt-4'>
                        {/* Payment Mode */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Payment Mode: <span className='text-red-500'>*</span>
                            </span>
                            <Select
                                value={filters.paymentMode}
                                onValueChange={(value) => handleFilterChange('paymentMode', value as 'Bank' | 'Cash')}>
                                <SelectTrigger className='w-40'>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Bank'>Bank</SelectItem>
                                    <SelectItem value='Cash'>Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                                {filters.paymentMode} Payment Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredRecords.length} | {filters.paymentMode} Amount: ₹
                                {filters.paymentMode === 'Bank' ? summary.bankTotal.toLocaleString() : summary.cashTotal.toLocaleString()}
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
                                    <Banknote className='h-3 w-3' />
                                    Total Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <CreditCard className='h-3 w-3' />
                                    Bank Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{summary.bankTotal.toLocaleString()}</div>
                                <div className='text-muted-foreground text-xs'>{summary.bankCount} employees</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <Wallet className='h-3 w-3' />
                                    Cash Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{summary.cashTotal.toLocaleString()}</div>
                                <div className='text-muted-foreground text-xs'>{summary.cashCount} employees</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-1 text-xs'>
                                    <div className='flex justify-between'>
                                        <span>Paid:</span>
                                        <span className='font-semibold text-green-600'>{summary.paidCount}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Pending:</span>
                                        <span className='font-semibold text-yellow-600'>{summary.pendingCount}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Failed:</span>
                                        <span className='font-semibold text-red-600'>{summary.failedCount}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Banknote className='h-4 w-4' />
                                {filters.paymentMode} Payment Details
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
