'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeOnload, useSaveEmployee } from '@/hooks/hrms/useEmployee';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useMemo } from 'react';
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

interface AddEmployeeFormProps {
    onSuccess: () => void;
    className?: string;
}

export default function AddEmployeeForm({ onSuccess, className = '' }: AddEmployeeFormProps) {
    const { data: onloadData } = useEmployeeOnload();
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
            HRME_EmployeeFirstName: '',
            HRME_EmployeeMiddleName: '',
            HRME_EmployeeLastName: '',
            HRME_EmployeeCode: '',
            HRMET_Id: 0,
            HRMGT_Id: 0,
            HRMD_Id: 0,
            HRMDES_Id: 0,
            HRMG_Id: 0,
            IVRMMG_Id: 0,
            IVRMMMS_Id: 0,
            ReligionId: 0,
            HRME_MobileNo: '',
            HRME_EmailId: '',
            HRME_FatherName: '',
            HRME_MotherName: '',
            HRME_BloodGroup: '',
            HRME_PFApplicableFlag: false,
            HRME_ESIApplicableFlag: false,
            HRME_TechNonTeachingFlg: false,
            HRME_ActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        saveEmployee(
            {
                HRME_Id: 0,
                MI_Id: HRMS_MI_ID,
                ...data,
                HRME_MobileNo: data.HRME_MobileNo ? Number(data.HRME_MobileNo) : undefined,
                LogInUserId: 5
            },
            {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || 'Employee added successfully');
                        reset();
                        onSuccess();
                    } else {
                        toast.error(response.message || 'Failed to add employee');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'An error occurred');
                }
            }
        );
    };

    const handleReset = () => {
        reset();
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
                        {/* Employee Code */}
                        <InputText
                            label='Employee Code'
                            required
                            id='HRME_EmployeeCode'
                            placeholder='Enter employee code'
                            {...register('HRME_EmployeeCode')}
                            error={errors.HRME_EmployeeCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* First Name */}
                        <InputText
                            label='First Name'
                            required
                            id='HRME_EmployeeFirstName'
                            placeholder='Enter first name'
                            {...register('HRME_EmployeeFirstName')}
                            error={errors.HRME_EmployeeFirstName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Middle Name */}
                        <InputText
                            label='Middle Name'
                            id='HRME_EmployeeMiddleName'
                            placeholder='Enter middle name'
                            {...register('HRME_EmployeeMiddleName')}
                            error={errors.HRME_EmployeeMiddleName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Last Name */}
                        <InputText
                            label='Last Name'
                            id='HRME_EmployeeLastName'
                            placeholder='Enter last name'
                            {...register('HRME_EmployeeLastName')}
                            error={errors.HRME_EmployeeLastName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Employee Type */}
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
                                            {employeeTypes.map((type: any) => (
                                                <SelectItem
                                                    key={type.HRMET_Id || type.hrmET_Id}
                                                    value={String(type.HRMET_Id || type.hrmET_Id)}>
                                                    {type.HRMET_EmployeeType || type.hrmET_EmployeeType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMET_Id && <FormError>{errors.HRMET_Id.message}</FormError>}
                        </div>

                        {/* Group Type */}
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
                                            {groupTypes.map((group: any) => (
                                                <SelectItem
                                                    key={group.HRMGT_Id || group.hrmgT_Id}
                                                    value={String(group.HRMGT_Id || group.hrmgT_Id)}>
                                                    {group.HRMGT_EmployeeGroupType || group.hrmgT_EmployeeGroupType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMGT_Id && <FormError>{errors.HRMGT_Id.message}</FormError>}
                        </div>

                        {/* Department */}
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
                                            {departments.map((dept: any) => (
                                                <SelectItem key={dept.HRMD_Id || dept.hrmD_Id} value={String(dept.HRMD_Id || dept.hrmD_Id)}>
                                                    {dept.HRMD_DepartmentName || dept.hrmD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMD_Id && <FormError>{errors.HRMD_Id.message}</FormError>}
                        </div>

                        {/* Designation */}
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
                                            {designations.map((desig: any) => (
                                                <SelectItem
                                                    key={desig.HRMDES_Id || desig.hrmdeS_Id}
                                                    value={String(desig.HRMDES_Id || desig.hrmdeS_Id)}>
                                                    {desig.HRMDES_DesignationName || desig.hrmdeS_DesignationName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMDES_Id && <FormError>{errors.HRMDES_Id.message}</FormError>}
                        </div>

                        {/* Grade */}
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
                                            {grades.map((grade: any) => (
                                                <SelectItem
                                                    key={grade.HRMG_Id || grade.hrmG_Id}
                                                    value={String(grade.HRMG_Id || grade.hrmG_Id)}>
                                                    {grade.HRMG_GradeName || grade.hrmG_GradeName}
                                                </SelectItem>
                                            ))}
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
                        {/* Date of Birth */}
                        <InputText
                            label='Date of Birth'
                            type='date'
                            id='HRME_DOB'
                            {...register('HRME_DOB')}
                            error={errors.HRME_DOB?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Date of Joining */}
                        <InputText
                            label='Date of Joining'
                            type='date'
                            id='HRME_DOJ'
                            {...register('HRME_DOJ')}
                            error={errors.HRME_DOJ?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Gender */}
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
                                            {genders.map((gender: any) => (
                                                <SelectItem
                                                    key={gender.IVRMMG_Id || gender.ivrmmmG_Id}
                                                    value={String(gender.IVRMMG_Id || gender.ivrmmmG_Id)}>
                                                    {gender.IVRMMG_GenderName || gender.ivrmmmG_GenderName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRMMG_Id && <FormError>{errors.IVRMMG_Id.message}</FormError>}
                        </div>

                        {/* Marital Status */}
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
                                            {maritalStatuses.map((status: any) => (
                                                <SelectItem
                                                    key={status.IVRMMMS_Id || status.ivrmmmsId}
                                                    value={String(status.IVRMMMS_Id || status.ivrmmmsId)}>
                                                    {status.IVRMMMS_MaritalStatus || status.ivrmmms_MaritalStatus}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRMMMS_Id && <FormError>{errors.IVRMMMS_Id.message}</FormError>}
                        </div>

                        {/* Religion */}
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
                                            {religions.map((religion: any) => (
                                                <SelectItem
                                                    key={religion.IVRMMR_Id || religion.religionId}
                                                    value={String(religion.IVRMMR_Id || religion.religionId)}>
                                                    {religion.IVRMMR_Name || religion.religionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ReligionId && <FormError>{errors.ReligionId.message}</FormError>}
                        </div>

                        {/* Blood Group */}
                        <InputText
                            label='Blood Group'
                            id='HRME_BloodGroup'
                            placeholder='Enter blood group'
                            {...register('HRME_BloodGroup')}
                            error={errors.HRME_BloodGroup?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Father Name */}
                        <InputText
                            label='Father Name'
                            id='HRME_FatherName'
                            placeholder='Enter father name'
                            {...register('HRME_FatherName')}
                            error={errors.HRME_FatherName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Mother Name */}
                        <InputText
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
                        {/* Mobile Number */}
                        <InputText
                            label='Mobile Number'
                            type='tel'
                            id='HRME_MobileNo'
                            placeholder='Enter mobile number'
                            {...register('HRME_MobileNo')}
                            error={errors.HRME_MobileNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Email ID */}
                        <InputText
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
                        {/* PF Applicable */}
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

                        {/* ESI Applicable */}
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

                        {/* Teaching Staff */}
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

                        {/* Active */}
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
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Employee
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
