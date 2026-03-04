'use client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface LeaveCreditTransactionFormProps {
    editingRow: LeaveCreditTransaction | null;
    onSubmit: (data: LeaveCreditTransaction) => void;
    onCancel: () => void;
    types: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    employees: Array<{ id: number; employeeCode: string; employeeName: string }>;
    leaveTypes: Array<{ value: string; label: string; code?: string }>;
    years: Array<{ id: number; year: string; fromDate: string; toDate: string; isActive: boolean }>;
    activeYearId: number;
    isLoadingTypes: boolean;
    isLoadingDepartments: boolean;
    isLoadingDesignations: boolean;
    isLoadingEmployees: boolean;
    onFilterChange: (type: 'types' | 'departments' | 'designations', values: number[]) => void;
}

type FormData = LeaveCreditTransaction & {
    selectedTypeIds: string[];
    selectedDeptIds: string[];
    selectedDesignationIds: string[];
};

export function LeaveCreditTransactionForm({
    editingRow,
    onSubmit,
    onCancel,
    types,
    departments,
    designations,
    employees,
    leaveTypes,
    years,
    activeYearId,
    isLoadingTypes,
    isLoadingDepartments,
    isLoadingDesignations,
    isLoadingEmployees,
    onFilterChange
}: LeaveCreditTransactionFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues:
            (editingRow ? {
                ...editingRow,
                selectedTypeIds: [],
                selectedDeptIds: [],
                selectedDesignationIds: []
            } : {
                employeeId: 0,
                leaveName: '',
                hrmL_LeaveType: '',
                hrmlY_Id: activeYearId,
                fromDate: new Date(),
                toDate: new Date(),
                totalDays: 1,
                id: 0,
                transactionId: 0,
                isActive: true, // Default to true for new records
                employeeName: '',
                createdAt: new Date(),
                selectedTypeIds: [],
                selectedDeptIds: [],
                selectedDesignationIds: []
            }) as FormData
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');

    // Calculate total days from date range
    useEffect(() => {
        if (fromDate && toDate) {
            try {
                const start = new Date(fromDate);
                const end = new Date(toDate);
                if (end >= start) {
                    const days = differenceInDays(end, start) + 1;
                    setValue('totalDays', days, { shouldValidate: true });
                }
            } catch (_error) { }
        }
    }, [fromDate, toDate, setValue]);

    // Automatically set Leave Year based on Date Range
    useEffect(() => {
        if (fromDate && years && years.length > 0) {
            try {
                const date = new Date(fromDate);
                // Find year where fromDate falls within [year.fromDate, year.toDate]
                const matchingYear = years.find(y => {
                    if (!y.fromDate || !y.toDate) return false;
                    const start = new Date(y.fromDate);
                    const end = new Date(y.toDate);
                    // Reset times for accurate comparison
                    date.setHours(0, 0, 0, 0);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    return date >= start && date <= end;
                });

                if (matchingYear) {
                    setValue('hrmlY_Id', matchingYear.id);
                } else {
                    // Fallback to active year or keep existing if editing?
                    // If no matching year found, we might want to warn or just let it be.
                    // For now, let's not force-reset to activeYearId if invalid, 
                    // but maybe we should if it's a new record.
                    if (!editingRow) {
                        setValue('hrmlY_Id', activeYearId);
                    }
                }
            } catch (e) {
                console.error("Error matching leave year", e);
            }
        }
    }, [fromDate, years, setValue, activeYearId, editingRow]);

    const onSubmitForm: SubmitHandler<FormData> = (data) => {
        // Ensure hrmL_LeaveType is set from leaveName if not already
        const selectedLeave = leaveTypes.find(l => l.value === data.leaveName);

        // Strip out the auxiliary filter fields
        const { selectedTypeIds, selectedDeptIds, selectedDesignationIds, ...transactionData } = data;

        const submitData = {
            ...transactionData,
            hrmL_LeaveType: selectedLeave?.code || selectedLeave?.label || data.leaveName || data.hrmL_LeaveType || '',
            hrmlY_Id: data.hrmlY_Id || activeYearId || 0,
            transactionId: editingRow?.transactionId || 0
        };
        onSubmit(submitData as unknown as LeaveCreditTransaction);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
            {/* Filters Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Filter by Type:</Label>
                    {isLoadingTypes ? (
                        <div className="h-10 w-full animate-pulse rounded-md border bg-muted" />
                    ) : (
                        <Controller
                            control={control}
                            name="selectedTypeIds"
                            render={({ field }) => (
                                <MultiSelect
                                    options={types.map(t => ({ label: t.name, value: String(t.id) }))}
                                    onValueChange={(vals) => {
                                        field.onChange(vals);
                                        onFilterChange('types', vals.map(Number));
                                        setValue('employeeId', 0); // Reset employee selection
                                    }}
                                    defaultValue={field.value}
                                    placeholder='Select Types'
                                    className='w-full'
                                    maxHeight={200}
                                />
                            )}
                        />
                    )}
                </div>
                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Filter by Department:</Label>
                    {isLoadingDepartments ? (
                        <div className="h-10 w-full animate-pulse rounded-md border bg-muted" />
                    ) : (
                        <Controller
                            control={control}
                            name="selectedDeptIds"
                            render={({ field }) => (
                                <MultiSelect
                                    options={departments.map(d => ({ label: d.name, value: String(d.id) }))}
                                    onValueChange={(vals) => {
                                        field.onChange(vals);
                                        onFilterChange('departments', vals.map(Number));
                                        setValue('employeeId', 0); // Reset employee selection
                                    }}
                                    defaultValue={field.value}
                                    placeholder='Select Departments'
                                    className='w-full'
                                    maxHeight={200}
                                />
                            )}
                        />
                    )}
                </div>
                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Filter by Designation:</Label>
                    {isLoadingDesignations ? (
                        <div className="h-10 w-full animate-pulse rounded-md border bg-muted" />
                    ) : (
                        <Controller
                            control={control}
                            name="selectedDesignationIds"
                            render={({ field }) => (
                                <MultiSelect
                                    options={designations.map(d => ({ label: d.name, value: String(d.id) }))}
                                    onValueChange={(vals) => {
                                        field.onChange(vals);
                                        onFilterChange('designations', vals.map(Number));
                                        setValue('employeeId', 0); // Reset employee selection
                                    }}
                                    defaultValue={field.value}
                                    placeholder='Select Designations'
                                    className='w-full'
                                    maxHeight={200}
                                />
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Leave Details Section */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label className='font-medium text-sm'>
                        Employee <span className='text-red-500'>*</span>
                    </Label>
                    {isLoadingEmployees ? (
                        <div className="h-10 w-full animate-pulse rounded-md border bg-muted" />
                    ) : (
                        <Controller
                            name='employeeId'
                            control={control}
                            rules={{ required: 'Employee is required', min: { value: 1, message: 'Employee is required' } }}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                                    <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Select employee' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.length > 0 ? (
                                            employees.map((option: any) => (
                                                <SelectItem key={option.id} value={String(option.id)}>
                                                    {option.employeeName} ({option.employeeCode})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-center text-muted-foreground text-sm'>No employees found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.employeeId && <FormError>{errors.employeeId.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        Leave Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveName'
                        control={control}
                        rules={{ required: 'Leave Name is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className={errors.leaveName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select Leave' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map((option: any) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        From Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fromDate'
                        control={control}
                        rules={{ required: 'From Date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                setDate={field.onChange}
                                placeholder='Select date'
                                className={cn('w-full', errors.fromDate && 'border-red-500')}
                            />
                        )}
                    />
                    {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        To Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='toDate'
                        control={control}
                        rules={{ required: 'To Date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                setDate={field.onChange}
                                placeholder='Select date'
                                className={cn('w-full', errors.toDate && 'border-red-500')}
                            />
                        )}
                    />
                    {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        Total Days <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                        {...control.register('totalDays', { valueAsNumber: true, required: 'Total Days is required', min: 0.5 })}
                        type='number'
                        step='0.5'
                        className={errors.totalDays ? 'border-red-500' : ''}
                    />
                    {errors.totalDays && <FormError>{errors.totalDays.message}</FormError>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button type='submit' variant='default' className='min-w-[120px]'>
                    <Save className='mr-2 h-4 w-4' />
                    SAVE
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
