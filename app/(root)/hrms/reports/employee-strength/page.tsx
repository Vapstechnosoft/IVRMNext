'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeStrengthReportOnload, useSearchEmployeeStrengthReport } from '@/hooks/hrms/useReports';
import { format } from 'date-fns';
import { BarChart3, Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type EmployeeStrengthRecord as EmployeeStrengthRecordColumn, employeeStrengthColumns } from './_components/columns';
import { EmployeeStrengthFilters, type StrengthReportFilters } from './_components/filters';

// Employee strength data structure
interface EmployeeStrengthRecord {
    id?: string;
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

export default function EmployeeStrengthReportPage() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useEmployeeStrengthReportOnload(roleId, 0);
    const searchMutation = useSearchEmployeeStrengthReport();

    // State
    const [strengthRecords, setStrengthRecords] = useState<EmployeeStrengthRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<EmployeeStrengthRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    // Memoize dropdown data from API
    const groupTypes = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).groupTypedropdown || [];
    }, [onloadData?.data]);

    const departments = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).departmentdropdown || [];
    }, [onloadData?.data]);

    const designations = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).designationdropdown || [];
    }, [onloadData?.data]);

    const [filters, setFilters] = useState<StrengthReportFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        employeeCategories: {
            allEmployee: false,
            departmentWise: false,
            leftEmployee: false
        },
        fromDate: null,
        toDate: null
    });

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage = onloadError?.message || onloadData?.message || 'Failed to load employee strength report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Map API data to component format
    const mappedGroupTypes = useMemo(() => {
        return groupTypes.map((gt: any) => ({
            id: gt.HRMGT_Id,
            groupType: gt.HRMGT_EmployeeGroupType || gt.HRMGT_Code || '',
            groupCode: gt.HRMGT_Code || '',
            order: gt.HRMGT_Order || 0,
            isActive: gt.HRMGT_ActiveFlag !== false
        }));
    }, [groupTypes]);

    const mappedDepartments = useMemo(() => {
        return departments.map((dept: any) => ({
            id: dept.HRMD_Id,
            departmentName: dept.HRMD_DepartmentName || '',
            internalTrainingHours: dept.HRMD_InternalTrainingMinimumHrs?.toString() || '0',
            order: dept.HRMD_Order || 0,
            isActive: dept.HRMD_ActiveFlag !== false
        }));
    }, [departments]);

    const mappedDesignations = useMemo(() => {
        return designations.map((desig: any) => ({
            id: desig.HRMDES_Id,
            designationName: desig.HRMDES_DesignationName || '',
            basicAmount: desig.HRMDES_BasicAmount?.toString() || '0',
            sanctionedSeats: desig.HRMDES_SanctionedSeats?.toString() || '0',
            displaySanctionedSeats: desig.HRMDES_DisplaySanctionedSeatsFlag || false,
            order: desig.HRMDES_Order || 0,
            isActive: desig.HRMDES_ActiveFlag !== false
        }));
    }, [designations]);

    // Cascading filter logic
    const availableDepartments = useMemo(() => {
        if (filters.groupType === 'All') return mappedDepartments;
        // In a real app, departments would be filtered by groupType relationship
        return mappedDepartments;
    }, [filters.groupType, mappedDepartments]);

    const availableDesignations = useMemo(() => {
        if (filters.department === 'All') return mappedDesignations;
        // In a real app, designations would be filtered by department relationship
        return mappedDesignations;
    }, [filters.department, mappedDesignations]);

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

    const handleDateChange = (key: 'fromDate' | 'toDate', date: Date | null) => {
        setFilters((prev) => ({
            ...prev,
            [key]: date
        }));
    };

    const handleCategoryChange = (category: keyof StrengthReportFilters['employeeCategories'], checked: boolean) => {
        const newCategories = {
            ...filters.employeeCategories,
            [category]: checked
        };

        // If "All Employee" is checked, uncheck others
        if (category === 'allEmployee' && checked) {
            newCategories.departmentWise = false;
            newCategories.leftEmployee = false;
        }
        // If others are checked, uncheck "All Employee"
        else if ((category === 'departmentWise' || category === 'leftEmployee') && checked) {
            newCategories.allEmployee = false;
        }

        setFilters((prev) => ({
            ...prev,
            employeeCategories: newCategories
        }));
    };

    const handleSearch = () => {
        // Only validate dates if "All Employee" is not selected
        if (!filters.employeeCategories.allEmployee) {
            if (!filters.fromDate || !filters.toDate) {
                toast.error('Please select from and to dates');
                return;
            }
        }

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            designationselected: filters.designation !== 'All' && mappedDesignations.find((d: any) => d.designationName === filters.designation)
                ? [mappedDesignations.find((d: any) => d.designationName === filters.designation)!.id]
                : [],
            departmentselected: filters.department !== 'All' && mappedDepartments.find((d: any) => d.departmentName === filters.department)
                ? [mappedDepartments.find((d: any) => d.departmentName === filters.department)!.id]
                : [],
            groupTypeselected: filters.groupType !== 'All' && mappedGroupTypes.find((g: any) => g.groupType === filters.groupType)
                ? [mappedGroupTypes.find((g: any) => g.groupType === filters.groupType)!.id]
                : [],
            AllEmployee: filters.employeeCategories.allEmployee,
            Departmentwise: filters.employeeCategories.departmentWise,
            LeftEmployee: filters.employeeCategories.leftEmployee,
            FromDate: filters.fromDate ? filters.fromDate.toISOString() : '',
            ToDate: filters.toDate ? filters.toDate.toISOString() : ''
        };

        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Map API response to EmployeeStrengthRecord format
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: EmployeeStrengthRecord[] = employeeDetails.map((emp: any, index: number) => ({
                        id: `emp-${index}`,
                        departmentName: emp.departmentName || emp.HRMD_DepartmentName || '',
                        designationName: emp.designationName || emp.HRMDES_DesignationName || '',
                        groupType: emp.groupType || emp.HRMGT_EmployeeGroupType || '',
                        totalEmployees: emp.totalEmployees || 0,
                        activeEmployees: emp.activeEmployees || emp.totalWorkingEmployees || 0,
                        leftEmployees: emp.leftEmployees || emp.totalLeftEmployees || 0,
                        newJoinees: emp.newJoinees || 0,
                        maleEmployees: emp.maleEmployees || 0,
                        femaleEmployees: emp.femaleEmployees || 0,
                        dateRange: filters.fromDate && filters.toDate
                            ? `${format(filters.fromDate, 'dd-MM-yyyy')} to ${format(filters.toDate, 'dd-MM-yyyy')}`
                            : ''
                    }));

                    setStrengthRecords(mappedRecords);
                    setShowReport(true);
                    toast.success('Employee strength report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate employee strength report');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching employee strength report:', error);
                toast.error(error.message || 'Failed to generate employee strength report');
            }
        });
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
            fromDate: null,
            toDate: null
        });
        setShowReport(false);
        setStrengthRecords([]);
        setFilteredRecords([]);
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

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeStrengthFilters
                filters={filters}
                groupTypes={mappedGroupTypes}
                availableDepartments={availableDepartments}
                availableDesignations={availableDesignations}
                onFilterChange={handleFilterChange}
                onCategoryChange={handleCategoryChange}
                onDateChange={handleDateChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                onExport={handleExport}
                onPrint={handlePrint}
            />

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
                        isLoading={isLoadingOnload}
                        columns={employeeStrengthColumns}
                        data={filteredRecords as unknown as EmployeeStrengthRecordColumn[]}
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
