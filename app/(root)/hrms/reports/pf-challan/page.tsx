'use client';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { usePFChallanReportOnload, useSearchPFChallanReport } from '@/hooks/hrms/useReports';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PFChallanFilters, type PFChallanFilters as PFChallanFiltersType } from './_components/filters';
import { PFChallanTemplate } from './_components/pf-challan-template';
// PF challan data structure
interface PFChallanRecord {
    id?: string;
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePF: number;
    employerPF: number;
    totalPF: number;
    vpfContribution: number;
    pensionContribution: number;
    administrationCharges: number;
    month: string;
    year: string;
}
export default function PFChallanPage() {
    const roleId = HRMS_MI_ID;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFChallanReportOnload(roleId);
    const searchMutation = useSearchPFChallanReport();
    // State
    const [pfRecords, setPFRecords] = useState<PFChallanRecord[]>([]);
    const [showChallan, setShowChallan] = useState(false);
    const [establishmentName, setEstablishmentName] = useState<string>('');
    const [establishmentAddress, setEstablishmentAddress] = useState<string>('');
    const [pincode, setPincode] = useState<string>('');
    const [filters, setFilters] = useState<PFChallanFiltersType>({
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
                const addressParts = [];
                if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                setEstablishmentAddress(addressParts.join(', ') || '');
                setPincode(institutionDetails.MI_Pincode || '');
            }
        }
    }, [onloadData]);
    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load PF challan report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);
    const handleFilterChange = (newFilters: PFChallanFiltersType) => {
        setFilters(newFilters);
    };
    const handleGenerate = () => {
        // Always show challan template when generate is clicked, even without data or on errors
        setShowChallan(true);
        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }
        // Find month ID from selected month name
        const selectedMonthObj = months.find((m: any) => m.IVRM_Month_Name?.trim() === filters.month);
        const monthName = selectedMonthObj?.IVRM_Month_Name?.trim() || filters.month;
        // Prepare search request
        const searchRequest = {
            MI_Id: roleId,
            HRES_Month: monthName,
            HRES_Year: filters.year
        };
        // Call search API to get PF challan data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract institution details from API response if available
                    const institutionDetails = (response.data as any).institutionDetails || onloadData?.data?.institutionDetails;
                    if (institutionDetails) {
                        setEstablishmentName(institutionDetails.MI_Name || '');
                        const addressParts = [];
                        if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
                        if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
                        if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
                        setEstablishmentAddress(addressParts.join(', ') || '');
                        setPincode(institutionDetails.MI_Pincode || '');
                    }
                    // Extract PF challan data from response
                    const pfData = response.data.getpfgriddata || response.data.pfreport || response.data.employeeDetails || [];
                    if (Array.isArray(pfData) && pfData.length > 0) {
                        // Map API response to PFChallanRecord format
                        const mappedRecords: PFChallanRecord[] = pfData.map((item: any, index: number) => {
                            const basicSalary = item.basicamount || item.basicSalary || item.AmountofWages || 0;
                            const pfEligibleSalary = item.pfEligibleSalary || Math.min(basicSalary, 15000); // PF ceiling
                            const employeePF = item.HRES_EPF || item.employeePF || pfEligibleSalary * 0.12; // 12% employee contribution
                            const employerPF = item.HRES_FPF || item.employerPF || pfEligibleSalary * 0.12; // 12% employer contribution
                            const vpfContribution = item.VPFAmount || item.vpfContribution || 0;
                            const pensionContribution = pfEligibleSalary * 0.0833; // 8.33% pension
                            const administrationCharges = pfEligibleSalary * 0.005; // 0.5% admin charges
                            const totalPF = employeePF + employerPF + vpfContribution + pensionContribution + administrationCharges;
                            return {
                                id: `pf-${item.HRME_Id || item.HRES_Id || index}`,
                                employeeCode: item.HRME_EmployeeCode || item.EmployeeCode || item.employeeCode || '',
                                employeeName:
                                    `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                    item.EmployeeName ||
                                    '',
                                pfNumber:
                                    item.HRME_PFAccNo ||
                                    item.HRME_PFuAN ||
                                    item.pfNumber ||
                                    `PF${(item.HRME_EmployeeCode || '').slice(-3)}${filters.month.slice(0, 3).toUpperCase()}`,
                                basicSalary: Math.round(basicSalary),
                                pfEligibleSalary: Math.round(pfEligibleSalary),
                                employeePF: Math.round(employeePF),
                                employerPF: Math.round(employerPF),
                                totalPF: Math.round(totalPF),
                                vpfContribution: Math.round(vpfContribution),
                                pensionContribution: Math.round(pensionContribution),
                                administrationCharges: Math.round(administrationCharges),
                                month: filters.month,
                                year: filters.year
                            };
                        });
                        setPFRecords(mappedRecords);
                        toast.success('PF Challan generated successfully');
                    } else {
                        // No data returned, but still show the challan structure
                        setPFRecords([]);
                        toast.warning('PF Challan generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate PF challan');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate PF challan');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setPFRecords([]);
        setShowChallan(false);
        toast.info('Filters cleared');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Calculate PF summary for challan template
    // A/C NO.1 = Employee Share + Employer Share (EPF contributions)
    // A/C NO.21 = Pension contribution (from employer share)
    // A/C NO.22 = Administration charges
    // A/C NO.2 and A/C NO.10 are typically 0 for standard contributions
    const challanSummary = useMemo(() => {
        return pfRecords.reduce(
            (acc, record) => {
                const employeeShare = record.employeePF;
                const employerShare = record.employerPF;
                const pensionContribution = record.pensionContribution;
                const adminCharges = record.administrationCharges;
                // A/C NO.1: Employee Share + Employer Share (excluding pension which goes to A/C 21)
                const account1EmployeeShare = employeeShare;
                const account1EmployerShare = employerShare - pensionContribution; // Employer share minus pension
                const account1Total = account1EmployeeShare + account1EmployerShare;
                return {
                    totalEmployeeShare: acc.totalEmployeeShare + account1EmployeeShare,
                    totalEmployerShare: acc.totalEmployerShare + account1EmployerShare,
                    totalAccount1: acc.totalAccount1 + account1Total,
                    account2: acc.account2 + 0, // Account 2 for other purposes
                    account10: acc.account10 + 0, // Account 10 for other purposes
                    account21: acc.account21 + pensionContribution, // Pension account
                    account22: acc.account22 + adminCharges, // Admin charges
                    grandTotal: acc.grandTotal + account1Total + pensionContribution + adminCharges
                };
            },
            {
                totalEmployeeShare: 0,
                totalEmployerShare: 0,
                totalAccount1: 0,
                account2: 0,
                account10: 0,
                account21: 0,
                account22: 0,
                grandTotal: 0
            }
        );
    }, [pfRecords]);
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <PFChallanFilters
                filters={filters}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />
            {/* Challan Results */}
            {showChallan && (
                <PFChallanTemplate
                    establishmentName={establishmentName}
                    establishmentAddress={establishmentAddress}
                    pincode={pincode}
                    month={filters.month}
                    year={filters.year}
                    summary={challanSummary}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
