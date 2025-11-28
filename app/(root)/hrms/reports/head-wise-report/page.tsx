'use client';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useHeadWiseReportOnload, useSearchHeadWiseReport } from '@/hooks/hrms/useReports';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type HeadWiseReportFilters as HeadWiseFilters, HeadWiseReportFilters } from './_components/filters';
import { HeadWiseReportTemplate } from './_components/report-template';

// Head wise report data structure
interface HeadWiseRecord {
    id?: string;
    employeeName: string;
    designation: string;
    totalEarning: number;
    totalDeduction: number;
    netSalary: number;
}

export default function HeadWiseReportPage() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useHeadWiseReportOnload(roleId, 0);
    const searchMutation = useSearchHeadWiseReport();

    // State
    const [headWiseRecords, setHeadWiseRecords] = useState<HeadWiseRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<HeadWiseRecord[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [schoolName, setSchoolName] = useState<string>('');
    const [schoolAddress, setSchoolAddress] = useState<string>('');

    const [filters, setFilters] = useState<HeadWiseFilters>({
        selectedGroupTypes: [],
        month: '',
        year: ''
    });

    // Memoize dropdown data from API
    const groupTypes = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return [];
        return (data as any).groupTypedropdown || [];
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
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load head wise report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Memoize mapped data
    const mappedGroupTypes = useMemo(() => {
        return groupTypes.map((gt: any) => ({
            id: gt.HRMGT_Id,
            groupType: gt.HRMGT_EmployeeGroupType || gt.HRMGT_Code || '',
            groupCode: gt.HRMGT_Code || '',
            order: gt.HRMGT_Order || 0,
            isActive: gt.HRMGT_ActiveFlag !== false
        }));
    }, [groupTypes]);

    // Filter head wise records based on selected criteria
    useEffect(() => {
        // For now, show all records as filtering is done on the API side
        setFilteredRecords(headWiseRecords);
    }, [headWiseRecords]);

    const handleFilterChange = (newFilters: HeadWiseFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        // Always show report template when search is clicked, even without data or on errors
        setShowReport(true);

        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        if (filters.selectedGroupTypes.length === 0) {
            toast.error('Please select at least one group type');
            return;
        }

        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthId = selectedMonthObj?.IVRM_Month_Id?.toString() || '';

        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            groupTypeselected: filters.selectedGroupTypes.length > 0 ? filters.selectedGroupTypes.map((id) => Number.parseInt(id)) : [],
            departmentselected: [],
            designationselected: [],
            HRES_Year: filters.year || '',
            HRES_Month: monthId || ''
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

                    // Map API response to HeadWiseRecord format
                    // The API returns employee details with EmployeeName, DesignationName, TotalEarning, TotalDeduction, NetSalary
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: HeadWiseRecord[] = employeeDetails.map((emp: any, index: number) => ({
                        id: `emp-${index}`,
                        employeeName: emp.EmployeeName || emp.HRME_EmployeeFirstName || emp.employeeName || '',
                        designation: emp.DesignationName || emp.HRMDES_DesignationName || emp.designation || '',
                        totalEarning: emp.TotalEarning || emp.totalEarning || 0,
                        totalDeduction: emp.TotalDeduction || emp.totalDeduction || 0,
                        netSalary: emp.NetSalary || emp.netSalary || 0
                    }));

                    setHeadWiseRecords(mappedRecords);
                    toast.success('Header wise report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate header wise report');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching head wise report:', error);
                toast.error(error.message || 'Failed to generate header wise report');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            selectedGroupTypes: [],
            month: '',
            year: ''
        });
        setHeadWiseRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        setSchoolName('');
        setSchoolAddress('');
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Header wise report exported successfully');
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
            <HeadWiseReportFilters
                filters={filters}
                groupTypes={mappedGroupTypes}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />

            {/* Report Results */}
            {showReport && (
                <HeadWiseReportTemplate
                    schoolName={schoolName}
                    schoolAddress={schoolAddress}
                    month={filters.month}
                    year={filters.year}
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
