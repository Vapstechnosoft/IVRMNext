'use client';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeStrengthReportOnload, useSearchEmployeeStrengthReport } from '@/hooks/hrms/useReports';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmployeeStrengthFilters, type StrengthReportFilters } from './_components/filters';
import { EmployeeStrengthReportTemplate } from './_components/report-template';

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
    const [schoolName, setSchoolName] = useState<string>('');
    const [schoolAddress, setSchoolAddress] = useState<string>('');

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
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load employee strength report data. Please check if the API endpoint is available.';
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
        // Always show report template when search is clicked, even without data or on errors
        setShowReport(true);

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
            designationselected:
                filters.designation !== 'All' && mappedDesignations.find((d: any) => d.designationName === filters.designation)
                    ? [mappedDesignations.find((d: any) => d.designationName === filters.designation)!.id]
                    : [],
            departmentselected:
                filters.department !== 'All' && mappedDepartments.find((d: any) => d.departmentName === filters.department)
                    ? [mappedDepartments.find((d: any) => d.departmentName === filters.department)!.id]
                    : [],
            groupTypeselected:
                filters.groupType !== 'All' && mappedGroupTypes.find((g: any) => g.groupType === filters.groupType)
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
                    // Extract institution details from API response
                    const institutionDetails = (response.data as any).institutionDetails || onloadData?.data?.institutionDetails;
                    if (institutionDetails) {
                        setSchoolName(institutionDetails.MI_Name || '');
                        const addressParts = [];
                        if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                        if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                        if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                        if (institutionDetails.MI_Pincode) addressParts.push(institutionDetails.MI_Pincode);
                        setSchoolAddress(addressParts.join(', ') || '');
                    }

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
                        dateRange:
                            filters.fromDate && filters.toDate
                                ? `${format(filters.fromDate, 'dd-MM-yyyy')} to ${format(filters.toDate, 'dd-MM-yyyy')}`
                                : ''
                    }));

                    setStrengthRecords(mappedRecords);
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
        setSchoolName('');
        setSchoolAddress('');
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee strength report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Extract institution details from onload data if available
    useEffect(() => {
        if (onloadData?.data) {
            const institutionDetails = (onloadData.data as any).institutionDetails;
            if (institutionDetails) {
                setSchoolName(institutionDetails.MI_Name || '');
                const addressParts = [];
                if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                if (institutionDetails.MI_Pincode) addressParts.push(institutionDetails.MI_Pincode);
                setSchoolAddress(addressParts.join(', ') || '');
            }
        }
    }, [onloadData]);

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
                <EmployeeStrengthReportTemplate
                    schoolName={schoolName}
                    schoolAddress={schoolAddress}
                    reportData={filteredRecords}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
