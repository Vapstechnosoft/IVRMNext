'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Banknote, CreditCard, Download, Printer, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BankCashReportFilters, type BankCashReportFilters as BankCashReportFiltersType } from './_components/filters';
import { bankCashColumns, type BankCashRecord, type GroupType, type Department, type Designation } from './_components/columns';


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

    const [filters, setFilters] = useState<BankCashReportFiltersType>({
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


    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <BankCashReportFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />

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
                                columns={bankCashColumns}
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
