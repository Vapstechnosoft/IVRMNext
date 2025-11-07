'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ESIReportFilters, type ESIReportFilters as ESIFilters } from './_components/filters';
import { esiReportColumns, type ESIRecord as ESIRecordColumn } from './_components/columns';

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

// ESI report data structure
interface ESIRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    esiNumber: string;
    grossSalary: number;
    esiEligibleSalary: number;
    employeeESI: number;
    employerESI: number;
    totalESI: number;
    month: string;
    year: string;
    workingDays: number;
    presentDays: number;
    esiStatus: 'Active' | 'Inactive' | 'Exempted';
}


export default function ESIReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const esiDB = createLocalCrud<ESIRecord>('report:esi');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [esiRecords, setESIRecords] = useState<ESIRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<ESIRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<ESIFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        month: '',
        year: ''
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

            // Load ESI records
            let recordList = esiDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockESIData();
                mockData.forEach((record) => esiDB.create(record));
                recordList = esiDB.list(); // Reload data after creating mock records
            }
            setESIRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock ESI data
    const generateMockESIData = (): Omit<ESIRecord, 'id' | 'createdAt'>[] => {
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

        const mockRecords: Omit<ESIRecord, 'id' | 'createdAt'>[] = [];
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

        employees.forEach((emp, empIndex) => {
            months.forEach((month, monthIndex) => {
                const grossSalary = 25000 + empIndex * 8000 + Math.random() * 5000;
                const esiEligibleSalary = grossSalary > 21000 ? 21000 : grossSalary; // ESI cap
                const employeeESI = esiEligibleSalary * 0.0075; // 0.75% employee contribution
                const employerESI = esiEligibleSalary * 0.0325; // 3.25% employer contribution
                const totalESI = employeeESI + employerESI;

                mockRecords.push({
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    groupTypeId: emp.groupTypeId,
                    departmentId: emp.departmentId,
                    designationId: emp.designationId,
                    departmentName: emp.deptName,
                    designationName: emp.desigName,
                    esiNumber: `ESI${emp.code.slice(-3)}${monthIndex + 1}`,
                    grossSalary: Math.round(grossSalary),
                    esiEligibleSalary: Math.round(esiEligibleSalary),
                    employeeESI: Math.round(employeeESI),
                    employerESI: Math.round(employerESI),
                    totalESI: Math.round(totalESI),
                    month: month,
                    year: '2025',
                    workingDays: 26,
                    presentDays: 24 + Math.floor(Math.random() * 3),
                    esiStatus: grossSalary > 21000 ? 'Active' : grossSalary < 10000 ? 'Exempted' : 'Active'
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

    // Filter ESI records based on selected criteria
    useEffect(() => {
        let filtered = esiRecords;

        if (filters.groupType !== 'All') {
            const selectedGroupType = groupTypes.find((g) => g.groupType === filters.groupType);
            if (selectedGroupType) {
                filtered = filtered.filter((record) => record.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department !== 'All') {
            const selectedDepartment = departments.find((d) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((record) => record.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation !== 'All') {
            const selectedDesignation = designations.find((d) => d.designationName === filters.designation);
            if (selectedDesignation) {
                filtered = filtered.filter((record) => record.designationId === selectedDesignation.id);
            }
        }

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, esiRecords, groupTypes, departments, designations]);

    const handleFilterChange = (newFilters: ESIFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        setShowReport(true);
        toast.success('ESI report generated');
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            month: '',
            year: ''
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('ESI report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate ESI totals
    const esiTotals = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                grossSalary: acc.grossSalary + record.grossSalary,
                esiEligibleSalary: acc.esiEligibleSalary + record.esiEligibleSalary,
                employeeESI: acc.employeeESI + record.employeeESI,
                employerESI: acc.employerESI + record.employerESI,
                totalESI: acc.totalESI + record.totalESI
            }),
            {
                grossSalary: 0,
                esiEligibleSalary: 0,
                employeeESI: 0,
                employerESI: 0,
                totalESI: 0
            }
        );
    }, [filteredRecords]);


    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <ESIReportFilters
                filters={filters}
                groupTypes={groupTypes}
                availableDepartments={availableDepartments}
                availableDesignations={availableDesignations}
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
                                ESI Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredRecords.length} employees | ESI Eligible:{' '}
                                {filteredRecords.filter((r) => r.esiStatus === 'Active').length}
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

                    {/* ESI Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Gross Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>₹{esiTotals.grossSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>ESI Eligible Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>₹{esiTotals.esiEligibleSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employee ESI (0.75%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{esiTotals.employeeESI.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employer ESI (3.25%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>₹{esiTotals.employerESI.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total ESI</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{esiTotals.totalESI.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ESI Status Summary */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Active ESI Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    {filteredRecords.filter((r) => r.esiStatus === 'Active').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Inactive Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>
                                    {filteredRecords.filter((r) => r.esiStatus === 'Inactive').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Exempted Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-gray-600 text-lg'>
                                    {filteredRecords.filter((r) => r.esiStatus === 'Exempted').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={esiReportColumns}
                        data={filteredRecords as unknown as ESIRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
