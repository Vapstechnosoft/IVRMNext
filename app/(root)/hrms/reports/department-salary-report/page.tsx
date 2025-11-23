'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Building, Calculator, DollarSign, Download, Printer, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    type DepartmentSalaryRecord,
    type DepartmentSummary,
    departmentSalaryColumns,
    departmentSummaryColumns
} from './_components/columns';
import { type DepartmentSalaryFilters, DepartmentSalaryReportFilters } from './_components/filters';

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

export default function DepartmentSalaryReportPage() {
    // State
    const [salaryRecords, setSalaryRecords] = useState<DepartmentSalaryRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<DepartmentSalaryRecord[]>([]);
    const [isLoading, _setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<DepartmentSalaryFilters>({
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        month: '',
        year: ''
    });

    // TODO: Will be populated from API when available
    const groupTypes = useMemo(() => [], []);
    const departments = useMemo(() => [], []);
    const designations = useMemo(() => [], []);
    const months = useMemo(() => [], []);
    const years = useMemo(() => [], []);

    // Filter records based on selected criteria
    useMemo(() => {
        let filtered = salaryRecords;

        // Filter by group types (by ID)
        if (filters.selectedGroupTypes.length > 0) {
            filtered = filtered.filter((record) => {
                // TODO: Map group type ID to name when API is integrated
                return filters.selectedGroupTypes.includes(record.groupType);
            });
        }

        // Filter by departments (by ID)
        if (filters.selectedDepartments.length > 0) {
            filtered = filtered.filter((record) => {
                // TODO: Map department ID to name when API is integrated
                return filters.selectedDepartments.includes(record.department);
            });
        }

        // Filter by designations (by ID)
        if (filters.selectedDesignations.length > 0) {
            filtered = filtered.filter((record) => {
                // TODO: Map designation ID to name when API is integrated
                return filters.selectedDesignations.includes(record.designation);
            });
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

    const handleFilterChange = (newFilters: DepartmentSalaryFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select both month and year');
            return;
        }

        // TODO: Call API when available
        // For now, just show the report structure
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
        setSalaryRecords([]);
        setFilteredRecords([]);
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

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <DepartmentSalaryReportFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                isLoading={isLoading}
            />

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
                                columns={departmentSummaryColumns}
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
                                columns={departmentSalaryColumns}
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
