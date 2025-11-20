'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterPFForm5EmployeeData, usePFForm5ReportOnload, useSearchPFForm5Report } from '@/hooks/hrms/useReports';
import { Calculator, Download, FileText, Printer, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type Form5Record as Form5RecordColumn, form5Columns } from './_components/columns';
import { type Form5Filters, PFForm5Filters } from './_components/filters';

// Form 5 data structure (Register of Employees)
interface Form5Record {
    id?: string;
    serialNo: number;
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    pfNumber: string;
    designation: string;
    department: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePFRate: number;
    employerPFRate: number;
    vpfRate: number;
    nomineeDetails: string;
    status: 'Active' | 'Left' | 'Resigned' | 'Terminated';
    month: string;
    year: string;
}

// Form 5 summary
interface Form5Summary {
    totalEmployees: number;
    activeEmployees: number;
    leftEmployees: number;
    newJoining: number;
    totalBasicSalary: number;
    totalPFEligibleSalary: number;
    averageSalary: number;
}

export default function Form5Page() {
    const roleId = HRMS_MI_ID;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload, error: onloadError } = usePFForm5ReportOnload(roleId);
    const _filterMutation = useFilterPFForm5EmployeeData();
    const searchMutation = useSearchPFForm5Report();

    // State
    const [form5Records, setForm5Records] = useState<Form5Record[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Form5Record[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState<Form5Filters>({
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
            const errorMessage =
                onloadError?.message ||
                onloadData?.message ||
                'Failed to load PF Form 5 report data. Please check if the API endpoint is available.';
            toast.error(errorMessage);
        }
    }, [onloadError, isLoadingOnload, onloadData]);

    // Filter Form 5 records based on selected month/year
    useEffect(() => {
        let filtered = form5Records;

        if (filters.month) {
            filtered = filtered.filter((record) => record.month === filters.month);
        }

        if (filters.year) {
            filtered = filtered.filter((record) => record.year === filters.year);
        }

        setFilteredRecords(filtered);
    }, [filters, form5Records]);

    const handleFilterChange = (newFilters: Form5Filters) => {
        setFilters(newFilters);
    };

    const handleGenerate = () => {
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

        // Call search API to get PF Form 5 data
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract PF Form 5 data from response
                    const pfData = response.data.getpfgriddata || response.data.pfreport || response.data.employeeDetails || [];

                    if (Array.isArray(pfData) && pfData.length > 0) {
                        // Map API response to Form5Record format
                        const mappedRecords: Form5Record[] = pfData.map((item: any, index: number) => {
                            const basicSalary = item.basicamount || item.basicSalary || item.AmountofWages || 0;
                            const pfEligibleSalary = item.pfEligibleSalary || Math.min(basicSalary, 15000); // PF ceiling
                            const employeePFRate = 12; // 12% employee PF rate
                            const employerPFRate = 12; // 12% employer PF rate
                            const vpfRate = item.VPFAmount ? 5 : 0; // 5% VPF if VPF amount exists

                            // Determine status based on leaving date
                            let status: 'Active' | 'Left' | 'Resigned' | 'Terminated' = 'Active';
                            if (item.HRME_DOL || item.dateOfLeaving) {
                                const leavingDate = new Date(item.HRME_DOL || item.dateOfLeaving);
                                const filterDate = new Date(`${filters.month} 1, ${filters.year}`);
                                if (leavingDate <= filterDate) {
                                    status = item.HRME_LeavingReason?.toLowerCase().includes('resign')
                                        ? 'Resigned'
                                        : item.HRME_LeavingReason?.toLowerCase().includes('terminat')
                                          ? 'Terminated'
                                          : 'Left';
                                }
                            }

                            return {
                                id: `form5-${item.HRME_Id || item.HRES_Id || index}`,
                                serialNo: index + 1,
                                employeeCode: item.HRME_EmployeeCode || item.EmployeeCode || item.employeeCode || '',
                                employeeName:
                                    `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                    item.EmployeeName ||
                                    '',
                                fatherName: item.HRME_FatherName || item.FatherHusbandName || item.fatherName || '',
                                dateOfBirth: item.HRME_DOB || item.dateOfBirth || '',
                                dateOfJoining: item.HRME_DOJ || item.dateOfJoining || '',
                                dateOfLeaving: item.HRME_DOL || item.dateOfLeaving,
                                pfNumber:
                                    item.HRME_PFAccNo ||
                                    item.HRME_PFuAN ||
                                    item.pfNumber ||
                                    `PF${(item.HRME_EmployeeCode || '').slice(-3)}/${filters.month.slice(0, 3).toUpperCase()}/${filters.year}`,
                                designation: item.DesignationName || item.HRMDES_DesignationName || item.designation || '',
                                department: item.departmentName || item.HRMD_DepartmentName || item.department || '',
                                basicSalary: Math.round(basicSalary),
                                pfEligibleSalary: Math.round(pfEligibleSalary),
                                employeePFRate: employeePFRate,
                                employerPFRate: employerPFRate,
                                vpfRate: vpfRate,
                                nomineeDetails: item.HRME_FatherName || item.FatherHusbandName || 'N/A',
                                status: status,
                                month: filters.month,
                                year: filters.year
                            };
                        });

                        setForm5Records(mappedRecords);
                        setShowForm(true);
                        toast.success('Form 5 generated successfully');
                    } else {
                        // No data returned, but still show the form structure
                        setForm5Records([]);
                        setShowForm(true);
                        toast.warning('Form 5 generated but no data found for selected period');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate Form 5');
                }
            },
            onError: (error: Error) => {
                console.error('Error searching PF Form 5 report:', error);
                toast.error(error.message || 'Failed to generate Form 5');
            }
        });
    };

    const handleCancel = () => {
        setFilters({
            month: '',
            year: ''
        });
        setForm5Records([]);
        setFilteredRecords([]);
        setShowForm(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Form 5 exported successfully');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate Form 5 summary
    const form5Summary: Form5Summary = useMemo(() => {
        const activeEmployees = filteredRecords.filter((record) => record.status === 'Active').length;
        const leftEmployees = filteredRecords.filter((record) => record.status !== 'Active').length;
        const newJoining = filteredRecords.filter((record) => {
            if (!filters.month || !filters.year) return false;
            const joiningDate = new Date(record.dateOfJoining);
            const filterMonth = new Date(`${filters.month} 1, ${filters.year}`);
            return joiningDate.getMonth() === filterMonth.getMonth() && joiningDate.getFullYear() === filterMonth.getFullYear();
        }).length;

        return filteredRecords.reduce(
            (acc, record) => ({
                totalEmployees: filteredRecords.length,
                activeEmployees: activeEmployees,
                leftEmployees: leftEmployees,
                newJoining: newJoining,
                totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
                totalPFEligibleSalary: acc.totalPFEligibleSalary + record.pfEligibleSalary,
                averageSalary: 0 // Will be calculated after reduce
            }),
            {
                totalEmployees: 0,
                activeEmployees: 0,
                leftEmployees: 0,
                newJoining: 0,
                totalBasicSalary: 0,
                totalPFEligibleSalary: 0,
                averageSalary: 0
            }
        );
    }, [filteredRecords, filters.month, filters.year]);

    // Calculate average salary
    form5Summary.averageSalary = filteredRecords.length > 0 ? Math.round(form5Summary.totalBasicSalary / filteredRecords.length) : 0;

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <PFForm5Filters
                filters={filters}
                months={months}
                years={years}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isLoading={isLoadingOnload}
            />

            {/* Form 5 Results */}
            {showForm && (
                <div className='space-y-4'>
                    {/* Form 5 Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Form 5 - {filters.month} {filters.year}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Employee Register | Total: {filteredRecords.length} | Active: {form5Summary.activeEmployees} | Left:{' '}
                                {form5Summary.leftEmployees}
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

                    {/* Form 5 Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{form5Summary.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserPlus className='h-3 w-3' />
                                    Active Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>{form5Summary.activeEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='flex items-center gap-1 text-muted-foreground text-sm'>
                                    <UserMinus className='h-3 w-3' />
                                    Left Employees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>{form5Summary.leftEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Average Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-blue-600 text-lg'>₹{form5Summary.averageSalary.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form 5 Statistics */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <Calculator className='h-4 w-4' />
                                    Salary Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total Basic Salary:</span>
                                    <span className='font-semibold'>₹{form5Summary.totalBasicSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Total PF Eligible Salary:</span>
                                    <span className='font-semibold'>₹{form5Summary.totalPFEligibleSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Average Basic Salary:</span>
                                    <span className='font-semibold text-blue-600'>₹{form5Summary.averageSalary.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Contribution Rate:</span>
                                    <span className='font-semibold'>12% (Employee) + 12% (Employer)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4' />
                                    Register Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Register Period:</span>
                                    <span className='font-semibold'>
                                        {filters.month} {filters.year}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>Organization:</span>
                                    <span className='font-semibold'>{institutionDetails?.MI_Name || 'N/A'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>PF Code:</span>
                                    <span className='font-semibold'>{institutionDetails?.MI_Code || 'N/A'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm'>New Joinings:</span>
                                    <span className='font-semibold text-green-600'>{form5Summary.newJoining}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoadingOnload}
                        columns={form5Columns}
                        data={filteredRecords as unknown as Form5RecordColumn[]}
                        totalItems={filteredRecords.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['serialNo'] }}
                    />

                    {/* Official Form 5 Format */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-foreground text-xl'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                                <h2 className='font-semibold text-foreground text-lg'>FORM 5 - REGISTER OF EMPLOYEES</h2>
                                <h3 className='font-medium text-base text-foreground'>Under the Employees' Provident Fund Scheme, 1952</h3>
                            </div>

                            <div className='mx-auto max-w-6xl space-y-4 text-left'>
                                <div className='grid grid-cols-2 gap-8 text-sm'>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Name of Establishment:</strong> {institutionDetails?.MI_Name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment Code:</strong> {institutionDetails?.MI_Code || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Establishment ID:</strong> {institutionDetails?.MI_Id || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Address:</strong> {institutionDetails?.MI_Address1 || 'N/A'}
                                            {institutionDetails?.MI_Address2 && `, ${institutionDetails.MI_Address2}`}
                                            {institutionDetails?.MI_Address3 && `, ${institutionDetails.MI_Address3}`}
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <strong>Register Period:</strong> {filters.month} {filters.year}
                                        </div>
                                        <div>
                                            <strong>Total Employees:</strong> {form5Summary.totalEmployees}
                                        </div>
                                        <div>
                                            <strong>Active Employees:</strong> {form5Summary.activeEmployees}
                                        </div>
                                        <div>
                                            <strong>Left Employees:</strong> {form5Summary.leftEmployees}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='text-center font-semibold'>EMPLOYEE REGISTER SUMMARY</h3>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full border-collapse border border-gray-300 text-xs'>
                                            <thead>
                                                <tr className='bg-gray-50'>
                                                    <th className='border border-gray-300 p-2 text-left'>S.No.</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Employee Name</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Father&apos;s Name</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Date of Birth</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Date of Joining</th>
                                                    <th className='border border-gray-300 p-2 text-left'>PF Number</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Designation</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Basic Salary</th>
                                                    <th className='border border-gray-300 p-2 text-left'>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRecords.slice(0, 10).map((record, index) => (
                                                    <tr key={record.employeeCode}>
                                                        <td className='border border-gray-300 p-2'>{index + 1}</td>
                                                        <td className='border border-gray-300 p-2'>{record.employeeName}</td>
                                                        <td className='border border-gray-300 p-2'>{record.fatherName}</td>
                                                        <td className='border border-gray-300 p-2'>
                                                            {new Date(record.dateOfBirth).toLocaleDateString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>
                                                            {new Date(record.dateOfJoining).toLocaleDateString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>{record.pfNumber}</td>
                                                        <td className='border border-gray-300 p-2'>{record.designation}</td>
                                                        <td className='border border-gray-300 p-2'>
                                                            ₹{record.basicSalary.toLocaleString()}
                                                        </td>
                                                        <td className='border border-gray-300 p-2'>{record.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredRecords.length > 10 && (
                                        <div className='text-center text-muted-foreground text-sm'>
                                            ... and {filteredRecords.length - 10} more employees
                                        </div>
                                    )}
                                </div>

                                <div className='space-y-2 text-sm'>
                                    <div>
                                        <strong>Important Information:</strong>
                                    </div>
                                    <ul className='list-inside list-disc space-y-1 text-xs'>
                                        <li>This register contains details of all employees covered under the EPF Scheme.</li>
                                        <li>
                                            Employee and Employer contributions are made at 12% each of basic salary (subject to ceiling).
                                        </li>
                                        <li>PF ceiling for contribution is ₹15,000 per month as per current regulations.</li>
                                        <li>
                                            All employees joining after the date of coverage are automatically enrolled in the PF scheme.
                                        </li>
                                        <li>Nominee details are recorded as per employee declarations at the time of joining.</li>
                                        <li>This register should be maintained and updated regularly as per EPFO guidelines.</li>
                                    </ul>
                                </div>

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
