'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCumulativeSalaryReportOnload } from '@/server/hrms/reports/cumulative-salary-report';
import type {
    DepartmentDropdown,
    DesignationDropdown,
    GroupTypeDropdown,
    LeaveYearDropdown,
    MonthDropdown
} from '@/types/hrms/reports/cumulative-salary-report';
import type { ColumnDef } from '@tanstack/react-table';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Minimal type for earning/deduction heads from onload API
type EarningDeductionDetail = { hrmeD_Name: string; [key: string]: any };

interface Employee {
    hrmE_Id: number;
    hrmE_EmployeeCode: string;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeMiddleName?: string;
    hrmE_EmployeeLastName?: string;
    hrmgT_Id: number;
    hrmD_Id: number;
    hrmdeS_Id: number;
    hrmD_DepartmentName?: string;
    hrmdeS_DesignationName?: string;
    hrmgT_EmployeeGroupType?: string;
    [key: string]: any;
}

interface SearchForm {
    groupType: string;
    department: string;
    designation: string;
    year?: string;
    month?: string;
    earningDeduction: string;
    amountType: string;
    heads: string;
}

export default function SalaryUpdationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [groupTypes, setGroupTypes] = useState<GroupTypeDropdown[]>([]);
    const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
    const [designations, setDesignations] = useState<DesignationDropdown[]>([]);
    const [availableHeads, setAvailableHeads] = useState<EarningDeductionDetail[]>([]);
    const [selectedHeads, setSelectedHeads] = useState<string[]>([]);
    const [monthOptions, setMonthOptions] = useState<MonthDropdown[]>([]);
    const [leaveYearOptions, setLeaveYearOptions] = useState<LeaveYearDropdown[]>([]);

    const { register, handleSubmit, reset, watch, control } = useForm<SearchForm>({
        mode: 'onChange',
        defaultValues: {
            groupType: 'All',
            department: 'All',
            designation: 'All',
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            earningDeduction: 'All Earning & Deduction',
            amountType: 'All',
            heads: 'All'
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedHeads = watch('heads');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees, hasSearched]);

    useEffect(() => {
        if (watchedHeads === 'All') {
            const allHeadNames = availableHeads.map((head) => head.hrmeD_Name);
            setSelectedHeads(allHeadNames);
        } else if (watchedHeads && watchedHeads !== 'All') {
            setSelectedHeads([watchedHeads]);
        }
    }, [watchedHeads, availableHeads]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const response = await getCumulativeSalaryReportOnload(30);

            if (response.success && response.data) {
                const data = response.data;

                setMonthOptions(data.monthdropdown || []);
                setLeaveYearOptions(data.leaveyeardropdown || []);
                setGroupTypes(data.groupTypedropdownlist || []);
                setDepartments(data.departmentdropdownlist || []);
                setDesignations(data.designationdropdownlist || []);
                setAvailableHeads((data as any).earningdeductiondetails || []);

                const salaryFields: Record<string, number> = {};
                ((data as any).earningdeductiondetails || []).forEach((head: EarningDeductionDetail) => {
                    salaryFields[head.hrmeD_Name] = 0;
                });

                if ((data as any).employeedropdown && (data as any).employeedropdown.length > 0) {
                    const apiEmployees: Employee[] = ((data as any).employeedropdown as any[]).map((emp: any) => ({
                        hrmE_Id: emp.hrmE_Id,
                        hrmE_EmployeeCode: emp.hrmE_EmployeeCode,
                        hrmE_EmployeeFirstName: emp.hrmE_EmployeeFirstName,
                        hrmE_EmployeeMiddleName: emp.hrmE_EmployeeMiddleName,
                        hrmE_EmployeeLastName: emp.hrmE_EmployeeLastName,
                        hrmgT_Id: emp.hrmgT_Id,
                        hrmD_Id: emp.hrmD_Id,
                        hrmdeS_Id: emp.hrmdeS_Id,
                        hrmD_DepartmentName: emp.hrmD_DepartmentName,
                        hrmdeS_DesignationName: emp.hrmdeS_DesignationName,
                        hrmgT_EmployeeGroupType: emp.hrmgT_EmployeeGroupType,
                        ...salaryFields,
                        ...Object.keys(emp).reduce((acc: Record<string, any>, key: string) => {
                            if (
                                ![
                                    'hrmE_Id',
                                    'hrmE_EmployeeCode',
                                    'hrmE_EmployeeFirstName',
                                    'hrmE_EmployeeMiddleName',
                                    'hrmE_EmployeeLastName',
                                    'hrmgT_Id',
                                    'hrmD_Id',
                                    'hrmdeS_Id',
                                    'hrmD_DepartmentName',
                                    'hrmdeS_DesignationName',
                                    'hrmgT_EmployeeGroupType'
                                ].includes(key)
                            ) {
                                acc[key] = emp[key] ?? 0;
                            }
                            return acc;
                        }, {})
                    }));
                    setEmployees(apiEmployees);
                }

                const headNames = ((data as any).earningdeductiondetails || []).map((head: EarningDeductionDetail) => head.hrmeD_Name);
                setSelectedHeads(headNames);
            } else {
                toast.error(response.message || 'Failed to load data');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (watchedGroupType && watchedGroupType !== 'All') {
            const groupType = groupTypes.find((g) => g.HRMGT_EmployeeGroupType === watchedGroupType);
            if (groupType) {
                filtered = filtered.filter((emp) => emp.hrmgT_Id === (groupType as any).HRMGT_Id);
            }
        }

        if (watchedDepartment && watchedDepartment !== 'All') {
            const department = departments.find((d) => d.HRMD_DepartmentName === watchedDepartment);
            if (department) {
                filtered = filtered.filter((emp) => emp.hrmD_Id === (department as any).HRMD_Id);
            }
        }

        if (watchedDesignation && watchedDesignation !== 'All') {
            const designation = designations.find((d) => d.HRMDES_DesignationName === watchedDesignation);
            if (designation) {
                filtered = filtered.filter((emp) => emp.hrmdeS_Id === (designation as any).HRMDES_Id);
            }
        }

        setFilteredEmployees(filtered);
    };

    const onSubmit: SubmitHandler<SearchForm> = async (_data: SearchForm) => {
        try {
            filterEmployees();
            setHasSearched(true);
            toast.success('Search completed successfully');
        } catch (error: any) {
            console.error('Error performing search:', error);
            toast.error(error.message || 'Search failed');
        }
    };

    const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
        if (selected) {
            setSelectedEmployees([...selectedEmployees, employeeId]);
        } else {
            setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
        }
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.hrmE_Id));
        } else {
            setSelectedEmployees([]);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Salary Updation' description='Search and update employee salary records' />
                    </div>
                </div>

                <CollapsibleSection
                    title='SALARY UPDATION'
                    description='Search and filter employee salary records'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-lg'
                    headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-6'>
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Group Type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Group Types</SelectItem>
                                                {groupTypes.map((groupType) => (
                                                    <SelectItem
                                                        key={(groupType as any).HRMGT_Id}
                                                        value={(groupType as any).HRMGT_EmployeeGroupType}>
                                                        {(groupType as any).HRMGT_EmployeeGroupType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Department</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Department' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Departments</SelectItem>
                                                {departments.map((department) => (
                                                    <SelectItem
                                                        key={(department as any).HRMD_Id}
                                                        value={(department as any).HRMD_DepartmentName}>
                                                        {(department as any).HRMD_DepartmentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Designation</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Designation' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Designations</SelectItem>
                                                {designations.map((designation) => (
                                                    <SelectItem
                                                        key={(designation as any).HRMDES_Id}
                                                        value={(designation as any).HRMDES_DesignationName}>
                                                        {(designation as any).HRMDES_DesignationName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Month</Label>
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month) => (
                                                    <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Id.toString()}>
                                                        {month.IVRM_Month_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Year</Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveYearOptions.map((year) => (
                                                    <SelectItem key={year.HRMLY_Id} value={year.HRMLY_Id.toString()}>
                                                        {year.HRMLY_LeaveYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Head</Label>
                                <Controller
                                    name='heads'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Head' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All Heads</SelectItem>
                                                {availableHeads.map((head) => (
                                                    <SelectItem key={head.hrmeD_Id} value={head.hrmeD_Name}>
                                                        {head.hrmeD_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Earning/Deduction</Label>
                                <div className='flex space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='all-earning'
                                            value='All Earning & Deduction'
                                            {...register('earningDeduction')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='all-earning'>All Earning & Deduction</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='earning'
                                            value='Earning'
                                            {...register('earningDeduction')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='earning'>Earning</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='deduction'
                                            value='Deduction'
                                            {...register('earningDeduction')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='deduction'>Deduction</Label>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Amount Type</Label>
                                <div className='flex space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='all-amount'
                                            value='All'
                                            {...register('amountType')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='all-amount'>All</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='amount'
                                            value='Amount'
                                            {...register('amountType')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='amount'>Amount</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <input
                                            type='radio'
                                            id='percentage'
                                            value='Percentage'
                                            {...register('amountType')}
                                            className='text-primary'
                                        />
                                        <Label htmlFor='percentage'>Percentage</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 pt-4'>
                            <Button type='submit' className='w-fit transition-all duration-200 hover:scale-105'>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                SEARCH
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={() => {
                                    reset();
                                    setHasSearched(false);
                                    setSelectedEmployees([]);
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {hasSearched && (
                    <CollapsibleSection
                        title='EMPLOYEE SALARY UPDATION'
                        description={`View and update employee salary records (${selectedEmployees.length} selected)`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <SalaryUpdationTable
                            employees={filteredEmployees}
                            isLoading={isLoading}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            selectedHeads={selectedHeads}
                        />
                    </CollapsibleSection>
                )}

                {!hasSearched && (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Please use the search form above to find employee salary records
                            </div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface SalaryUpdationTableProps {
    employees: Employee[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    selectedHeads: string[];
}

function SalaryUpdationTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    selectedHeads
}: SalaryUpdationTableProps) {
    const sanitizedEmployees = employees.map((emp) => {
        const sanitized = { ...emp };
        selectedHeads.forEach((headName) => {
            if (sanitized[headName] == null) {
                sanitized[headName] = 0;
            }
        });
        return sanitized;
    });

    const columns: ColumnDef<Employee>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={sanitizedEmployees.length > 0 && selectedEmployees.length === sanitizedEmployees.length}
                    onCheckedChange={(value: boolean) => onSelectAll(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }: { row: any }) => (
                <Checkbox
                    checked={selectedEmployees.includes(row.original.hrmE_Id)}
                    onCheckedChange={(value: boolean) => onEmployeeSelect(row.original.hrmE_Id, !!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'slNo',
            header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }: { row: any; table: any }) => {
                const index = table.getSortedRowModel().rows.findIndex((r: any) => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'hrmE_EmployeeCode',
            header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }: { row: any }) => <div>{row.getValue('hrmE_EmployeeCode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'hrmE_EmployeeName',
            header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }: { row: any }) => {
                const employee = row.original;
                const fullName = `${employee.hrmE_EmployeeFirstName} ${employee.hrmE_EmployeeLastName || ''}`.trim();
                return <div>{fullName}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        ...selectedHeads.map((headName) => ({
            id: headName,
            accessorFn: (row: Employee) => {
                const value = row[headName];
                return value == null ? 0 : Number(value);
            },
            header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={headName} />,
            cell: ({ row }: { row: any }) => {
                const currentValue = row.original[headName] ?? 0;
                return (
                    <div className='w-20'>
                        <input
                            type='number'
                            defaultValue={currentValue}
                            className='w-full rounded border px-2 py-1 text-sm'
                            onChange={(e) => {
                                const newValue = Number.parseFloat(e.target.value) || 0;
                                row.original[headName] = newValue;
                            }}
                        />
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        }))
    ];

    return (
        <div className='space-y-4'>
            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable
                    isLoading={isLoading}
                    columns={columns}
                    data={sanitizedEmployees}
                    totalItems={sanitizedEmployees.length}
                    showViewOptions={true}
                    columnPinning={{ left: ['select'] }}
                />
            </div>

            <div className='flex justify-end gap-2'>
                <Button className='w-fit transition-all duration-200 hover:scale-105'>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    UPDATE
                </Button>
                <Button variant='outline' className='w-fit transition-all duration-200 hover:scale-105'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
