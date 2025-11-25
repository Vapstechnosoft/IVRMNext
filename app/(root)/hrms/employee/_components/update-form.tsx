'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeById, useEmployeeOnload, useSaveEmployee } from '@/hooks/hrms/useEmployee';

// Safe SelectItem wrapper that prevents empty string values - ABSOLUTE PROTECTION
const SafeSelectItem = ({ value, children, ...props }: { value: any; children: React.ReactNode; [key: string]: any }) => {
    // ABSOLUTE CHECK: If value is null, undefined, or empty string, don't render
    if (value == null || value === undefined || value === '') {
        console.error('🔴 [SafeSelectItem - update-form] EMPTY VALUE DETECTED:', {
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
        console.error('🔴 [SafeSelectItem - update-form] EMPTY STRING DETECTED:', {
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
        console.error('🔴 [SafeSelectItem - update-form] EMPTY TRIMMED VALUE DETECTED:', {
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
        console.error('🔴 [SafeSelectItem - update-form] FINAL CHECK FAILED - trimmedValue is empty:', {
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
const ensureNonEmptyValue = (value: any): string | null => {
    if (value == null) return null;
    const str = String(value).trim();
    return str !== '' ? str : null;
};
import type { EmployeeListItem } from '@/types/hrms/employee';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    HRME_EmployeeFirstName: z.string().min(1, 'First name is required'),
    HRME_EmployeeMiddleName: z.string().optional(),
    HRME_EmployeeLastName: z.string().optional(),
    HRME_EmployeeCode: z.string().min(1, 'Employee code is required'),
    HRMET_Id: z.number().min(1, 'Please select employee type'),
    HRMGT_Id: z.number().optional(),
    HRMD_Id: z.number().optional(),
    HRMDES_Id: z.number().optional(),
    HRMG_Id: z.number().optional(),
    HRME_DOB: z.string().optional(),
    HRME_DOJ: z.string().optional(),
    IVRMMG_Id: z.number().optional(),
    IVRMMMS_Id: z.number().optional(),
    ReligionId: z.number().optional(),
    HRME_MobileNo: z.string().optional(),
    HRME_EmailId: z.string().email().optional().or(z.literal('')),
    HRME_FatherName: z.string().optional(),
    HRME_MotherName: z.string().optional(),
    HRME_BloodGroup: z.string().optional(),
    HRME_PFApplicableFlag: z.boolean().optional(),
    HRME_ESIApplicableFlag: z.boolean().optional(),
    HRME_TechNonTeachingFlg: z.boolean().optional(),
    HRME_ActiveFlag: z.boolean().optional()
});

type FormFields = z.infer<typeof formSchema>;

interface UpdateEmployeeFormProps {
    selectedRow: EmployeeListItem;
    onSuccess: () => void;
    className?: string;
}

export default function UpdateEmployeeForm({ selectedRow, onSuccess, className = '' }: UpdateEmployeeFormProps) {
    const { data: onloadData } = useEmployeeOnload();
    const { data: employeeDetailData } = useEmployeeById(selectedRow.HRME_Id);
    const { mutate: saveEmployee, isPending } = useSaveEmployee();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            HRME_EmployeeFirstName: selectedRow.HRME_EmployeeFirstName || '',
            HRME_EmployeeMiddleName: selectedRow.HRME_EmployeeMiddleName || '',
            HRME_EmployeeLastName: selectedRow.HRME_EmployeeLastName || '',
            HRME_EmployeeCode: selectedRow.HRME_EmployeeCode || '',
            HRMET_Id: 0,
            HRME_MobileNo: selectedRow.HRME_MobileNo ? String(selectedRow.HRME_MobileNo) : '',
            HRME_EmailId: selectedRow.HRME_EmailId || '',
            HRME_ActiveFlag: selectedRow.HRME_ActiveFlag
        }
    });

    // Load full employee details when available
    useEffect(() => {
        if (employeeDetailData?.data) {
            const details = employeeDetailData.data;
            reset({
                HRME_EmployeeFirstName: details.HRME_EmployeeFirstName || '',
                HRME_EmployeeMiddleName: details.HRME_EmployeeMiddleName || '',
                HRME_EmployeeLastName: details.HRME_EmployeeLastName || '',
                HRME_EmployeeCode: details.HRME_EmployeeCode || '',
                HRMET_Id: details.HRMET_Id || 0,
                HRMGT_Id: details.HRMGT_Id || 0,
                HRMD_Id: details.HRMD_Id || 0,
                HRMDES_Id: details.HRMDES_Id || 0,
                HRMG_Id: details.HRMG_Id || 0,
                HRME_DOB: details.HRME_DOB || '',
                HRME_DOJ: details.HRME_DOJ || '',
                IVRMMG_Id: details.IVRMMG_Id || 0,
                IVRMMMS_Id: details.IVRMMMS_Id || 0,
                ReligionId: details.ReligionId || 0,
                HRME_MobileNo: details.HRME_MobileNo ? String(details.HRME_MobileNo) : '',
                HRME_EmailId: details.HRME_EmailId || '',
                HRME_FatherName: details.HRME_FatherName || '',
                HRME_MotherName: details.HRME_MotherName || '',
                HRME_BloodGroup: details.HRME_BloodGroup || '',
                HRME_PFApplicableFlag: details.HRME_PFApplicableFlag || false,
                HRME_ESIApplicableFlag: details.HRME_ESIApplicableFlag || false,
                HRME_TechNonTeachingFlg: details.HRME_TechNonTeachingFlg || false,
                HRME_ActiveFlag: details.HRME_ActiveFlag
            });
        }
    }, [employeeDetailData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        saveEmployee(
            {
                HRME_Id: selectedRow.HRME_Id,
                MI_Id: HRMS_MI_ID,
                ...data,
                HRME_MobileNo: data.HRME_MobileNo ? Number(data.HRME_MobileNo) : undefined,
                LogInUserId: 5
            },
            {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || 'Employee updated successfully');
                        onSuccess();
                    } else {
                        toast.error(response.message || 'Failed to update employee');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'An error occurred');
                }
            }
        );
    };

    // Memoize arrays to prevent unnecessary re-renders
    const employeeTypes = useMemo(() => onloadData?.data?.employeeTypedropdownlist || [], [onloadData?.data?.employeeTypedropdownlist]);
    const groupTypes = useMemo(() => onloadData?.data?.groupTypedropdownlist || [], [onloadData?.data?.groupTypedropdownlist]);
    const departments = useMemo(() => onloadData?.data?.departmentdropdownlist || [], [onloadData?.data?.departmentdropdownlist]);
    const designations = useMemo(() => onloadData?.data?.designationdropdownlist || [], [onloadData?.data?.designationdropdownlist]);
    const grades = useMemo(() => onloadData?.data?.gradedropdownlist || [], [onloadData?.data?.gradedropdownlist]);
    const genders = useMemo(() => onloadData?.data?.genderdropdownlist || [], [onloadData?.data?.genderdropdownlist]);
    const maritalStatuses = useMemo(() => onloadData?.data?.maritalStatusdropdownlist || [], [onloadData?.data?.maritalStatusdropdownlist]);
    const religions = useMemo(() => onloadData?.data?.religiondropdownlist || [], [onloadData?.data?.religiondropdownlist]);

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Basic Information */}
                <div className='rounded-lg border p-4'>
                    <h3 className='mb-4 font-semibold text-lg'>Basic Information</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <HRMSInputText
                            label='Employee Code'
                            required
                            id='HRME_EmployeeCode'
                            placeholder='Enter employee code'
                            {...register('HRME_EmployeeCode')}
                            error={errors.HRME_EmployeeCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='First Name'
                            required
                            id='HRME_EmployeeFirstName'
                            placeholder='Enter first name'
                            {...register('HRME_EmployeeFirstName')}
                            error={errors.HRME_EmployeeFirstName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Middle Name'
                            id='HRME_EmployeeMiddleName'
                            placeholder='Enter middle name'
                            {...register('HRME_EmployeeMiddleName')}
                            error={errors.HRME_EmployeeMiddleName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Last Name'
                            id='HRME_EmployeeLastName'
                            placeholder='Enter last name'
                            {...register('HRME_EmployeeLastName')}
                            error={errors.HRME_EmployeeLastName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMET_Id'>
                                Employee Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRMET_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMET_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select employee type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeeTypes
                                                .filter((type: any) => {
                                                    const typeId = type.HRMET_Id ?? type.hrmET_Id;
                                                    return ensureNonEmptyValue(typeId) != null;
                                                })
                                                .map((type: any) => {
                                                    const typeId = type.HRMET_Id ?? type.hrmET_Id;
                                                    const typeIdStr = ensureNonEmptyValue(typeId);
                                                    if (!typeIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={typeId} value={typeIdStr}>
                                                            {type.HRMET_EmployeeType || type.hrmET_EmployeeType}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMET_Id && <FormError>{errors.HRMET_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMGT_Id'>Group Type</Label>
                            <Controller
                                name='HRMGT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMGT_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select group type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypes
                                                .filter((group: any) => {
                                                    const groupId = group.HRMGT_Id ?? group.hrmgT_Id;
                                                    return ensureNonEmptyValue(groupId) != null;
                                                })
                                                .map((group: any) => {
                                                    const groupId = group.HRMGT_Id ?? group.hrmgT_Id;
                                                    const groupIdStr = ensureNonEmptyValue(groupId);
                                                    if (!groupIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={groupId} value={groupIdStr}>
                                                            {group.HRMGT_EmployeeGroupType || group.hrmgT_EmployeeGroupType}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMGT_Id && <FormError>{errors.HRMGT_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMD_Id'>Department</Label>
                            <Controller
                                name='HRMD_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMD_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments
                                                .filter((dept: any) => {
                                                    const deptId = dept.HRMD_Id ?? dept.hrmD_Id;
                                                    return deptId != null && deptId !== '' && String(deptId).trim() !== '';
                                                })
                                                .map((dept: any) => {
                                                    const deptId = dept.HRMD_Id ?? dept.hrmD_Id;
                                                    const deptIdStr = String(deptId).trim();
                                                    if (!deptIdStr || deptIdStr === '') return null;
                                                    return (
                                                        <SafeSelectItem key={deptId} value={deptIdStr}>
                                                            {dept.HRMD_DepartmentName || dept.hrmD_DepartmentName}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMD_Id && <FormError>{errors.HRMD_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMDES_Id'>Designation</Label>
                            <Controller
                                name='HRMDES_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMDES_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select designation' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designations
                                                .filter((desig: any) => {
                                                    const desigId = desig.HRMDES_Id ?? desig.hrmdeS_Id;
                                                    return ensureNonEmptyValue(desigId) != null;
                                                })
                                                .map((desig: any) => {
                                                    const desigId = desig.HRMDES_Id ?? desig.hrmdeS_Id;
                                                    const desigIdStr = ensureNonEmptyValue(desigId);
                                                    if (!desigIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={desigId} value={desigIdStr}>
                                                            {desig.HRMDES_DesignationName || desig.hrmdeS_DesignationName}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMDES_Id && <FormError>{errors.HRMDES_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMG_Id'>Grade</Label>
                            <Controller
                                name='HRMG_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMG_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select grade' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades
                                                .filter((grade: any) => {
                                                    const gradeId = grade.HRMG_Id ?? grade.hrmG_Id;
                                                    return ensureNonEmptyValue(gradeId) != null;
                                                })
                                                .map((grade: any) => {
                                                    const gradeId = grade.HRMG_Id ?? grade.hrmG_Id;
                                                    const gradeIdStr = ensureNonEmptyValue(gradeId);
                                                    if (!gradeIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={gradeId} value={gradeIdStr}>
                                                            {grade.HRMG_GradeName || grade.hrmG_GradeName}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMG_Id && <FormError>{errors.HRMG_Id.message}</FormError>}
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className='rounded-lg border p-4'>
                    <h3 className='mb-4 font-semibold text-lg'>Personal Details</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        <HRMSInputText
                            label='Date of Birth'
                            type='date'
                            id='HRME_DOB'
                            {...register('HRME_DOB')}
                            error={errors.HRME_DOB?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Date of Joining'
                            type='date'
                            id='HRME_DOJ'
                            {...register('HRME_DOJ')}
                            error={errors.HRME_DOJ?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='IVRMMG_Id'>Gender</Label>
                            <Controller
                                name='IVRMMG_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='IVRMMG_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select gender' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genders
                                                .filter((gender: any) => {
                                                    const genderId = gender.IVRMMG_Id ?? gender.ivrmmmG_Id;
                                                    return ensureNonEmptyValue(genderId) != null;
                                                })
                                                .map((gender: any) => {
                                                    const genderId = gender.IVRMMG_Id ?? gender.ivrmmmG_Id;
                                                    const genderIdStr = ensureNonEmptyValue(genderId);
                                                    if (!genderIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={genderId} value={genderIdStr}>
                                                            {gender.IVRMMG_GenderName || gender.ivrmmmG_GenderName}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRMMG_Id && <FormError>{errors.IVRMMG_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='IVRMMMS_Id'>Marital Status</Label>
                            <Controller
                                name='IVRMMMS_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='IVRMMMS_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select marital status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {maritalStatuses
                                                .filter((status: any) => {
                                                    const statusId = status.IVRMMMS_Id ?? status.ivrmmmsId;
                                                    return ensureNonEmptyValue(statusId) != null;
                                                })
                                                .map((status: any) => {
                                                    const statusId = status.IVRMMMS_Id ?? status.ivrmmmsId;
                                                    const statusIdStr = ensureNonEmptyValue(statusId);
                                                    if (!statusIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={statusId} value={statusIdStr}>
                                                            {status.IVRMMMS_MaritalStatus || status.ivrmmms_MaritalStatus}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRMMMS_Id && <FormError>{errors.IVRMMMS_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='ReligionId'>Religion</Label>
                            <Controller
                                name='ReligionId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='ReligionId' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select religion' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {religions
                                                .filter((religion: any) => {
                                                    const religionId = religion.IVRMMR_Id ?? religion.religionId;
                                                    return ensureNonEmptyValue(religionId) != null;
                                                })
                                                .map((religion: any) => {
                                                    const religionId = religion.IVRMMR_Id ?? religion.religionId;
                                                    const religionIdStr = ensureNonEmptyValue(religionId);
                                                    if (!religionIdStr) return null;
                                                    return (
                                                        <SafeSelectItem key={religionId} value={religionIdStr}>
                                                            {religion.IVRMMR_Name || religion.religionName}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ReligionId && <FormError>{errors.ReligionId.message}</FormError>}
                        </div>

                        <HRMSInputText
                            label='Blood Group'
                            id='HRME_BloodGroup'
                            placeholder='Enter blood group'
                            {...register('HRME_BloodGroup')}
                            error={errors.HRME_BloodGroup?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Father Name'
                            id='HRME_FatherName'
                            placeholder='Enter father name'
                            {...register('HRME_FatherName')}
                            error={errors.HRME_FatherName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Mother Name'
                            id='HRME_MotherName'
                            placeholder='Enter mother name'
                            {...register('HRME_MotherName')}
                            error={errors.HRME_MotherName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Contact Details */}
                <div className='rounded-lg border p-4'>
                    <h3 className='mb-4 font-semibold text-lg'>Contact Details</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <HRMSInputText
                            label='Mobile Number'
                            type='tel'
                            id='HRME_MobileNo'
                            placeholder='Enter mobile number'
                            {...register('HRME_MobileNo')}
                            error={errors.HRME_MobileNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <HRMSInputText
                            label='Email ID'
                            type='email'
                            id='HRME_EmailId'
                            placeholder='Enter email address'
                            {...register('HRME_EmailId')}
                            error={errors.HRME_EmailId?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Flags */}
                <div className='rounded-lg border p-4'>
                    <h3 className='mb-4 font-semibold text-lg'>Additional Information</h3>
                    <div className='space-y-4'>
                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRME_PFApplicableFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRME_PFApplicableFlag' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRME_PFApplicableFlag' className='cursor-pointer font-normal'>
                                PF Applicable
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRME_ESIApplicableFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRME_ESIApplicableFlag' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRME_ESIApplicableFlag' className='cursor-pointer font-normal'>
                                ESI Applicable
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRME_TechNonTeachingFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRME_TechNonTeachingFlg' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRME_TechNonTeachingFlg' className='cursor-pointer font-normal'>
                                Teaching Staff
                            </Label>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='HRME_ActiveFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='HRME_ActiveFlag' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='HRME_ActiveFlag' className='cursor-pointer font-normal'>
                                Active
                            </Label>
                        </div>
                    </div>
                </div>

                {errors.root && <FormError>{errors.root.message}</FormError>}

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onSuccess}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Employee
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
