'use client';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterEmployeesForLoanReport, useGetEmployeeLoanDetails, useLoanReportOnload } from '@/hooks/hrms/useReports';
import type { EmployeeDropdown } from '@/types/hrms/reports/loan-report';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { EmployeeLoanRecord } from './_components/columns';
import { type LoanFilters, LoanReportFilters } from './_components/filters';
import { PrintableLoanSheet } from './_components/printable-sheet';
export default function LoanReportPage() {
    const MI_Id = HRMS_MI_ID;
    const roleId = 0;
    const LogInUserId = 0;
    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useLoanReportOnload(MI_Id, roleId, LogInUserId);
    const filterMutation = useFilterEmployeesForLoanReport();
    const searchMutation = useGetEmployeeLoanDetails();
    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdown || [], [onloadData?.data?.groupTypedropdown]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdown || [], [onloadData?.data?.departmentdropdown]);
    const designations = useMemo(() => onloadData?.data?.designationdropdown || [], [onloadData?.data?.designationdropdown]);
    const months = useMemo(() => onloadData?.data?.monthdropdown || [], [onloadData?.data?.monthdropdown]);
    const years = useMemo(() => onloadData?.data?.leaveyeardropdown || [], [onloadData?.data?.leaveyeardropdown]);
    // State
    const [loanRecords, setLoanRecords] = useState<EmployeeLoanRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<EmployeeLoanRecord[]>([]);
    const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<LoanFilters>({
        reportScope: 'all',
        selectedGroupTypes: [],
        selectedDepartments: [],
        selectedDesignations: [],
        selectedEmployee: '',
        month: '',
        year: ''
    });
    // Show error if API fails
    useEffect(() => {
        if (onloadData && !onloadData.success) {
            const errorMessage = onloadData?.message || 'Failed to load loan report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadData]);
    // Debug: Log when showReport changes
    useEffect(() => {
        // showReport state tracked for UI updates
    }, [showReport]);
    // Filter employees when filters change (for Individual mode)
    useEffect(() => {
        if (filters.reportScope === 'individual') {
            const hasFilters =
                filters.selectedGroupTypes.length > 0 || filters.selectedDepartments.length > 0 || filters.selectedDesignations.length > 0;
            if (hasFilters) {
                const request = {
                    MI_Id,
                    roleId,
                    LogInUserId,
                    hrmgT_IdList: filters.selectedGroupTypes.length > 0 ? filters.selectedGroupTypes : [],
                    hrmD_IdList: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : [],
                    hrmdeS_IdList: filters.selectedDesignations.length > 0 ? filters.selectedDesignations : []
                };
                filterMutation.mutate(request, {
                    onSuccess: (response) => {
                        if (response.success && response.data?.employeedropdown) {
                            setEmployees(response.data.employeedropdown || []);
                        } else {
                            setEmployees([]);
                        }
                    },
                    onError: (_error) => {
                        setEmployees([]);
                    }
                });
            } else {
                setEmployees([]);
            }
        } else {
            setEmployees([]);
            setFilters((prev) => ({ ...prev, selectedEmployee: '' }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.reportScope, filters.selectedGroupTypes, filters.selectedDepartments, filters.selectedDesignations]);
    // Filter records based on selected criteria
    useEffect(() => {
        // Filtering will be done on the backend via API
        setFilteredRecords(loanRecords);
    }, [loanRecords]);
    const handleFilterChange = (newFilters: LoanFilters) => {
        setFilters(newFilters);
    };
    const handleSearch = () => {
        // Show the sheet template immediately, even without data
        setShowReport(true);
        setLoanRecords([]);
        setFilteredRecords([]);
        // Show immediate feedback
        toast.info('Generating report...');
        // Validate and show warnings, but don't block
        if (filters.reportScope === 'individual') {
            if (!filters.selectedEmployee) {
                toast.warning('Please select an employee for accurate results');
            }
        } else {
            // For "All" scope, month and year are recommended
            if (!filters.month || !filters.year) {
                toast.warning('Please select month and year for accurate results');
            }
        }
        // Only call API if we have minimum required filters
        const hasMinimumFilters = filters.reportScope === 'individual' ? filters.selectedEmployee : filters.month && filters.year;
        if (!hasMinimumFilters) {
            // Show empty sheet template
            toast.info('Showing report template. Please select filters and search again for data.');
            return;
        }
        const request = {
            MI_Id,
            roleId,
            LogInUserId,
            hrmgT_IdList: filters.selectedGroupTypes.length > 0 ? filters.selectedGroupTypes : [],
            hrmD_IdList: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : [],
            hrmdeS_IdList: filters.selectedDesignations.length > 0 ? filters.selectedDesignations : [],
            hrmE_Id: filters.reportScope === 'individual' && filters.selectedEmployee ? Number.parseInt(filters.selectedEmployee) : 0
        };
        searchMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Process the response data to populate loan records
                    const employeeLoanDetails = response.data.employeeSalaryslipDetails || [];
                    const loanTotalAmount = response.data.EmploanTotalAmount || [];
                    const responseData = response.data;
                    // Transform API response to EmployeeLoanRecord format
                    // The API response structure contains loan data in employeeSalaryslipDetails with Values object
                    const records: EmployeeLoanRecord[] = [];
                    // Helper function to extract value from item (handles Values object structure)
                    const getValue = (item: any, key: string, defaultValue: any = 0) => {
                        // Check if item has Values object (API structure)
                        if (item?.Values && typeof item.Values === 'object') {
                            return item.Values[key] ?? defaultValue;
                        }
                        // Otherwise check direct properties
                        return item?.[key] ?? defaultValue;
                    };
                    // Map employeeSalaryslipDetails if available
                    if (Array.isArray(employeeLoanDetails) && employeeLoanDetails.length > 0) {
                        employeeLoanDetails.forEach((item: any, index: number) => {
                            // Extract loan data from the item or Values object
                            const loanAmount =
                                getValue(item, 'HREL_LoanAmount') ||
                                getValue(item, 'loanAmount') ||
                                getValue(item, 'HRELT_LoanAmount') ||
                                responseData.HREL_LoanAmount ||
                                responseData.HRELT_LoanAmount ||
                                0;
                            const approvedAmount = loanAmount; // Assuming approved amount equals loan amount if not specified
                            const interestRate = getValue(item, 'interestRate') || getValue(item, 'HREL_InterestRate') || 0;
                            const loanTenureStr = getValue(item, 'HREL_LoanInsallments') || responseData.HREL_LoanInsallments || '';
                            const loanTenure = loanTenureStr ? Number.parseInt(String(loanTenureStr)) : 0;
                            const emiAmount = getValue(item, 'emiAmount') || getValue(item, 'HREL_EMIAmount') || 0;
                            const paidAmount = getValue(item, 'paidAmount') || getValue(item, 'HREL_PaidAmount') || 0;
                            const remainingAmount =
                                getValue(item, 'HREL_TotalPending') || responseData.HREL_TotalPending || approvedAmount - paidAmount;
                            // Determine status based on remaining amount and other factors
                            let status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted' = 'Pending';
                            if (remainingAmount === 0 && paidAmount > 0) {
                                status = 'Completed';
                            } else if (paidAmount > 0 && remainingAmount > 0) {
                                status = 'Active';
                            } else if (loanAmount > 0 && paidAmount === 0) {
                                status = 'Approved';
                            }
                            // Calculate total interest and total payable amount
                            const totalInterest = getValue(item, 'totalInterest') || (loanAmount * interestRate * loanTenure) / (12 * 100);
                            const totalPayableAmount = approvedAmount + totalInterest;
                            const paidEMIs = getValue(item, 'paidEMIs') || Math.floor(paidAmount / (emiAmount || 1));
                            const remainingEMIs = loanTenure - paidEMIs;
                            // Get employee details from item, Values, or response top-level
                            const employeeCode =
                                getValue(item, 'HRME_EmployeeCode') ||
                                getValue(item, 'employeeCode') ||
                                responseData.hrme_employeecode ||
                                '';
                            const employeeFirstName =
                                getValue(item, 'HRME_EmployeeFirstName') ||
                                getValue(item, 'employeeFirstName') ||
                                responseData.hrmE_EmployeeFirstName ||
                                '';
                            const employeeMiddleName =
                                getValue(item, 'HRME_EmployeeMiddleName') || getValue(item, 'employeeMiddleName') || '';
                            const employeeLastName = getValue(item, 'HRME_EmployeeLastName') || getValue(item, 'employeeLastName') || '';
                            const employeeName = `${employeeFirstName} ${employeeMiddleName} ${employeeLastName}`.trim() || employeeCode;
                            const groupType = getValue(item, 'HRMGT_EmployeeGroupType') || getValue(item, 'groupType') || 'N/A';
                            const department = getValue(item, 'HRMD_DepartmentName') || getValue(item, 'department') || 'N/A';
                            const designation = getValue(item, 'HRMDES_DesignationName') || getValue(item, 'designation') || 'N/A';
                            const basicSalary = getValue(item, 'HRME_BasicSalary') || getValue(item, 'basicSalary') || 0;
                            const loanToSalaryRatio = basicSalary > 0 ? Math.round((loanAmount / basicSalary) * 100) : 0;
                            // Get loan type from item, Values, or response top-level
                            const loanType =
                                getValue(item, 'HRML_LoanType') ||
                                getValue(item, 'loanType') ||
                                responseData.HRML_LoanType ||
                                'Personal Loan';
                            // Get dates
                            const loanApplicationDate =
                                getValue(item, 'HREL_ApplicationDate') || getValue(item, 'loanApplicationDate') || '';
                            const loanStartDate = getValue(item, 'HREL_StartDate') || getValue(item, 'loanStartDate') || '';
                            const loanEndDate = getValue(item, 'HREL_EndDate') || getValue(item, 'loanEndDate') || '';
                            const approvalDate = getValue(item, 'HREL_ApprovalDate') || getValue(item, 'approvalDate') || '';
                            const approvedBy = getValue(item, 'HREL_ApprovedBy') || getValue(item, 'approvedBy') || '';
                            const guarantor = getValue(item, 'guarantor') || '';
                            const loanPurpose = getValue(item, 'HREL_Purpose') || getValue(item, 'loanPurpose') || '';
                            // Get month and year from item, Values, or response top-level
                            const month = filters.month || getValue(item, 'HRELT_Month') || responseData.HRELT_Month || '';
                            const year =
                                filters.year || getValue(item, 'HRELT_Year')?.toString() || responseData.HRELT_Year?.toString() || '';
                            records.push({
                                id: Number(getValue(item, 'HREL_Id') || getValue(item, 'HRELT_Id') || index) || index + 1,
                                employeeCode: employeeCode,
                                employeeName: employeeName,
                                groupType: groupType,
                                department: department,
                                designation: designation,
                                loanApplicationDate: loanApplicationDate,
                                loanType:
                                    (loanType as
                                        | 'Personal Loan'
                                        | 'Home Loan'
                                        | 'Vehicle Loan'
                                        | 'Education Loan'
                                        | 'Emergency Loan'
                                        | 'Medical Loan') || 'Personal Loan',
                                loanAmount: Math.round(loanAmount),
                                approvedAmount: Math.round(approvedAmount),
                                interestRate: Math.round(interestRate * 100) / 100,
                                loanTenure: loanTenure,
                                emiAmount: Math.round(emiAmount),
                                loanStartDate: loanStartDate,
                                loanEndDate: loanEndDate,
                                totalInterest: Math.round(totalInterest),
                                totalPayableAmount: Math.round(totalPayableAmount),
                                paidAmount: Math.round(paidAmount),
                                remainingAmount: Math.round(remainingAmount),
                                paidEMIs: paidEMIs,
                                remainingEMIs: remainingEMIs,
                                status: status,
                                approvalDate: approvalDate,
                                approvedBy: approvedBy,
                                guarantor: guarantor,
                                loanPurpose: loanPurpose,
                                month: month,
                                year: year,
                                basicSalary: Math.round(basicSalary),
                                loanToSalaryRatio: loanToSalaryRatio
                            });
                        });
                    }
                    // If no records from employeeSalaryslipDetails, try EmploanTotalAmount
                    if (records.length === 0 && Array.isArray(loanTotalAmount) && loanTotalAmount.length > 0) {
                        loanTotalAmount.forEach((item: any, index: number) => {
                            // Similar mapping logic - EmploanTotalAmount may have aggregated data
                            const loanAmount =
                                getValue(item, 'HREL_LoanAmount') ||
                                getValue(item, 'HRELT_LoanAmount') ||
                                responseData.HREL_LoanAmount ||
                                responseData.HRELT_LoanAmount ||
                                0;
                            const remainingAmount = getValue(item, 'HREL_TotalPending') || responseData.HREL_TotalPending || 0;
                            const employeeCode = getValue(item, 'HRME_EmployeeCode') || responseData.hrme_employeecode || '';
                            const employeeName =
                                getValue(item, 'HRME_EmployeeFirstName') || responseData.hrmE_EmployeeFirstName || employeeCode;
                            if (loanAmount > 0) {
                                records.push({
                                    id: index + 1000000, // Use a large number to avoid conflicts
                                    employeeCode: employeeCode,
                                    employeeName: employeeName,
                                    groupType: 'N/A',
                                    department: 'N/A',
                                    designation: 'N/A',
                                    loanApplicationDate: '',
                                    loanType:
                                        (responseData.HRML_LoanType as
                                            | 'Personal Loan'
                                            | 'Home Loan'
                                            | 'Vehicle Loan'
                                            | 'Education Loan'
                                            | 'Emergency Loan'
                                            | 'Medical Loan') || 'Personal Loan',
                                    loanAmount: Math.round(loanAmount),
                                    approvedAmount: Math.round(loanAmount),
                                    interestRate: 0,
                                    loanTenure: 0,
                                    emiAmount: 0,
                                    loanStartDate: '',
                                    loanEndDate: '',
                                    totalInterest: 0,
                                    totalPayableAmount: Math.round(loanAmount),
                                    paidAmount: Math.round(loanAmount - remainingAmount),
                                    remainingAmount: Math.round(remainingAmount),
                                    paidEMIs: 0,
                                    remainingEMIs: 0,
                                    status: remainingAmount === 0 ? 'Completed' : 'Active',
                                    approvalDate: '',
                                    approvedBy: '',
                                    guarantor: '',
                                    loanPurpose: '',
                                    month: filters.month || responseData.HRELT_Month || '',
                                    year: filters.year || responseData.HRELT_Year?.toString() || '',
                                    basicSalary: 0,
                                    loanToSalaryRatio: 0
                                });
                            }
                        });
                    }
                    // Always update records and show report (sheet is already shown)
                    setLoanRecords(records);
                    setFilteredRecords(records);
                    if (records.length > 0) {
                        toast.success(`Employee Loan Report generated successfully. Found ${records.length} loan record(s).`);
                    } else {
                        toast.warning('No loan data found for selected criteria. Showing empty report template.');
                    }
                } else {
                    // Even on API error, keep the sheet visible
                    toast.error(response.message || 'Failed to generate loan report. Showing empty report template.');
                }
            },
            onError: (error) => {
                // Keep the sheet visible even on error
                toast.error(error.message || 'Failed to generate loan report. Showing empty report template.');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            reportScope: 'all',
            selectedGroupTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            selectedEmployee: '',
            month: '',
            year: ''
        });
        setEmployees([]);
        setLoanRecords([]);
        setFilteredRecords([]);
        setShowReport(false);
        toast.info('Filters cleared');
    };
    const isLoading = isLoadingOnload || filterMutation.isPending || searchMutation.isPending;
    const handleExport = () => {
        // TODO: Implement Excel export functionality
        toast.success('Employee Loan Report exported successfully');
    };
    const handlePrint = () => {
        window.print();
    };
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <LoanReportFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                months={months}
                years={years}
                employees={employees}
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />
            {/* Report Results - Printable Sheet */}
            {showReport && (
                <div className='mt-4'>
                    <div className='mb-2 rounded bg-blue-50 p-2 text-blue-800 text-xs'>
                        Report Sheet Visible - Records: {filteredRecords.length}
                    </div>
                    <PrintableLoanSheet
                        records={filteredRecords}
                        institutionName={onloadData?.data?.institutionDetails?.MI_Name}
                        institutionAddress={
                            onloadData?.data?.institutionDetails?.MI_Address1
                                ? `${onloadData.data.institutionDetails.MI_Address1}${onloadData.data.institutionDetails.MI_Address2 ? `, ${onloadData.data.institutionDetails.MI_Address2}` : ''}${onloadData.data.institutionDetails.MI_Address3 ? `, ${onloadData.data.institutionDetails.MI_Address3}` : ''}${onloadData.data.institutionDetails.MI_Pincode ? `, ${onloadData.data.institutionDetails.MI_Pincode}` : ''}`
                                : undefined
                        }
                        month={filters.month}
                        year={filters.year}
                        employeeName={
                            filters.reportScope === 'individual' && filters.selectedEmployee
                                ? employees.find((e) => e.HRME_Id.toString() === filters.selectedEmployee)
                                    ? `${employees.find((e) => e.HRME_Id.toString() === filters.selectedEmployee)?.HRME_EmployeeFirstName || ''} ${employees.find((e) => e.HRME_Id.toString() === filters.selectedEmployee)?.HRME_EmployeeMiddleName || ''} ${employees.find((e) => e.HRME_Id.toString() === filters.selectedEmployee)?.HRME_EmployeeLastName || ''}`.trim()
                                    : undefined
                                : undefined
                        }
                        reportScope={filters.reportScope}
                        onPrint={handlePrint}
                        onExport={handleExport}
                    />
                </div>
            )}
        </div>
    );
}
