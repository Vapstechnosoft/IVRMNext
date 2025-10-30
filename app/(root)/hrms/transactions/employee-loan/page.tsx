'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EMPLOYEE_LOAN_VALIDATION } from '@/lib/validation/hrms-transaction-validation';
import { activateDeactivateEmployeeLoan, getEmployeeLoanList, saveEmployeeLoan } from '@/server/hrms/employee-loan';
import type { EmployeeDropdown, EmployeeLoanItem, EmployeeLoanSaveRequest, MasterLoanDropdown, ModeOfPaymentDropdown } from '@/types/hrms/employee-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Edit, MoreHorizontal, Plus, Power, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface EmployeeLoanForm {
    employeeId: number;
    loanTypeId: number;
    amount: number;
    installments: number;
    startDate: string;
    modeOfPayment?: string;
    referenceNo?: string;
    loanInterest?: number;
    loanEMI?: number;
}

export default function EmployeeLoanPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loans, setLoans] = useState<EmployeeLoanItem[]>([]);
    const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
    const [loanTypes, setLoanTypes] = useState<MasterLoanDropdown[]>([]);
    const [paymentModes, setPaymentModes] = useState<ModeOfPaymentDropdown[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        // setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeLoanForm>({
        mode: 'onChange',
        defaultValues: {
            employeeId: 0,
            loanTypeId: 0,
            amount: 0,
            installments: 0,
            startDate: '',
            modeOfPayment: '',
            referenceNo: '',
            loanInterest: 0,
            loanEMI: 0
        }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const response = await getEmployeeLoanList(2);

            if (response.success && response.data) {
                let employeeList = response.data.employeedropdown || [];

                if (employeeList.length === 0 && response.data.emploanList?.length > 0) {
                    const uniqueEmployees = new Map();
                    response.data.emploanList.forEach((loan: any) => {
                        if (loan.MasterEmployee && loan.MasterEmployee.HRME_Id > 0) {
                            uniqueEmployees.set(loan.MasterEmployee.HRME_Id, loan.MasterEmployee);
                        }
                    });
                    employeeList = Array.from(uniqueEmployees.values());
                }

                // Employee details are already in employeedropdown array

                setEmployees(employeeList);
                setLoanTypes(response.data.masterloandropdown || []);
                setPaymentModes(response.data.modeOfPaymentdropdown || []);
                setLoans(response.data.emploanList || []);
            } else {
                toast.error(response.message || 'Failed to load data');
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error(error.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        reset({
            employeeId: 0,
            loanTypeId: 0,
            amount: 0,
            installments: 0,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            modeOfPayment: '',
            referenceNo: '',
            loanInterest: 0,
            loanEMI: 0
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingId(null);
        reset();
    };

    const onSubmit: SubmitHandler<EmployeeLoanForm> = async (data: EmployeeLoanForm) => {
        try {
            const loanData: EmployeeLoanSaveRequest = {
                HREL_Id: editingId || 0,
                MI_Id: 30,
                HRME_Id: data.employeeId,
                roleId: 2,
                HRMLN_Id: data.loanTypeId,
                HREL_AppliedDate: data.startDate,
                HREL_LoanAmount: data.amount,
                HREL_LoanInsallments: data.installments,
                HREL_LoanStatus: 'Applied',
                HREL_SanctionedAmount: 0,
                HREL_TotalPrincipalPaid: 0,
                HREL_TotalInterestPaid: 0,
                HREL_TotalPending: 0,
                HREL_LoanInterest: data.loanInterest || 0,
                HREL_LaonEMI: data.loanEMI || 0,
                HREL_ModeOfPayment: data.modeOfPayment || '',
                HREL_ReferenceNo: data.referenceNo || '',
                HREL_ActiveFlag: true,
                HREL_NoofInstallment: data.installments
            };

            const response = await saveEmployeeLoan(loanData);

            if (response.success) {
                toast.success(editingId ? 'Employee loan updated successfully' : 'Employee loan created successfully');
                loadData();
                handleFormClose();
            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (item: EmployeeLoanItem) => {
        setEditingId(item.HREL_Id);
        reset({
            employeeId: item.HRME_Id,
            loanTypeId: item.HRMLN_Id,
            amount: item.HREL_LoanAmount,
            installments: item.HREL_LoanInsallments,
            startDate: item.HREL_AppliedDate ? format(new Date(item.HREL_AppliedDate), 'yyyy-MM-dd') : '',
            modeOfPayment: item.HREL_ModeOfPayment || '',
            referenceNo: item.HREL_ReferenceNo || '',
            loanInterest: item.HREL_LoanInterest || 0,
            loanEMI: item.HREL_LaonEMI || 0
        });
        setIsFormOpen(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const response = await activateDeactivateEmployeeLoan({
                HREL_Id: id,
                HREL_ActiveFlag: !currentStatus,
                roleId: 2
            });

            if (response.success) {
                toast.success(`Employee loan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                setTimeout(() => {
                    loadData();
                }, 500);
            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((emp) => emp?.HRME_Id === employeeId);
        if (!employee) return 'Unknown Employee';

        const firstName = employee.HRME_EmployeeFirstName || '';
        const middleName = employee.HRME_EmployeeMiddleName || '';
        const lastName = employee.HRME_EmployeeLastName || '';

        return `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown Employee';
    };

    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp) => emp?.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || 'Unknown';
    };

    const getLoanTypeName = (loanTypeId: number) => {
        const loanType = loanTypes.find((type) => type?.HRMLN_Id === loanTypeId);
        return loanType?.HRML_LoanType || 'Unknown Loan Type';
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Loan' description='Manage employee loan applications and track loan status' />
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            onClick={handleAddClick}
                            size='lg'
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Employee Loan
                        </Button>
                    </div>
                </div>

                <CollapsibleSection
                    title='Employee Loan Records'
                    description='View, search, and manage all employee loans'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <EmployeeLoanTable
                        loans={loans}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onToggleActive={handleToggleActive}
                        getEmployeeName={getEmployeeName}
                        getEmployeeCode={getEmployeeCode}
                        getLoanTypeName={getLoanTypeName}
                    />
                </CollapsibleSection>

                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Employee Loan' : 'Add Employee Loan'}
                            description='Fill in the employee loan details'
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
                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <Controller
                                            name='employeeId'
                                            control={control}
                                            rules={EMPLOYEE_LOAN_VALIDATION.employeeId}
                                            render={({ field }) => (
                                                <div className='space-y-2'>
                                                    <Label>Employee *</Label>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}>
                                                        <SelectTrigger
                                                            className={cn(
                                                                'transition-colors focus:ring-2 focus:ring-primary/20',
                                                                errors.employeeId && 'border-destructive'
                                                            )}>
                                                            <SelectValue placeholder='Select or search Employee in the list' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employees.length > 0 ? (
                                                                employees
                                                                    .filter((emp) => emp?.HRME_Id != null)
                                                                    .map((employee) => (
                                                                        <SelectItem
                                                                            key={employee.HRME_Id}
                                                                            value={employee.HRME_Id.toString()}>
                                                                            {employee.HRME_EmployeeCode} - {employee.HRME_EmployeeFirstName}{' '}
                                                                            {employee.HRME_EmployeeMiddleName || ''}{' '}
                                                                            {employee.HRME_EmployeeLastName || ''}
                                                                        </SelectItem>
                                                                    ))
                                                            ) : (
                                                                <div className='p-2 text-muted-foreground text-sm'>
                                                                    No employees available
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.employeeId && (
                                                        <p className='text-destructive text-sm'>{errors.employeeId.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <div className='space-y-2'>
                                            <Label>Applied Date *</Label>
                                            <Controller
                                                name='startDate'
                                                control={control}
                                                rules={EMPLOYEE_LOAN_VALIDATION.appliedDate}
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
                                                                {field.value ? format(new Date(field.value), 'PPP') : 'Select Date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='w-auto p-0' align='start'>
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
                                            {errors.startDate && <p className='text-destructive text-sm'>{errors.startDate.message}</p>}
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <Controller
                                            name='loanTypeId'
                                            control={control}
                                            rules={EMPLOYEE_LOAN_VALIDATION.loanTypeId}
                                            render={({ field }) => (
                                                <div className='space-y-2'>
                                                    <Label>Loan Type *</Label>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loanTypes
                                                                .filter((type) => type?.HRMLN_Id != null)
                                                                .map((loanType) => (
                                                                    <SelectItem
                                                                        key={loanType.HRMLN_Id}
                                                                        value={loanType.HRMLN_Id.toString()}>
                                                                        {loanType.HRML_LoanType} (Max: ₹
                                                                        {loanType.HRML_Max?.toLocaleString() || 0})
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.loanTypeId && (
                                                        <p className='text-destructive text-sm'>{errors.loanTypeId.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name='modeOfPayment'
                                            control={control}
                                            rules={EMPLOYEE_LOAN_VALIDATION.modeOfPayment}
                                            render={({ field }) => (
                                                <div className='space-y-2'>
                                                    <Label>Mode Of Payment *</Label>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentModes
                                                                .filter((mode) => mode?.IVRMMOD_Id != null && mode?.IVRMMOD_ModeOfPayment)
                                                                .map((mode) => (
                                                                    <SelectItem key={mode.IVRMMOD_Id} value={mode.IVRMMOD_ModeOfPayment}>
                                                                        {mode.IVRMMOD_ModeOfPayment}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <Controller
                                            name='referenceNo'
                                            control={control}
                                            rules={EMPLOYEE_LOAN_VALIDATION.referenceNo}
                                            render={({ field }) => (
                                                <div className='space-y-2'>
                                                    <Label>Reference No.</Label>
                                                    <InputText
                                                        label='Reference No.'
                                                        id='referenceNo'
                                                        placeholder='Enter reference number (max 20 characters, numbers only)'
                                                        {...field}
                                                        error={errors.referenceNo?.message}
                                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <InputText
                                            label='Loan Amount *'
                                            type='number'
                                            id='amount'
                                            step='0.01'
                                            placeholder='Enter loan amount (max 10 digits including decimals)'
                                            {...register('amount', EMPLOYEE_LOAN_VALIDATION.loanAmount)}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />

                                        <InputText
                                            label='Loan Interest *'
                                            type='number'
                                            id='loanInterest'
                                            step='0.01'
                                            placeholder='Enter loan interest (max 5 digits including decimals)'
                                            {...register('loanInterest', EMPLOYEE_LOAN_VALIDATION.loanInterest)}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <InputText
                                            label='Loan Installments (IN MONTHS) *'
                                            type='number'
                                            id='installments'
                                            placeholder='Enter loan installments (max 4 digits)'
                                            {...register('installments', EMPLOYEE_LOAN_VALIDATION.loanInstallments)}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />

                                        <InputText
                                            label='Loan EMI *'
                                            type='number'
                                            id='loanEMI'
                                            step='0.01'
                                            placeholder='Enter loan EMI (max 10 digits including decimals)'
                                            {...register('loanEMI', EMPLOYEE_LOAN_VALIDATION.loanEMI)}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>

                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                                        <Button type='button' variant='outline' onClick={handleFormClose}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
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

interface EmployeeLoanTableProps {
    loans: EmployeeLoanItem[];
    isLoading: boolean;
    onEdit: (loan: EmployeeLoanItem) => void;
    onToggleActive: (id: number, currentStatus: boolean) => void;
    getEmployeeName: (employeeId: number) => string;
    getEmployeeCode: (employeeId: number) => string;
    getLoanTypeName: (loanTypeId: number) => string;
}

function EmployeeLoanTable({
    loans,
    isLoading,
    onEdit,
    onToggleActive,
    getEmployeeName,
    getEmployeeCode,
    getLoanTypeName
}: EmployeeLoanTableProps) {
    const columns: ColumnDef<EmployeeLoanItem>[] = [
        {
            id: 'serialNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='S.No.' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            id: 'employee',
            accessorKey: 'HRME_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
            cell: ({ row }) => {
                const employeeId = row.getValue('employee') as number;
                return (
                    <div>
                        <div className='font-medium'>{getEmployeeName(employeeId)}</div>
                        <div className='text-muted-foreground text-sm'>{getEmployeeCode(employeeId)}</div>
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'loanType',
            accessorKey: 'HRMLN_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />,
            cell: ({ row }) => <div>{getLoanTypeName(row.getValue('loanType'))}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'amount',
            accessorKey: 'HREL_LoanAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('amount')).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'installments',
            accessorKey: 'HREL_LoanInsallments',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Installments' />,
            cell: ({ row }) => <div>{row.getValue('installments')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'emi',
            accessorKey: 'HREL_LaonEMI',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Loan EMI' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('emi') || 0).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'appliedDate',
            accessorKey: 'HREL_AppliedDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Date' />,
            cell: ({ row }) => {
                const date = row.getValue('appliedDate') as string;
                return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'status',
            accessorKey: 'HREL_LoanStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const loan = row.original;
                const isActive = loan.HREL_ActiveFlag === true;

                return (
                    <Badge variant={isActive ? 'success' : 'destructive'} className='text-xs'>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'totalPending',
            accessorKey: 'HREL_TotalPending',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Pending' />,
            cell: ({ row }) => <div>₹{Number(row.getValue('totalPending') || 0).toLocaleString()}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const loan = row.original;
                const isActive = loan.HREL_ActiveFlag === true;

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
                                <Button variant='ghost' onClick={() => onEdit(loan)} className='w-full justify-start'>
                                    <Edit className='mr-2 h-4 w-4' />
                                    Edit
                                </Button>
                                <Button
                                    variant='ghost'
                                    onClick={() => onToggleActive(loan.HREL_Id, isActive)}
                                    className={`w-full justify-start ${isActive ? 'text-orange-600' : 'text-green-600'}`}>
                                    <Power className='mr-2 h-4 w-4' />
                                    {isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableHiding: false
        }
    ];

    return (
        <div className='overflow-hidden rounded-lg bg-card'>
            <DataTable
                isLoading={isLoading}
                columns={columns}
                data={loans}
                totalItems={loans.length}
                showViewOptions={true}
                columnPinning={{ right: ['actions'] }}
            />
        </div>
    );
}
