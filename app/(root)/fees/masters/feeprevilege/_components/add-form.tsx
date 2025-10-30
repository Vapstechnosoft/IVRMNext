'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, ChevronsUpDown, Save, Search, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useGroupsDropdown, useRolesDropdown } from '@/hooks/fees/useMasters';
import { feePrivilegeSchema } from '@/schemas/fees/masters';
import { addOrUpdateFeePrivilege } from '@/server/fees/masters/fee_previlege';
import type { IMasterGroupDropdown, IMasterRoleDropdown } from '@/types/fees/masters/masters';
import type { z } from 'zod';

type FeePrivilegeFormFields = z.infer<typeof feePrivilegeSchema.addOrUpdate> & {
    demoIds?: number[];
};

// Hardcoded Fee Groups data
const hardcodedFeeGroups: IMasterGroupDropdown[] = [
    { groupId: 1, groupName: 'Tuition Fees' },
    { groupId: 2, groupName: 'Transportation Fees' },
    { groupId: 3, groupName: 'Library Fees' },
    { groupId: 4, groupName: 'Lab Fees' }
];

// Hardcoded Demo data
const hardcodedDemoItems: { demoId: number; demoName: string }[] = [
    { demoId: 1, demoName: 'Demo Item A' },
    { demoId: 2, demoName: 'Demo Item B' },
    { demoId: 3, demoName: 'Demo Item C' },
    { demoId: 4, demoName: 'Demo Item D' }
];

export default function AddFeePrivilegeForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const { data: academicYears, isLoading: loadingAY } = useAcademicYearDropdown();
    const { data: groups, isLoading: loadingGroups } = useGroupsDropdown();
    const { data: rolesData, isLoading: loadingRoles } = useRolesDropdown();
    const roles: IMasterRoleDropdown[] = rolesData?.data ?? [];

    const [isFeeGroupOpen, setIsFeeGroupOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const [searchGroup, setSearchGroup] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [searchDemo, setSearchDemo] = useState('');

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FeePrivilegeFormFields>({
        resolver: zodResolver(feePrivilegeSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FeePrivilegeFormFields> = async (data) => {
        try {
            const response = await addOrUpdateFeePrivilege(data);
            if (response.success) {
                toast.success(response.message);
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='academicYearId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingAY ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : (
                                        academicYears?.data?.map((a) => (
                                            <SelectItem key={a.asmaY_Id} value={a.asmaY_Id.toString()}>
                                                {a.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                </div>

                {/* Group */}
                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Group <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='groupId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Group' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingGroups ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : (
                                        groups?.data?.map((g: IMasterGroupDropdown) => (
                                            <SelectItem key={g.groupId} value={g.groupId.toString()}>
                                                {g.groupName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.groupId && <FormError>{errors.groupId.message}</FormError>}
                </div>

                {/* Fee Groups Multiselect */}
                <Controller
                    name='feeGroupIds'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Fee Groups <span className='text-red-500'>*</span>
                            </Label>
                            <Popover open={isFeeGroupOpen} onOpenChange={setIsFeeGroupOpen}>
                                <PopoverTrigger asChild>
                                    <Button type='button' variant='outline' className='justify-between'>
                                        {field.value?.length ? `${field.value.length} selected` : 'Select Fee Groups'}
                                        <ChevronsUpDown className='h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[280px] p-2'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                        <Input
                                            value={searchGroup}
                                            onChange={(e) => setSearchGroup(e.target.value)}
                                            placeholder='Search fee groups...'
                                            className='pl-8 text-sm'
                                        />
                                    </div>

                                    <div
                                        onClick={() => {
                                            const allIds = hardcodedFeeGroups.map((g) => g.groupId);
                                            field.onChange(field.value?.length === allIds.length ? [] : allIds);
                                        }}
                                        className='mb-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50'>
                                        {field.value?.length === hardcodedFeeGroups.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>

                                    {hardcodedFeeGroups
                                        .filter((g) => g.groupName.toLowerCase().includes(searchGroup.toLowerCase()))
                                        .map((g) => {
                                            const selected = field.value?.includes(g.groupId);
                                            return (
                                                <div
                                                    key={g.groupId}
                                                    onClick={() =>
                                                        field.onChange(
                                                            selected
                                                                ? (field.value || []).filter((v) => v !== g.groupId)
                                                                : [...(field.value || []), g.groupId]
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                                                        selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{g.groupName}</span>
                                                </div>
                                            );
                                        })}
                                </PopoverContent>
                            </Popover>
                            {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                        </div>
                    )}
                />

                {/* Roles Multiselect */}
                <Controller
                    name='roleIds'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Roles <span className='text-red-500'>*</span>
                            </Label>
                            <Popover open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                                <PopoverTrigger asChild>
                                    <Button type='button' variant='outline' className='justify-between'>
                                        {field.value?.length ? `${field.value.length} selected` : 'Select Roles'}
                                        <ChevronsUpDown className='h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[280px] p-2'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                        <Input
                                            value={searchRole}
                                            onChange={(e) => setSearchRole(e.target.value)}
                                            placeholder='Search roles...'
                                            className='pl-8 text-sm'
                                        />
                                    </div>
                                    <div
                                        onClick={() => {
                                            const allIds = roles.map((r: IMasterRoleDropdown) => r.roleId);
                                            field.onChange(field.value?.length === allIds.length ? [] : allIds);
                                        }}
                                        className='mb-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50'>
                                        {field.value?.length === roles.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                    {roles
                                        .filter((r) => r.roleName.toLowerCase().includes(searchRole.toLowerCase()))
                                        .map((r) => {
                                            const selected = field.value?.includes(r.roleId);
                                            return (
                                                <div
                                                    key={r.roleId}
                                                    onClick={() =>
                                                        field.onChange(
                                                            selected
                                                                ? (field.value || []).filter((v) => v !== r.roleId)
                                                                : [...(field.value || []), r.roleId]
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                                                        selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{r.roleName}</span>
                                                </div>
                                            );
                                        })}
                                </PopoverContent>
                            </Popover>
                            {errors.roleIds && <FormError>{errors.roleIds.message}</FormError>}
                        </div>
                    )}
                />

                {/* Demo Multiselect */}
                <Controller
                    name='demoIds'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Demo <span className='text-red-500'>*</span>
                            </Label>
                            <Popover open={isDemoOpen} onOpenChange={setIsDemoOpen}>
                                <PopoverTrigger asChild>
                                    <Button type='button' variant='outline' className='justify-between'>
                                        {field.value?.length ? `${field.value.length} selected` : 'Select Demo Items'}
                                        <ChevronsUpDown className='h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[280px] p-2'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                        <Input
                                            value={searchDemo}
                                            onChange={(e) => setSearchDemo(e.target.value)}
                                            placeholder='Search demo items...'
                                            className='pl-8 text-sm'
                                        />
                                    </div>
                                    <div
                                        onClick={() => {
                                            const allIds = hardcodedDemoItems.map((d) => d.demoId);
                                            field.onChange(field.value?.length === allIds.length ? [] : allIds);
                                        }}
                                        className='mb-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50'>
                                        {field.value?.length === hardcodedDemoItems.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                    {hardcodedDemoItems
                                        .filter((d) => d.demoName.toLowerCase().includes(searchDemo.toLowerCase()))
                                        .map((d) => {
                                            const selected = field.value?.includes(d.demoId);
                                            return (
                                                <div
                                                    key={d.demoId}
                                                    onClick={() =>
                                                        field.onChange(
                                                            selected
                                                                ? (field.value || []).filter((v) => v !== d.demoId)
                                                                : [...(field.value || []), d.demoId]
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                                                        selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{d.demoName}</span>
                                                </div>
                                            );
                                        })}
                                </PopoverContent>
                            </Popover>
                            {errors.demoIds && <FormError>{errors.demoIds.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save Fee Privilege
                    </div>
                </Button>
            </div>
        </form>
    );
}
