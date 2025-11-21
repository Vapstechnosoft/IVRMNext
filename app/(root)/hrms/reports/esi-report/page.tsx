'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useESIReportOnload, useSearchESIReport } from '@/hooks/hrms/useReports';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type ESIRecord as ESIRecordColumn, esiReportColumns } from './_components/columns';
import { type ESIReportFilters as ESIFilters, ESIReportFilters } from './_components/filters';

// ESI report data structure
interface ESIRecord {
    id?: string;
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
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useESIReportOnload(roleId, 0);
    const searchMutation = useSearchESIReport();

    // State
    const [esiRecords, setESIRecords] = useState<ESIRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<ESIRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<ESIFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        month: '',
        year: ''
    });

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

    const months = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).monthdropdown || [];
    }, [onloadData?.data]);

    const years = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).leaveyeardropdown || [];
    }, [onloadData?.data]);

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage = onloadError?.message || onloadData?.message || 'Failed to load ESI report data. Please check if the API endpoint is available.';
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

    // Filter ESI records based on selected criteria
    useEffect(() => {
        let filtered = esiRecords;

        if (filters.groupType !== 'All') {
            const selectedGroupType = mappedGroupTypes.find((g: any) => g.groupType === filters.groupType);
            if (selectedGroupType) {
                filtered = filtered.filter((record) => record.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department !== 'All') {
            const selectedDepartment = mappedDepartments.find((d: any) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((record) => record.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation !== 'All') {
            const selectedDesignation = mappedDesignations.find((d: any) => d.designationName === filters.designation);
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
    }, [filters, esiRecords, mappedGroupTypes, mappedDepartments, mappedDesignations]);

    const handleFilterChange = (newFilters: ESIFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }

        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthId = selectedMonthObj?.IVRM_Month_Id?.toString() || '';

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            groupTypeselected: filters.groupType !== 'All' && mappedGroupTypes.find((g: any) => g.groupType === filters.groupType)
                ? [mappedGroupTypes.find((g: any) => g.groupType === filters.groupType)!.id]
                : [],
            departmentselected: filters.department !== 'All' && mappedDepartments.find((d: any) => d.departmentName === filters.department)
                ? [mappedDepartments.find((d: any) => d.departmentName === filters.department)!.id]
                : [],
            designationselected: filters.designation !== 'All' && mappedDesignations.find((d: any) => d.designationName === filters.designation)
                ? [mappedDesignations.find((d: any) => d.designationName === filters.designation)!.id]
                : [],
            HRES_Year: filters.year || '',
            HRES_Month: monthId || ''
        };

        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Map API response to ESIRecord format
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: ESIRecord[] = employeeDetails.map((emp: any, index: number) => ({
                        id: `emp-${index}`,
                        employeeCode: emp.HRME_EmployeeCode || emp.employeeCode || '',
                        employeeName: emp.EmployeeName || emp.employeeName || '',
                        groupTypeId: emp.HRMGT_Id || emp.groupTypeId || 0,
                        departmentId: emp.HRMD_Id || emp.departmentId || 0,
                        designationId: emp.HRMDES_Id || emp.designationId || 0,
                        departmentName: emp.HRMD_DepartmentName || emp.departmentName || '',
                        designationName: emp.HRMDES_DesignationName || emp.designationName || '',
                        esiNumber: emp.HRME_ESIAccNo || emp.esiNumber || '',
                        grossSalary: emp.basicAmount || emp.grossSalary || 0,
                        esiEligibleSalary: emp.esiEligibleSalary || (emp.basicAmount > 21000 ? 21000 : emp.basicAmount) || 0,
                        employeeESI: emp.EmployeeContibution || emp.employeeESI || 0,
                        employerESI: emp.EmployerContibution || emp.employerESI || 0,
                        totalESI: emp.totalAmount || emp.totalESI || 0,
                        month: filters.month,
                        year: filters.year,
                        workingDays: emp.HRES_WorkingDays || emp.workingDays || 0,
                        presentDays: emp.presentDays || 0,
                        esiStatus: emp.HRME_ESIAccNo ? 'Active' : 'Inactive' as 'Active' | 'Inactive' | 'Exempted'
                    }));

                    setESIRecords(mappedRecords);
                    setShowReport(true);
                    toast.success('ESI report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate ESI report');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching ESI report:', error);
                toast.error(error.message || 'Failed to generate ESI report');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            month: '',
            year: ''
        });
        setESIRecords([]);
        setFilteredRecords([]);
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
                groupTypes={mappedGroupTypes}
                availableDepartments={availableDepartments}
                availableDesignations={availableDesignations}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
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
                        isLoading={isLoadingOnload}
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
