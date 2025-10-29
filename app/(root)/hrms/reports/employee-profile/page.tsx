'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useEmployeeProfileReportOnload,
    useFilterEmployeesBySelection,
    useSearchEmployeeProfileDetails
} from '@/hooks/hrms/reports/useEmployeeProfileReport';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import { Printer, Search, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EmployeeProfileReportPage() {
    const roleId = HRMS_MI_ID;
    const [showReport, setShowReport] = useState(false);

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useEmployeeProfileReportOnload(roleId);
    const filterMutation = useFilterEmployeesBySelection();
    const searchMutation = useSearchEmployeeProfileDetails();

    // Extract dropdown data from onload response
    const groupTypes = onloadData?.data?.groupTypedropdown || [];
    const departments = onloadData?.data?.departmentdropdown || [];
    const designations = onloadData?.data?.designationdropdown || [];
    const [employees, setEmployees] = useState<EmployeeDropdown[]>(onloadData?.data?.employeedropdown || []);

    // Filter states (multi-select)
    const [selectedGroupTypes, setSelectedGroupTypes] = useState<number[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
    const [selectedDesignations, setSelectedDesignations] = useState<number[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

    // Employee search
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDropdown[]>([]);

    // Selected employee details
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<any>(null);

    // Update employees when onload data changes
    useEffect(() => {
        if (onloadData?.data?.employeedropdown) {
            setEmployees(onloadData.data.employeedropdown);
            setFilteredEmployees(onloadData.data.employeedropdown);
        }
    }, [onloadData]);

    const handleFilterEmployees = useCallback(() => {
        const request = {
            MI_Id: roleId,
            LogInUserId: 2,
            hrmgT_IdList: selectedGroupTypes.length > 0 ? selectedGroupTypes : [0],
            hrmD_IdList: selectedDepartments.length > 0 ? selectedDepartments : [0],
            hrmdeS_IdList: selectedDesignations.length > 0 ? selectedDesignations : [0]
        };

        filterMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data.employeedropdown) {
                    setEmployees(response.data.employeedropdown);
                    setFilteredEmployees(response.data.employeedropdown);
                }
            }
        });
    }, [roleId, selectedGroupTypes, selectedDepartments, selectedDesignations, filterMutation]);

    // Filter employees when criteria change
    useEffect(() => {
        handleFilterEmployees();
    }, [handleFilterEmployees]);

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

    const handleSearch = () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }

        const request = {
            MI_Id: roleId,
            groupTypeIds: selectedGroupTypes,
            departmentIds: selectedDepartments,
            designationIds: selectedDesignations,
            employeeIds: [selectedEmployee],
            roleId: roleId
        };

        searchMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Map the API response to our display format
                    const employeeData = response.data;

                    // Get the selected employee from the employees list
                    const employee = employees.find((emp) => emp.HRME_Id === selectedEmployee);

                    if (employee) {
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

                        setSelectedEmployeeDetails(details);
                        setShowReport(true);
                        toast.success('Employee profile details retrieved successfully');
                    } else {
                        toast.error('Employee not found');
                    }
                }
            }
        });
    };

    const handleCancel = () => {
        setSelectedGroupTypes([]);
        setSelectedDepartments([]);
        setSelectedDesignations([]);
        setSelectedEmployee(null);
        setEmployeeSearchQuery('');
        setShowReport(false);
        setSelectedEmployeeDetails(null);
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
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Employee Profile Report' description='Generate comprehensive employee profile reports' />
            </div>

            {/* Employee Selection Section */}
            {!showReport && (
                <CollapsibleSection
                    title='EMPLOYEE PROFILE REPORT'
                    description='Select group, department, designation, and employee to generate the report'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-6'>
                        {/* Filter Row */}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {/* Group Type Filter */}
                            <div className='space-y-2'>
                                <label className='font-medium text-foreground text-sm'>Group Type: All</label>
                                <MultiSelect
                                    options={groupTypes.map((gt) => ({
                                        label: gt.HRMGT_EmployeeGroupType,
                                        value: gt.HRMGT_Id.toString()
                                    }))}
                                    selected={selectedGroupTypes.map((id) => id.toString())}
                                    onChange={(values) => setSelectedGroupTypes(values.map((v) => Number.parseInt(v)))}
                                    placeholder='Select group types'
                                />
                            </div>

                            {/* Department Filter */}
                            <div className='space-y-2'>
                                <label className='font-medium text-foreground text-sm'>Department: All</label>
                                <MultiSelect
                                    options={departments.map((dept) => ({
                                        label: dept.HRMD_DepartmentName,
                                        value: dept.HRMD_Id.toString()
                                    }))}
                                    selected={selectedDepartments.map((id) => id.toString())}
                                    onChange={(values) => setSelectedDepartments(values.map((v) => Number.parseInt(v)))}
                                    placeholder='Select departments'
                                />
                            </div>

                            {/* Designation Filter */}
                            <div className='space-y-2'>
                                <label className='font-medium text-foreground text-sm'>Designation: All</label>
                                <MultiSelect
                                    options={designations.map((desg) => ({
                                        label: desg.HRMDES_DesignationName,
                                        value: desg.HRMDES_Id.toString()
                                    }))}
                                    selected={selectedDesignations.map((id) => id.toString())}
                                    onChange={(values) => setSelectedDesignations(values.map((v) => Number.parseInt(v)))}
                                    placeholder='Select designations'
                                />
                            </div>
                        </div>

                        {/* Employee Selection */}
                        <div className='space-y-2'>
                            <label className='font-medium text-foreground text-sm'>Employee: All</label>
                            <div className='space-y-2'>
                                <InputText
                                    type='text'
                                    placeholder='search here...'
                                    value={employeeSearchQuery}
                                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                                />
                                <div className='max-h-60 space-y-2 overflow-y-auto rounded-lg border p-4'>
                                    {filteredEmployees.map((employee) => (
                                        <div key={employee.HRME_Id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`employee-${employee.HRME_Id}`}
                                                checked={selectedEmployee === employee.HRME_Id}
                                                onCheckedChange={(checked) => {
                                                    setSelectedEmployee(checked ? employee.HRME_Id : null);
                                                }}
                                            />
                                            <label
                                                htmlFor={`employee-${employee.HRME_Id}`}
                                                className='cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                {getEmployeeName(employee)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-2'>
                            <Button onClick={handleSearch} className='w-fit transition-all duration-200 hover:scale-105'>
                                <Search className='mr-2 h-4 w-4' />
                                SHOW DETAILS
                            </Button>
                            <Button variant='outline' onClick={handleCancel} className='w-fit transition-all duration-200 hover:scale-105'>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* Employee Profile Report Section */}
            {showReport && selectedEmployeeDetails && (
                <CollapsibleSection
                    title='EMPLOYEE PROFILE REPORT'
                    description='Employee profile details'
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
                                        <p className='text-sm'>{selectedEmployeeDetails.EmployeeCode || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Name of Employee:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.EmployeeName || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Designation:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.Designation || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Institution Name:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.InstitutionName || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Contact Details:</p>
                                        <p className='text-sm'>{(selectedEmployeeDetails.ContactDetails || []).join(', ')}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Email-Id:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.EmailId || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Join Date:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.JoinDate || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Left Date:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.LeftDate || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Total no. Of Service:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.TotalServiceDays || '-'} Days</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Blood Group:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.BloodGroup || '-'}</p>
                                    </div>
                                    <div className='col-span-2 space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Address:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.Address || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Age:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.Age || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Religion:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.Religion || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>DOB:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.DOB || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>AadharCard Number:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.AadharCardNumber || '-'}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-muted-foreground text-sm'>Father Name:</p>
                                        <p className='text-sm'>{selectedEmployeeDetails.FatherName || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Section */}
                            <div className='flex flex-col items-center justify-start space-y-4'>
                                <div className='flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100'>
                                    {selectedEmployeeDetails.ProfilePhoto ? (
                                        <img
                                            src={selectedEmployeeDetails.ProfilePhoto}
                                            alt='Employee Photo'
                                            className='h-full w-full object-cover'
                                        />
                                    ) : (
                                        <User className='h-24 w-24 text-gray-400' />
                                    )}
                                </div>
                                <p className='text-center text-muted-foreground text-sm'>Signature of Nodal Officer</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-2 border-t pt-4'>
                            <Button variant='outline' onClick={handlePrint} className='w-fit transition-all duration-200 hover:scale-105'>
                                <Printer className='mr-2 h-4 w-4' />
                                PRINT
                            </Button>
                            <Button onClick={handleCancel} className='w-fit transition-all duration-200 hover:scale-105'>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
