'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeProfileReportOnload, useFilterEmployeesBySelection, useSearchEmployeeProfileDetails } from '@/hooks/hrms/useReports';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import { Printer, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmployeeProfileFilters } from './_components/filters';

export default function EmployeeProfileReportPage() {
    const roleId = HRMS_MI_ID;
    const [showReport, setShowReport] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    // React Query hooks
    const { data: onloadData } = useEmployeeProfileReportOnload(roleId);
    const filterMutation = useFilterEmployeesBySelection();
    const searchMutation = useSearchEmployeeProfileDetails();

    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdown || [], [onloadData?.data?.groupTypedropdown]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdown || [], [onloadData?.data?.departmentdropdown]);
    const designations = useMemo(() => onloadData?.data?.designationdropdown || [], [onloadData?.data?.designationdropdown]);

    // Memoize onload employee dropdown to prevent unnecessary re-renders
    const onloadEmployees = useMemo(() => onloadData?.data?.employeedropdown || [], [onloadData?.data?.employeedropdown]);

    // Initialize with empty array to prevent hydration mismatches
    const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);

    // Update employees when onload data is available (client-side only)
    useEffect(() => {
        if (onloadEmployees.length > 0) {
            setEmployees(onloadEmployees);
        }
    }, [onloadEmployees]);

    // Filter states (multi-select)
    const [selectedGroupTypes, setSelectedGroupTypes] = useState<number[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
    const [selectedDesignations, setSelectedDesignations] = useState<number[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    // Employee search
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDropdown[]>([]);

    // Selected employee details (array to support multiple reports)
    const [employeeReports, setEmployeeReports] = useState<any[]>([]);

    // No automatic filtering - employees will only load when user clicks "SEARCH EMPLOYEES"

    // Hide employee dropdown when filters change (user must search again)
    useEffect(() => {
        if (showEmployeeDropdown) {
            setShowEmployeeDropdown(false);
            setSelectedEmployees([]);
            setFilteredEmployees([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroupTypes, selectedDepartments, selectedDesignations]);

    // Filter employees based on search query
    useEffect(() => {
        const filtered = employees.filter(
            (emp) =>
                emp.HRME_EmployeeCode.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`
                    .toLowerCase()
                    .includes(employeeSearchQuery.toLowerCase())
        );
        setFilteredEmployees(filtered);
    }, [employeeSearchQuery, employees]);

    // Handle filter search - load employees based on filters
    const handleFilterSearch = () => {
        const hasFilters = selectedGroupTypes.length > 0 || selectedDepartments.length > 0 || selectedDesignations.length > 0;

        if (!hasFilters) {
            toast.error('Please select at least one filter (Group Type, Department, or Designation)');
            return;
        }

        const request = {
            MI_Id: roleId,
            LogInUserId: 2,
            hrmgT_IdList: selectedGroupTypes.length > 0 ? selectedGroupTypes : [0],
            hrmD_IdList: selectedDepartments.length > 0 ? selectedDepartments : [0],
            hrmdeS_IdList: selectedDesignations.length > 0 ? selectedDesignations : [0]
        };

        filterMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data?.employeedropdown) {
                    setEmployees(response.data.employeedropdown);
                    setFilteredEmployees(response.data.employeedropdown);
                    setShowEmployeeDropdown(true);
                    toast.success('Employees loaded successfully');
                } else {
                    toast.error('No employees found for the selected filters');
                }
            },
            onError: (error) => {
                console.error('Error filtering employees:', error);
                toast.error('Failed to load employees');
            }
        });
    };

    // Handle select all employees
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
        } else {
            setSelectedEmployees([]);
        }
    };

    // Check if all filtered employees are selected
    const isAllSelected = filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length;
    const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length;

    // Handle individual employee selection
    const handleEmployeeToggle = (employeeId: number, checked: boolean) => {
        if (checked) {
            setSelectedEmployees((prev) => [...prev, employeeId]);
        } else {
            setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
        }
    };

    const handleSearch = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        // Show loading state
        const reports: any[] = [];
        let successCount = 0;
        let errorCount = 0;

        // Fetch details for each selected employee
        for (const employeeId of selectedEmployees) {
            try {
                const employee = employees.find((emp) => emp.HRME_Id === employeeId);

                if (!employee) {
                    errorCount++;
                    continue;
                }

                const request = {
                    MI_Id: roleId,
                    groupTypeIds: selectedGroupTypes,
                    departmentIds: selectedDepartments,
                    designationIds: selectedDesignations,
                    employeeIds: [employeeId],
                    roleId: roleId
                };

                const response = await searchMutation.mutateAsync(request);

                if (response.success && response.data) {
                    const employeeData = response.data;

                    // Map the API response fields to our display format
                    const details = {
                        EmployeeCode: employee.HRME_EmployeeCode,
                        EmployeeName: `${employee.HRME_EmployeeFirstName} ${
                            employee.HRME_EmployeeMiddleName || ''
                        } ${employee.HRME_EmployeeLastName || ''}`.trim(),
                        Designation: designations.find((d) => d.HRMDES_Id === employee.HRMDES_Id)?.HRMDES_DesignationName || '-',
                        InstitutionName: (employeeData as any).institutionDetails?.MI_Name || '-',
                        ContactDetails: employee.HRME_MobileNo ? [employee.HRME_MobileNo] : [],
                        EmailId: employee.HRME_EmailID || '-',
                        JoinDate: employee.HRME_DateOfJoining ? new Date(employee.HRME_DateOfJoining).toLocaleDateString() : '-',
                        LeftDate: employee.HRME_DateOfLeaving ? new Date(employee.HRME_DateOfLeaving).toLocaleDateString() : '-',
                        TotalServiceDays: employee.HRME_DateOfJoining
                            ? Math.floor((Date.now() - new Date(employee.HRME_DateOfJoining).getTime()) / (1000 * 60 * 60 * 24))
                            : 0,
                        BloodGroup: '-',
                        Address: '-',
                        Age: '-',
                        Religion: '-',
                        DOB: '-',
                        AadharCardNumber: '-',
                        FatherName: '-',
                        ProfilePhoto: employee.HRME_ProfilePhoto
                    };

                    reports.push(details);
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error fetching details for employee ${employeeId}:`, error);
                errorCount++;
            }
        }

        if (reports.length > 0) {
            setEmployeeReports(reports);
            setShowReport(true);
            toast.success(`Successfully generated ${successCount} report(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        } else {
            toast.error('Failed to generate reports for selected employees');
        }
    };

    const handleCancel = () => {
        setSelectedGroupTypes([]);
        setSelectedDepartments([]);
        setSelectedDesignations([]);
        setSelectedEmployees([]);
        setEmployeeSearchQuery('');
        setShowReport(false);
        setShowEmployeeDropdown(false);
        setEmployeeReports([]);
    };

    const _handleBack = () => {
        setShowReport(false);
        setEmployeeReports([]);
        setSelectedEmployees([]);
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Get employee name
    const getEmployeeName = (employee: EmployeeDropdown) => {
        return `${employee.HRME_EmployeeFirstName} ${
            employee.HRME_EmployeeMiddleName || ''
        } ${employee.HRME_EmployeeLastName || ''}`.trim();
    };

    return (
        <div className='space-y-6'>
            {/* Employee Selection Section */}
            <EmployeeProfileFilters
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                selectedGroupTypes={selectedGroupTypes}
                selectedDepartments={selectedDepartments}
                selectedDesignations={selectedDesignations}
                selectedEmployees={selectedEmployees}
                employeeSearchQuery={employeeSearchQuery}
                filteredEmployees={filteredEmployees}
                showEmployeeDropdown={showEmployeeDropdown}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onGroupTypeChange={setSelectedGroupTypes}
                onDepartmentChange={setSelectedDepartments}
                onDesignationChange={setSelectedDesignations}
                onEmployeeSearchChange={setEmployeeSearchQuery}
                onSelectAllEmployees={handleSelectAll}
                onEmployeeToggle={handleEmployeeToggle}
                onFilterSearch={handleFilterSearch}
                onSearch={handleSearch}
                onCancel={handleCancel}
                getEmployeeName={getEmployeeName}
            />

            {/* Employee Profile Reports Section - Multiple reports displayed one below another */}
            {showReport && employeeReports.length > 0 && (
                <div className='space-y-6'>
                    {/* Render each report */}
                    {employeeReports.map((report, index) => (
                        <CollapsibleSection
                            key={index}
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-6'>
                                {/* School Header */}
                                <div className='space-y-1 border-b pb-4 text-center'>
                                    <h2 className='font-bold text-2xl'>VAPS SCHOOL</h2>
                                    <p>3, CHURCH ROAD, WEST BENGAL, INDIA</p>
                                    <p>HOWRAH - 711101.</p>
                                    <p className='font-semibold text-sm'>EMPLOYEE PROFILE REPORT</p>
                                </div>

                                {/* Employee Details */}
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    {/* Details Grid */}
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Employee Code:</p>
                                                <p className='text-sm'>{report.EmployeeCode || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Name of Employee:</p>
                                                <p className='text-sm'>{report.EmployeeName || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Designation:</p>
                                                <p className='text-sm'>{report.Designation || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Institution Name:</p>
                                                <p className='text-sm'>{report.InstitutionName || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Contact Details:</p>
                                                <p className='text-sm'>{(report.ContactDetails || []).join(', ')}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Email-Id:</p>
                                                <p className='text-sm'>{report.EmailId || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Join Date:</p>
                                                <p className='text-sm'>{report.JoinDate || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Left Date:</p>
                                                <p className='text-sm'>{report.LeftDate || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Total no. Of Service:</p>
                                                <p className='text-sm'>{report.TotalServiceDays || '-'} Days</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Blood Group:</p>
                                                <p className='text-sm'>{report.BloodGroup || '-'}</p>
                                            </div>
                                            <div className='col-span-2 space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Address:</p>
                                                <p className='text-sm'>{report.Address || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Age:</p>
                                                <p className='text-sm'>{report.Age || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Religion:</p>
                                                <p className='text-sm'>{report.Religion || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>DOB:</p>
                                                <p className='text-sm'>{report.DOB || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>AadharCard Number:</p>
                                                <p className='text-sm'>{report.AadharCardNumber || '-'}</p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-muted-foreground text-sm'>Father Name:</p>
                                                <p className='text-sm'>{report.FatherName || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Section */}
                                    <div className='flex flex-col items-center justify-start space-y-4'>
                                        <div className='flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100'>
                                            {report.ProfilePhoto ? (
                                                <img
                                                    src={report.ProfilePhoto}
                                                    alt={report.EmployeeName}
                                                    className='h-full w-full object-cover'
                                                />
                                            ) : (
                                                <User className='h-24 w-24 text-gray-400' />
                                            )}
                                        </div>
                                        <p className='text-center text-muted-foreground text-sm'>Signature of Nodal Officer</p>
                                    </div>
                                </div>

                                {/* Print Button for individual report */}
                                <div className='flex justify-end border-t pt-4'>
                                    <Button
                                        variant='outline'
                                        onClick={handlePrint}
                                        className='w-fit transition-all duration-200 hover:scale-105'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        PRINT
                                    </Button>
                                </div>
                            </div>
                        </CollapsibleSection>
                    ))}

                    {/* Global Print All Button */}
                    <div className='flex justify-center border-t pt-4'>
                        <Button variant='outline' onClick={handlePrint} className='w-fit transition-all duration-200 hover:scale-105'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT ALL REPORTS
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
