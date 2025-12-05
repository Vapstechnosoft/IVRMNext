'use client';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { usePFForm10ReportOnload, useSearchPFForm10Report } from '@/hooks/hrms/useReports';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type Form10Filters, PFForm10Filters } from './_components/filters';
import { PFForm10Template } from './_components/pf-form10-template';
// Member leaving service data structure
interface MemberLeavingService {
    serialNo: number;
    accountNo: string;
    memberName: string;
    fatherOrHusbandName: string;
    dateOfLeaving: string;
    reasonForLeaving: string;
    remarks: string;
}
export default function Form10Page() {
    const roleId = HRMS_MI_ID;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFForm10ReportOnload(roleId);
    const searchMutation = useSearchPFForm10Report();
    // State
    const [membersLeavingService, setMembersLeavingService] = useState<MemberLeavingService[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [establishmentName, setEstablishmentName] = useState<string>('');
    const [establishmentCode, setEstablishmentCode] = useState<string>('');
    const [establishmentAddress, setEstablishmentAddress] = useState<string>('');
    const [filters, setFilters] = useState<Form10Filters>({
        month: '',
        year: ''
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
    // Extract institution details from onload data
    useEffect(() => {
        if (onloadData?.data) {
            const institutionDetails = (onloadData.data as any).institutionDetails;
            if (institutionDetails) {
                setEstablishmentName(institutionDetails.MI_Name || '');
                setEstablishmentCode(institutionDetails.MI_Code || '');
                const addressParts = [];
                if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                if (institutionDetails.MI_Pincode) addressParts.push(institutionDetails.MI_Pincode);
                setEstablishmentAddress(addressParts.join(', ') || '');
            }
        }
    }, [onloadData]);
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load PF Form 10 report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);
    const handleFilterChange = (newFilters: Form10Filters) => {
        setFilters(newFilters);
    };
    const handleGenerate = () => {
        // Always show form template when generate is clicked, even without data or on errors
        setShowForm(true);
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        // Find month name from selected month
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthName = selectedMonthObj?.IVRM_Month_Name?.trim() || filters.month;
        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRES_Month: monthName,
            HRES_Year: filters.year
        };
        // Call search API to get PF Form 10 data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract institution details from API response if available
                    const institutionDetails = (response.data as any).institutionDetails || onloadData?.data?.institutionDetails;
                    if (institutionDetails) {
                        setEstablishmentName(institutionDetails.MI_Name || '');
                        setEstablishmentCode(institutionDetails.MI_Code || '');
                        const addressParts = [];
                        if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                        if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                        if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                        if (institutionDetails.MI_Pincode) addressParts.push(institutionDetails.MI_Pincode);
                        setEstablishmentAddress(addressParts.join(', ') || '');
                    }
                    // Extract PF Form 10 data - members leaving service
                    const pfData = response.data.getpfgriddata || response.data.pfreport || response.data.employeeDetails || [];
                    if (Array.isArray(pfData) && pfData.length > 0) {
                        // Filter employees who left service in the selected month/year
                        // Map API response to MemberLeavingService format
                        const mappedMembers: MemberLeavingService[] = pfData
                            .filter((item: any) => {
                                // Check if employee has a date of leaving
                                const dateOfLeaving = item.HRME_DOL || item.dateOfLeaving;
                                if (!dateOfLeaving) return false;
                                try {
                                    // Check if the leaving date matches the selected month/year
                                    const leavingDate = new Date(dateOfLeaving);
                                    const leavingMonth = leavingDate.getMonth() + 1; // 1-12
                                    const leavingYear = leavingDate.getFullYear().toString();
                                    // Get month number from selected month name
                                    const monthMap: { [key: string]: number } = {
                                        January: 1,
                                        February: 2,
                                        March: 3,
                                        April: 4,
                                        May: 5,
                                        June: 6,
                                        July: 7,
                                        August: 8,
                                        September: 9,
                                        October: 10,
                                        November: 11,
                                        December: 12
                                    };
                                    const selectedMonthNum = monthMap[filters.month] || 0;
                                    return leavingMonth === selectedMonthNum && leavingYear === filters.year;
                                } catch {
                                    return false;
                                }
                            })
                            .map((item: any, index: number) => {
                                // Determine reason for leaving
                                const reasonForLeaving = item.HRME_LeavingReason || item.reasonForLeaving || item.LeavingReason || 'Left';
                                return {
                                    serialNo: index + 1,
                                    accountNo: item.HRME_PFAccNo || item.HRME_PFuAN || item.pfNumber || '',
                                    memberName:
                                        `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                        item.EmployeeName ||
                                        '',
                                    fatherOrHusbandName: item.HRME_FatherName || item.FatherHusbandName || item.fatherName || '',
                                    dateOfLeaving: item.HRME_DOL || item.dateOfLeaving || '',
                                    reasonForLeaving,
                                    remarks: item.HRME_Remarks || item.remarks || ''
                                };
                            });
                        setMembersLeavingService(mappedMembers);
                        toast.success('Form 10 generated successfully');
                    } else {
                        // No data returned, but still show the form structure
                        setMembersLeavingService([]);
                        toast.warning('Form 10 generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate Form 10');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate Form 10');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setMembersLeavingService([]);
        setShowForm(false);
        toast.info('Filters cleared');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <PFForm10Filters
                filters={filters}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />
            {/* Form 10 Results */}
            {showForm && (
                <PFForm10Template
                    establishmentName={establishmentName}
                    establishmentCode={establishmentCode}
                    establishmentAddress={establishmentAddress}
                    month={filters.month}
                    year={filters.year}
                    membersLeavingService={membersLeavingService}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
