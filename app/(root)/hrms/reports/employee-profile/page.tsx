'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeProfileReportOnload, useFilterEmployeesBySelection, useSearchEmployeeProfileDetails } from '@/hooks/hrms/useReports';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmployeeProfileFilters } from './_components/filters';
import { EmployeeProfileReportTemplate } from './_components/report-template';

export default function EmployeeProfileReportPage() {
    const roleId = HRMS_MI_ID;
    const [showReport, setShowReport] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    // React Query hooks
    const { data: onloadData, isLoading: onloadLoading, error: onloadError } = useEmployeeProfileReportOnload(roleId, 0);
    const filterMutation = useFilterEmployeesBySelection();
    const searchMutation = useSearchEmployeeProfileDetails();

    // Memoize arrays to prevent unnecessary re-renders
    // Extract dropdown data from the API response - handle different field name variations
    const groupTypes = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        // Try different possible field names from the API response
        return (data as any).groupTypedropdownlist || (data as any).groupTypedropdown || (data as any).grouplist || [];
    }, [onloadData?.data]);

    const departments = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        // Try different possible field names from the API response
        return (data as any).departmentdropdownlist || (data as any).departmentdropdown || (data as any).departmentlist || [];
    }, [onloadData?.data]);

    const designations = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        // Try different possible field names from the API response
        return (data as any).designationdropdownlist || (data as any).designationdropdown || (data as any).designationlist || [];
    }, [onloadData?.data]);

    // Memoize onload employee dropdown to prevent unnecessary re-renders
    const onloadEmployees = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        // Try to get employeedropdown from different possible locations
        const currentEmployeeDetails = (data as any).currentemployeeDetails;
        if (currentEmployeeDetails?.employeedropdown) {
            return currentEmployeeDetails.employeedropdown;
        }
        if ((data as any).employeedropdown) {
            return (data as any).employeedropdown;
        }
        if ((data as any).employeedetailList) {
            return (data as any).employeedetailList;
        }
        if ((data as any).ArrayempsList) {
            return (data as any).ArrayempsList;
        }
        return [];
    }, [onloadData?.data]);

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
    const [employeeReports, setEmployeeReports] = useState<
        Array<{
            EmployeeCode: string;
            EmployeeName: string;
            Designation: string;
            InstitutionName: string;
            InstitutionAddress?: string;
            InstitutionCity?: string;
            InstitutionPincode?: string;
            ContactDetails: string[];
            EmailId: string;
            JoinDate: string;
            LeftDate: string;
            TotalServiceDays: number;
            BloodGroup: string;
            Address: string;
            Age: string | number;
            Religion: string;
            DOB: string;
            AadharCardNumber: string;
            FatherName: string;
            ProfilePhoto?: string;
        }>
    >([]);

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
            LogInUserId: 0,
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
                    toast.error(response.message || 'No employees found for the selected filters');
                }
            },
            onError: (error) => {
                console.error('Error filtering employees:', error);
                toast.error(error.message || 'Failed to load employees. Please check if the API endpoint is available.');
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
        // Always show report template when search is clicked, even without employees
        setShowReport(true);

        if (selectedEmployees.length === 0) {
            toast.warning('Please select at least one employee. Showing empty report template.');
            return;
        }

        // Show loading state
        const reports: any[] = [];
        let successCount = 0;
        let errorCount = 0;

        // Fetch details for each selected employee
        for (const employeeId of selectedEmployees) {
            const employee = employees.find((emp) => emp.HRME_Id === employeeId);
            try {
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

                    // Extract currentemployeeDetails from the response if available
                    const currentEmployeeDetails = (employeeData as any).currentemployeeDetails || employeeData;

                    // Map the API response fields to our display format
                    // Extract employee details from currentemployeeDetails if available
                    const empDetails = currentEmployeeDetails?.currentemployeeDetails || currentEmployeeDetails;
                    const institutionDetails = (employeeData as any).institutionDetails || currentEmployeeDetails?.institutionDetails;

                    // Build institution address from available fields
                    const institutionAddressParts = [];
                    if (institutionDetails?.MI_Address1) institutionAddressParts.push(institutionDetails.MI_Address1);
                    if (institutionDetails?.MI_Address2) institutionAddressParts.push(institutionDetails.MI_Address2);
                    if (institutionDetails?.MI_Address3) institutionAddressParts.push(institutionDetails.MI_Address3);
                    const institutionAddress = institutionAddressParts.length > 0 ? institutionAddressParts.join(', ') : '-';

                    const details = {
                        EmployeeCode: empDetails?.HRME_EmployeeCode || employee.HRME_EmployeeCode,
                        EmployeeName: empDetails
                            ? `${empDetails.HRME_EmployeeFirstName || ''} ${empDetails.HRME_EmployeeMiddleName || ''} ${empDetails.HRME_EmployeeLastName || ''}`.trim()
                            : `${employee.HRME_EmployeeFirstName} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim(),
                        Designation:
                            empDetails?.DesignationName ||
                            designations.find((d: any) => d.HRMDES_Id === (empDetails?.HRMDES_Id || employee.HRMDES_Id))
                                ?.HRMDES_DesignationName ||
                            '-',
                        InstitutionName: institutionDetails?.MI_Name || '-',
                        InstitutionAddress: institutionAddress,
                        InstitutionCity: institutionDetails?.MI_AddressArea || '-',
                        InstitutionPincode: institutionDetails?.MI_Pincode?.toString() || '-',
                        ContactDetails: (() => {
                            const contacts: string[] = [];
                            // Add primary mobile number
                            if (empDetails?.HRME_MobileNo) {
                                contacts.push(empDetails.HRME_MobileNo.toString());
                            } else if (employee.HRME_MobileNo) {
                                contacts.push(employee.HRME_MobileNo.toString());
                            }
                            // Add spouse mobile number if available
                            if (empDetails?.HRME_SpouseMobileNo) {
                                contacts.push(empDetails.HRME_SpouseMobileNo.toString());
                            }
                            // Add any additional mobile numbers from mobile list
                            if (empDetails?.selectedmobile_list_dto && Array.isArray(empDetails.selectedmobile_list_dto)) {
                                empDetails.selectedmobile_list_dto.forEach((mobile: any) => {
                                    if (mobile.HRMEMNO_MobileNo && !contacts.includes(mobile.HRMEMNO_MobileNo.toString())) {
                                        contacts.push(mobile.HRMEMNO_MobileNo.toString());
                                    }
                                });
                            }
                            return contacts;
                        })(),
                        EmailId: empDetails?.HRME_EmailId || employee.HRME_EmailID || '-',
                        JoinDate: empDetails?.HRME_DOJ
                            ? empDetails.HRME_DOJ
                            : employee.HRME_DateOfJoining
                              ? employee.HRME_DateOfJoining
                              : '-',
                        LeftDate: empDetails?.HRME_DOL
                            ? empDetails.HRME_DOL
                            : employee.HRME_DateOfLeaving
                              ? employee.HRME_DateOfLeaving
                              : '-',
                        TotalServiceDays: empDetails?.HRME_DOJ
                            ? Math.floor((Date.now() - new Date(empDetails.HRME_DOJ).getTime()) / (1000 * 60 * 60 * 24))
                            : employee.HRME_DateOfJoining
                              ? Math.floor((Date.now() - new Date(employee.HRME_DateOfJoining).getTime()) / (1000 * 60 * 60 * 24))
                              : 0,
                        BloodGroup: empDetails?.HRME_BloodGroup || '-',
                        Address: empDetails?.HRME_PerStreet || empDetails?.HRME_LocStreet || '-',
                        Age: empDetails?.HRME_DOB
                            ? Math.floor((Date.now() - new Date(empDetails.HRME_DOB).getTime()) / (1000 * 60 * 60 * 24 * 365))
                            : '-',
                        Religion: '-', // Would need to map from religion dropdown
                        DOB: empDetails?.HRME_DOB ? empDetails.HRME_DOB : '-',
                        AadharCardNumber: empDetails?.HRME_AadharCardNo?.toString() || '-',
                        FatherName: empDetails?.HRME_FatherName || '-',
                        ProfilePhoto: empDetails?.HRME_Photo || employee.HRME_ProfilePhoto
                    };

                    reports.push(details);
                    successCount++;
                } else {
                    toast.error(`Failed to fetch details for employee ${employee?.HRME_EmployeeCode || employeeId}`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error fetching details for employee ${employeeId}:`, error);
                toast.error(
                    `Error fetching details for employee ${employee?.HRME_EmployeeCode || employeeId}. Please check if the API endpoint is available.`
                );
                errorCount++;
                // Still show template even on error
                setShowReport(true);
            }
        }

        if (reports.length > 0) {
            setEmployeeReports(reports);
            setShowReport(true);
            toast.success(`Successfully generated ${successCount} report(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        } else {
            // Still show template even if no reports generated
            setEmployeeReports([]);
            setShowReport(true);
            toast.error('Failed to generate reports for selected employees. Showing empty template.');
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
            <div className='space-y-6'>
                <div className='rounded-lg border border-destructive bg-destructive/10 p-4 text-center'>
                    <p className='font-semibold text-destructive'>
                        {onloadError
                            ? 'Failed to load filter options. Please check if the API endpoint is available.'
                            : onloadData?.message || 'Failed to load filter options'}
                    </p>
                </div>
            </div>
        );
    }

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

            {/* Employee Profile Reports Section - Show template even when no data */}
            {showReport && (
                <div className='space-y-6'>
                    {/* Render each report or show empty template */}
                    {employeeReports.length > 0 ? (
                        employeeReports.map((report, index) => {
                            // Build school address
                            const addressParts = [];
                            if (report.InstitutionAddress && report.InstitutionAddress !== '-') {
                                addressParts.push(report.InstitutionAddress);
                            }
                            if (
                                report.InstitutionCity &&
                                report.InstitutionCity !== '-' &&
                                report.InstitutionPincode &&
                                report.InstitutionPincode !== '-'
                            ) {
                                addressParts.push(`${report.InstitutionCity} - ${report.InstitutionPincode}.`);
                            }
                            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

                            return (
                                <CollapsibleSection
                                    key={index}
                                    defaultOpen={true}
                                    variant='default'
                                    size='lg'
                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                    <EmployeeProfileReportTemplate
                                        schoolName={report.InstitutionName}
                                        schoolAddress={fullAddress}
                                        employeeData={report}
                                        isLoading={false}
                                        onPrint={handlePrint}
                                        onCancel={handleCancel}
                                    />
                                </CollapsibleSection>
                            );
                        })
                    ) : (
                        // Show empty template when no data
                        <CollapsibleSection
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <EmployeeProfileReportTemplate
                                schoolName=''
                                schoolAddress=''
                                employeeData={null}
                                isLoading={searchMutation.isPending}
                                onPrint={handlePrint}
                                onCancel={handleCancel}
                            />
                        </CollapsibleSection>
                    )}
                </div>
            )}
        </div>
    );
}
