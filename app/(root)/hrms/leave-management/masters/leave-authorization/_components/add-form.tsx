'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useInstitutionsByLoginBased,
    useLeaveAuthorization,
    useLeaveAuthorizationDropdowns,
    useSaveLeaveAuthorization
} from '@/hooks/hrms/leave-management/useMasters';
import { LEAVE_AUTHORIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Loader2, RotateCcw, Save, X } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveAuthorization } from './columns';
interface AddLeaveAuthorizationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}
export default function AddLeaveAuthorizationForm({ onSuccess, onCancel, className = '' }: AddLeaveAuthorizationFormProps) {
    const { refetchAll } = useLeaveAuthorization();
    const { mutate: saveLeaveAuthorization, isPending } = useSaveLeaveAuthorization();
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useLeaveAuthorizationDropdowns();
    const { data: institutionsData, isLoading: isLoadingInstitutions } = useInstitutionsByLoginBased();

    const mastersLoading = isLoadingDropdowns || isLoadingInstitutions;

    // Extract institution options from API
    const institutionOptions = useMemo(() => {
        if (!institutionsData?.data || !Array.isArray(institutionsData.data)) {
            return [];
        }
        return institutionsData.data
            .map((item: any) => ({
                value: String(item.mI_Id || item.MI_Id || item.miId || ''),
                label: String(item.mI_Name || item.MI_Name || item.institution || '') //added
            }))
            .filter((item: { value: string; label: string }) => item.value && item.label);
    }, [institutionsData]);

    // Extract dropdown options from API
    const gradeOptions = useMemo(() => {
        if (!dropdownData?.data?.grades || !Array.isArray(dropdownData.data.grades)) {
            return [];
        }
        return dropdownData.data.grades;
    }, [dropdownData]);
    const groupTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.groupTypes || !Array.isArray(dropdownData.data.groupTypes)) {
            return [];
        }
        return dropdownData.data.groupTypes;
    }, [dropdownData]);
    const departmentOptions = useMemo(() => {
        if (!dropdownData?.data?.departments || !Array.isArray(dropdownData.data.departments)) {
            return [];
        }
        return dropdownData.data.departments;
    }, [dropdownData]);
    const designationOptions = useMemo(() => {
        if (!dropdownData?.data?.designations || !Array.isArray(dropdownData.data.designations)) {
            return [];
        }
        return dropdownData.data.designations;
    }, [dropdownData]);
    const leaveTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.leaveTypes || !Array.isArray(dropdownData.data.leaveTypes)) {
            return [];
        }
        return dropdownData.data.leaveTypes;
    }, [dropdownData]);
    const approvalPersonOptions = useMemo(() => {
        if (!dropdownData?.data?.approvalPersons || !Array.isArray(dropdownData.data.approvalPersons)) {
            return [];
        }
        return dropdownData.data.approvalPersons;
    }, [dropdownData]);
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveAuthorization>({
        mode: 'onChange',
        defaultValues: {
            institution: '',
            hrmG_GradeName: '',
            hrmgT_EmployeeGroupType: '',
            hrmD_DepartmentName: '',
            hrmdeS_DesignationName: '',
            hrmL_LeaveName: '',
            hrlaoN_SanctionLevelNo: '',
            hrmE_EmployeeFirstName: '',
            finalFlag: false
        }
    });
    const onSubmit: SubmitHandler<LeaveAuthorization> = async (data) => {
        saveLeaveAuthorization(data, {
            onSuccess: () => {
                reset();
            }
        });
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Institution Field */}
                <div className='mb-4'>
                    <Controller
                        name='institution'
                        control={control}
                        rules={{ required: 'Institution is required' }}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='institution-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Institution <span className='text-red-500'>*</span>
                                </label>
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(value) => {
                                        field.onChange(value || '');
                                    }}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger id='institution-select' className={errors.institution ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={isLoadingInstitutions ? 'Loading...' : '--Select Institution--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutionOptions.length > 0 ? (
                                            institutionOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                {isLoadingInstitutions ? 'Loading institutions...' : 'No institutions available'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.institution && <FormError>{errors.institution.message}</FormError>}
                            </div>
                        )}
                    />
                </div>
                {/* Form Fields Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='hrmG_GradeName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmG_GradeName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Select Grade <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='grade-select' className={errors.hrmG_GradeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeOptions.length > 0 ? (
                                                gradeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmG_GradeName && <FormError>{errors.hrmG_GradeName.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmgT_EmployeeGroupType'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmgT_EmployeeGroupType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Group Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='group-type-select' className={errors.hrmgT_EmployeeGroupType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypeOptions.length > 0 ? (
                                                groupTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmgT_EmployeeGroupType && <FormError>{errors.hrmgT_EmployeeGroupType.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmD_DepartmentName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmD_DepartmentName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Department Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='department-select' className={errors.hrmD_DepartmentName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentOptions.length > 0 ? (
                                                departmentOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmD_DepartmentName && <FormError>{errors.hrmD_DepartmentName.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmdeS_DesignationName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmdeS_DesignationName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Designation Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='designation-select' className={errors.hrmdeS_DesignationName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designationOptions.length > 0 ? (
                                                designationOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmdeS_DesignationName && <FormError>{errors.hrmdeS_DesignationName.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                    {/* Right Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='hrmL_LeaveName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmL_LeaveName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='leave-type-select' className={errors.hrmL_LeaveName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {leaveTypeOptions.length > 0 ? (
                                                leaveTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmL_LeaveName && <FormError>{errors.hrmL_LeaveName.message}</FormError>}
                                </div>
                            )}
                        />
                        <div className='mb-4'>
                            <InputText
                                label='Order'
                                id='hrlaoN_SanctionLevelNo'
                                required
                                type='number'
                                {...register('hrlaoN_SanctionLevelNo', LEAVE_AUTHORIZATION_VALIDATION.hrlaoN_SanctionLevelNo)}
                                error={errors.hrlaoN_SanctionLevelNo?.message}
                                className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                        <Controller
                            name='hrmE_EmployeeFirstName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmE_EmployeeFirstName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Approval Person <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='approval-person-select'
                                            className={errors.hrmE_EmployeeFirstName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {approvalPersonOptions.length > 0 ? (
                                                approvalPersonOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmE_EmployeeFirstName && <FormError>{errors.hrmE_EmployeeFirstName.message}</FormError>}
                                </div>
                            )}
                        />
                        {/* Checkbox */}
                        <div className='pt-2'>
                            <Controller
                                name='finalFlag'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='finalFlag'
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
                                        />
                                        <label htmlFor='finalFlag' className='cursor-pointer font-medium text-gray-700 text-sm'>
                                            Final Flag
                                        </label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={mastersLoading}>
                        <RotateCcw className='mr-1.5 h-4 w-4' />
                        Reset
                    </Button>
                    {mastersLoading && <Loader2 className='h-4 w-4 animate-spin text-purple-500' />}
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
