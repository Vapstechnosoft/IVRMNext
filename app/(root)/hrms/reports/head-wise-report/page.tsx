'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Calculator, Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type HeadWiseRecord as HeadWiseRecordColumn, headWiseReportColumns } from './_components/columns';
import { type HeadWiseReportFilters as HeadWiseFilters, HeadWiseReportFilters } from './_components/filters';

// Data interfaces from employee-category masters
interface GroupType extends BaseEntity {
    groupType: string;
    groupCode: string;
    order: number;
    isActive: boolean;
}

// Head wise report data structure
interface HeadWiseRecord extends BaseEntity {
    salaryHead: string;
    headType: 'Earning' | 'Deduction';
    groupType: string;
    departmentName: string;
    totalEmployees: number;
    totalAmount: number;
    averageAmount: number;
    maxAmount: number;
    minAmount: number;
    month: string;
    year: string;
}

export default function HeadWiseReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const headWiseDB = createLocalCrud<HeadWiseRecord>('report:head-wise');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [headWiseRecords, setHeadWiseRecords] = useState<HeadWiseRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<HeadWiseRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<HeadWiseFilters>({
        selectedGroupTypes: [],
        month: '',
        year: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load group types
            let groupList = groupTypeDB.list();
            if (groupList.length === 0) {
                const mockData = generateMockGroupTypes();
                mockData.forEach((group) => groupTypeDB.create(group));
                groupList = groupTypeDB.list(); // Reload data after creating mock records
            }
            setGroupTypes(groupList.filter((g) => g.isActive));

            // Load head wise records
            let recordList = headWiseDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockHeadWiseData();
                mockData.forEach((record) => headWiseDB.create(record));
                recordList = headWiseDB.list(); // Reload data after creating mock records
            }
            setHeadWiseRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock group types
    const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
        return [
            {
                groupType: 'Test NON Teaching',
                groupCode: 'TNT',
                order: 1,
                isActive: true
            },
            {
                groupType: 'Test Insurance',
                groupCode: 'TI',
                order: 2,
                isActive: true
            },
            { groupType: 'Teaching', groupCode: 'T', order: 3, isActive: true },
            {
                groupType: 'Owner of the company',
                groupCode: 'OC',
                order: 4,
                isActive: true
            },
            { groupType: 'Non Teaching', groupCode: 'NT', order: 5, isActive: true },
            {
                groupType: 'Administrative',
                groupCode: 'ADM',
                order: 6,
                isActive: true
            },
            { groupType: 'test', groupCode: 'TST', order: 7, isActive: true }
        ];
    };

    // Generate mock head wise data
    const generateMockHeadWiseData = (): Omit<HeadWiseRecord, 'id' | 'createdAt'>[] => {
        const salaryHeads = [
            { name: 'Basic Pay', type: 'Earning' as const },
            { name: 'DA', type: 'Earning' as const },
            { name: 'HRA', type: 'Earning' as const },
            { name: 'Special Allowance', type: 'Earning' as const },
            { name: 'Transport Allowance', type: 'Earning' as const },
            { name: 'PF Deduction', type: 'Deduction' as const },
            { name: 'ESI Deduction', type: 'Deduction' as const },
            { name: 'Professional Tax', type: 'Deduction' as const },
            { name: 'Income Tax', type: 'Deduction' as const }
        ];

        const groupTypeNames = [
            'Test NON Teaching',
            'Test Insurance',
            'Teaching',
            'Owner of the company',
            'Non Teaching',
            'Administrative',
            'test'
        ];
        const departments = ['JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'SERVICE STAFF', 'ADMINISTRATIVE'];
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

        const mockRecords: Omit<HeadWiseRecord, 'id' | 'createdAt'>[] = [];

        salaryHeads.forEach((head) => {
            groupTypeNames.forEach((groupType) => {
                departments.forEach((dept) => {
                    months.forEach((month) => {
                        const totalEmployees = 3 + Math.floor(Math.random() * 8);
                        const baseAmount = head.type === 'Earning' ? 15000 + Math.random() * 25000 : 2000 + Math.random() * 8000;
                        const totalAmount = baseAmount * totalEmployees;
                        const averageAmount = totalAmount / totalEmployees;
                        const maxAmount = averageAmount * 1.5;
                        const minAmount = averageAmount * 0.7;

                        mockRecords.push({
                            salaryHead: head.name,
                            headType: head.type,
                            groupType: groupType,
                            departmentName: dept,
                            totalEmployees,
                            totalAmount: Math.round(totalAmount),
                            averageAmount: Math.round(averageAmount),
                            maxAmount: Math.round(maxAmount),
                            minAmount: Math.round(minAmount),
                            month: month,
                            year: '2025'
                        });
                    });
                });
            });
        });

        return mockRecords;
    };

    // Filter head wise records based on selected criteria
    useEffect(() => {
        let filtered = headWiseRecords;

        if (filters.selectedGroupTypes.length > 0) {
            filtered = filtered.filter((record) => filters.selectedGroupTypes.includes(record.groupType));
        }

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, headWiseRecords]);

    const handleGroupTypeToggle = (groupType: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedGroupTypes: prev.selectedGroupTypes.includes(groupType)
                ? prev.selectedGroupTypes.filter((g) => g !== groupType)
                : [...prev.selectedGroupTypes, groupType]
        }));
    };

    const handleSelectAllGroupTypes = () => {
        const allGroupTypeNames = groupTypes.map((g) => g.groupType);
        setFilters((prev) => ({
            ...prev,
            selectedGroupTypes: prev.selectedGroupTypes.length === allGroupTypeNames.length ? [] : allGroupTypeNames
        }));
    };

    const handleFilterChange = (newFilters: HeadWiseFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        setShowReport(true);
        toast.success('Head wise report generated');
    };

    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            month: '',
            year: ''
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Head wise report exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const earningRecords = filteredRecords.filter((r) => r.headType === 'Earning');
        const deductionRecords = filteredRecords.filter((r) => r.headType === 'Deduction');

        return {
            totalEarnings: earningRecords.reduce((sum, r) => sum + r.totalAmount, 0),
            totalDeductions: deductionRecords.reduce((sum, r) => sum + r.totalAmount, 0),
            totalEmployees: new Set(filteredRecords.map((r) => `${r.groupType}-${r.departmentName}`)).size,
            earningHeads: new Set(earningRecords.map((r) => r.salaryHead)).size,
            deductionHeads: new Set(deductionRecords.map((r) => r.salaryHead)).size
        };
    }, [filteredRecords]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <HeadWiseReportFilters
                filters={filters}
                groupTypes={groupTypes}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                onSelectAllGroupTypes={handleSelectAllGroupTypes}
                onGroupTypeToggle={handleGroupTypeToggle}
            />

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Head Wise Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredRecords.length} salary heads | Group Types: {filters.selectedGroupTypes.length}
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{summaryStats.totalEarnings.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>₹{summaryStats.totalDeductions.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Earning Heads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.earningHeads}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Deduction Heads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{summaryStats.deductionHeads}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Net Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{(summaryStats.totalEarnings - summaryStats.totalDeductions).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={headWiseReportColumns}
                        data={filteredRecords as unknown as HeadWiseRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />

                    {/* Head Type Analysis */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Earnings Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Earnings Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    {Array.from(
                                        new Set(filteredRecords.filter((r) => r.headType === 'Earning').map((r) => r.salaryHead))
                                    ).map((head) => {
                                        const headTotal = filteredRecords
                                            .filter((r) => r.salaryHead === head && r.headType === 'Earning')
                                            .reduce((sum, r) => sum + r.totalAmount, 0);

                                        return (
                                            <div key={head} className='flex items-center justify-between'>
                                                <span className='text-sm'>{head}</span>
                                                <span className='font-semibold text-green-600 text-sm'>₹{headTotal.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deductions Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Deductions Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    {Array.from(
                                        new Set(filteredRecords.filter((r) => r.headType === 'Deduction').map((r) => r.salaryHead))
                                    ).map((head) => {
                                        const headTotal = filteredRecords
                                            .filter((r) => r.salaryHead === head && r.headType === 'Deduction')
                                            .reduce((sum, r) => sum + r.totalAmount, 0);

                                        return (
                                            <div key={head} className='flex items-center justify-between'>
                                                <span className='text-sm'>{head}</span>
                                                <span className='font-semibold text-red-600 text-sm'>₹{headTotal.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
