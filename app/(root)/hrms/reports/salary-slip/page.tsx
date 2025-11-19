'use client';

import { Button } from '@/components/ui/button';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterEmployeesByYearMonth, useGenerateSalarySlip, useSalarySlipOnload } from '@/hooks/hrms/useReports';
import { FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { EmployeeSalarySlipDisplay } from './_components/columns';
import { SalarySlipFilters, type SalarySlipFilters as SalarySlipFiltersType } from './_components/filters';

export default function SalarySlipReportPage() {
    const roleId = HRMS_MI_ID;
    const LogInUserId = 0;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useSalarySlipOnload(roleId, LogInUserId);
    const filterMutation = useFilterEmployeesByYearMonth();
    const generateMutation = useGenerateSalarySlip();

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdownlist || [], [onloadData?.data?.groupTypedropdownlist]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdownlist || [], [onloadData?.data?.departmentdropdownlist]);
    const designations = useMemo(() => onloadData?.data?.designationdropdownlist || [], [onloadData?.data?.designationdropdownlist]);
    const months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const years = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);

    // State
    const [employees, setEmployees] = useState<EmployeeSalarySlipDisplay[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeSalarySlipDisplay[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [filters, setFilters] = useState<SalarySlipFilters>({
        groupType: [],
        department: [],
        designation: [],
        month: '',
        year: '',
        slipPerPage: '',
        options: {
            lopDays: false,
            leaveDetails: false,
            panCardNo: false,
            bankDetails: false
        }
    });

    // Load employees when year/month changes
    useEffect(() => {
        if (filters.year && filters.month) {
            const request = {
                MI_Id: roleId,
                LogInUserId: 0,
                HRES_Year: filters.year,
                HRES_Month: filters.month
            };

            filterMutation.mutate(request, {
                onSuccess: (response) => {
                    if (response.success && response.data?.employeedropdown) {
                        const employeeList: EmployeeSalarySlipDisplay[] = (response.data.employeedropdown || []).map(
                            (emp: any, index: number) => ({
                                id: emp.HRME_Id || index + 1, // Use HRME_Id as unique identifier, fallback to index if missing
                                employeeCode: emp.HRME_EmployeeCode,
                                employeeName:
                                    `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim(),
                                groupTypeId: emp.HRMGT_Id || 0,
                                departmentId: emp.HRMD_Id || 0,
                                designationId: emp.HRMDES_Id || 0,
                                HRME_Id: emp.HRME_Id,
                                isSelected: false
                            })
                        );
                        setEmployees(employeeList);
                        setFilteredEmployees(employeeList);
                    } else {
                        toast.error(response.message || 'No employees found for the selected month and year');
                    }
                },
                onError: (error) => {
                    console.error('Error filtering employees:', error);
                    toast.error(error.message || 'Failed to load employees. Please check if the API endpoint is available.');
                }
            });
        } else {
            setEmployees([]);
            setFilteredEmployees([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.year, filters.month]);

    // Filter employees based on selected criteria and search term
    useEffect(() => {
        let filtered = employees;

        // Apply dropdown filters
        if (filters.groupType.length > 0) {
            filtered = filtered.filter((emp) => filters.groupType.includes(emp.groupTypeId));
        }

        if (filters.department.length > 0) {
            filtered = filtered.filter((emp) => filters.department.includes(emp.departmentId));
        }

        if (filters.designation.length > 0) {
            filtered = filtered.filter((emp) => filters.designation.includes(emp.designationId));
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (emp) =>
                    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEmployees(filtered);
    }, [filters, employees, searchTerm]);

    const handleOptionChange = (option: keyof SalarySlipFiltersType['options'], checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                [option]: checked
            }
        }));
    };

    const handleFilterChange = (newFilters: SalarySlipFiltersType) => {
        setFilters(newFilters);
    };

    const handleSelectEmployee = (employeeId: number, checked: boolean) => {
        const updatedEmployees = employees.map((emp) => (emp.id === employeeId ? { ...emp, isSelected: checked } : emp));
        setEmployees(updatedEmployees);
    };

    const handleSelectAll = (checked: boolean) => {
        const updatedEmployees = employees.map((emp) => ({ ...emp, isSelected: checked }));
        setEmployees(updatedEmployees);
    };

    const handleGenerateSlip = () => {
        const selectedEmployees = filteredEmployees.filter((emp) => emp.isSelected);
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }

        const request = {
            MI_Id: roleId,
            HRES_Year: filters.year,
            HRES_Month: filters.month,
            empid: selectedEmployees.map((emp) => emp.HRME_Id),
            hrmdeS_IdList: filters.designation.length > 0 ? filters.designation : [],
            hrmD_IdList: filters.department.length > 0 ? filters.department : [],
            groupTypeIdList: filters.groupType.length > 0 ? filters.groupType : []
        };

        generateMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(`Salary slips generated successfully for ${selectedEmployees.length} employee(s)`);
                    // Here you would typically display the generated slips or open print dialog
                } else {
                    toast.error(response.message || 'Failed to generate salary slips');
                }
            },
            onError: (error) => {
                console.error('Error generating salary slips:', error);
                toast.error(error.message || 'Failed to generate salary slips. Please check if the API endpoint is available.');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: '',
            slipPerPage: '',
            options: {
                lopDays: false,
                leaveDetails: false,
                panCardNo: false,
                bankDetails: false
            }
        });
        setSearchTerm('');

        // Clear all selections
        const updatedEmployees = employees.map((emp) => ({ ...emp, isSelected: false }));
        setEmployees(updatedEmployees);

        toast.info('Filters and selections cleared');
    };

    const selectedCount = filteredEmployees.filter((emp) => emp.isSelected).length;
    const isLoading = isLoadingOnload || filterMutation.isPending || generateMutation.isPending;

    // Handle onload errors
    useEffect(() => {
        if (onloadError) {
            toast.error('Failed to load filter options. Please check if the API endpoint is available.');
        } else if (onloadData && !onloadData.success) {
            toast.error(onloadData.message || 'Failed to load filter options');
        }
    }, [onloadError, onloadData]);

    // Show error message if onload fails
    if (onloadError || (onloadData && !onloadData.success)) {
        return (
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    <div className='rounded-lg border border-destructive bg-destructive/10 p-4 text-center'>
                        <p className='font-semibold text-destructive'>
                            {onloadError
                                ? 'Failed to load filter options. Please check if the API endpoint is available.'
                                : onloadData?.message || 'Failed to load filter options'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error message if onload fails
    if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
        return (
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg bg-destructive/10 py-12'>
                        <div className='text-center'>
                            <h3 className='font-semibold text-destructive text-lg'>Error Loading Filter Options</h3>
                            <p className='text-muted-foreground text-sm mt-2'>
                                {(onloadError as any)?.message || (onloadData as any)?.message || 'Failed to load filter options. Please check if the API endpoint is available.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={handleGenerateSlip}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                        disabled={isLoadingOnload}>
                        <FileText className='h-4 w-4' />
                        Generate Slips
                    </Button>
                </div>

                {/* Generate Employee Salary Slip Section */}
                <SalarySlipFilters
                    filters={filters}
                    groupTypes={groupTypes}
                    departments={departments}
                    designations={designations}
                    months={months}
                    years={years}
                    employees={employees}
                    filteredEmployees={filteredEmployees}
                    searchTerm={searchTerm}
                    selectedCount={selectedCount}
                    isLoading={isLoading || isLoadingOnload}
                    onFilterChange={handleFilterChange}
                    onSearchChange={setSearchTerm}
                    onOptionChange={handleOptionChange}
                    onSelectAll={handleSelectAll}
                    onSelectEmployee={handleSelectEmployee}
                    onGenerateSlip={handleGenerateSlip}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
