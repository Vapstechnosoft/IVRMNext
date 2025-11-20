'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import type { LeaveCreditDetail } from './columns';

interface LeaveCreditDetailsFormProps {
    activeTab: string;
    onSubmit: (data: LeaveCreditDetail) => void;
    onCancel: () => void;
    defaultValues?: Partial<LeaveCreditDetail>;
}

// Mock data - replace with actual API calls
const typeOptions = [
    { label: 'Teaching', value: 'Teaching' },
    { label: 'Non Teaching', value: 'Non Teaching' },
    { label: 'Administrative', value: 'Administrative' },
    { label: 'test', value: 'test' },
    { label: 'assistant teacher', value: 'assistant teacher' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Owner of the company', value: 'Owner of the company' }
];

const departmentOptions = [
    { label: 'Teaching', value: 'Teaching' },
    { label: 'Non Teaching', value: 'Non Teaching' },
    { label: 'JUNIOR SCHOOL', value: 'JUNIOR SCHOOL' },
    { label: 'PRIMARY SCHOOL', value: 'PRIMARY SCHOOL' },
    { label: 'SENIOR SCHOOL', value: 'SENIOR SCHOOL' },
    { label: 'OFFICE STAFF', value: 'OFFICE STAFF' },
    { label: 'Service Staff', value: 'Service Staff' }
];

const designationOptions = [
    { label: 'Assistant Teacher', value: 'Assistant Teacher' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Vice Principal', value: 'Vice Principal' },
    { label: 'Office Assistant', value: 'Office Assistant' },
    { label: 'System Manager', value: 'System Manager' },
    { label: 'Teacher Helper', value: 'Teacher Helper' },
    { label: 'Electrician', value: 'Electrician' }
];

const gradeOptions = [
    { label: 'General', value: 'General' },
    { label: 'TEst A', value: 'TEst A' },
    { label: 'BTech', value: 'BTech' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Staff', value: 'Staff' },
    { label: 'CEO', value: 'CEO' }
];

const leaveNameOptions = [
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'General Leave', value: 'General Leave' },
    { label: 'Earned Leave (EL)/Privilege Leave (PL)', value: 'Earned Leave (EL)/Privilege Leave (PL)' },
    { label: 'Maternity leave', value: 'Maternity leave' },
    { label: 'Optional Leave', value: 'Optional Leave' },
    { label: 'Emergency Leave', value: 'Emergency Leave' }
];

const MONTHS_ARRAY = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// Shared form fields component
function LeaveCreditFormFields({
    control,
    errors,
    leaveCreditMonthWise,
    creditMonths,
    handleMonthToggle,
    handleAllMonthsToggle,
    allMonthsSelected
}: {
    control: any;
    errors: any;
    leaveCreditMonthWise: boolean;
    creditMonths: string[];
    handleMonthToggle: (month: string, checked: boolean) => void;
    handleAllMonthsToggle: (checked: boolean) => void;
    allMonthsSelected: boolean;
}) {
    return (
        <>
            {/* Filters Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Type:</Label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Types'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Department:</Label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={departmentOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Departments'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Designation:</Label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={designationOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Designations'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Grade Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Grade:</Label>
                    <Controller
                        name='grade'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={gradeOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Grades'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Leave Property Fields */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label htmlFor='leave-name-select' className='font-medium text-sm'>
                        Leave Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveName'
                        control={control}
                        rules={{ required: 'Leave Name is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveNameOptions.map((option) => (
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
                    <Label htmlFor='leave-code-input' className='font-medium text-sm'>
                        Leave code:
                    </Label>
                    <Controller
                        name='leaveCode'
                        control={control}
                        render={({ field }) => (
                            <InputText
                                id='leave-code-input'
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder='Enter leave code'
                            />
                        )}
                    />
                </div>

                <div>
                    <Label htmlFor='no-of-days-input' className='font-medium text-sm'>
                        No of Days <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='noOfDays'
                        control={control}
                        rules={{ required: 'No of Days is required', min: { value: 0, message: 'No of Days must be 0 or greater' } }}
                        render={({ field }) => (
                            <InputText
                                id='no-of-days-input'
                                type='number'
                                step='0.5'
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className={errors.noOfDays ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.noOfDays && <FormError>{errors.noOfDays.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='max-leave-applicable-input' className='font-medium text-sm'>
                        Max Leave Applicable <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='maxLeaveApplicable'
                        control={control}
                        rules={{ required: 'Max Leave Applicable is required', min: { value: 0, message: 'Max Leave Applicable must be 0 or greater' } }}
                        render={({ field }) => (
                            <InputText
                                id='max-leave-applicable-input'
                                type='number'
                                step='0.5'
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className={errors.maxLeaveApplicable ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.maxLeaveApplicable && <FormError>{errors.maxLeaveApplicable.message}</FormError>}
                </div>
            </div>

            {/* Checkboxes */}
            <div className='flex gap-6'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        name='leaveCarryForward'
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id='leave-carry-forward'
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor='leave-carry-forward' className='cursor-pointer font-normal text-sm'>
                        Leave Carry Forward
                    </Label>
                </div>

                <div className='flex items-center space-x-2'>
                    <Controller
                        name='leaveEncashment'
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id='leave-encashment'
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor='leave-encashment' className='cursor-pointer font-normal text-sm'>
                        Leave Encashment
                    </Label>
                </div>
            </div>

            {/* Credit Month Selection */}
            <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        name='leaveCreditMonthWise'
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id='credit-month'
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor='credit-month' className='cursor-pointer font-medium text-sm'>
                        Credit Month
                    </Label>
                </div>

                {leaveCreditMonthWise && (
                    <div className='space-y-2 border rounded-md p-3 max-h-[240px] overflow-y-auto'>
                        <div className='flex items-center space-x-2 pb-2 border-b'>
                            <Checkbox
                                id='all-months'
                                checked={allMonthsSelected}
                                onCheckedChange={handleAllMonthsToggle}
                            />
                            <Label htmlFor='all-months' className='cursor-pointer font-normal text-sm'>
                                All
                            </Label>
                        </div>
                        <div className='space-y-2'>
                            {MONTHS_ARRAY.map((month) => (
                                <div key={month} className='flex items-center space-x-2'>
                                    <Checkbox
                                        id={`month-${month}`}
                                        checked={creditMonths.includes(month)}
                                        onCheckedChange={(checked) => handleMonthToggle(month, checked as boolean)}
                                    />
                                    <Label htmlFor={`month-${month}`} className='cursor-pointer font-normal text-sm'>
                                        {month}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export function LeaveCreditDetailsForm({ activeTab: initialActiveTab, onSubmit, onCancel, defaultValues }: LeaveCreditDetailsFormProps) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<LeaveCreditDetail>({
        defaultValues: defaultValues || {
            type: [],
            department: [],
            designation: [],
            grade: [],
            leaveName: '',
            leaveCode: '',
            noOfDays: 0,
            maxLeaveApplicable: 0,
            leaveCarryForward: false,
            leaveEncashment: false,
            leaveCreditMonthWise: false,
            creditMonths: [],
            months: MONTHS_ARRAY.reduce(
                (acc, m) => {
                    acc[m] = 0;
                    return acc;
                },
                {} as Record<string, number>
            )
        }
    });

    const leaveCreditMonthWise: boolean = watch('leaveCreditMonthWise') ?? false;
    const creditMonths = watch('creditMonths') || [];

    const handleMonthToggle = (month: string, checked: boolean) => {
        const currentMonths = creditMonths;
        if (checked) {
            setValue('creditMonths', [...currentMonths, month]);
        } else {
            setValue('creditMonths', currentMonths.filter((m) => m !== month));
        }
    };

    const handleAllMonthsToggle = (checked: boolean) => {
        if (checked) {
            setValue('creditMonths', MONTHS_ARRAY);
        } else {
            setValue('creditMonths', []);
        }
    };

    const allMonthsSelected: boolean = creditMonths.length === MONTHS_ARRAY.length;

    const onSubmitForm: SubmitHandler<LeaveCreditDetail> = (data) => {
        onSubmit(data);
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='Leave Credit'>Leave Credit</TabsTrigger>
                <TabsTrigger value='Carry Forward'>Carry Forward</TabsTrigger>
                <TabsTrigger value='Encashment'>Encashment</TabsTrigger>
            </TabsList>

            <TabsContent value='Leave Credit' className='mt-4'>
                <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
                    <LeaveCreditFormFields
                        control={control}
                        errors={errors}
                        leaveCreditMonthWise={leaveCreditMonthWise}
                        creditMonths={creditMonths}
                        handleMonthToggle={handleMonthToggle}
                        handleAllMonthsToggle={handleAllMonthsToggle}
                        allMonthsSelected={allMonthsSelected}
                    />
                    {/* Action Buttons */}
                    <div className='flex justify-center gap-2 pt-4'>
                        <Button type='submit' variant='default' className='min-w-[120px]'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE
                        </Button>
                        <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                            <X className='mr-2 h-4 w-4' />
                            CLEAR
                        </Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value='Carry Forward' className='mt-4'>
                <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
                    <LeaveCreditFormFields
                        control={control}
                        errors={errors}
                        leaveCreditMonthWise={leaveCreditMonthWise}
                        creditMonths={creditMonths}
                        handleMonthToggle={handleMonthToggle}
                        handleAllMonthsToggle={handleAllMonthsToggle}
                        allMonthsSelected={allMonthsSelected}
                    />
                    {/* Action Buttons */}
                    <div className='flex justify-center gap-2 pt-4'>
                        <Button type='submit' variant='default' className='min-w-[120px]'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE
                        </Button>
                        <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                            <X className='mr-2 h-4 w-4' />
                            CLEAR
                        </Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value='Encashment' className='mt-4'>
                <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
                    <LeaveCreditFormFields
                        control={control}
                        errors={errors}
                        leaveCreditMonthWise={leaveCreditMonthWise}
                        creditMonths={creditMonths}
                        handleMonthToggle={handleMonthToggle}
                        handleAllMonthsToggle={handleAllMonthsToggle}
                        allMonthsSelected={allMonthsSelected}
                    />
                    {/* Action Buttons */}
                    <div className='flex justify-center gap-2 pt-4'>
                        <Button type='submit' variant='default' className='min-w-[120px]'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE
                        </Button>
                        <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                            <X className='mr-2 h-4 w-4' />
                            CLEAR
                        </Button>
                    </div>
                </form>
            </TabsContent>
        </Tabs>
    );
}
