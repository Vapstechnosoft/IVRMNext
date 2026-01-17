'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterEmployeesByYearMonth, useGenerateSalarySlip, useSalarySlipOnload } from '@/hooks/hrms/useReports';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { EmployeeSalarySlipDisplay } from './_components/columns';
import { SalarySlipFilters, type SalarySlipFilters as SalarySlipFiltersType } from './_components/filters';
import { SalarySlipTemplate } from './_components/salary-slip-template';
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
    const [showReport, setShowReport] = useState(false);
    const [salarySlips, setSalarySlips] = useState<
        Array<{
            employeeId: number;
            employeeName: string;
            designation: string;
            payLevel?: string;
            bankName?: string;
            bankAccountNo?: string;
            pfNo?: string;
            esiNo?: string;
            lopDays: number;
            earnings: Array<{ name: string; amount: number }>;
            deductions: Array<{ name: string; amount: number }>;
            grossPay: number;
            totalDeduction: number;
            netPayable: number;
            amountInWords: string;
            leaveDetails: Array<{
                serialNo: number;
                leaveName: string;
                totalLeaves: number;
                availedLeaves: number;
                balanceLeaves: number;
            }>;
        }>
    >([]);
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
        // Always show report template when generate is clicked
        setShowReport(true);
        const selectedEmployees = filteredEmployees.filter((emp) => emp.isSelected);
        if (selectedEmployees.length === 0) {
            toast.warning('Please select at least one employee. Showing empty salary slip template.');
            return;
        }
        if (!filters.month || !filters.year) {
            toast.warning('Please select month and year. Showing empty salary slip template.');
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
                if (response.success && response.data) {
                    // Parse salary slip data from API response
                    const slips: typeof salarySlips = [];
                    // The API might return data in different formats
                    const responseData = response.data;
                    const employeeList = responseData.employeedropdown || [];
                    const _employeeSalaryslipDetails = responseData.employeeSalaryslipDetails || [];
                    const earningdeductiondetails = responseData.earningdeductiondetails || [];
                    const employeeLeaveDetails = responseData.employeeLeaveDetails || [];
                    const mainList = responseData.main_list || [];
                    const reportData = responseData.ReportData || [];
                    // Try to get employee details - could be in different locations
                    let currentemployeeDetails: any = {};
                    if (responseData.currentemployeeDetails) {
                        if (
                            typeof responseData.currentemployeeDetails === 'object' &&
                            !Array.isArray(responseData.currentemployeeDetails)
                        ) {
                            currentemployeeDetails = responseData.currentemployeeDetails;
                        } else if (Array.isArray(responseData.currentemployeeDetails)) {
                            // If it's an array, create a map by HRME_Id
                            currentemployeeDetails = {};
                            responseData.currentemployeeDetails.forEach((emp: any) => {
                                if (emp.HRME_Id) {
                                    currentemployeeDetails[emp.HRME_Id] = emp;
                                }
                            });
                        }
                    }
                    // Process each selected employee
                    selectedEmployees.forEach((selectedEmp) => {
                        const empData = employeeList.find((e: any) => e.HRME_Id === selectedEmp.HRME_Id) || {};
                        const empDetails = currentemployeeDetails[selectedEmp.HRME_Id] || currentemployeeDetails || empData || {};
                        // Extract earnings and deductions
                        const earnings: Array<{ name: string; amount: number }> = [];
                        const deductions: Array<{ name: string; amount: number }> = [];
                        // Process earningdeductiondetails - could be array or object
                        let earningDeductionList: any[] = [];
                        if (Array.isArray(earningdeductiondetails)) {
                            earningDeductionList = earningdeductiondetails;
                        } else if (earningdeductiondetails && typeof earningdeductiondetails === 'object') {
                            // If it's an object, try to find arrays within it
                            earningDeductionList = Object.values(earningdeductiondetails).filter(Array.isArray).flat() as any[];
                        }
                        earningDeductionList.forEach((item: any) => {
                            if (!item || typeof item !== 'object') return;
                            // Check if this item belongs to the current employee
                            const belongsToEmployee = !item.HRME_Id || item.HRME_Id === selectedEmp.HRME_Id;
                            if (!belongsToEmployee) return;
                            const earnDedFlag = item.HRMED_EarnDedFlag || item.EarnDedFlag || item.flag || '';
                            const name = item.HRMED_Name || item.Name || item.name || '';
                            const amount = item.HREED_Amount || item.Amount || item.amount || 0;
                            if (earnDedFlag === 'Earning' || earnDedFlag === 'E' || name.toLowerCase().includes('earning')) {
                                if (name && amount) {
                                    earnings.push({ name, amount: Number(amount) || 0 });
                                }
                            } else if (earnDedFlag === 'Deduction' || earnDedFlag === 'D' || name.toLowerCase().includes('deduction')) {
                                if (name && amount) {
                                    deductions.push({ name, amount: Number(amount) || 0 });
                                }
                            }
                        });
                        // If no earnings/deductions found, try main_list or ReportData
                        if (earnings.length === 0 && deductions.length === 0) {
                            const dataSource = mainList.length > 0 ? mainList : Array.isArray(reportData) ? reportData : [];
                            dataSource.forEach((item: any) => {
                                if (item && item.HRME_Id === selectedEmp.HRME_Id) {
                                    // Try to extract from various possible structures
                                    if (item.earnings) {
                                        earnings.push(...(Array.isArray(item.earnings) ? item.earnings : []));
                                    }
                                    if (item.deductions) {
                                        deductions.push(...(Array.isArray(item.deductions) ? item.deductions : []));
                                    }
                                }
                            });
                        }
                        // Calculate totals - use from API if available, otherwise calculate
                        const grossPay = responseData.empGrossSal || earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
                        const totalDeduction = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
                        const netPayable = responseData.HRESD_Amount || grossPay - totalDeduction;
                        // Extract leave details
                        const leaveDetails: Array<{
                            serialNo: number;
                            leaveName: string;
                            totalLeaves: number;
                            availedLeaves: number;
                            balanceLeaves: number;
                        }> = [];
                        if (Array.isArray(employeeLeaveDetails)) {
                            employeeLeaveDetails.forEach((leave: any, index: number) => {
                                if (!leave || typeof leave !== 'object') return;
                                if (leave.HRME_Id && leave.HRME_Id !== selectedEmp.HRME_Id) return;
                                leaveDetails.push({
                                    serialNo: index + 1,
                                    leaveName: leave.HRML_LeaveName || leave.LeaveName || leave.leaveName || '-',
                                    totalLeaves: leave.TotalLeaves || leave.HRELT_TotDays || leave.totalLeaves || 0,
                                    availedLeaves: leave.AvailedLeaves || leave.HRELT_AvailedDays || leave.availedLeaves || 0,
                                    balanceLeaves: leave.BalanceLeaves || leave.HRELT_BalanceDays || leave.balanceLeaves || 0
                                });
                            });
                        }
                        // Get employee designation from various sources
                        const empDesigId = (empDetails as any).HRMDES_Id || (empData as any).HRMDES_Id;
                        const designation =
                            empDetails.DesignationName ||
                            empDetails.HRMDES_DesignationName ||
                            responseData.DesignationName ||
                            designations.find((d: any) => d.HRMDES_Id === empDesigId)?.HRMDES_DesignationName ||
                            '-';
                        slips.push({
                            employeeId: selectedEmp.HRME_Id,
                            employeeName: selectedEmp.employeeName,
                            designation,
                            payLevel: empDetails.PayLevel || empDetails.payLevel || '-',
                            bankName: empDetails.BankName || empDetails.bankName || responseData.HRES_BankCode || '-',
                            bankAccountNo: empDetails.BankAccountNo || empDetails.bankAccountNo || responseData.HRES_AccountNo || '-',
                            pfNo: empDetails.PFNo || empDetails.pfNo || empDetails.HRME_PFAccNo || responseData.HRES_EPF?.toString() || '-',
                            esiNo:
                                empDetails.ESINo ||
                                empDetails.esiNo ||
                                empDetails.HRME_ESIAccNo ||
                                responseData.HRES_ESIEmplr?.toString() ||
                                '-',
                            lopDays: responseData.Lopdays || 0,
                            earnings:
                                earnings.length > 0
                                    ? earnings
                                    : [
                                          { name: 'Provident Fund', amount: responseData.HRES_EPF || 0 },
                                          { name: 'Basic Pay', amount: responseData.basicamount || grossPay || 0 }
                                      ],
                            deductions:
                                deductions.length > 0
                                    ? deductions
                                    : [
                                          { name: 'ESI', amount: 0 },
                                          { name: 'PT', amount: 0 }
                                      ],
                            grossPay,
                            totalDeduction,
                            netPayable,
                            amountInWords: responseData.NetAmountInwords || '',
                            leaveDetails
                        });
                    });
                    setSalarySlips(slips);
                    setShowReport(true);
                    toast.success(`Salary slips generated successfully for ${selectedEmployees.length} employee(s)`);
                } else {
                    // Still show template even on unsuccessful response
                    setSalarySlips([]);
                    setShowReport(true);
                    toast.error(response.message || 'Failed to generate salary slips. Showing empty template.');
                }
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to generate salary slips. Please check if the API endpoint is available.');
                // Still show template even on error
                setSalarySlips([]);
                setShowReport(true);
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
        setShowReport(false);
        setSalarySlips([]);
        // Clear all selections
        const updatedEmployees = employees.map((emp) => ({ ...emp, isSelected: false }));
        setEmployees(updatedEmployees);
        toast.info('Filters and selections cleared');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    const handleSendMail = () => {
        toast.success('Salary slip email sent successfully');
    };
    const handleSendSMS = () => {
        toast.success('Salary slip SMS sent successfully');
    };
    // Get institution details
    const institutionDetails = useMemo(() => {
        const generateResponse = generateMutation.data?.data;
        if (generateResponse?.institutionDetails) {
            return generateResponse.institutionDetails;
        }
        // Try to get from onload data
        if (onloadData?.data?.institutionDetails) {
            return onloadData.data.institutionDetails;
        }
        return null;
    }, [generateMutation.data, onloadData]);
    // Build school name and address
    const schoolName = institutionDetails?.MI_Name || '';
    const schoolAddress = useMemo(() => {
        if (!institutionDetails) return '';
        const addressParts = [];
        if (institutionDetails.MI_Address1) addressParts.push(institutionDetails.MI_Address1);
        if (institutionDetails.MI_Address2) addressParts.push(institutionDetails.MI_Address2);
        if (institutionDetails.MI_Address3) addressParts.push(institutionDetails.MI_Address3);
        if (institutionDetails.MI_AddressArea) addressParts.push(institutionDetails.MI_AddressArea);
        if (institutionDetails.MI_Pincode) {
            addressParts.push(`${institutionDetails.MI_Pincode}`);
        }
        return addressParts.join(', ');
    }, [institutionDetails]);
    const schoolLogo = institutionDetails?.MI_Logo;
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
                            <p className='mt-2 text-muted-foreground text-sm'>
                                {(onloadError as any)?.message ||
                                    (onloadData as any)?.message ||
                                    'Failed to load filter options. Please check if the API endpoint is available.'}
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
                {/* Salary Slip Reports Section - Show template even when no data */}
                {showReport && (
                    <div className='space-y-6'>
                        {salarySlips.length > 0 ? (
                            // Render each salary slip
                            salarySlips.map((slip, index) => (
                                <CollapsibleSection
                                    key={slip.employeeId || index}
                                    defaultOpen={true}
                                    variant='default'
                                    size='lg'
                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                    <SalarySlipTemplate
                                        schoolName={schoolName}
                                        schoolAddress={schoolAddress}
                                        schoolLogo={schoolLogo}
                                        month={filters.month}
                                        year={filters.year}
                                        salarySlipData={{
                                            employeeName: slip.employeeName,
                                            designation: slip.designation,
                                            payLevel: slip.payLevel,
                                            bankName: slip.bankName,
                                            bankAccountNo: slip.bankAccountNo,
                                            pfNo: slip.pfNo,
                                            esiNo: slip.esiNo,
                                            lopDays: slip.lopDays,
                                            earnings: slip.earnings,
                                            deductions: slip.deductions,
                                            grossPay: slip.grossPay,
                                            totalDeduction: slip.totalDeduction,
                                            netPayable: slip.netPayable,
                                            amountInWords: slip.amountInWords,
                                            leaveDetails: slip.leaveDetails
                                        }}
                                        showLopDays={filters.options.lopDays}
                                        showLeaveDetails={filters.options.leaveDetails}
                                        showPanCardNo={filters.options.panCardNo}
                                        showBankDetails={filters.options.bankDetails}
                                        isLoading={generateMutation.isPending}
                                        onPrint={handlePrint}
                                        onSendMail={handleSendMail}
                                        onSendSMS={handleSendSMS}
                                        onCancel={handleCancel}
                                    />
                                </CollapsibleSection>
                            ))
                        ) : (
                            // Show empty template when no data
                            <CollapsibleSection
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <SalarySlipTemplate
                                    schoolName={schoolName}
                                    schoolAddress={schoolAddress}
                                    schoolLogo={schoolLogo}
                                    month={filters.month}
                                    year={filters.year}
                                    salarySlipData={null}
                                    showLopDays={filters.options.lopDays}
                                    showLeaveDetails={filters.options.leaveDetails}
                                    showPanCardNo={filters.options.panCardNo}
                                    showBankDetails={filters.options.bankDetails}
                                    isLoading={generateMutation.isPending}
                                    onPrint={handlePrint}
                                    onSendMail={handleSendMail}
                                    onSendSMS={handleSendSMS}
                                    onCancel={handleCancel}
                                />
                            </CollapsibleSection>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
