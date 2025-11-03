'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useFilterEmployeesByYearMonth,
    useGenerateSalarySlip,
    useSalarySlipOnload
} from '@/hooks/hrms/useReports';
import type { EmployeeDropdown } from '@/types/hrms/reports/salary-slip-report';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Employee salary slip data structure for display
interface EmployeeSalarySlipDisplay {
    id: number;
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    HRME_Id: number;
    isSelected: boolean;
}

// Report filters and options
interface SalarySlipFilters {
    groupType: number[];
    department: number[];
    designation: number[];
    month: string;
    year: string;
    slipPerPage: string;
    options: {
        lopDays: boolean;
        leaveDetails: boolean;
        panCardNo: boolean;
        bankDetails: boolean;
    };
}

export default function SalarySlipReportPage() {
    const roleId = HRMS_MI_ID;
    const LogInUserId = 2;

    // React Query hooks
    const { data: onloadData, isLoading: isLoadingOnload } = useSalarySlipOnload(roleId, LogInUserId);
    const filterMutation = useFilterEmployeesByYearMonth();
    const generateMutation = useGenerateSalarySlip();

    // Extract dropdown data from onload response
    const groupTypes = onloadData?.data?.groupTypedropdownlist || [];
    const departments = onloadData?.data?.departmentdropdownlist || [];
    const designations = onloadData?.data?.designationdropdownlist || [];
    const months = onloadData?.data?.monthdropdown || [];
    const years = onloadData?.data?.leaveyeardropdown || [];

    // State
    const [employees, setEmployees] = useState<EmployeeSalarySlipDisplay[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeSalarySlipDisplay[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
                        const employeeList: EmployeeSalarySlipDisplay[] = (response.data.employeedropdown || []).map((emp: EmployeeDropdown, index: number) => ({
                            id: emp.HRME_Id || index + 1, // Use HRME_Id as unique identifier, fallback to index if missing
                            employeeCode: emp.HRME_EmployeeCode,
                            employeeName: `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim(),
                            groupTypeId: emp.HRMGT_Id,
                            departmentId: emp.HRMD_Id,
                            designationId: emp.HRMDES_Id,
                            HRME_Id: emp.HRME_Id,
                            isSelected: false
                        }));
                        setEmployees(employeeList);
                        setFilteredEmployees(employeeList);
                    }
                },
                onError: (error) => {
                    console.error('Error filtering employees:', error);
                    toast.error('Failed to load employees');
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

    const handleOptionChange = (option: keyof SalarySlipFilters['options'], checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                [option]: checked
            }
        }));
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
        const selectedEmployees = filteredEmployees.filter((emp) => emp.isSelected);
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        if (!filters.month || !filters.year) {
            toast.error('Please select month and year');
            return;
        }

        const request = {
            MI_Id: roleId,
            HRES_Year: filters.year,
            HRES_Month: filters.month,
            empid: selectedEmployees.map((emp) => emp.HRME_Id),
            hrmdeS_IdList: filters.designation.length > 0 ? filters.designation : [0],
            hrmD_IdList: filters.department.length > 0 ? filters.department : [0],
            groupTypeIdList: filters.groupType.length > 0 ? filters.groupType : [0]
        };

        generateMutation.mutate(request, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(`Salary slips generated successfully for ${selectedEmployees.length} employee(s)`);
                    // Here you would typically display the generated slips or open print dialog
                } else {
                    toast.error(response.message || 'Failed to generate salary slips');
                }
            },
            onError: (error) => {
                console.error('Error generating salary slips:', error);
                toast.error('Failed to generate salary slips');
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

        // Clear all selections
        const updatedEmployees = employees.map((emp) => ({ ...emp, isSelected: false }));
        setEmployees(updatedEmployees);

        toast.info('Filters and selections cleared');
    };

    const selectedCount = filteredEmployees.filter((emp) => emp.isSelected).length;
    const isLoading = isLoadingOnload || filterMutation.isPending || generateMutation.isPending;

    // Table columns
    const columns: ColumnDef<EmployeeSalarySlipDisplay>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        handleSelectAll(!!value);
                    }}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.isSelected}
                    onCheckedChange={(value) => handleSelectEmployee(row.original.id, !!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 24
        },
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='text-center'>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false,
            size: 80
        },
        {
            accessorKey: 'employeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={handleGenerateSlip}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <FileText className='h-4 w-4' />
                        Generate Slips
                    </Button>
                </div>

                {/* Generate Employee Salary Slip Section */}
                <CollapsibleSection
                    title='Salary Slip Configuration'
                    description='Configure filters and options for salary slip generation'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {/* Filter Section - Row 1 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Group Type Filter */}
                        <div className='space-y-2'>
                            <Label>Group Type</Label>
                            <MultiSelect
                                options={groupTypes.map((gt) => ({
                                    label: gt.HRMGT_EmployeeGroupType,
                                    value: gt.HRMGT_Id.toString()
                                }))}
                                defaultValue={filters.groupType.map((id) => id.toString())}
                                onValueChange={(values) => setFilters((prev) => ({ ...prev, groupType: values.map((v) => Number.parseInt(v)) }))}
                                placeholder='Select group types'
                            />
                        </div>

                        {/* Department Filter */}
                        <div className='space-y-2'>
                            <Label>Department</Label>
                            <MultiSelect
                                options={departments.map((dept) => ({
                                    label: dept.HRMD_DepartmentName,
                                    value: dept.HRMD_Id.toString()
                                }))}
                                defaultValue={filters.department.map((id) => id.toString())}
                                onValueChange={(values) => setFilters((prev) => ({ ...prev, department: values.map((v) => Number.parseInt(v)) }))}
                                placeholder='Select departments'
                            />
                        </div>

                        {/* Designation Filter */}
                        <div className='space-y-2'>
                            <Label>Designation</Label>
                            <MultiSelect
                                options={designations.map((desg) => ({
                                    label: desg.HRMDES_DesignationName,
                                    value: desg.HRMDES_Id.toString()
                                }))}
                                defaultValue={filters.designation.map((id) => id.toString())}
                                onValueChange={(values) => setFilters((prev) => ({ ...prev, designation: values.map((v) => Number.parseInt(v)) }))}
                                placeholder='Select designations'
                            />
                        </div>
                    </div>

                    {/* Filter Section - Row 2 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Month Filter */}
                        <div className='space-y-2'>
                            <label htmlFor='month-select' className='font-medium text-foreground text-sm'>
                                Month
                            </label>
                            <Select value={filters.month} onValueChange={(value) => setFilters((prev) => ({ ...prev, month: value }))}>
                                <SelectTrigger id='month-select'>
                                    <SelectValue placeholder='Select month' />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month: any, index: number) => (
                                        <SelectItem key={`month-${index}-${month.monthId || month.monthName || index}`} value={month.monthName || month.monthId?.toString() || ''}>
                                            {month.monthName || month.monthId}
                                        </SelectItem>
                                    ))}
                                    {months.length === 0 && (
                                        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                            <SelectItem key={`fallback-month-${index}`} value={month}>
                                                {month}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year Filter */}
                        <div className='space-y-2'>
                            <label htmlFor='year-select' className='font-medium text-foreground text-sm'>
                                Year
                            </label>
                            <Select value={filters.year} onValueChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}>
                                <SelectTrigger id='year-select'>
                                    <SelectValue placeholder='Select year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year: any, index: number) => (
                                        <SelectItem key={`year-${index}-${year.yearId || year.yearName || index}`} value={year.yearName || year.yearId?.toString() || ''}>
                                            {year.yearName || year.yearId}
                                        </SelectItem>
                                    ))}
                                    {years.length === 0 && (
                                        Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return (
                                                <SelectItem key={`fallback-year-${year}`} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Slip/page Filter */}
                        <div className='space-y-2'>
                            <Label>Slip/page</Label>
                            <Select value={filters.slipPerPage} onValueChange={(value) => setFilters((prev) => ({ ...prev, slipPerPage: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key='slip-per-page-1' value='1'>1 slip per page</SelectItem>
                                    <SelectItem key='slip-per-page-2' value='2'>2 slips per page</SelectItem>
                                    <SelectItem key='slip-per-page-3' value='3'>3 slips per page</SelectItem>
                                    <SelectItem key='slip-per-page-4' value='4'>4 slips per page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                        <div className='flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='lop-days-checkbox'
                                checked={filters.options.lopDays}
                                onCheckedChange={(checked) => handleOptionChange('lopDays', !!checked)}
                            />
                            <Label htmlFor='lop-days-checkbox'>LOP Days</Label>
                        </div>
                        <div className='flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='leave-details-checkbox'
                                checked={filters.options.leaveDetails}
                                onCheckedChange={(checked) => handleOptionChange('leaveDetails', !!checked)}
                            />
                            <Label htmlFor='leave-details-checkbox'>Leave Details</Label>
                        </div>
                        <div className='flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='pan-card-checkbox'
                                checked={filters.options.panCardNo}
                                onCheckedChange={(checked) => handleOptionChange('panCardNo', !!checked)}
                            />
                            <Label htmlFor='pan-card-checkbox'>Pan Card No.</Label>
                        </div>
                        <div className='flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='bank-details-checkbox'
                                checked={filters.options.bankDetails}
                                onCheckedChange={(checked) => handleOptionChange('bankDetails', !!checked)}
                            />
                            <Label htmlFor='bank-details-checkbox'>Bank Details</Label>
                        </div>
                    </div>

                    {/* Employee Table with Search */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='font-medium text-foreground text-sm'>Employee List ({filteredEmployees.length} employees)</div>
                            <div className='flex items-center gap-4'>
                                <Input
                                    placeholder='search here...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='w-64'
                                />
                                {selectedCount > 0 && <span className='text-muted-foreground text-sm'>{selectedCount} selected</span>}
                            </div>
                        </div>

                        {/* Data Table */}
                        <DataTable
                            isLoading={isLoading}
                            columns={columns}
                            data={filteredEmployees}
                            totalItems={filteredEmployees.length}
                            showViewOptions={true}
                            columnPinning={{ left: ['select', 'id'] }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                        <Button variant='outline' onClick={handleCancel}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button onClick={handleGenerateSlip} disabled={selectedCount === 0}>
                            GENERATE SLIP
                        </Button>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
