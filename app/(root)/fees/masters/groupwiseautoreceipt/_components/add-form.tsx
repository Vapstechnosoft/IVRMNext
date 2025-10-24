'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { masterClassSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterClassYearlyCategory } from '@/server/fees/masters/class_yearly_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, RotateCcw, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormFields = {
    academicYear: string;
    usePrefix: boolean;
    useSuffix: boolean;
    prefixValue: string;
    suffixValue: string;
    startingNumber: string;
    groups: string[];
    autoGroupName: string;
    address: string;
    receiptTemplateFormat: string;
};

interface DropdownOption {
    value: string;
    label: string;
}

interface GroupOption {
    value: string;
    label: string;
}

interface AddMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterClassForm({ onSuccess, className = '' }: AddMasterClassFormProps) {
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const {
        handleSubmit,
        reset,
        setValue,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onSubmit',
        defaultValues: {
            academicYear: '',
            usePrefix: false,
            useSuffix: false,
            prefixValue: '',
            suffixValue: '',
            startingNumber: '',
            groups: [],
            autoGroupName: '',
            address: '',
            receiptTemplateFormat: ''
        }
    });

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [academicYearOptions, setAcademicYearOptions] = useState<DropdownOption[]>([]);
    const [groupOptions] = useState<GroupOption[]>([
        { value: '1', label: 'Group 1' },
        { value: '2', label: 'Group 2' },
        { value: '3', label: 'Group 3' },
        { value: '4', label: 'Group 4' },
        { value: '5', label: 'Group 5' }
    ]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [usePrefix, setUsePrefix] = useState(false);
    const [useSuffix, setUseSuffix] = useState(false);

    const academicYear = watch('academicYear');
    const groupsValue = watch('groups');

    useEffect(() => {
        setIsLoadingDropdowns(loadingAcademic);
    }, [loadingAcademic]);

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYearOptions([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const options = academicData.data.map((item: any) => ({
                value: item.asmaY_Id.toString(),
                label: item.asmaY_Year
            }));
            setAcademicYearOptions(options);
        } else {
            setAcademicYearOptions([]);
        }
    }, [academicData, academicError]);

    const filteredGroupOptions = groupOptions.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleGroupChange = (value: string) => {
        const currentGroups = groupsValue || [];
        let updatedGroups: string[];
        if (currentGroups.includes(value)) {
            updatedGroups = currentGroups.filter((c) => c !== value);
        } else {
            updatedGroups = [...currentGroups, value];
        }
        setSelectedGroups(updatedGroups);
        setValue('groups', updatedGroups, { shouldValidate: true });
    };

    const handleSelectAll = () => {
        const currentGroups = groupsValue || [];
        if (currentGroups.length === groupOptions.length) {
            setSelectedGroups([]);
            setValue('groups', [], { shouldValidate: true });
        } else {
            const allValues = groupOptions.map((opt) => opt.value);
            setSelectedGroups(allValues);
            setValue('groups', allValues, { shouldValidate: true });
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (isSubmitting) return;

        try {
            const { academicYear, prefixValue, suffixValue, startingNumber, groups, autoGroupName, address, receiptTemplateFormat } = data;

            if (!academicYear) {
                toast.error('Please select academic year.');
                return;
            }
            if (usePrefix && !prefixValue) {
                toast.error('Please enter prefix value.');
                return;
            }
            if (useSuffix && !suffixValue) {
                toast.error('Please enter suffix value.');
                return;
            }
            if (!startingNumber) {
                toast.error('Please enter starting number.');
                return;
            }
            if (groups.length === 0) {
                toast.error('Please select at least one group.');
                return;
            }
            if (!autoGroupName) {
                toast.error('Please enter auto group name.');
                return;
            }

            const payload = {
                fmcC_Id: 0,
                mI_Id: 30,
                fmcC_ClassCategoryName: autoGroupName,
                fmcC_ClassCategoryCode: '',
                fmcC_ActiveFlag: true,
                asmaY_ID: Number.parseInt(academicYear),
                asmcL_ID: 0,
                clsYearData: groups,
                user_id: 21602,
                prefix: usePrefix ? prefixValue : '',
                suffix: useSuffix ? suffixValue : '',
                startingNumber: startingNumber,
                address: address,
                receiptTemplateFormat: receiptTemplateFormat
            };

            const response = await addOrUpdateMasterClassYearlyCategory(payload);

            if (response.success) {
                toast.success(response.message || 'Master class saved successfully');
                reset();
                setSelectedGroups([]);
                setSearchTerm('');
                setUsePrefix(false);
                setUseSuffix(false);
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save master class');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Error saving master class');
        }
    };

    const handleReset = () => {
        reset();
        setSelectedGroups([]);
        setSearchTerm('');
        setUsePrefix(false);
        setUseSuffix(false);
    };

    return (
        <div className={`${className} w-full`}>
            <Card className='mx-auto w-full max-w-6xl border-gray-200 shadow-md'>
                <CardHeader className='border-b bg-white p-5'>
                    <CardTitle className='font-medium text-gray-700 text-sm'>Add Master Class</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            handleSubmit(onSubmit)(e);
                        }}
                        className='space-y-6'>
                        {/* Academic Year */}
                        <div>
                            <Label htmlFor='academicYear'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValue('academicYear', value, { shouldValidate: true })}
                                value={academicYear}
                                disabled={isLoadingDropdowns}>
                                <SelectTrigger
                                    id='academicYear'
                                    className={`mt-1 w-full transition-colors ${
                                        errors.academicYear ? 'border-red-500' : 'border-gray-300'
                                    }`}>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {hasSubmitted && errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                        </div>

                        {/* Starting Number */}
                        <div>
                            <Label htmlFor='startingNumber'>
                                Starting Number <span className='text-red-500'>*</span>
                            </Label>
                            <input
                                id='startingNumber'
                                type='number'
                                {...register('startingNumber')}
                                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                            />
                            {hasSubmitted && errors.startingNumber && <FormError>{errors.startingNumber.message}</FormError>}
                        </div>

                        {/* Prefix / Suffix */}
                        <div className='lg:col-span-2'>
                            <Label>Prefix / Suffix</Label>
                            <div className='mt-2 flex flex-wrap gap-6'>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        checked={usePrefix}
                                        onChange={(e) => {
                                            setUsePrefix(e.target.checked);
                                            setValue('usePrefix', e.target.checked, {
                                                shouldValidate: true
                                            });
                                        }}
                                        className='h-4 w-4 rounded border-gray-300 accent-primary'
                                    />
                                    <span>Prefix</span>
                                </label>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        checked={useSuffix}
                                        onChange={(e) => {
                                            setUseSuffix(e.target.checked);
                                            setValue('useSuffix', e.target.checked, {
                                                shouldValidate: true
                                            });
                                        }}
                                        className='h-4 w-4 rounded border-gray-300 accent-primary'
                                    />
                                    <span>Suffix</span>
                                </label>
                            </div>
                        </div>

                        {usePrefix && (
                            <div>
                                <Label htmlFor='prefixValue'>
                                    Prefix <span className='text-red-500'>*</span>
                                </Label>
                                <input
                                    id='prefixValue'
                                    type='text'
                                    {...register('prefixValue')}
                                    className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                                />
                            </div>
                        )}

                        {useSuffix && (
                            <div>
                                <Label htmlFor='suffixValue'>
                                    Suffix <span className='text-red-500'>*</span>
                                </Label>
                                <input
                                    id='suffixValue'
                                    type='text'
                                    {...register('suffixValue')}
                                    className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                                />
                            </div>
                        )}

                        {/* Groups */}
                        <div className='lg:col-span-2'>
                            <Label>
                                Select Groups <span className='text-red-500'>*</span>
                            </Label>
                            <div className='mt-2 rounded-md border border-gray-200 bg-white p-3'>
                                <input
                                    type='text'
                                    placeholder='Search Groups...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='mb-3 w-full rounded-md border border-gray-300 px-3 py-1.5 transition-colors focus:border-gray-400 focus:ring-0'
                                />
                                {/* Select All styled like groupsgrouping UI */}
                                <div
                                    onClick={handleSelectAll}
                                    className={cn(
                                        'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                        selectedGroups.length === groupOptions.length
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-gray-200 hover:border-primary/40'
                                    )}>
                                    {selectedGroups.length === groupOptions.length ? (
                                        <CheckSquare className='h-4 w-4 text-primary' />
                                    ) : (
                                        <Square className='h-4 w-4 text-gray-400' />
                                    )}
                                    <span>Select All</span>
                                </div>

                                <div className='mt-2 max-h-40 overflow-y-auto rounded-md border border-gray-200 p-1'>
                                    {filteredGroupOptions.map((option) => {
                                        const selected = selectedGroups.includes(option.value);
                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => handleGroupChange(option.value)}
                                                className={cn(
                                                    'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                    selected
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-200 hover:border-primary/40'
                                                )}>
                                                {selected ? (
                                                    <CheckSquare className='h-4 w-4 text-primary' />
                                                ) : (
                                                    <Square className='h-4 w-4 text-gray-400' />
                                                )}
                                                <span>{option.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Auto Group Name */}
                        <div>
                            <Label htmlFor='autoGroupName'>
                                Auto Group Name <span className='text-red-500'>*</span>
                            </Label>
                            <input
                                id='autoGroupName'
                                type='text'
                                {...register('autoGroupName')}
                                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                            />
                        </div>

                        {/* Address */}
                        <div className='lg:col-span-2'>
                            <Label htmlFor='address'>Address</Label>
                            <textarea
                                id='address'
                                {...register('address')}
                                className='mt-1 h-24 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                            />
                        </div>

                        {/* Receipt Template */}
                        <div className='lg:col-span-2'>
                            <Label htmlFor='receiptTemplateFormat'>Receipt Template Format</Label>
                            <textarea
                                id='receiptTemplateFormat'
                                {...register('receiptTemplateFormat')}
                                className='mt-1 h-32 w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-gray-400 focus:ring-0'
                            />
                        </div>

                        {/* Buttons */}
                        <div className='mt-3 flex justify-end gap-3 border-t pt-5 lg:col-span-2'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                className='order-2 flex w-fit items-center gap-2 transition-all duration-200 hover:scale-105 sm:order-1'>
                                <RotateCcw className='h-4 w-4' />
                                Reset
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                className='order-1 flex w-fit items-center gap-2 transition-all duration-200 hover:scale-105 sm:order-2'>
                                <Save className='h-4 w-4' />
                                Save Master Class
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
