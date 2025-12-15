'use client';
import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEarningsDeductionsTypeDropdownForIncrement, useEmployeeDropdownForIncrement, useSaveSalaryIncrement } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import { hrmsTransactionSchemas } from '@/schemas/hrms/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save, X } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type FormFields = z.infer<typeof hrmsTransactionSchemas.salaryIncrement.addOrUpdate>;
interface AddFormProps {
    response: any;
    onSuccess: () => void;
    className?: string;
}
export default function AddSalaryIncrementForm({ response, onSuccess, className = '' }: AddFormProps) {
    const { mutate: saveIncrement, isPending } = useSaveSalaryIncrement();
    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsTransactionSchemas.salaryIncrement.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            HRESI_Id: 0,
            HRME_Id: 0,
            HRMED_Id: 0,
            HRESI_IncrementType: 'Percentage',
            HRESI_IncrementAmount: 0,
            HRESI_IncrementPercentage: 0,
            HRESI_EffectiveDate: undefined as Date | undefined,
            HRESI_ActiveFlg: true,
            LogInUserId: 2
        }
    });
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = {
            HREIC_Id: data.HRESI_Id || 0,
            HRME_Id: data.HRME_Id,
            HREIC_IncrementDate: data.HRESI_EffectiveDate ? data.HRESI_EffectiveDate.toISOString() : new Date().toISOString(),
            HREIC_ArrearApplicableFlg: false,
            HREIC_ArrearGivenFlg: false,
            HREIC_ArrearMonths: 0,
            HRMED_Id: data.HRMED_Id || 0,
            HREICED_Amount: data.HRESI_IncrementAmount || 0,
            HREICED_Percentage: data.HRESI_IncrementPercentage?.toString() || '0',
            HREIC_ActiveFlag: data.HRESI_ActiveFlg,
            roleId: data.LogInUserId || 2,
            UserId: data.LogInUserId || 2
        };
        saveIncrement(payload as any, {
            onSuccess: (response) => {
                toast.success(response?.retrunMsg || 'Salary increment added successfully');
                reset();
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(error.message || 'An error occurred');
            }
        });
    };
    const handleReset = () => {
        reset();
    };
    
    // Fetch employee dropdown from API
    const { data: employeeData, isLoading: isLoadingEmployees } = useEmployeeDropdownForIncrement();
    
    // Fetch earnings deductions type dropdown from API (Head dropdown)
    const { data: earningsDeductionsTypeData, isLoading: isLoadingEarningsDeductionsType } = useEarningsDeductionsTypeDropdownForIncrement();
    
    // Transform Employee dropdown from { key, value } format
    const employeeOptions = useMemo(() => {
        const rawData = Array.isArray(employeeData) ? employeeData : (employeeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    HRME_Id: item.key,
                    HRME_EmployeeFirstName: item.value.split(' ')[0] || '',
                    HRME_EmployeeMiddleName: item.value.split(' ').slice(1, -1).join(' ') || '',
                    HRME_EmployeeLastName: item.value.split(' ').slice(-1)[0] || ''
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [employeeData]);
    
    // Transform Earnings Deductions Type dropdown from { key, value } format
    const earningsDeductionsTypeOptions = useMemo(() => {
        const rawData = Array.isArray(earningsDeductionsTypeData) ? earningsDeductionsTypeData : (earningsDeductionsTypeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility
                    HRMED_Id: item.key,
                    HRMED_Name: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [earningsDeductionsTypeData]);
    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Employee - Multi-select with search */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label>
                                Employee <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRME_Id'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <MultiSelect
                                        options={employeeOptions.map((emp: any) => ({
                                            label: emp.value || `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim() || '',
                                            value: emp.value || `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim() || ''
                                        }))}
                                        onValueChange={(vals) => {
                                            if (vals.length > 0) {
                                                // Find the employee by the selected value (name) and get its ID (key)
                                                const selectedEmployee = employeeOptions.find((emp: any) => 
                                                    emp.value === vals[0]
                                                );
                                                field.onChange(selectedEmployee?.key || selectedEmployee?.HRME_Id || 0);
                                            } else {
                                                field.onChange(0);
                                            }
                                        }}
                                        defaultValue={
                                            field.value && field.value > 0
                                                ? (() => {
                                                      const selectedEmployee = employeeOptions.find(
                                                          (emp: any) => emp.key === field.value || emp.HRME_Id === field.value
                                                      );
                                                      return selectedEmployee ? [selectedEmployee.value] : [];
                                                  })()
                                                : []
                                        }
                                        placeholder={isLoadingEmployees ? 'Loading employees...' : 'Select employee'}
                                        className='w-full'
                                        maxHeight={240}
                                        disabled={isLoadingEmployees}
                                    />
                                )}
                            />
                            {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                        </div>
                        {/* Head */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMED_Id'>
                                Head <span className='text-destructive'>:*</span>
                            </Label>
                            <Controller
                                name='HRMED_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            // Find the head by the selected value (name) and get its ID (key)
                                            const selectedHead = earningsDeductionsTypeOptions.find((head: any) => 
                                                head.value === value || String(head.key) === value || String(head.HRMED_Id) === value
                                            );
                                            field.onChange(selectedHead?.key || selectedHead?.HRMED_Id || Number(value));
                                        }}
                                        value={
                                            field.value && field.value > 0
                                                ? (() => {
                                                      const selectedHead = earningsDeductionsTypeOptions.find(
                                                          (head: any) => head.key === field.value || head.HRMED_Id === field.value
                                                      );
                                                      return selectedHead ? selectedHead.value : '';
                                                  })()
                                                : ''
                                        }>
                                        <SelectTrigger id='HRMED_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder={isLoadingEarningsDeductionsType ? 'Loading heads...' : 'Select Head'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(earningsDeductionsTypeOptions) && earningsDeductionsTypeOptions.length > 0
                                                ? earningsDeductionsTypeOptions.map((head: any) => (
                                                      <SelectItem
                                                          key={head.key || head.HRMED_Id}
                                                          value={head.value || head.HRMED_Name || ''}>
                                                          {head.value || head.HRMED_Name || ''}
                                                      </SelectItem>
                                                  ))
                                                : null}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMED_Id && <FormError>{errors.HRMED_Id.message}</FormError>}
                        </div>
                        {/* Increment Date */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRESI_EffectiveDate'>
                                Increment Date <span className='text-destructive'>:*</span>
                            </Label>
                            <Controller
                                name='HRESI_EffectiveDate'
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal transition-colors focus:ring-2 focus:ring-primary/20',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? (
                                                    format(field.value instanceof Date ? field.value : new Date(field.value), 'dd-MM-yyyy')
                                                ) : (
                                                    <span>Select date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={
                                                    field.value
                                                        ? field.value instanceof Date
                                                            ? field.value
                                                            : new Date(field.value)
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    field.onChange(date || undefined);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.HRESI_EffectiveDate && <FormError>{errors.HRESI_EffectiveDate.message}</FormError>}
                        </div>
                        {/* Increment Type */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label>Increment Type</Label>
                            <Controller
                                name='HRESI_IncrementType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value || 'Percentage'}
                                        onValueChange={(value) => field.onChange(value as 'Percentage' | 'Amount' | undefined)}
                                        className='flex items-center gap-6'>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value='Percentage' id='inc-per' />
                                            <Label htmlFor='inc-per' className='cursor-pointer font-normal'>
                                                Percentage
                                            </Label>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value='Amount' id='inc-amt' />
                                            <Label htmlFor='inc-amt' className='cursor-pointer font-normal'>
                                                Amount
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.HRESI_IncrementType && <FormError>{errors.HRESI_IncrementType.message}</FormError>}
                        </div>
                        {/* Percentage/Amount - Show based on selected type */}
                        {watch('HRESI_IncrementType') === 'Percentage' && (
                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='HRESI_IncrementPercentage'>
                                    Percentage <span className='text-destructive'>:*</span>
                                </Label>
                                <InputText
                                    type='number'
                                    step='0.01'
                                    id='HRESI_IncrementPercentage'
                                    placeholder='Enter percentage'
                                    {...register('HRESI_IncrementPercentage', { valueAsNumber: true })}
                                    error={errors.HRESI_IncrementPercentage?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        )}
                        {watch('HRESI_IncrementType') === 'Amount' && (
                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='HRESI_IncrementAmount'>
                                    Amount <span className='text-destructive'>:*</span>
                                </Label>
                                <Controller
                                    name='HRESI_IncrementAmount'
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            id='HRESI_IncrementAmount'
                                            value={field.value || 0}
                                            onChange={field.onChange}
                                            error={errors.HRESI_IncrementAmount?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>
                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='w-fit transition-all duration-200 hover:scale-105'
                        isLoading={isSubmitting || isPending}
                        loadingText='Saving...'>
                        <Save className='mr-2 h-4 w-4' />
                        SAVE
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        <X className='mr-2 h-4 w-4' />
                        CANCEL
                    </Button>
                </div>
            </form>
        </div>
    );
}
