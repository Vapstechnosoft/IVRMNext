'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Upload, X } from 'lucide-react';

// Safe SelectItem wrapper that prevents empty string values - ABSOLUTE PROTECTION
const SafeSelectItem = ({ value, children, ...props }: { value: any; children: React.ReactNode; [key: string]: any }) => {
    // ABSOLUTE CHECK: If value is null, undefined, or empty string, don't render
    if (value == null || value === undefined || value === '') {
        console.error('🔴 [SafeSelectItem - employee-tab] EMPTY VALUE DETECTED:', {
            value,
            valueType: typeof value,
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // Convert to string
    const strValue = String(value);

    // ABSOLUTE CHECK: If string is empty or only whitespace, don't render
    if (strValue === '' || strValue.trim() === '' || strValue.length === 0) {
        console.error('🔴 [SafeSelectItem - employee-tab] EMPTY STRING DETECTED:', {
            originalValue: value,
            strValue,
            strValueLength: strValue.length,
            trimmed: strValue.trim(),
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    const trimmedValue = strValue.trim();

    // FINAL ABSOLUTE CHECK: If trimmed is empty, don't render
    if (trimmedValue === '' || trimmedValue.length === 0) {
        console.error('🔴 [SafeSelectItem - employee-tab] EMPTY TRIMMED VALUE DETECTED:', {
            originalValue: value,
            strValue,
            trimmedValue,
            trimmedLength: trimmedValue.length,
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // FINAL FINAL CHECK: Double-check trimmedValue is not empty before rendering
    if (!trimmedValue || trimmedValue === '' || trimmedValue.length === 0) {
        console.error('🔴 [SafeSelectItem - employee-tab] FINAL CHECK FAILED - trimmedValue is empty:', {
            originalValue: value,
            strValue,
            trimmedValue,
            trimmedLength: trimmedValue?.length,
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // Only render if we have a valid non-empty string
    return (
        <SelectItem {...props} value={trimmedValue}>
            {children}
        </SelectItem>
    );
};

// Helper function to ensure SelectItem value is never empty string
const ensureNonEmptyValue = (value: any, fallback: any = null): string | null => {
    // Handle null/undefined
    if (value == null || value === undefined) {
        if (fallback != null && fallback !== undefined) {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Handle empty string explicitly
    if (value === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Convert to string
    const str = String(value);

    // Check if empty or whitespace
    if (str === '' || str.trim() === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Final check - ensure it's not empty
    const trimmed = str.trim();
    if (trimmed === '' || trimmed.length === 0) {
        return null;
    }

    return trimmed;
};
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

interface EmployeeTabProps {
    control: any;
    register: any;
    errors: any;
    selectedPhoto: string | null;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedPhoto: (photo: string | null) => void;
    setPhotoFile: (file: File | null) => void;
    options: any;
    isSubmitting: boolean;
    watch: any;
    onClear?: () => void;
}

export function EmployeeTab({
    control,
    register,
    errors,
    selectedPhoto,
    onPhotoUpload,
    setSelectedPhoto,
    setPhotoFile,
    options,
    isSubmitting,
    watch,
    onClear
}: any) {
    // State for controlling date picker popovers
    const [_dateOfJoiningOpen, _setDateOfJoiningOpen] = useState(false);
    const [_dateOfConfirmationOpen, _setDateOfConfirmationOpen] = useState(false);
    const [_pfDateOpen, _setPfDateOpen] = useState(false);
    const [_esiDateOpen, _setEsiDateOpen] = useState(false);
    const [_dateOfBirthOpen, _setDateOfBirthOpen] = useState(false);
    const [_dateOfRetirementOpen, _setDateOfRetirementOpen] = useState(false);
    return (
        <div className='space-y-6'>
            {/* Main Form Fields in Two Columns */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <InputText
                        label='First Name'
                        required
                        id='firstName'
                        {...register('firstName', {
                            required: 'First Name is required'
                        })}
                        error={errors.firstName?.message}
                    />

                    <InputText label='Middle Name' id='middleName' {...register('middleName')} error={errors.middleName?.message} />

                    <InputText label='Last Name' id='lastName' {...register('lastName')} error={errors.lastName?.message} />

                    <InputText
                        label='Employee Code'
                        required
                        id='employeeCode'
                        {...register('employeeCode', {
                            required: 'Employee code is required'
                        })}
                        error={errors.employeeCode?.message}
                    />

                    <InputText label="Father's Name" id='fatherName' {...register('fatherName')} error={errors.fatherName?.message} />

                    <InputText label="Mother's Name" id='motherName' {...register('motherName')} error={errors.motherName?.message} />

                    <Controller
                        name='typeOfEmployment'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Type of Employment <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.empTypes || [])
                                            .filter((it: any) => {
                                                // Aggressively filter out items with empty string IDs
                                                const id1 = it.HRMET_Id;
                                                const id2 = it.value;
                                                const id3 = it;
                                                // Check each ID - must be non-null, non-undefined, non-empty-string, and non-whitespace
                                                const valid1 = id1 != null && id1 !== undefined && id1 !== '' && String(id1).trim() !== '';
                                                const valid2 = id2 != null && id2 !== undefined && id2 !== '' && String(id2).trim() !== '';
                                                const valid3 = id3 != null && id3 !== undefined && id3 !== '' && String(id3).trim() !== '';
                                                return valid1 || valid2 || valid3;
                                            })
                                            .map((it: any) => {
                                                // Try each ID in order, use first valid one
                                                let val: string | null = null;
                                                if (it.HRMET_Id != null && it.HRMET_Id !== '' && String(it.HRMET_Id).trim() !== '') {
                                                    val = ensureNonEmptyValue(it.HRMET_Id);
                                                } else if (it.value != null && it.value !== '' && String(it.value).trim() !== '') {
                                                    val = ensureNonEmptyValue(it.value);
                                                } else if (it != null && it !== '' && String(it).trim() !== '') {
                                                    val = ensureNonEmptyValue(it);
                                                }

                                                // Final check - if still null or empty, skip this item
                                                if (!val || val === '' || val.trim() === '' || val.length === 0) return null;

                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {it.HRMET_EmployeeType || it.label || String(it)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='employeeGroup'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Employee Group <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.groupTypes || [])
                                            .filter((gt: any) => {
                                                const val = gt.HRMGT_Id ?? gt.value ?? gt;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((gt: any) => {
                                                const val = (gt.HRMGT_Id ?? gt.value ?? gt)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={gt.HRMGT_Id || gt.value || String(gt)} value={finalVal}>
                                                        {gt.HRMGT_EmployeeGroupType || gt.label || String(gt)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='school'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    School <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.departments || [])
                                            .filter((d: any) => {
                                                const val = d.HRMD_Id ?? d.value ?? d;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((d: any) => {
                                                const val = (d.HRMD_Id ?? d.value ?? d)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={d.HRMD_Id || d.value || String(d)} value={finalVal}>
                                                        {d.HRMD_DepartmentName || d.label || String(d)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Designation <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.designations || [])
                                            .filter((dg: any) => {
                                                const val = dg.HRMDES_Id ?? dg.value ?? dg;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((dg: any) => {
                                                const val = (dg.HRMDES_Id ?? dg.value ?? dg)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={dg.HRMDES_Id || dg.value || String(dg)} value={finalVal}>
                                                        {dg.HRMDES_DesignationName || dg.label || String(dg)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <InputText
                        label='Subject Taught'
                        id='subjectTaught'
                        placeholder='Enter subject taught'
                        {...register('subjectTaught')}
                        error={errors.subjectTaught?.message}
                    />

                    <Controller
                        name='grade'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Grade <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.grades || [])
                                            .filter((gr: any) => {
                                                const val = gr.HRMG_Id ?? gr.Id ?? gr.value ?? gr;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((gr: any) => {
                                                const val = (gr.HRMG_Id ?? gr.Id ?? gr.value ?? gr)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={gr.HRMG_Id || gr.Id || gr.value || String(gr)} value={finalVal}>
                                                        {gr.HRMG_GradeName || gr.Name || gr.label || gr.Grade || String(gr)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='dateOfJoining'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Date Of Joining <span className='text-red-500'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    />

                    <Controller
                        name='dateOfConfirmation'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Date Of Confirmation</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    />

                    <div className='space-y-3'>
                        <Controller
                            name='epf'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='epf' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='epf'>EPF</Label>
                                </div>
                            )}
                        />
                        <Controller
                            name='ppf'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='ppf' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='ppf'>PPF</Label>
                                </div>
                            )}
                        />
                        <Controller
                            name='phdResearchGuide'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='phdResearchGuide' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='phdResearchGuide'>PHD Research Guide ?</Label>
                                </div>
                            )}
                        />
                    </div>

                    {/* Recognition Year - Conditional on PHD Research Guide */}
                    {watch?.('phdResearchGuide') ? (
                        <InputText
                            label='Recognition Year'
                            id='recognitionYear'
                            {...register('recognitionYear')}
                            error={errors.recognitionYear?.message}
                        />
                    ) : null}

                    <Controller
                        name='teachingNonTeaching'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Teaching/NonTeaching <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.teachingNonTeaching || [])
                                            .filter((item: any) => {
                                                const val = item.value ?? item.name ?? item.label ?? item;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((item: any, index: number) => {
                                                const val = ensureNonEmptyValue(item.value ?? item.name ?? item.label ?? item, index);
                                                if (!val) return null;
                                                const label = item.label ?? item.name ?? item.value ?? String(item);
                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {label}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='pfApplicable'
                        control={control}
                        render={({ field }) => (
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='pfApplicable' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                <Label htmlFor='pfApplicable'>PF Applicable?</Label>
                            </div>
                        )}
                    />

                    {/* PF Fields - Conditional on PF Applicable */}
                    {watch?.('pfApplicable') ? (
                        <div className='space-y-4 border-blue-500 border-l-4 pl-4'>
                            <div className='space-y-2'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='pfMaxAmount' {...register('pfMaxAmount')} />
                                    <Label htmlFor='pfMaxAmount'>PF Max Amount</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='pfFixedAmount' {...register('pfFixedAmount')} />
                                    <Label htmlFor='pfFixedAmount'>PF Fixed Amount</Label>
                                </div>
                            </div>

                            <InputText label='PF Acc No.' id='pfAccNo' {...register('pfAccNo')} error={errors.pfAccNo?.message} />

                            <InputText label='UAN Number' id='uanNumber' {...register('uanNumber')} error={errors.uanNumber?.message} />

                            <Controller
                                name='pfDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>PF Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    ) : null}

                    <Controller
                        name='esiApplicable'
                        control={control}
                        render={({ field }) => (
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='esiApplicable' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                <Label htmlFor='esiApplicable'>ESI Applicable?</Label>
                            </div>
                        )}
                    />

                    {/* ESI Fields - Conditional on ESI Applicable */}
                    {watch?.('esiApplicable') ? (
                        <div className='space-y-4 border-green-500 border-l-4 pl-4'>
                            <InputText label='ESI Acc No.' id='esiAccNo' {...register('esiAccNo')} error={errors.esiAccNo?.message} />

                            <InputText
                                label='Gratuity Acc No.'
                                id='gratuityAccNo'
                                {...register('gratuityAccNo')}
                                error={errors.gratuityAccNo?.message}
                            />

                            <Controller
                                name='esiDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>ESI Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    ) : null}

                    <InputText label='National SSN' id='nationalSSN' {...register('nationalSSN')} error={errors.nationalSSN?.message} />
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <Controller
                        name='religion'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Religion <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.religions || [])
                                            .filter((rel: any, index: number) => {
                                                const id = rel.IVRMMR_Id || rel.IMR_Id || rel.Id || rel.id || rel.value || index;
                                                const val = id?.toString();
                                                return val && val.trim() !== '';
                                            })
                                            .map((rel: any, index: number) => {
                                                // Handle different possible property names
                                                const id = rel.IVRMMR_Id ?? rel.IMR_Id ?? rel.Id ?? rel.id ?? rel.value ?? index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === '' || idStr === '') return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === '') return null;
                                                const name =
                                                    rel.IVRMMR_Name ||
                                                    rel.IMR_ReligionName ||
                                                    rel.ReligionName ||
                                                    rel.Name ||
                                                    rel.name ||
                                                    rel.label ||
                                                    rel.text ||
                                                    String(rel);

                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='casteCategory'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Caste Category <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.casteCategories || [])
                                            .filter((cc: any, index: number) => {
                                                const id = cc.IMCC_Id || cc.Id || cc.id || cc.value || index;
                                                const val = id?.toString();
                                                return val && val.trim() !== '';
                                            })
                                            .map((cc: any, index: number) => {
                                                // Handle different possible property names
                                                const id = cc.IMCC_Id ?? cc.Id ?? cc.id ?? cc.value ?? index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === '' || idStr === '') return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === '') return null;
                                                const name =
                                                    cc.IMCC_CategoryName ||
                                                    cc.IMCC_CasteCategoryName ||
                                                    cc.CasteCategoryName ||
                                                    cc.Name ||
                                                    cc.name ||
                                                    cc.label ||
                                                    cc.text ||
                                                    String(cc);

                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='caste'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Caste <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Caste' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.castes || [])
                                            .filter((c: any, index: number) => {
                                                const id = c.IMC_Id || c.Id || c.id || c.value || index;
                                                const val = id?.toString();
                                                return val && val.trim() !== '';
                                            })
                                            .map((c: any, index: number) => {
                                                // Handle different possible property names
                                                const id = c.IMC_Id ?? c.Id ?? c.id ?? c.value ?? index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === '' || idStr === '') return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === '') return null;
                                                const name =
                                                    c.IMC_CasteName || c.CasteName || c.Name || c.name || c.label || c.text || String(c);

                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='dateOfBirth'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Date Of Birth <span className='text-red-500'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    />

                    <Controller
                        name='dateOfRetirement'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Date of Retirement</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    />

                    <Controller
                        name='gender'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Gender <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.genders || [])
                                            .filter((g: any) => {
                                                const val = g.IVRMMG_Id ?? g.value ?? g;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((g: any) => {
                                                const val = (g.IVRMMG_Id ?? g.value ?? g)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={g.IVRMMG_Id || g.value || String(g)} value={finalVal}>
                                                        {g.IVRMMG_GenderName || g.IVRMMG_Gender || g.label || String(g)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='maritalStatus'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Marital Status <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.maritalStatuses || [])
                                            .filter((ms: any) => {
                                                const val = ms.IVRMMMS_Id ?? ms.value ?? ms;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((ms: any) => {
                                                const val = (ms.IVRMMMS_Id ?? ms.value ?? ms)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === '' || val === '') return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === '') return null;
                                                return (
                                                    <SafeSelectItem key={ms.IVRMMMS_Id || ms.value || String(ms)} value={finalVal}>
                                                        {ms.IVRMMMS_MaritalStatus || ms.IVRMMMS_Name || ms.label || String(ms)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    {/* Multiple Mobile Numbers */}
                    <div className='space-y-2'>
                        <Label>Mobile No.</Label>
                        <Controller
                            name='mobileDetails'
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                                <div className='space-y-2'>
                                    {field.value?.map((_mobile: any, index: number) => (
                                        <div key={index} className='flex items-center gap-2'>
                                            <Controller
                                                name={`mobileDetails.${index}.type`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className='w-28'>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(options?.phoneTypes || [])
                                                                .filter((item: any) => {
                                                                    const val = item.value ?? item.name ?? item.label ?? item;
                                                                    return val != null && val !== '' && String(val).trim() !== '';
                                                                })
                                                                .map((item: any, index: number) => {
                                                                    const val = ensureNonEmptyValue(
                                                                        item.value ?? item.name ?? item.label ?? item,
                                                                        index
                                                                    );
                                                                    if (!val) return null;
                                                                    const label = item.label ?? item.name ?? item.value ?? String(item);
                                                                    return (
                                                                        <SafeSelectItem key={val} value={val}>
                                                                            {label}
                                                                        </SafeSelectItem>
                                                                    );
                                                                })
                                                                .filter(Boolean)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            <InputText
                                                placeholder='Enter mobile number'
                                                {...register(`mobileDetails.${index}.mobileNo`)}
                                                className='min-w-[200px] flex-1'
                                            />
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='h-9 w-9 p-0'
                                                onClick={() => {
                                                    const newValues = field.value?.filter((_: any, i: number) => i !== index) || [];
                                                    field.onChange(newValues);
                                                }}>
                                                <X className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='w-full'
                                        onClick={() => {
                                            field.onChange([...(field.value || []), { mobileNo: '', type: 'default' }]);
                                        }}>
                                        <Plus className='mr-1 h-4 w-4' /> Add Mobile
                                    </Button>
                                </div>
                            )}
                        />
                    </div>

                    {/* Multiple Email IDs */}
                    <div className='space-y-2'>
                        <Label>Email -Id</Label>
                        <Controller
                            name='emailDetails'
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                                <div className='space-y-2'>
                                    {field.value?.map((_email: any, index: number) => (
                                        <div key={index} className='flex items-center gap-2'>
                                            <Controller
                                                name={`emailDetails.${index}.type`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className='w-28'>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(options?.phoneTypes || [])
                                                                .filter((item: any) => {
                                                                    const val = item.value ?? item.name ?? item.label ?? item;
                                                                    return val != null && val !== '' && String(val).trim() !== '';
                                                                })
                                                                .map((item: any, index: number) => {
                                                                    const val = ensureNonEmptyValue(
                                                                        item.value ?? item.name ?? item.label ?? item,
                                                                        index
                                                                    );
                                                                    if (!val) return null;
                                                                    const label = item.label ?? item.name ?? item.value ?? String(item);
                                                                    return (
                                                                        <SafeSelectItem key={val} value={val}>
                                                                            {label}
                                                                        </SafeSelectItem>
                                                                    );
                                                                })
                                                                .filter(Boolean)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            <InputText
                                                type='email'
                                                placeholder='Enter email address'
                                                {...register(`emailDetails.${index}.emailId`)}
                                                className='min-w-[200px] flex-1'
                                            />
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='h-9 w-9 p-0'
                                                onClick={() => {
                                                    const newValues = field.value?.filter((_: any, i: number) => i !== index) || [];
                                                    field.onChange(newValues);
                                                }}>
                                                <X className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='w-full'
                                        onClick={() => {
                                            field.onChange([...(field.value || []), { emailId: '', type: 'default' }]);
                                        }}>
                                        <Plus className='mr-1 h-4 w-4' /> Add Email
                                    </Button>
                                </div>
                            )}
                        />
                    </div>

                    <InputText label='Aadhaar No.' id='aadharNo' {...register('aadharNo')} error={errors.aadharNo?.message} />

                    <InputText label='PAN Card No.' id='panCardNo' {...register('panCardNo')} error={errors.panCardNo?.message} />

                    <Controller
                        name='bloodGroup'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Blood Group</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.bloodGroups || [])
                                            .filter((item: any) => {
                                                const val = item.value ?? item.name ?? item.label ?? item;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((item: any, index: number) => {
                                                const val = ensureNonEmptyValue(item.value ?? item.name ?? item.label ?? item, index);
                                                if (!val) return null;
                                                const label = item.label ?? item.name ?? item.value ?? String(item);
                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {label}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='salaryType'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Salary Type</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.salaryTypes || [])
                                            .filter((item: any) => {
                                                const val = item.value ?? item.name ?? item.label ?? item;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((item: any, index: number) => {
                                                const val = ensureNonEmptyValue(item.value ?? item.name ?? item.label ?? item, index);
                                                if (!val) return null;
                                                const label = item.label ?? item.name ?? item.value ?? String(item);
                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {label}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    <Controller
                        name='modeOfPayment'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Mode of Payment <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.modeOfPayment || [])
                                            .filter((item: any) => {
                                                const val = item.value ?? item.name ?? item.label ?? item;
                                                return val != null && val !== '' && String(val).trim() !== '';
                                            })
                                            .map((item: any, index: number) => {
                                                const val = ensureNonEmptyValue(item.value ?? item.name ?? item.label ?? item, index);
                                                if (!val) return null;
                                                const label = item.label ?? item.name ?? item.value ?? String(item);
                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {label}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />

                    {/* Employee Photo Upload */}
                    <div className='space-y-2'>
                        <Label>Upload Employee Photo</Label>
                        <div className='rounded-lg border-2 border-gray-300 border-dashed p-4 text-center'>
                            <div className='mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
                                {selectedPhoto ? (
                                    <img src={selectedPhoto} alt='Employee Preview' className='h-full w-full rounded-lg object-cover' />
                                ) : (
                                    <Upload className='h-12 w-12 text-gray-400' />
                                )}
                            </div>
                            <div className='space-y-2'>
                                <input type='file' id='employeePhoto' accept='image/*' onChange={onPhotoUpload} className='hidden' />
                                <Button
                                    type='button'
                                    variant='outline'
                                    className='w-full'
                                    onClick={() => document.getElementById('employeePhoto')?.click()}>
                                    {selectedPhoto ? 'Change Photo' : 'Upload Employee Photo'}
                                </Button>
                                {selectedPhoto && (
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        size='sm'
                                        onClick={() => {
                                            setSelectedPhoto(null);
                                            setPhotoFile(null);
                                            const fileInput = document.getElementById('employeePhoto') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}>
                                        Remove Photo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details - Conditional on Mode of Payment */}
                    {watch('modeOfPayment') === 'Bank' ? (
                        <div className='space-y-4'>
                            <div className='rounded-md bg-blue-600 px-4 py-2 text-white'>
                                <h3 className='font-semibold'>Employee Bank Details:</h3>
                            </div>

                            <Controller
                                name='bankDetails'
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => (
                                    <div className='rounded-lg border bg-card'>
                                        <div className='bg-blue-600 px-4 py-2 text-white'>
                                            <div className='grid grid-cols-5 gap-2 font-semibold text-sm'>
                                                <div>Serial No.</div>
                                                <div>Employer Bank Name</div>
                                                <div>Bank Account No.</div>
                                                <div>Account Type</div>
                                                <div>Action</div>
                                            </div>
                                        </div>
                                        <div className='space-y-2 p-4'>
                                            {field.value?.map((_bank: any, index: number) => (
                                                <div key={index} className='grid grid-cols-5 items-center gap-2'>
                                                    <div>{index + 1}</div>
                                                    <div>
                                                        <Controller
                                                            name={`bankDetails.${index}.employerBankName`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                    }}
                                                                    value={field.value || ''}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(options?.banks || [])
                                                                            .filter((b: any) => {
                                                                                const bankId = (
                                                                                    b.HRMBD_Id ??
                                                                                    b.BankId ??
                                                                                    b.value ??
                                                                                    b
                                                                                )?.toString();
                                                                                return bankId && bankId.trim() !== '';
                                                                            })
                                                                            .map((b: any) => {
                                                                                const bankId = (
                                                                                    b.HRMBD_Id ??
                                                                                    b.BankId ??
                                                                                    b.value ??
                                                                                    b
                                                                                )?.toString();
                                                                                // Ensure value is never empty string
                                                                                if (!bankId || bankId.trim() === '' || bankId === '')
                                                                                    return null;
                                                                                const finalBankId = String(bankId).trim();
                                                                                if (finalBankId === '') return null;
                                                                                const bankName =
                                                                                    b.HRMBD_BankName || b.BankName || b.label || String(b);
                                                                                return (
                                                                                    <SafeSelectItem key={bankId} value={finalBankId}>
                                                                                        {bankName}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })
                                                                            .filter(Boolean)}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputText
                                                            placeholder='Bank Account No.'
                                                            {...register(`bankDetails.${index}.bankAccountNo`)}
                                                            className='w-full'
                                                        />
                                                    </div>
                                                    <div>
                                                        <Controller
                                                            name={`bankDetails.${index}.accountType`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(options?.addressTypes || [])
                                                                            .filter((item: any) => {
                                                                                const val = item.value ?? item.name ?? item.label ?? item;
                                                                                return (
                                                                                    val != null && val !== '' && String(val).trim() !== ''
                                                                                );
                                                                            })
                                                                            .map((item: any, index: number) => {
                                                                                const val = ensureNonEmptyValue(
                                                                                    item.value ?? item.name ?? item.label ?? item,
                                                                                    index
                                                                                );
                                                                                if (!val) return null;
                                                                                const label =
                                                                                    item.label ?? item.name ?? item.value ?? String(item);
                                                                                return (
                                                                                    <SafeSelectItem key={val} value={val}>
                                                                                        {label}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })
                                                                            .filter(Boolean)}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => {
                                                                const newValues =
                                                                    field.value?.filter((_: any, i: number) => i !== index) || [];
                                                                field.onChange(newValues);
                                                            }}>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() => {
                                                    field.onChange([
                                                        ...(field.value || []),
                                                        {
                                                            employerBankName: '',
                                                            bankAccountNo: '',
                                                            accountType: 'default'
                                                        }
                                                    ]);
                                                }}>
                                                <Plus className='mr-1 h-4 w-4' /> Add Bank Account
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

// Address Tab Component
