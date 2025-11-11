'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { differenceInYears } from 'date-fns';
import { format } from 'date-fns';
import { Calculator, CalendarIcon, Clock, Download, Printer, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RetirementReportFilters, type RetirementFilters } from './_components/filters';
import { getRetirementColumns, headerFields, type RetirementRecord as RetirementRecordColumn } from './_components/columns';

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
    const columns = useMemo(() => getRetirementColumns(filters.selectedHeaders), [filters.selectedHeaders]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <RetirementReportFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onHeaderChange={handleHeaderChange}
                onHeaderSelectAll={handleHeaderSelectAll}
                onDateChange={handleDateChange}
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
                        data={filteredRecords as unknown as RetirementRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
