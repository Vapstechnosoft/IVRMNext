'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { deleteSalaryIncrement, getSalaryIncrementOnload, saveSalaryIncrement } from '@/server/hrms/salary-increment';
import type { EarningDeductionType, SalaryIncrementDeleteRequest, SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Employee {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string | null;
    HRME_EmployeeLastName?: string | null;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
    HRMD_DepartmentName?: string;
    HRMDES_DesignationName?: string;
    HRMGT_EmployeeGroupType?: string;
    currentSalary: number;
    incrementAmount: number;
    newSalary: number;
    incrementPercentage: number;
    incrementStatus: 'Pending' | 'Processed' | 'Rejected';
    effectiveDate?: string;
    processedDate?: string;
    earningHead?: string;
    previousAmount?: number;
    flag?: 'Percentage' | 'Amount';
    HREIC_Id?: number;
}

interface IncrementForm {
    employeeId: string;
    incrementDate: string;
    earningHead: string;
    incrementType: 'Percentage' | 'Amount';
    incrementValue: number;
    remarks: string;
}

export default function SalaryIncrementProcessPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
    const [earningHeads, setEarningHeads] = useState<EarningDeductionType[]>([]);
    const [gridData, setGridData] = useState<SalaryIncrementGridItem[]>([]);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors, isSubmitting }
    } = useForm<IncrementForm>({
        mode: 'onChange',
        defaultValues: {
            employeeId: '',
            incrementDate: '',
            earningHead: '',
            incrementType: 'Percentage',
            incrementValue: 0,
            remarks: ''
        }
    });

    const watchedIncrementType = watch('incrementType');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [employees]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const payload = {
                MI_Id: 30,
                roleId: 0
            };

            const response = await getSalaryIncrementOnload(payload);

            if (response.success && response.data) {
                setEarningHeads(response.data.earningdeductiontype || []);
                setGridData(response.data.griddata || []);

                const employeeList = response.data.employeelist || [];
                const gridData = response.data.griddata || [];

                const incrementMap = new Map<string, SalaryIncrementGridItem>();
                gridData.forEach((record: SalaryIncrementGridItem) => {
                    if (record.EmployeeName) {
                        incrementMap.set(record.EmployeeName, record);
                    }
                });

                const mappedEmployees: Employee[] = employeeList.map((emp: any) => {
                    const fullName = `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${
                        emp.HRME_EmployeeLastName || ''
                    }`.trim();
                    const incrementRecord = incrementMap.get(fullName);

                    return {
                        HRME_Id: emp.HRME_Id,
                        HRME_EmployeeCode: emp.HRME_EmployeeCode,
                        HRME_EmployeeFirstName: emp.HRME_EmployeeFirstName,
                        HRME_EmployeeMiddleName: emp.HRME_EmployeeMiddleName,
                        HRME_EmployeeLastName: emp.HRME_EmployeeLastName,
                        HRMGT_Id: emp.HRMGT_Id,
                        HRMD_Id: emp.HRMD_Id,
                        HRMDES_Id: emp.HRMDES_Id,
                        HRMD_DepartmentName: incrementRecord?.HRMD_DepartmentName,
                        currentSalary: 0,
                        incrementAmount: incrementRecord?.Amount || 0,
                        newSalary: 0,
                        incrementPercentage: 0,
                        incrementStatus: incrementRecord ? 'Processed' : 'Pending',
                        effectiveDate: incrementRecord ? new Date().toISOString() : undefined,
                        earningHead: incrementRecord?.HRMED_Name,
                        previousAmount: 0,
                        flag: incrementRecord?.Flag as 'Percentage' | 'Amount' | undefined,
                        HREIC_Id: incrementRecord?.HREIC_Id || 0
                    };
                });

                setEmployees(mappedEmployees);
                setEmployeeOptions(mappedEmployees);
                setFilteredEmployees(mappedEmployees);
            } else {
                toast.error('Failed to load salary increment data');
            }
        } catch (error: any) {
            console.error('Error loading salary increment data:', error);
            toast.error(error.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const filterEmployees = () => {
        setFilteredEmployees(employees);
    };

    const handleIncrementClick = () => {
        setIsFormOpen(true);
        reset();
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedEmployees([]);
        reset();
    };

    const onSubmit: SubmitHandler<IncrementForm> = async (data: IncrementForm) => {
        try {
            if (data.employeeId === 'All') {
                toast.error('Please select a specific employee for increment');
                return;
            }

            const selectedEmployee = employees.find((emp) => emp.HRME_Id.toString() === data.employeeId);
            if (!selectedEmployee) {
                toast.error('Selected employee not found');
                return;
            }

            const earningHead = earningHeads.find((head) => head.HRMED_Name === data.earningHead);
            if (!earningHead) {
                toast.error('Selected earning head not found');
                return;
            }

            let incrementAmount = 0;
            let incrementPercentage = 0;

            if (data.incrementType === 'Percentage') {
                incrementAmount = (selectedEmployee.currentSalary * data.incrementValue) / 100;
                incrementPercentage = data.incrementValue;
            } else {
                incrementAmount = data.incrementValue;
                incrementPercentage = (data.incrementValue / selectedEmployee.currentSalary) * 100;
            }

            const payload: any = {
                MI_Id: 30,
                roleId: 0,
                HREIC_Id: selectedEmployee.HREIC_Id || 0,
                HRME_Id: selectedEmployee.HRME_Id,
                HREIC_LastIncrementDate: new Date().toISOString(),
                HREIC_IncrementDueDate: new Date().toISOString(),
                HREIC_IncrementDate: data.incrementDate,
                Fromdate: data.incrementDate,
                Todate: data.incrementDate,
                HREIC_ArrearApplicableFlg: false,
                HREIC_ArrearGivenFlg: false,
                HREIC_ArrearMonths: 0,
                UserId: 0,
                HREIC_ActiveFlag: true,
                HREICED_Id: false,
                HRMED_Id: earningHead.HRMED_Id,
                HREICED_Amount: data.incrementType === 'Amount' ? data.incrementValue : incrementAmount,
                HREICED_Percentage: data.incrementType === 'Percentage' ? data.incrementValue.toString() : incrementPercentage.toString(),
                HREICED_ActiveFlag: true,
                retrunMsg: 'string',
                Status: 'string',
                monthdropdown: [],
                griddata: gridData || [],
                Reportdata: [],
                employeelist: [],
                earningdeductiontype: earningHeads || [],
                getempsdetails: [],
                leaveyeardropdown: [],
                Type: 'string',
                Option: 'string',
                Month: 0,
                Year: 0,
                selected_hrmeID: selectedEmployee.HRME_Id,
                employee: []
            };

            const response = await saveSalaryIncrement(payload);

            if (response.success) {
                toast.success(
                    response.message ||
                        `Successfully processed increment for ${selectedEmployee.HRME_EmployeeFirstName} ${
                            selectedEmployee.HRME_EmployeeLastName || ''
                        }`
                );

                await loadData();
                handleFormClose();
            } else {
                toast.error(response.message || 'Failed to save salary increment');
            }
        } catch (error: any) {
            console.error('Error submitting salary increment:', error);
            toast.error(error.message || 'Increment process failed');
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
            const pendingEmployees = filteredEmployees.filter((emp) => emp.incrementStatus === 'Pending');
            setSelectedEmployees(pendingEmployees.map((emp) => emp.HRME_Id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleDelete = async (employee: Employee) => {
        try {
            if (!employee.HREIC_Id || employee.HREIC_Id === 0) {
                toast.error('No increment record found for this employee. Only employees with existing increment records can be deleted.');
                return;
            }

            if (!employee.effectiveDate || !employee.earningHead) {
                toast.error("This employee doesn't have a processed increment record to delete.");
                return;
            }

            const payload: SalaryIncrementDeleteRequest = {
                HREIC_Id: employee.HREIC_Id,
                MI_Id: 30,
                roleId: 2
            };

            const response = await deleteSalaryIncrement(payload);

            if (response.success) {
                toast.success(response.message || 'Salary increment record deleted successfully');
                await loadData();
            } else {
                toast.error(response.message || 'Failed to delete salary increment');
            }
        } catch (error: any) {
            console.error('Error deleting salary increment:', error);
            toast.error(error.message || 'Delete operation failed');
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Salary Increment Process' description='Process salary increments for employees' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleIncrementClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <TrendingUp className='h-4 w-4' />
                        Process Increment
                    </Button>
                </div>

                <CollapsibleSection
                    title='Employee Increment Records'
                    description={`View and process salary increments (${selectedEmployees.length} selected)`}
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <SalaryIncrementTable
                        employees={filteredEmployees}
                        isLoading={isLoading}
                        selectedEmployees={selectedEmployees}
                        onEmployeeSelect={handleEmployeeSelect}
                        onSelectAll={handleSelectAll}
                        onDelete={handleDelete}
                    />
                </CollapsibleSection>

                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title='Salary Increment Process'
                            description='Configure increment parameters for selected employees'
                            defaultOpen={true}
                            variant='outline'
                            size='lg'
                            className='shadow-lg'>
                            <div className='relative'>
                                <Button
                                    onClick={handleFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>

                                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                                    <div className='space-y-4'>
                                        <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                                            <h3 className='font-semibold'>EMPLOYEE SALARY INCREMENT DETAILS</h3>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <div className='space-y-2'>
                                                <Label>Employee *</Label>
                                                <Controller
                                                    name='employeeId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Employee' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='All'>All</SelectItem>
                                                                {employeeOptions.map((employee) => (
                                                                    <SelectItem key={employee.HRME_Id} value={employee.HRME_Id.toString()}>
                                                                        {`${employee.HRME_EmployeeFirstName} ${employee.HRME_EmployeeMiddleName || ''} ${
                                                                            employee.HRME_EmployeeLastName || ''
                                                                        }`.trim()}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Increment Date *</Label>
                                                <Controller
                                                    name='incrementDate'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal',
                                                                        !field.value && 'text-muted-foreground'
                                                                    )}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {field.value
                                                                        ? format(new Date(field.value), 'dd-MM-yyyy')
                                                                        : 'Select date'}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) =>
                                                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <div className='space-y-2'>
                                                <Label>Head *</Label>
                                                <Controller
                                                    name='earningHead'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Head' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {earningHeads.map((head) => (
                                                                    <SelectItem key={head.HRMED_Id} value={head.HRMED_Name}>
                                                                        {head.HRMED_Name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Increment Type</Label>
                                                <div className='flex space-x-4'>
                                                    <div className='flex items-center space-x-2'>
                                                        <input
                                                            type='radio'
                                                            id='percentage'
                                                            value='Percentage'
                                                            {...register('incrementType')}
                                                            className='text-primary'
                                                        />
                                                        <Label htmlFor='percentage'>Percentage</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <input
                                                            type='radio'
                                                            id='amount'
                                                            value='Amount'
                                                            {...register('incrementType')}
                                                            className='text-primary'
                                                        />
                                                        <Label htmlFor='amount'>Amount</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <InputText
                                                label={watchedIncrementType === 'Percentage' ? 'Percentage *' : 'Amount *'}
                                                type='number'
                                                step='0.01'
                                                id='incrementValue'
                                                {...register('incrementValue', {
                                                    required: 'Increment value is required',
                                                    min: {
                                                        value: 0.01,
                                                        message: 'Value must be greater than 0'
                                                    }
                                                })}
                                            />

                                            <InputText
                                                label='Remarks'
                                                id='remarks'
                                                {...register('remarks')}
                                                error={errors.remarks?.message}
                                            />
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleFormClose}
                                            className='w-fit transition-all duration-200 hover:scale-105'>
                                            CANCEL
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='w-fit transition-all duration-200 hover:scale-105'>
                                            {isSubmitting ? (
                                                <div className='flex items-center'>
                                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                    Processing...
                                                </div>
                                            ) : (
                                                'SAVE'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}

interface SalaryIncrementTableProps {
    employees: Employee[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onDelete: (employee: Employee) => void;
}

function SalaryIncrementTable({ employees, isLoading }: SalaryIncrementTableProps) {
    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: 'slNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const employee = row.original;
                const fullName =
                    `${employee.HRME_EmployeeFirstName} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim();
                return <div>{fullName}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div>{row.original.HRMD_DepartmentName || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'incrementDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Increment Date' />,
            cell: ({ row }) => <div>{row.original.effectiveDate ? format(new Date(row.original.effectiveDate), 'dd/MM/yyyy') : 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'earningHead',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Earning Head' />,
            cell: ({ row }) => <div>{row.original.earningHead || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'previousAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Previous Amount' />,
            cell: ({ row }) => <div>₹{Number(row.original.previousAmount || 0).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'incrementValue',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage/Amount' />,
            cell: ({ row }) => {
                const employee = row.original;
                if (employee.flag === 'Percentage') {
                    return <div>{employee.incrementPercentage || 0}%</div>;
                }
                return <div>₹{Number(employee.incrementAmount || 0).toLocaleString()}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'flag',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Flag' />,
            cell: ({ row }) => <div>{row.original.flag || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const employee = row.original;
                const hasIncrementRecord = employee.HREIC_Id && employee.HREIC_Id > 0;
                const hasValidData = employee.effectiveDate && employee.earningHead;

                return (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                            /* noop: hook up delete if needed */
                        }}
                        disabled={!hasIncrementRecord || !hasValidData}
                        className={`h-8 w-8 p-0 ${
                            hasIncrementRecord && hasValidData
                                ? 'text-destructive hover:text-destructive'
                                : 'cursor-not-allowed text-muted-foreground'
                        }`}
                        title={
                            hasIncrementRecord && hasValidData
                                ? 'Delete increment record'
                                : !hasIncrementRecord
                                  ? 'No increment record to delete'
                                  : 'Incomplete increment data - cannot delete'
                        }>
                        <X className='h-4 w-4' />
                    </Button>
                );
            },
            enableSorting: false,
            enableHiding: false
        }
    ];

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div className='text-muted-foreground text-sm'>Total Grid Records : {employees.length}</div>
                <div className='flex items-center gap-2'>
                    <input type='text' placeholder='search here...' className='w-48 rounded-md border px-3 py-1 text-sm' />
                    <RefreshCw className='h-4 w-4 text-muted-foreground' />
                </div>
            </div>

            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable isLoading={isLoading} columns={columns} data={employees} totalItems={employees.length} showViewOptions={true} />
            </div>
        </div>
    );
}
