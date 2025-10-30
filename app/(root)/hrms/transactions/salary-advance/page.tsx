'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getSalaryAdvanceList, saveSalaryAdvance, toggleSalaryAdvanceStatus } from '@/server/hrms/salary-advance';
import type {
    EmployeeDropdown,
    LeaveYearDropdown,
    ModeOfPaymentDropdown,
    MonthDropdown,
    SalaryAdvanceItem
} from '@/types/hrms/salary-advance';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Edit, MoreHorizontal, Plus, Power, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SalaryAdvance extends SalaryAdvanceItem {
    selected?: boolean;
}

interface SalaryAdvanceForm {
    employeeId: string;
    entryDate: string;
    advanceYear: string;
    advanceMonth: string;
    appliedAmount: number;
    remarks: string;
    modeOfPayment: string;
    referenceNo: number;
}

export default function SalaryAdvancePage() {
    const [_salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
    const [filteredAdvances, setFilteredAdvances] = useState<SalaryAdvance[]>([]);
    const [selectedAdvances, setSelectedAdvances] = useState<number[]>([]);
    const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
    const [leaveYears, setLeaveYears] = useState<LeaveYearDropdown[]>([]);
    const [months, setMonths] = useState<MonthDropdown[]>([]);
    const [modeOfPayments, setModeOfPayments] = useState<ModeOfPaymentDropdown[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const _formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting: formIsSubmitting }
    } = useForm<SalaryAdvanceForm>({
        mode: 'onChange',
        defaultValues: {
            employeeId: '',
            entryDate: '',
            advanceYear: '',
            advanceMonth: '',
            appliedAmount: 0,
            remarks: '',
            modeOfPayment: '',
            referenceNo: 0
        }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const response = await getSalaryAdvanceList(2);

            if (response.success && response.data) {
                setEmployees(response.data.employeedropdown || []);
                setLeaveYears(response.data.leaveyeardropdown || []);
                setMonths(response.data.monthdropdown || []);
                setModeOfPayments(response.data.modeOfPaymentdropdown || []);

                const mappedAdvances: SalaryAdvance[] = (response.data.empadvaList || []).map((advance: any) => ({
                    ...advance,
                    selected: false
                }));

                setSalaryAdvances(mappedAdvances);
                setFilteredAdvances(mappedAdvances);
            } else {
                toast.error(response.message || 'Failed to load data');
            }
        } catch (error: any) {
            console.error('Error loading salary advance data:', error);
            toast.error(error.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit: SubmitHandler<SalaryAdvanceForm> = async (data: SalaryAdvanceForm) => {
        try {
            setIsSubmitting(true);

            const payload = {
                HRESA_Id: editingId || 0,
                MI_Id: 30,
                HRME_Id: Number(data.employeeId),
                HRESA_EntryDate: data.entryDate,
                HRESA_AdvYear: Number(data.advanceYear),
                HRESA_AdvMonth: data.advanceMonth,
                HRESA_AppliedAmount: data.appliedAmount,
                HRESA_Remarks: data.remarks,
                HRESA_ActiveFlag: true,
                HRESA_AdvStatus: 'Pending',
                HRESA_SanctinedAmount: 0,
                HRESA_ModeOfPayment: data.modeOfPayment,
                HRESA_ReferenceNo: data.referenceNo,
                roleId: 2
            };

            const response = await saveSalaryAdvance(payload);

            if (response.success) {
                toast.success(response.message || 'Salary advance saved successfully');
                reset();
                setEditingId(null);
                setShowForm(false);
                loadData();
            } else {
                toast.error(response.message || 'Save failed');
            }
        } catch (error: any) {
            console.error('Error saving salary advance:', error);
            toast.error(error.message || 'Save failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (advance: SalaryAdvance) => {
        setEditingId(advance.HRESA_Id);
        setShowForm(true);
        setValue('employeeId', advance.HRME_Id.toString());
        setValue('entryDate', advance.HRESA_EntryDate ? format(new Date(advance.HRESA_EntryDate), 'yyyy-MM-dd') : '');
        setValue('advanceYear', advance.HRESA_AdvYear.toString());
        setValue('advanceMonth', advance.HRESA_AdvMonth);
        setValue('appliedAmount', advance.HRESA_AppliedAmount);
        setValue('remarks', advance.HRESA_Remarks);
        setValue('modeOfPayment', advance.HRESA_ModeOfPayment);
        setValue('referenceNo', advance.HRESA_ReferenceNo);
    };

    const handleToggleActive = async (advanceId: number, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            const response = await toggleSalaryAdvanceStatus(advanceId);

            if (response.success) {
                toast.success(`Successfully ${newStatus ? 'activated' : 'deactivated'} the salary advance record`);
                loadData();
            } else {
                toast.error(response.message || 'Failed to toggle status');
            }
        } catch (error: any) {
            console.error('Toggle status error:', error);
            toast.error(error.message || 'Failed to toggle status');
        }
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedAdvances(filteredAdvances.map((advance) => advance.HRESA_Id));
        } else {
            setSelectedAdvances([]);
        }
    };

    const handleAdvanceSelect = (advanceId: number, selected: boolean) => {
        if (selected) {
            setSelectedAdvances((prev) => [...prev, advanceId]);
        } else {
            setSelectedAdvances((prev) => prev.filter((id) => id !== advanceId));
        }
    };

    const getEmployeeName = (employee: EmployeeDropdown) => {
        return `${employee.HRME_EmployeeFirstName} ${
            employee.HRME_EmployeeMiddleName || ''
        } ${employee.HRME_EmployeeLastName || ''}`.trim();
    };

    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp) => emp.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || `EMP${employeeId}`;
    };

    const getLeaveYearName = (yearId: number) => {
        const year = leaveYears.find((y) => y.HRMLY_Id === yearId);
        return year?.HRMLY_LeaveYear || `Year ${yearId}`;
    };

    const getMonthName = (monthId: number) => {
        const month = months.find((m) => m.IVRM_Month_Id === monthId);
        return month?.IVRM_Month_Name || `Month ${monthId}`;
    };

    const SalaryAdvanceTable = ({
        advances,
        isLoading,
        onSelectAll,
        onAdvanceSelect,
        onEdit,
        onToggleActive,
        getEmployeeCode,
        getEmployeeName,
        getLeaveYearName,
        getMonthName
    }: {
        advances: SalaryAdvance[];
        isLoading: boolean;
        onSelectAll: (selected: boolean) => void;
        onAdvanceSelect: (advanceId: number, selected: boolean) => void;
        onEdit: (advance: SalaryAdvance) => void;
        onToggleActive: (advanceId: number, currentStatus: boolean) => void;
        getEmployeeCode: (employeeId: number) => string;
        getEmployeeName: (employee: EmployeeDropdown) => string;
        getLeaveYearName: (yearId: number) => string;
        getMonthName: (monthId: number) => string;
    }) => {
        const columns: ColumnDef<SalaryAdvance>[] = [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={advances.length > 0 && selectedAdvances.length === advances.length}
                        onCheckedChange={(value) => onSelectAll(!!value)}
                        aria-label='Select all'
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedAdvances.includes(row.original.HRESA_Id)}
                        onCheckedChange={(value) => onAdvanceSelect(row.original.HRESA_Id, !!value)}
                        aria-label='Select row'
                    />
                ),
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'HRESA_Id',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' />,
                cell: ({ row, table }) => {
                    const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                    return <div>{index + 1}</div>;
                },
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'HRME_Id',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
                cell: ({ row }) => <div>{getEmployeeCode(row.getValue('HRME_Id'))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'MasterEmployee',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
                cell: ({ row }) => {
                    const employee = row.getValue('MasterEmployee') as EmployeeDropdown;
                    return <div>{getEmployeeName(employee)}</div>;
                },
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvYear',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Year' />,
                cell: ({ row }) => <div>{getLeaveYearName(row.getValue('HRESA_AdvYear'))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvMonth',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Month' />,
                cell: ({ row }) => <div>{getMonthName(Number(row.getValue('HRESA_AdvMonth')))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AppliedAmount',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Amount' />,
                cell: ({ row }) => <div>₹{row.getValue('HRESA_AppliedAmount')?.toLocaleString()}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
                cell: ({ row }) => {
                    const status = row.getValue('HRESA_AdvStatus') as string;
                    return (
                        <span
                            className={cn(
                                'rounded-full px-2 py-1 font-medium text-xs',
                                status === 'Approved'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'Rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                            )}>
                            {status}
                        </span>
                    );
                },
                enableSorting: true,
                enableHiding: true
            },
            {
                id: 'actions',
                header: 'Actions',
                accessorFn: (row: any) => {
                    return row;
                },
                enableSorting: false,
                cell: ({ cell }: { cell: any }) => {
                    const advance = cell.getValue() as SalaryAdvance;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                    <MoreHorizontal className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <div className='flex-justify-between flex-wrap gap-2'>
                                    <Button variant='ghost' onClick={() => onEdit(advance)} className='w-full justify-start'>
                                        <Edit className='mr-2 h-4 w-4' />
                                        Edit
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        onClick={() => onToggleActive(advance.HRESA_Id, advance.HRESA_ActiveFlag)}
                                        className={`w-full justify-start ${
                                            advance.HRESA_ActiveFlag ? 'text-orange-600' : 'text-green-600'
                                        }`}>
                                        <Power className='mr-2 h-4 w-4' />
                                        {advance.HRESA_ActiveFlag ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                }
            }
        ];

        return (
            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable<SalaryAdvance, any> columns={columns} data={advances} totalItems={advances.length} isLoading={isLoading} />
            </div>
        );
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Salary Advance' description='Manage employee salary advance requests' />
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            onClick={() => {
                                setShowForm(true);
                                setEditingId(null);
                                reset();
                            }}
                            className='flex items-center gap-2'>
                            <Plus className='h-4 w-4' />
                            Add Salary Advance
                        </Button>
                    </div>
                </div>

                {showForm && (
                    <CollapsibleSection
                        title={editingId ? 'Edit Salary Advance' : 'Add New Salary Advance'}
                        description='Enter salary advance details'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label>Employee *</Label>
                                    <Controller
                                        name='employeeId'
                                        control={control}
                                        rules={{ required: 'Please select an employee' }}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Employee' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.HRME_Id} value={emp.HRME_Id.toString()}>
                                                            {emp.HRME_EmployeeCode} - {getEmployeeName(emp)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.employeeId && <p className='text-red-500 text-sm'>{errors.employeeId.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Entry Date *</Label>
                                    <Controller
                                        name='entryDate'
                                        control={control}
                                        rules={{ required: 'Please select entry date' }}
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
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.entryDate && <p className='text-red-500 text-sm'>{errors.entryDate.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Advance Year *</Label>
                                    <Controller
                                        name='advanceYear'
                                        control={control}
                                        rules={{ required: 'Please select advance year' }}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveYears.map((year) => (
                                                        <SelectItem key={year.HRMLY_Id} value={year.HRMLY_Id.toString()}>
                                                            {year.HRMLY_LeaveYear}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.advanceYear && <p className='text-red-500 text-sm'>{errors.advanceYear.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Advance Month *</Label>
                                    <Controller
                                        name='advanceMonth'
                                        control={control}
                                        rules={{ required: 'Please select advance month' }}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Id.toString()}>
                                                            {month.IVRM_Month_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.advanceMonth && <p className='text-red-500 text-sm'>{errors.advanceMonth.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Applied Amount *</Label>
                                    <InputText
                                        type='number'
                                        step='any'
                                        placeholder='Enter amount'
                                        {...register('appliedAmount', {
                                            required: 'Please enter applied amount',
                                            min: {
                                                value: 1,
                                                message: 'Amount must be greater than 0'
                                            }
                                        })}
                                    />
                                    {errors.appliedAmount && <p className='text-red-500 text-sm'>{errors.appliedAmount.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Mode of Payment *</Label>
                                    <Controller
                                        name='modeOfPayment'
                                        control={control}
                                        rules={{ required: 'Please select mode of payment' }}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Payment Mode' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modeOfPayments.map((mode) => (
                                                        <SelectItem key={mode.IVRMMOD_Id} value={mode.IVRMMOD_Id.toString()}>
                                                            {mode.IVRMMOD_ModeOfPayment}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.modeOfPayment && <p className='text-red-500 text-sm'>{errors.modeOfPayment.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Reference No</Label>
                                    <InputText
                                        type='number'
                                        placeholder='Enter reference number'
                                        {...register('referenceNo', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label>Remarks</Label>
                                <InputText placeholder='Enter remarks' {...register('remarks')} />
                            </div>

                            <div className='flex gap-4'>
                                <Button type='submit' disabled={isSubmitting || formIsSubmitting} className='flex items-center gap-2'>
                                    <Plus className='h-4 w-4' />
                                    {isSubmitting || formIsSubmitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                        reset();
                                        setEditingId(null);
                                        setShowForm(false);
                                    }}
                                    className='flex items-center gap-2'>
                                    <X className='h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CollapsibleSection>
                )}

                <CollapsibleSection
                    title='Salary Advance Records'
                    description={`Found ${filteredAdvances.length} salary advance records`}
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-4'>
                        {selectedAdvances.length > 0 && (
                            <div className='flex items-center gap-4 rounded-lg bg-blue-50 p-4'>
                                <span className='font-medium text-sm'>{selectedAdvances.length} record(s) selected</span>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        toast.info('Bulk actions not implemented yet');
                                    }}>
                                    Bulk Actions
                                </Button>
                            </div>
                        )}

                        <SalaryAdvanceTable
                            advances={filteredAdvances}
                            isLoading={isLoading}
                            onSelectAll={handleSelectAll}
                            onAdvanceSelect={handleAdvanceSelect}
                            onEdit={handleEdit}
                            onToggleActive={handleToggleActive}
                            getEmployeeCode={getEmployeeCode}
                            getEmployeeName={getEmployeeName}
                            getLeaveYearName={getLeaveYearName}
                            getMonthName={getMonthName}
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
