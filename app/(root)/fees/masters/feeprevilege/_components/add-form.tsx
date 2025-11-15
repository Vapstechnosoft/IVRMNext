'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropdown,
    useFeeMasterGroupwiseAutoReceiptDropDown,
    useRolesDropdown,
    useUserNameDropdown
} from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { CheckSquare, RotateCcw, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface DropdownOption {
    value: string;
    label: string;
}

interface UserOption {
    userId: number;
    normalizedUserName: string;
}

interface AddMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
}

type FormFields = {
    academicYear: string;
    group: string;
    roles: string;
    users: string[];
};

export default function AddFeePrivilegeForm({ onSuccess, className = '' }: AddMasterClassFormProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        trigger,
        reset
    } = useForm<FormFields>({
        defaultValues: {
            academicYear: '',
            group: '',
            roles: '',
            users: []
        }
    });

    const academicYear = watch('academicYear');
    const group = watch('group');
    const roles = watch('roles');
    const usersValue = watch('users');

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: rolesData, isLoading: loadingRoles, error: rolesError } = useRolesDropdown();

    const {
        data: groupData,
        isLoading: loadingGroupData,
        error: groupDataError
    } = useFeeMasterGroupwiseAutoReceiptDropDown(Number(academicYear));

    const { data: userNameData, isLoading: loadingUserNames, error: userNameError } = useUserNameDropdown(Number(roles || 0));

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [academicYearOptions, setAcademicYearOptions] = useState<DropdownOption[]>([]);
    const [roleOptions, setRoleOptions] = useState<DropdownOption[]>([]);
    const [groupOptions, setGroupOptions] = useState<DropdownOption[]>([]);
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

    useEffect(() => {
        setIsLoadingDropdowns(loadingAcademic || loadingRoles);
    }, [loadingAcademic, loadingRoles]);

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYearOptions([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const opts = academicData.data.map((i: any) => ({
                value: i.asmaY_Id.toString(),
                label: i.asmaY_Year
            }));
            setAcademicYearOptions(opts);
        } else {
            setAcademicYearOptions([]);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (rolesError) {
            toast.error(rolesError.message || 'Error fetching roles');
            setRoleOptions([]);
            return;
        }
        if (rolesData?.data && Array.isArray(rolesData.data)) {
            const opts = rolesData.data
                .map((i: any) => ({
                    value: i.ivrmrT_Id?.toString() || '',
                    label: i.ivrmrT_Role || 'Unknown Role'
                }))
                .filter((o) => o.value);
            setRoleOptions(opts);
        } else {
            setRoleOptions([]);
        }
    }, [rolesData, rolesError]);

    useEffect(() => {
        if (groupDataError) {
            toast.error(groupDataError.message || 'Error fetching groups');
            setGroupOptions([]);
            return;
        }
        if (groupData?.data && Array.isArray(groupData.data)) {
            const opts = groupData.data.map((g: any) => ({
                value: g.fmG_Id.toString(),
                label: g.fmG_GroupName
            }));
            setGroupOptions(opts);
        } else {
            setGroupOptions([]);
        }
    }, [groupData, groupDataError, academicYear]);

    useEffect(() => {
        if (userNameError) {
            toast.error(userNameError.message || 'Error fetching users');
            setUserOptions([]);
            return;
        }
        if (userNameData?.data && Array.isArray(userNameData.data)) {
            const opts = userNameData.data.map((i: any) => ({
                userId: i.userId,
                normalizedUserName: i.normalizedUserName
            }));
            setUserOptions(opts);
        } else {
            setUserOptions([]);
        }
    }, [userNameData, userNameError, roles]);

    const filteredUsers = userOptions.filter((u) => u.normalizedUserName.toLowerCase().includes(userSearch.toLowerCase()));

    const toggleUser = (id: string) => {
        const cur = usersValue || [];
        const updated = cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id];
        setValue('users', updated, { shouldValidate: hasSubmitted });
    };

    const selectAllUsers = () => {
        if ((usersValue || []).length === userOptions.length && userOptions.length) {
            setValue('users', [], { shouldValidate: hasSubmitted });
        } else {
            const all = userOptions.map((u) => u.userId.toString());
            setValue('users', all, { shouldValidate: hasSubmitted });
        }
    };

    const handleReset = () => {
        reset();
        setUserSearch('');
        setHasSubmitted(false);
    };

    const handleFormSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        setHasSubmitted(true);
        const ok = await trigger();
        if (ok) handleSubmit(onSubmit)();
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                asmaY_Id: Number(data.academicYear),
                fmG_Id: Number(data.group),
                roleId: Number(data.roles),
                saveuser: data.users.map((u) => ({ userId: Number(u) }))
            };

            console.log('Payload →', payload);
            toast.success('Privilege saved successfully');
            handleReset();
            onSuccess?.();
        } catch (err: any) {
            toast.error(err.message || 'Error saving privilege');
        }
    };

    return (
        <div className={`${className} w-full`}>
            <Card className='mx-auto w-full max-w-8xl border-gray-300 shadow-md'>
                <CardContent className='p-6'>
                    <div className='space-y-6'>
                        {/* ---------- Academic Year ---------- */}
                        <div>
                            <Label htmlFor='academicYear'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(v) => {
                                    setValue('academicYear', v, { shouldValidate: hasSubmitted });
                                    setValue('group', '');
                                }}
                                value={academicYear}
                                disabled={isLoadingDropdowns}>
                                <SelectTrigger
                                    id='academicYear'
                                    className={cn('mt-1 w-full', errors.academicYear ? 'border-red-500' : 'border-gray-300')}>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {hasSubmitted && errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                        </div>

                        {/* ---------- Group (Dropdown) - Right after Academic Year ---------- */}
                        {academicYear && (
                            <div>
                                <Label htmlFor='group'>
                                    Group <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(v) => setValue('group', v, { shouldValidate: hasSubmitted })}
                                    value={group}
                                    disabled={loadingGroupData}>
                                    <SelectTrigger
                                        id='group'
                                        className={cn('mt-1 w-full', errors.group ? 'border-red-500' : 'border-gray-300')}>
                                        <SelectValue placeholder='Select Group' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingGroupData ? (
                                            <div className='px-3 py-2 text-gray-500 text-sm'>Loading groups...</div>
                                        ) : groupOptions.length === 0 ? (
                                            <div className='px-3 py-2 text-gray-500 text-sm'>No groups available</div>
                                        ) : (
                                            groupOptions.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {hasSubmitted && errors.group && <FormError>{errors.group.message}</FormError>}
                            </div>
                        )}

                        {/* ---------- Role ---------- */}
                        <div>
                            <Label htmlFor='roles'>
                                Role <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                onValueChange={(v) => {
                                    setValue('roles', v, { shouldValidate: hasSubmitted });
                                    setValue('users', []);
                                    setUserSearch('');
                                }}
                                value={roles}
                                disabled={isLoadingDropdowns}>
                                <SelectTrigger
                                    id='roles'
                                    className={cn('mt-1 w-full', errors.roles ? 'border-red-500' : 'border-gray-300')}>
                                    <SelectValue placeholder='Select Role' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingRoles ? (
                                        <div className='px-3 py-2 text-gray-500 text-sm'>Loading roles...</div>
                                    ) : roleOptions.length === 0 ? (
                                        <div className='px-3 py-2 text-gray-500 text-sm'>No roles</div>
                                    ) : (
                                        roleOptions.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {o.label}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {hasSubmitted && errors.roles && <FormError>{errors.roles.message}</FormError>}
                        </div>

                        {/* ---------- Users (only when role selected) ---------- */}
                        {roles && (
                            <div>
                                <Label>
                                    Select Users <span className='text-red-500'>*</span>
                                </Label>
                                <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                                    <InputText
                                        placeholder='Search Users...'
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className='mb-3'
                                    />

                                    {/* Select All */}
                                    <div
                                        onClick={selectAllUsers}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            (usersValue || []).length === userOptions.length && userOptions.length
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {(usersValue || []).length === userOptions.length && userOptions.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>

                                    <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                        {loadingUserNames ? (
                                            <div className='py-4 text-center text-gray-500 text-sm'>Loading users...</div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className='py-4 text-center text-gray-500 text-sm'>No users found</div>
                                        ) : (
                                            filteredUsers.map((u) => {
                                                const id = u.userId.toString();
                                                const selected = (usersValue || []).includes(id);
                                                return (
                                                    <div
                                                        key={u.userId}
                                                        onClick={() => toggleUser(id)}
                                                        className={cn(
                                                            'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                            selected
                                                                ? 'border-primary bg-primary/5 text-primary'
                                                                : 'border-gray-300 hover:border-primary/40'
                                                        )}>
                                                        {selected ? (
                                                            <CheckSquare className='h-4 w-4 text-primary' />
                                                        ) : (
                                                            <Square className='h-4 w-4 text-gray-400' />
                                                        )}
                                                        <span>{u.normalizedUserName}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                {hasSubmitted && errors.users && <FormError>{errors.users.message}</FormError>}
                            </div>
                        )}

                        {/* ---------- Buttons ---------- */}
                        <div className='mt-3 flex justify-start gap-3 border-t pt-5'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className='flex w-fit items-center gap-2'>
                                <RotateCcw className='h-4 w-4' />
                                Reset
                            </Button>
                            <Button onClick={handleFormSubmit} disabled={isSubmitting} className='flex w-fit items-center gap-2'>
                                <Save className='h-4 w-4' />
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
