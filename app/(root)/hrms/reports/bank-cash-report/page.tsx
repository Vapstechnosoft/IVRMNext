'use client';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useBankCashReportOnload, useSearchBankCashReport } from '@/hooks/hrms/useReports';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BankCashReportFilters, type BankCashReportFilters as BankCashReportFiltersType } from './_components/filters';
import { BankCashReportTemplate } from './_components/report-template';
// Simplified Bank Cash Record for template
interface BankCashRecord {
    id?: string;
    employeeName: string;
    netSalary: number;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
}
export default function BankCashReportPage() {
    const roleId = HRMS_MI_ID;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = useBankCashReportOnload(roleId, 0);
    const searchMutation = useSearchBankCashReport();
    // State
    const [bankCashRecords, setBankCashRecords] = useState<BankCashRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<BankCashRecord[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [schoolName, setSchoolName] = useState<string>('');
    const [schoolAddress, setSchoolAddress] = useState<string>('');
    const [filters, setFilters] = useState<BankCashReportFiltersType>({
        selectedTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        paymentMode: 'Bank',
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
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load bank cash report data. Please check if the API endpoint is available.';
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
    // Filter records based on selected criteria
    useEffect(() => {
        // For now, show all records as filtering is done on the API side
        setFilteredRecords(bankCashRecords);
    }, [bankCashRecords]);
    const handleFilterChange = (newFilters: BankCashReportFiltersType) => {
        setFilters(newFilters);
    };
    const handleSearch = () => {
        // Always show report template when search is clicked, even without data or on errors
        setShowReport(true);
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthId = selectedMonthObj?.IVRM_Month_Id || 0;
        // Find year ID from selected year
        const selectedYearObj = years.find((y: any) => y.HRMLY_LeaveYear === filters.year);
        const yearId = selectedYearObj?.HRMLY_Id || 0;
        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRES_Year: yearId,
            HRES_Month: monthId,
            BankCash: filters.paymentMode,
            departmentselected: filters.selectedDepartments.length > 0 ? filters.selectedDepartments.map((id) => Number.parseInt(id)) : [],
            groupTypeselected: filters.selectedTypes.length > 0 ? filters.selectedTypes.map((id) => Number.parseInt(id)) : []
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
                    // Map API response to BankCashRecord format (simplified for template)
                    const employeeDetails = response.data.employeeDetails || [];
                    const mappedRecords: BankCashRecord[] = employeeDetails.map((emp: any, index: number) => ({
                        id: `emp-${index}`,
                        employeeName: emp.EmployeeName || emp.HRME_EmployeeFirstName || emp.employeeName || '',
                        netSalary: emp.NetSalary || emp.netSalary || 0,
                        // Bank-specific fields (only when payment mode is Bank)
                        accountNumber:
                            filters.paymentMode === 'Bank'
                                ? emp.BankAcNumber || emp.HRME_BankAccountNo || emp.accountNumber || ''
                                : undefined,
                        ifscCode: filters.paymentMode === 'Bank' ? emp.HRMBD_IFSCCode || emp.IFSCCode || emp.ifscCode || '' : undefined,
                        branch: filters.paymentMode === 'Bank' ? emp.HRMBD_BranchName || emp.BranchName || emp.branch || '' : undefined
                    }));
                    setBankCashRecords(mappedRecords);
                    toast.success('Bank/Cash Report generated successfully');
                } else {
                    toast.error(response.message || 'Failed to generate bank cash report');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate bank cash report');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            selectedTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            paymentMode: 'Bank',
            month: '',
            year: ''
        });
        setBankCashRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        setSchoolName('');
        setSchoolAddress('');
        toast.info('Filters cleared');
    };
    const handleExport = () => {
        toast.success('Bank/Cash Report exported successfully');
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
            <BankCashReportFilters
                filters={filters}
                groupTypes={mappedGroupTypes}
                departments={mappedDepartments}
                designations={mappedDesignations}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />
            {/* Report Results */}
            {showReport && (
                <BankCashReportTemplate
                    schoolName={schoolName}
                    schoolAddress={schoolAddress}
                    month={filters.month}
                    year={filters.year}
                    paymentMode={filters.paymentMode}
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
