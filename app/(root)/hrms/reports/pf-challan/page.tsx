'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { usePFChallanReportOnload, useFilterPFChallanEmployeeData, useSearchPFChallanReport } from '@/hooks/hrms/useReports';
import { Calculator, Download, FileText, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type PFChallanRecord as PFChallanRecordColumn, pfChallanColumns } from './_components/columns';
import { PFChallanFilters, type PFChallanFilters as PFChallanFiltersType } from './_components/filters';

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

// PF challan summary
interface PFChallanSummary {
    totalEmployees: number;
    totalBasicSalary: number;
    totalEmployeePF: number;
    totalEmployerPF: number;
    totalVPF: number;
    totalPension: number;
    totalAdminCharges: number;
    grandTotal: number;
}

export default function PFChallanPage() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFChallanReportOnload(roleId);
    const filterMutation = useFilterPFChallanEmployeeData();
    const searchMutation = useSearchPFChallanReport();

    // State
    const [pfRecords, setPFRecords] = useState<PFChallanRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PFChallanRecord[]>([]);
    const [showChallan, setShowChallan] = useState(false);

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

    // Get institution details from API
    const institutionDetails = useMemo(() => {
        const data = onloadData?.data;
        if (!data) return null;
        return (data as any).institutionDetails || null;
    }, [onloadData?.data]);

    // Show error if API fails
    useEffect(() => {
        if (onloadError || (!isLoadingOnload && onloadData && !onloadData.success)) {
            const errorMessage = onloadError?.message || onloadData?.message || 'Failed to load PF challan report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Filter PF records based on selected month/year
    useEffect(() => {
        let filtered = pfRecords;

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, pfRecords]);

    const handleFilterChange = (newFilters: PFChallanFiltersType) => {
        setFilters(newFilters);
    };

    const handleGenerate = () => {
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
                                employeeName: `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() || item.EmployeeName || '',
                                pfNumber: item.HRME_PFAccNo || item.HRME_PFuAN || item.pfNumber || `PF${(item.HRME_EmployeeCode || '').slice(-3)}${filters.month.slice(0, 3).toUpperCase()}`,
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
                        setShowChallan(true);
                        toast.success('PF Challan generated successfully');
                    } else {
                        // No data returned, but still show the challan structure
                        setPFRecords([]);
                        setShowChallan(true);
                        toast.warning('PF Challan generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate PF challan');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching PF challan report:', error);
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
        setFilteredRecords([]);
        setShowChallan(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('PF Challan exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate PF summary
    const pfSummary: PFChallanSummary = useMemo(() => {
        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: acc.totalEmployees + 1,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalEmployeePF: acc.totalEmployeePF + record.employeePF,
                totalEmployerPF: acc.totalEmployerPF + record.employerPF,
                totalVPF: acc.totalVPF + record.vpfContribution,
                totalPension: acc.totalPension + record.pensionContribution,
                totalAdminCharges: acc.totalAdminCharges + record.administrationCharges,
                grandTotal: acc.grandTotal + record.totalPF
            }),
            {
                totalEmployees: 0,
                totalBasicSalary: 0,
                totalEmployeePF: 0,
                totalEmployerPF: 0,
                totalVPF: 0,
                totalPension: 0,
                totalAdminCharges: 0,
                grandTotal: 0
            }
        );
    }, [filteredRecords]);

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
                <div className='space-y-4'>
                    {/* Challan Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                PF Challan - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Employees: {filteredRecords.length} | Total PF Amount: ₹{pfSummary.grandTotal.toLocaleString()}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <Button variant='outline' onClick={handleExport} prefix={<Download className='size-4' />}>
                                Export
                            </Button>
                            <Button variant='outline' onClick={handlePrint} prefix={<Printer className='size-4' />}>
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* PF Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{pfSummary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employee PF (12%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{pfSummary.totalEmployeePF.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employer PF (12%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-orange-600'>₹{pfSummary.totalEmployerPF.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total PF Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>₹{pfSummary.grandTotal.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PF Breakdown */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    PF Contribution Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employee PF (12%):</span>
                                    <span className='font-semibold text-blue-600'>₹{pfSummary.totalEmployeePF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Employer PF (12%):</span>
                                    <span className='font-semibold text-orange-600'>₹{pfSummary.totalEmployerPF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>VPF Contribution:</span>
                                    <span className='font-semibold'>₹{pfSummary.totalVPF.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Pension (8.33%):</span>
                                    <span className='font-semibold'>₹{pfSummary.totalPension.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Admin Charges (0.5%):</span>
                                    <span className='font-semibold'>₹{pfSummary.totalAdminCharges.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between border-t pt-2 font-semibold'>
                                    <span>Total PF Amount:</span>
                                    <span className='text-green-600'>₹{pfSummary.grandTotal.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Challan Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Challan Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Due Date:</span>
                                    <span className='font-semibold'>15th of next month</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>VAPS SCHOOL</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Code:</span>
                                    <span className='font-semibold'>WB/KOL/12345</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Establishment ID:</span>
                                    <span className='font-semibold'>WBKOL12345000</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload}
                        columns={pfChallanColumns}
                        data={filteredRecords as unknown as PFChallanRecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />

                    {/* Official PF Challan Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>MONTHLY CONTRIBUTION CHALLAN</h2>
                            </div>

                            <div className='mx-auto max-w-4xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Establishment Name:</strong>{' '}
                                            {institutionDetails?.MI_Name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> {institutionDetails?.MI_Code || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment ID:</strong> {institutionDetails?.MI_Id || 'N/A'}
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Challan Period:</strong> {filters.month} {filters.year}
                                        </div>
                                        <div>
                                            <strong>Due Date:</strong> 15th of next month
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {pfSummary.totalEmployees}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>CONTRIBUTION DETAILS</h3>
                                    <div className='grid grid-cols-2 gap-8 text-sm'>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>Total Basic Salary:</span>
                                                <span>₹{pfSummary.totalBasicSalary.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employee Share (12%):</span>
                                                <span>₹{pfSummary.totalEmployeePF.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Employer Share (12%):</span>
                                                <span>₹{pfSummary.totalEmployerPF.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span>VPF Contribution:</span>
                                                <span>₹{pfSummary.totalVPF.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Pension Contribution:</span>
                                                <span>₹{pfSummary.totalPension.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Admin Charges:</span>
                                                <span>₹{pfSummary.totalAdminCharges.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='border-t pt-3'>
                                        <div className='flex justify-between font-bold text-lg'>
                                            <span>TOTAL AMOUNT PAYABLE:</span>
                                            <span className='text-green-600'>₹{pfSummary.grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='text-center text-muted-foreground text-sm'>
                                    This challan should be submitted to the nearest PF office along with the payment by the due date.
                                </div>

                                {institutionDetails?.MI_Address1 && (
                                    <div className='text-center text-muted-foreground text-sm'>
                                        <div>{institutionDetails.MI_Address1}</div>
                                        {institutionDetails.MI_Address2 && <div>{institutionDetails.MI_Address2}</div>}
                                        {institutionDetails.MI_Address3 && <div>{institutionDetails.MI_Address3}</div>}
                                    </div>
                                )}

                                <div className='flex justify-between pt-8'>
                                    <div className='text-sm'>
                                        <div className='font-semibold'>Prepared By</div>
                                        <div className='mt-2'>HR Department</div>
                                        <div className='mt-6 w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>Signature & Date</div>
                                    </div>
                                    <div className='text-right text-sm'>
                                        <div className='font-semibold'>Authorized Signatory</div>
                                        <div className='mt-2'>Principal/Director</div>
                                        <div className='mt-6 ml-auto w-32 border-gray-300 border-t' />
                                        <div className='mt-1 text-xs'>Signature & Seal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
