'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeFeePrevilegeList,
    useCollegeFeePrivilegeAcademicYears,
    useCollegeFeePrivilegeFeeGroups,
    useCollegeFeePrivilegeFeeHeads,
    useCollegeFeePrivilegeUsersByRole
} from '@/hooks/fees/college/useMasters';
import { cn } from '@/lib/utils';
import { collegeFeePrevilegeSchema } from '@/schemas/fees/college/masters/masterclgfeeprevilege';
import { saveCollegeFeePrivilege } from '@/server/fees/college/masters/masterclgfeeprevilege';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, RotateCcw, Save, Search, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeePrivilegeFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof collegeFeePrevilegeSchema.addOrUpdate>;

export default function AddCollegeFeePrivilegeForm({ onSuccess, pageData, className = '' }: AddCollegeFeePrivilegeFormProps) {
    const { refetchAll } = useCollegeFeePrevilegeList();
    const { data: academicYearsData, isLoading: isAcademicYearsLoading } = useCollegeFeePrivilegeAcademicYears();
    const { data: feeGroupsData, isLoading: isFeeGroupsLoading } = useCollegeFeePrivilegeFeeGroups();
    const { data: feeHeadsData, isLoading: isFeeHeadsLoading } = useCollegeFeePrivilegeFeeHeads();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeePrevilegeSchema.addOrUpdate),
        defaultValues: {
            academicYear: '',
            group: '',
            heads: [],
            roles: '',
            users: []
        }
    });

    const selectedRole = watch('roles');
    const selectedHeads = watch('heads') || [];
    const selectedUsers = watch('users') || [];

    const { data: userData, isLoading: isUserLoading } = useCollegeFeePrivilegeUsersByRole(selectedRole ? Number(selectedRole) : undefined);

    const [headSearchTerm, setHeadSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const effectiveData = useMemo(() => {
        return pageData?.data || pageData || {};
    }, [pageData]);

    // Extract dropdown lists from specific APIs with fallback to all details
    const academicYears = useMemo(() => {
        const fromApi =
            (academicYearsData?.data as any)?.adcyear ||
            (academicYearsData as any)?.adcyear ||
            (academicYearsData?.data as any) ||
            academicYearsData;
        if (Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
        const raw = effectiveData?.adcyear || [];
        return Array.isArray(raw) ? raw : [];
    }, [academicYearsData, effectiveData]);

    const groups = useMemo(() => {
        const fromApi =
            (feeGroupsData?.data as any)?.group || (feeGroupsData as any)?.group || (feeGroupsData?.data as any) || feeGroupsData;
        if (Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
        const raw = effectiveData?.group || [];
        return Array.isArray(raw) ? raw : [];
    }, [feeGroupsData, effectiveData]);

    const heads = useMemo(() => {
        const fromApi =
            (feeHeadsData?.data as any)?.head ||
            (feeHeadsData?.data as any)?.feeheads ||
            (feeHeadsData as any)?.head ||
            (feeHeadsData as any)?.feeheads ||
            (feeHeadsData?.data as any) ||
            feeHeadsData;
        if (Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
        const raw = effectiveData?.head || effectiveData?.feeheads || [];
        return Array.isArray(raw) ? raw : [];
    }, [feeHeadsData, effectiveData]);

    const roles = useMemo(() => {
        const raw = effectiveData?.role || effectiveData?.roles || [];
        return Array.isArray(raw) ? raw : [];
    }, [effectiveData]);

    const users = useMemo(() => {
        const raw =
            (userData?.data as any)?.usnam ||
            (userData?.data as any)?.userlist ||
            (userData as any)?.usnam ||
            (userData as any)?.userlist ||
            (userData?.data as any) ||
            userData ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [userData]);

    // Reset selected users when role changes
    useEffect(() => {
        setValue('users', [], { shouldValidate: false });
        setUserSearchTerm('');
    }, [selectedRole, setValue]);

    // Filter heads based on search
    const filteredHeads = useMemo(() => {
        if (!headSearchTerm.trim()) return heads;
        return heads.filter((h: any) => (h.fmH_FeeName || '').toLowerCase().includes(headSearchTerm.trim().toLowerCase()));
    }, [heads, headSearchTerm]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) return users;
        return users.filter((u: any) =>
            (u.normalizedUserName || u.userName || u.normalized_UserName || '').toLowerCase().includes(userSearchTerm.trim().toLowerCase())
        );
    }, [users, userSearchTerm]);

    // Head selection handlers
    const isAllHeadsSelected = heads.length > 0 && heads.every((h: any) => selectedHeads.includes(h.fmH_Id.toString()));

    const handleSelectAllHeads = () => {
        if (isAllHeadsSelected) {
            setValue('heads', [], { shouldValidate: true });
        } else {
            const allIds = heads.map((h: any) => h.fmH_Id.toString());
            setValue('heads', allIds, { shouldValidate: true });
        }
    };

    const handleToggleHead = (id: string) => {
        const current = selectedHeads || [];
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        setValue('heads', next, { shouldValidate: true });
    };

    // User selection handlers
    const isAllUsersSelected =
        users.length > 0 && users.every((u: any) => selectedUsers.includes((u.userId ?? u.user_Id ?? u.id).toString()));

    const handleSelectAllUsers = () => {
        if (isAllUsersSelected) {
            setValue('users', [], { shouldValidate: true });
        } else {
            const allIds = users.map((u: any) => (u.userId ?? u.user_Id ?? u.id).toString());
            setValue('users', allIds, { shouldValidate: true });
        }
    };

    const handleToggleUser = (id: string) => {
        const current = selectedUsers || [];
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        setValue('users', next, { shouldValidate: true });
    };

    const handleReset = () => {
        reset({
            academicYear: '',
            group: '',
            heads: [],
            roles: '',
            users: []
        });
        setHeadSearchTerm('');
        setUserSearchTerm('');
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                fgL_Id: 0,
                FGL_Id: 0,
                ASMAY_Id: Number(data.academicYear),
                asmaY_Id: Number(data.academicYear),
                fmG_ID: Number(data.group),
                FMG_ID: Number(data.group),
                IVRMRT_Id: Number(data.roles),
                ivrmrT_Id: Number(data.roles),
                grouphead: data.heads.map((id) => ({ fmH_Id: Number(id), FMH_Id: Number(id) })),
                username: data.users.map((id) => ({ userId: Number(id), UserId: Number(id) }))
            };

            const response = await saveCollegeFeePrivilege(payload);
            const res = response as any;

            if (res?.returnval === true && res?.fgL_Id > 0) {
                toast.success('Record Updated Successfully');
                refetchAll();
                handleReset();
                onSuccess?.();
            } else if (res?.returnval === true || res?.success) {
                toast.success('Record Saved Successfully');
                refetchAll();
                handleReset();
                onSuccess?.();
            } else if (res?.returnval === false && res?.returnduplicatestatus === 'Duplicate') {
                toast.error('Record Already Exist');
            } else {
                toast.error(res?.message || 'Record Not Saved Successfully');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to save fee privilege');
        }
    };

    return (
        <Card className={cn('border-none shadow-none', className)}>
            <CardContent className='p-0'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Left Column: Academic Year, Group, Head */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='academicYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={academicYears.length === 0 && isAcademicYearsLoading}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Academic Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((ay: any) => (
                                                    <SelectItem key={ay.asmaY_Id} value={ay.asmaY_Id.toString()}>
                                                        {ay.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.academicYear?.message}</FormError>
                            </div>

                            {/* Group */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Group <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='group'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={groups.length === 0 && isFeeGroupsLoading}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Group--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((g: any) => (
                                                    <SelectItem key={g.fmG_Id} value={g.fmG_Id.toString()}>
                                                        {g.fmG_GroupName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.group?.message}</FormError>
                            </div>

                            {/* Fee Heads Multi-Select */}
                            <div className='space-y-1.5'>
                                <div className='flex items-center justify-between'>
                                    <Label className='font-medium text-sm'>
                                        Head <span className='text-destructive'>*</span>
                                    </Label>
                                    <span className='text-muted-foreground text-xs'>
                                        {selectedHeads.length} of {heads.length} selected
                                    </span>
                                </div>

                                <div className='rounded-md border border-input bg-background p-3 shadow-sm'>
                                    {/* Search input & Select All */}
                                    <div className='mb-2 flex items-center justify-between gap-2 border-b pb-2'>
                                        <div className='relative flex-1'>
                                            <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                            <InputText
                                                placeholder='Search Head...'
                                                value={headSearchTerm}
                                                onChange={(e) => setHeadSearchTerm(e.target.value)}
                                                className='h-8 pl-8 text-xs'
                                            />
                                        </div>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={handleSelectAllHeads}
                                            disabled={heads.length === 0}
                                            className='h-8 text-xs'>
                                            {isAllHeadsSelected ? (
                                                <>
                                                    <CheckSquare className='mr-1.5 h-3.5 w-3.5 text-primary' /> Deselect All
                                                </>
                                            ) : (
                                                <>
                                                    <Square className='mr-1.5 h-3.5 w-3.5' /> Select All
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Heads list */}
                                    <div className='max-h-48 space-y-1 overflow-y-auto pr-1'>
                                        {isFeeHeadsLoading && heads.length === 0 ? (
                                            <div className='py-4 text-center text-muted-foreground text-xs'>Loading heads...</div>
                                        ) : filteredHeads.length === 0 ? (
                                            <div className='py-4 text-center text-muted-foreground text-xs'>
                                                {heads.length === 0 ? 'No heads available' : 'No matching heads found'}
                                            </div>
                                        ) : (
                                            filteredHeads.map((head: any) => {
                                                const idStr = head.fmH_Id.toString();
                                                const isChecked = selectedHeads.includes(idStr);
                                                return (
                                                    <label
                                                        key={head.fmH_Id}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70',
                                                            isChecked && 'bg-primary/10 font-medium text-primary'
                                                        )}>
                                                        <input
                                                            type='checkbox'
                                                            className='h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary'
                                                            checked={isChecked}
                                                            onChange={() => handleToggleHead(idStr)}
                                                        />
                                                        <span>{head.fmH_FeeName}</span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <FormError>{errors.heads?.message}</FormError>
                            </div>
                        </div>

                        {/* Right Column: Roles, User Name */}
                        <div className='space-y-4'>
                            {/* Roles */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Roles <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='roles'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={roles.length === 0}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Role--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r: any) => (
                                                    <SelectItem key={r.ivrmrT_Id} value={r.ivrmrT_Id.toString()}>
                                                        {r.ivrmrT_Role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.roles?.message}</FormError>
                            </div>

                            {/* User Name Multi-Select */}
                            {selectedRole && (
                                <div className='fade-in-50 animate-in space-y-1.5 duration-200'>
                                    <div className='flex items-center justify-between'>
                                        <Label className='font-medium text-sm'>
                                            User Name <span className='text-destructive'>*</span>
                                        </Label>
                                        <span className='text-muted-foreground text-xs'>
                                            {selectedUsers.length} of {users.length} selected
                                        </span>
                                    </div>

                                    <div className='rounded-md border border-input bg-background p-3 shadow-sm'>
                                        {/* Search input & Select All */}
                                        <div className='mb-2 flex items-center justify-between gap-2 border-b pb-2'>
                                            <div className='relative flex-1'>
                                                <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                                <InputText
                                                    placeholder='Search User...'
                                                    value={userSearchTerm}
                                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                                    className='h-8 pl-8 text-xs'
                                                />
                                            </div>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={handleSelectAllUsers}
                                                disabled={users.length === 0 || isUserLoading}
                                                className='h-8 text-xs'>
                                                {isAllUsersSelected ? (
                                                    <>
                                                        <CheckSquare className='mr-1.5 h-3.5 w-3.5 text-primary' /> Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className='mr-1.5 h-3.5 w-3.5' /> Select All
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Users list */}
                                        <div className='max-h-48 space-y-1 overflow-y-auto pr-1'>
                                            {isUserLoading ? (
                                                <div className='py-4 text-center text-muted-foreground text-xs'>Loading users...</div>
                                            ) : filteredUsers.length === 0 ? (
                                                <div className='py-4 text-center text-muted-foreground text-xs'>
                                                    {users.length === 0 ? 'No users found for this role' : 'No matching users found'}
                                                </div>
                                            ) : (
                                                filteredUsers.map((user: any) => {
                                                    const userId = user.userId ?? user.user_Id ?? user.id;
                                                    const userName =
                                                        user.normalizedUserName ??
                                                        user.userName ??
                                                        user.normalized_UserName ??
                                                        `User ${userId}`;
                                                    const idStr = userId.toString();
                                                    const isChecked = selectedUsers.includes(idStr);
                                                    return (
                                                        <label
                                                            key={userId}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70',
                                                                isChecked && 'bg-primary/10 font-medium text-primary'
                                                            )}>
                                                            <input
                                                                type='checkbox'
                                                                className='h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary'
                                                                checked={isChecked}
                                                                onChange={() => handleToggleUser(idStr)}
                                                            />
                                                            <span>{userName}</span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    <FormError>{errors.users?.message}</FormError>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-center gap-4 border-t pt-4'>
                        <Button type='submit' isLoading={isSubmitting} className='min-w-28'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </Button>
                        <Button type='button' variant='outline' onClick={handleReset} className='min-w-28'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
