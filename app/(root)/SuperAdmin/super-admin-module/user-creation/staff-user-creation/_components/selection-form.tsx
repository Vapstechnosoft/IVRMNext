'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InstitutionDTO, RoleTypeDTO, StaffDTO, TrustDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { Controller, useFormContext } from 'react-hook-form';

interface SelectionFormProps {
    roleTypes: RoleTypeDTO[];
    trusts: TrustDTO[];
    institutions: InstitutionDTO[];
    staffList: StaffDTO[];
}

export default function SelectionForm({ roleTypes, trusts, institutions, staffList }: SelectionFormProps) {
    const {
        control,
        formState: { errors }
    } = useFormContext();

    return (
        <div className='grid grid-cols-1 gap-6 rounded-lg border border-gray-200 bg-gray-50 p-6 md:grid-cols-2'>
            {/* Role Type */}
            <div className='space-y-2'>
                <Label className='font-semibold text-sm'>
                    Select Role Type: <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    control={control}
                    name='roleType'
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className='bg-white'>
                                <SelectValue placeholder='-- SELECT ROLE --' />
                            </SelectTrigger>
                            <SelectContent>
                                {roleTypes.map((role) => (
                                    <SelectItem key={role.ivrmrT_Id} value={String(role.ivrmrT_Id)}>
                                        {role.ivrmrT_Role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.roleType && <p className='font-medium text-red-500 text-xs'>{errors.roleType.message as string}</p>}
            </div>

            {/* Selection Mode (Single/Multiple) */}
            <div className='space-y-4'>
                <Label className='font-semibold text-sm italic'>Individual Or Multiple Staff Mapping:</Label>
                <Controller
                    control={control}
                    name='filterData'
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6 pt-2'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Single' id='r1' />
                                <Label htmlFor='r1' className='cursor-pointer'>
                                    Individual Staff
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Multiple' id='r2' />
                                <Label htmlFor='r2' className='cursor-pointer'>
                                    Multiple Staff
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            {/* Trust (Conditional) */}
            <div className='space-y-2'>
                <Label className='font-semibold text-sm'>Select Trust Name:</Label>
                <Controller
                    control={control}
                    name='trust'
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className='bg-white'>
                                <SelectValue placeholder='-- SELECT TRUST --' />
                            </SelectTrigger>
                            <SelectContent>
                                {trusts.map((trust) => (
                                    <SelectItem key={trust.mO_Id} value={String(trust.mO_Id)}>
                                        {trust.mO_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Institution */}
            <div className='space-y-2'>
                <Label className='font-semibold text-sm'>
                    Select Institution Name: <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    control={control}
                    name='institution'
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className='bg-white'>
                                <SelectValue placeholder='-- SELECT INSTITUTION --' />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions.map((inst) => (
                                    <SelectItem key={inst.mI_Id} value={String(inst.mI_Id)}>
                                        {inst.mI_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.institution && <p className='font-medium text-red-500 text-xs'>{errors.institution.message as string}</p>}
            </div>

            {/* Staff Selection (Searchable Select or Standard Select for now) */}
            <div className='max-w-md space-y-2 md:col-span-2'>
                <Label className='font-semibold text-sm'>
                    Select Staff Name: <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    control={control}
                    name='staffId'
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={control._formValues.filterData === 'Multiple'}>
                            <SelectTrigger className='bg-white'>
                                <SelectValue placeholder='-- SELECT STAFF --' />
                            </SelectTrigger>
                            <SelectContent>
                                {staffList.map((staff) => (
                                    <SelectItem key={staff.hrmE_Id} value={String(staff.hrmE_Id)}>
                                        {staff.stafname}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </div>
    );
}
