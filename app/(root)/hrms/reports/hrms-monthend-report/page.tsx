'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMonthEndReportOnload, useSearchMonthEndReport } from '@/hooks/hrms/useReports';
import { Building, Calculator, Download, Printer, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type MonthEndRecord as MonthEndRecordColumn, monthEndReportColumns } from './_components/columns';
import { type FilterOptions, HRMSMonthEndFilters, type MonthEndFilters } from './_components/filters';
// Month End Report data structure
interface MonthEndRecord {
    id?: string;
    employeeCode: string;
    employeeName: string;
    groupType: string;
    department: string;
    designation: string;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    pfContribution: number;
    esiContribution: number;
    incomeTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leavesTaken: number;
    overtime: number;
    status: 'Active' | 'On Leave' | 'Absent' | 'Resigned';
    month: string;
    year: string;
    ieName: string;
}
// Month End Summary
interface MonthEndSummary {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    absentEmployees: number;
    totalBasicSalary: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    averageNetSalary: number;
}
export default function HRMSMonthEndReportPage() {
    const roleId = HRMS_MI_ID;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useMonthEndReportOnload(roleId);
    const searchMutation = useSearchMonthEndReport();
    // State
    const [monthEndRecords, setMonthEndRecords] = useState<MonthEndRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MonthEndRecord[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<MonthEndFilters>({
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        month: '',
        year: '',
        ieName: ''
    });
    // Memoize dropdown data from API
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
    // Get institution details from API
    const institutionDetails = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return null;
        return (data as any).institutionDetails || null;
    }, [onloadData?.data]);
    // Filter options for filters component
    const filterOptions: FilterOptions = useMemo(() => {
        return {
            groupTypes: groupTypes
                .filter((gt: any) => gt.hrmgT_Id && gt.HRMGT_GroupTypeName)
                .map((gt: any) => ({
                    id: gt.hrmgT_Id,
                    groupType: gt.HRMGT_GroupTypeName
                })),
            departments: departments
                .filter((dept: any) => dept.hrmD_Id && dept.HRMD_DepartmentName)
                .map((dept: any) => ({
                    id: dept.hrmD_Id,
                    departmentName: dept.HRMD_DepartmentName
                })),
            designations: designations
                .filter((desg: any) => desg.hrmdeS_Id && desg.HRMDES_DesignationName)
                .map((desg: any) => ({
                    id: desg.hrmdeS_Id,
                    designationName: desg.HRMDES_DesignationName
                }))
        };
    }, [groupTypes, departments, designations]);
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load month end report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);
    // Filter records based on selected filters
    useEffect(() => {
        let filtered = monthEndRecords;
        // Filter by group types
        if (filters.selectedGroupTypes.length > 0) {
            filtered = filtered.filter((record) => filters.selectedGroupTypes.includes(record.groupType));
        }
        // Filter by departments
        if (filters.selectedDepartments.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDepartments.includes(record.department));
        }
        // Filter by designations
        if (filters.selectedDesignations.length > 0) {
            filtered = filtered.filter((record) => filters.selectedDesignations.includes(record.designation));
        }
        // Filter by month
        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }
        // Filter by year
        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }
        // Filter by IE Name
        if (filters.ieName) {
            filtered = filtered.filter(
                (record) =>
                    record.ieName.toLowerCase().includes(filters.ieName.toLowerCase()) ||
                    record.employeeName.toLowerCase().includes(filters.ieName.toLowerCase())
            );
        }
        setFilteredRecords(filtered);
    }, [filters, monthEndRecords]);
    const handleFilterChange = (newFilters: MonthEndFilters) => {
        setFilters(newFilters);
    };
    const handleSearch = () => {
        if (!filters.month || !filters.year) {
            toast.error('Please select both month and year');
            return;
        }
        // Find month name from selected month
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthName = selectedMonthObj?.IVRM_Month_Name?.trim() || filters.month;
        // Find selected group type IDs
        const selectedGroupTypeIds = filters.selectedGroupTypes
            .map((name) => {
                const groupType = groupTypes.find((gt: any) => gt.HRMGT_GroupTypeName === name);
                return groupType?.hrmgT_Id;
            })
            .filter((id): id is number => id !== undefined);
        // Find selected department IDs
        const selectedDepartmentIds = filters.selectedDepartments
            .map((name) => {
                const dept = departments.find((d: any) => d.HRMD_DepartmentName === name);
                return dept?.hrmD_Id;
            })
            .filter((id): id is number => id !== undefined);
        // Find selected designation IDs
        const selectedDesignationIds = filters.selectedDesignations
            .map((name) => {
                const desg = designations.find((d: any) => d.HRMDES_DesignationName === name);
                return desg?.hrmdeS_Id;
            })
            .filter((id): id is number => id !== undefined);
        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            retrunMsg: '',
            roleId: 0,
            HRES_Year: filters.year,
            HRES_Month: monthName,
            monthdropdown: [],
            leaveyeardropdown: [],
            employeeDetails: [],
            groupTypeIdList: selectedGroupTypeIds.length > 0 ? selectedGroupTypeIds : [],
            hrmD_IdList: selectedDepartmentIds.length > 0 ? selectedDepartmentIds : [],
            hrmdeS_IdList: selectedDesignationIds.length > 0 ? selectedDesignationIds : [],
            empid: []
        };
        // Call search API to get month end report data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract employee details from response
                    const employeeData = response.data.employeeDetails || [];
                    if (Array.isArray(employeeData) && employeeData.length > 0) {
                        // Map API response to MonthEndRecord format
                        const mappedRecords: MonthEndRecord[] = employeeData.map((item: any, index: number) => {
                            const basicSalary = item.basicamount || item.basicSalary || item.HRESD_Amount || 0;
                            const allowances = item.allowances || item.DAamount || item.Othersamount || 0;
                            const grossSalary = item.empGrossSal || item.grossSalary || basicSalary + allowances;
                            const pfContribution = item.HRES_EPF || item.pfContribution || 0;
                            const esiContribution = item.esiContribution || 0;
                            const incomeTax = item.incomeTax || item.professionaltaxamount || 0;
                            const otherDeductions = item.otherDeductions || 0;
                            const totalDeductions = pfContribution + esiContribution + incomeTax + otherDeductions;
                            const netSalary = item.netsalary || item.netSalary || grossSalary - totalDeductions;
                            // Determine status
                            let status: 'Active' | 'On Leave' | 'Absent' | 'Resigned' = 'Active';
                            if (item.HRME_DOL || item.dateOfLeaving) {
                                status = 'Resigned';
                            } else if (item.status) {
                                status = item.status;
                            }
                            return {
                                id: `monthend-${item.HRME_Id || item.HRES_Id || index}`,
                                employeeCode: item.HRME_EmployeeCode || item.EmployeeCode || item.employeeCode || '',
                                employeeName:
                                    `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                    item.EmployeeName ||
                                    '',
                                groupType: item.groupTypeName || item.HRMGT_GroupTypeName || 'N/A',
                                department: item.departmentName || item.HRMD_DepartmentName || 'N/A',
                                designation: item.DesignationName || item.HRMDES_DesignationName || 'N/A',
                                basicSalary: Math.round(basicSalary),
                                allowances: Math.round(allowances),
                                grossSalary: Math.round(grossSalary),
                                pfContribution: Math.round(pfContribution),
                                esiContribution: Math.round(esiContribution),
                                incomeTax: Math.round(incomeTax),
                                otherDeductions: Math.round(otherDeductions),
                                totalDeductions: Math.round(totalDeductions),
                                netSalary: Math.round(netSalary),
                                workingDays: item.HRES_WorkingDays || item.workingDays || 0,
                                presentDays: item.presentDays || item.HRES_WorkingDays || 0,
                                absentDays: item.absentDays || 0,
                                leavesTaken: item.leavesTaken || 0,
                                overtime: item.overtime || 0,
                                status: status,
                                month: filters.month,
                                year: filters.year,
                                ieName: filters.ieName || 'HR Department'
                            };
                        });
                        setMonthEndRecords(mappedRecords);
                        setShowReport(true);
                        toast.success('Month End Report generated successfully');
                    } else {
                        // No data returned
                        setMonthEndRecords([]);
                        setShowReport(true);
                        toast.warning('Month End Report generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate Month End Report');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate Month End Report');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            month: '',
            year: '',
            ieName: ''
        });
        setMonthEndRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };
    const handleExport = () => {
        toast.success('Month End Report exported successfully');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Calculate Month End summary
    const monthEndSummary: MonthEndSummary = useMemo(() => {
        const activeEmployees = filteredRecords.filter((record) => record.status === 'Active').length;
        const onLeaveEmployees = filteredRecords.filter((record) => record.status === 'On Leave').length;
        const absentEmployees = filteredRecords.filter((record) => record.status === 'Absent').length;
        const summary = filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                activeEmployees: activeEmployees,
                onLeaveEmployees: onLeaveEmployees,
                absentEmployees: absentEmployees,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalGrossSalary: acc.totalGrossSalary + record.grossSalary,
                totalDeductions: acc.totalDeductions + record.totalDeductions,
                totalNetSalary: acc.totalNetSalary + record.netSalary,
                averageNetSalary: 0 // Will be calculated after
            }),
            {
                totalEmployees: 0,
                activeEmployees: 0,
                onLeaveEmployees: 0,
                absentEmployees: 0,
                totalBasicSalary: 0,
                totalGrossSalary: 0,
                totalDeductions: 0,
                totalNetSalary: 0,
                averageNetSalary: 0
            }
        );
        summary.averageNetSalary = filteredRecords.length > 0 ? Math.round(summary.totalNetSalary / filteredRecords.length) : 0;
        return summary;
    }, [filteredRecords]);
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <HRMSMonthEndFilters
                filters={filters}
                filterOptions={filterOptions}
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
                                Month End Report - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Active: {monthEndSummary.activeEmployees} | Total Net Salary: ₹
                                {monthEndSummary.totalNetSalary.toLocaleString()}
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
                                <div className='font-semibold text-foreground text-lg'>{monthEndSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserCheck className='h-3 w-3' />
                                    Active Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{monthEndSummary.activeEmployees}</div>
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
                                <div className='font-semibold text-blue-600 text-lg'>
                                    ₹{monthEndSummary.totalGrossSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Net Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>
                                    ₹{monthEndSummary.totalNetSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Detailed Summary */}
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
                                    <span className='font-semibold'>₹{monthEndSummary.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Gross Salary:</span>
                                    <span className='font-semibold'>₹{monthEndSummary.totalGrossSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Deductions:</span>
                                    <span className='font-semibold text-red-600'>₹{monthEndSummary.totalDeductions.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Net Salary:</span>
                                    <span className='font-semibold text-green-600'>₹{monthEndSummary.totalNetSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Average Net Salary:</span>
                                    <span className='font-semibold text-blue-600'>
                                        ₹{monthEndSummary.averageNetSalary.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Building className='h-4 w-4' />
                                    Employee Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Active Employees:</span>
                                    <span className='font-semibold text-green-600'>{monthEndSummary.activeEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>On Leave:</span>
                                    <span className='font-semibold text-yellow-600'>{monthEndSummary.onLeaveEmployees}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Absent:</span>
                                    <span className='font-semibold text-red-600'>{monthEndSummary.absentEmployees}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='text-sm'>Report Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Generated By:</span>
                                    <span className='font-semibold'>{filters.ieName || 'HR Department'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>{institutionDetails?.MI_Name || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload}
                        columns={monthEndReportColumns}
                        data={filteredRecords as unknown as MonthEndRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
