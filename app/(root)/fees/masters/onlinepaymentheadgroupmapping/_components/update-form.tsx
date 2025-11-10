'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useMasterOnlinePaymentHeadGroup,
    useMasterOnlinePaymentHeadGroupClass,
    useMasterOnlinePaymentHeadGroupGroupName,
    useMasterOnlinePaymentHeadGroupHeadName,
    useMasterOnlinePaymentHeadGroupInstallment,
    useMasterOnlinePaymentHeadGroupSubMerchant,
    useMasterTerms
} from '@/hooks/fees/useMasters';
import { masterOnlinePaymentHeadGroupSchema } from '@/schemas/fees/masters';
import { addMasterOnlinePaymentHeadGroup } from '@/server/fees/masters/online_payment_head_group';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterOnlinePaymentHeadGroupSchema.addOrUpdate>;

export interface SelectedRowData {
    fopM_Id: number;
    asmaY_Id?: number;
    asmcL_ID?: number;
    className?: string;
    fpgd_id?: number;
    submerchandId?: string;
    fmg_id?: number;
    groupName?: string;
    fmh_HeadId?: number;
    headName?: string;
    fti_id?: number;
    installmentName?: string;
    fmt_id?: number;
    termName?: string;
    institutionName?: string;
}

interface UpdateFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: SelectedRowData;
}

export default function UpdateMasterOnlinePaymentHeadGroupMappingForm({ onSuccess, className = '', selectedRow }: UpdateFormProps) {
    const [academicYear, setAcademicYear] = useState<number | null>(selectedRow?.asmaY_Id || null);
    const [classId, setClassId] = useState<number | null>(selectedRow?.asmcL_ID || null);
    const [subMerchantId, setSubMerchantId] = useState<number | null>(selectedRow?.fpgd_id || null);
    const [groupId, setGroupId] = useState<number | null>(selectedRow?.fmg_id || null);
    const [selectedHeads, setSelectedHeads] = useState<number[]>(selectedRow?.fmh_HeadId ? [selectedRow.fmh_HeadId] : []);
    const [installmentId, setInstallmentId] = useState<number | null>(selectedRow?.fti_id || null);
    const [termId, setTermId] = useState<number | null>(selectedRow?.fmt_id || null);
    const [headSearchTerm, setHeadSearchTerm] = useState('');

    const { data: academicYearData, isLoading: academicYearLoading, error: academicYearError } = useMasterOnlinePaymentHeadGroup();

    const { data: masterClass, isLoading: masterClassLoading } = useMasterOnlinePaymentHeadGroupClass(academicYear);

    const { data: masterSubMerchant, isLoading: masterSubMerchantLoading } = useMasterOnlinePaymentHeadGroupSubMerchant(academicYear);

    const { data: masterGroupName, isLoading: masterGroupNameLoading } = useMasterOnlinePaymentHeadGroupGroupName(academicYear);

    const {
        data: masterHeadName,
        isLoading: masterHeadNameLoading,
        refetch: refetchHeadNames
    } = useMasterOnlinePaymentHeadGroupHeadName(academicYear, groupId);

    const { data: masterInstallment, isLoading: masterInstallmentLoading } = useMasterOnlinePaymentHeadGroupInstallment(academicYear);

    const { data: masterTerms, isLoading: masterTermsLoading } = useMasterTerms();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterOnlinePaymentHeadGroupSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            mI_Id: '30',
            institutionName: 'vidya_vikas_vidya_samste',
            asmaY_Id: selectedRow.asmaY_Id,
            classCategory: selectedRow.asmcL_ID?.toString() || '',
            subMerchantId: selectedRow.fpgd_id?.toString() || '',
            groupName: selectedRow.fmg_id?.toString() || '',
            installmentName: selectedRow.fti_id?.toString() || '',
            terms: selectedRow.fmt_id?.toString() || '',
            academicYear: selectedRow.asmaY_Id?.toString() || ''
        }
    });

    const [classCategoryOptions, setClassCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [subMerchantIdOptions, setSubMerchantIdOptions] = useState<{ value: string; label: string }[]>([]);
    const [groupNameOptions, setGroupNameOptions] = useState<{ value: string; label: string }[]>([]);
    const [headOptions, setHeadOptions] = useState<{ value: string; label: string }[]>([]);
    const [installmentOptions, setInstallmentOptions] = useState<{ value: string; label: string }[]>([]);
    const [termsOptions, setTermsOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (selectedRow) {
            setAcademicYear(selectedRow.asmaY_Id || null);
            setClassId(selectedRow.asmcL_ID || null);
            setSubMerchantId(selectedRow.fpgd_id || null);
            setGroupId(selectedRow.fmg_id || null);
            setInstallmentId(selectedRow.fti_id || null);
            setTermId(selectedRow.fmt_id || null);

            if (selectedRow.fmh_HeadId) {
                setSelectedHeads([selectedRow.fmh_HeadId]);
            }

            // Set form values
            setValue('classCategory', selectedRow.asmcL_ID?.toString() || '');
            setValue('subMerchantId', selectedRow.fpgd_id?.toString() || '');
            setValue('groupName', selectedRow.fmg_id?.toString() || '');
            setValue('installmentName', selectedRow.fti_id?.toString() || '');
            setValue('terms', selectedRow.fmt_id?.toString() || '');
        }
    }, [selectedRow, setValue]);

    // Refetch heads when group changes
    useEffect(() => {
        if (academicYear && groupId) {
            refetchHeadNames();
        }
    }, [academicYear, groupId, refetchHeadNames]);

    const filteredHeadOptions = headOptions.filter((o) => o.label.toLowerCase().includes(headSearchTerm.toLowerCase()));

    // Set Class options
    useEffect(() => {
        if (masterClass?.data && Array.isArray(masterClass.data)) {
            const opts = masterClass.data.map((c: any) => ({
                value: c.asmcL_ID.toString(),
                label: c.asmcL_ClassName
            }));
            setClassCategoryOptions(opts);
        }
    }, [masterClass?.data]);

    // Set Sub Merchant options
    useEffect(() => {
        if (masterSubMerchant?.data && Array.isArray(masterSubMerchant.data)) {
            const opts = masterSubMerchant.data.map((c: any) => ({
                value: c.fpgD_Id.toString(),
                label: c.fpgD_MerchantId
            }));
            setSubMerchantIdOptions(opts);
        }
    }, [masterSubMerchant?.data]);

    // Set Group Name options
    useEffect(() => {
        if (masterGroupName?.data && Array.isArray(masterGroupName.data)) {
            const opts = masterGroupName.data.map((c: any) => ({
                value: c.fmg_id.toString(),
                label: c.groupName
            }));
            setGroupNameOptions(opts);
        }
    }, [masterGroupName?.data]);

    // Set Head Name options
    useEffect(() => {
        if (masterHeadName?.data && Array.isArray(masterHeadName.data)) {
            const opts = masterHeadName.data.map((c: any) => ({
                value: c.fmh_HeadId.toString(),
                label: c.fmh_HeadName
            }));
            setHeadOptions(opts);
        }
    }, [masterHeadName?.data]);

    // Set Installment options
    useEffect(() => {
        if (masterInstallment?.data && Array.isArray(masterInstallment.data)) {
            const opts = masterInstallment.data.map((c: any) => ({
                value: c.ftI_ID.toString(),
                label: c.ftI_NAME
            }));
            const uniqueOpts = opts.filter((opt, index, self) => index === self.findIndex((o) => o.value === opt.value));
            setInstallmentOptions(uniqueOpts);
        }
    }, [masterInstallment?.data]);

    // Set Terms options
    useEffect(() => {
        if (masterTerms?.data && Array.isArray(masterTerms.data)) {
            const opts = masterTerms.data.map((c: any) => ({
                value: c.fmT_Id.toString(),
                label: c.fmT_Name
            }));
            setTermsOptions(opts);
        }
    }, [masterTerms?.data]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            if (!academicYear || !classId || !subMerchantId || !groupId || selectedHeads.length === 0 || !termId || !installmentId) {
                toast.error('Please fill all required fields');
                return;
            }

            const payload = {
                fopM_Id: selectedRow.fopM_Id,
                mI_Id: 30,
                asmaY_Id: academicYear,
                asmcL_ID: classId,
                fpgd_id: subMerchantId,
                fmg_id: groupId,
                selectedheadList: selectedHeads.map((headId) => ({ fmH_Id: headId })),
                fmt_id: termId,
                fti_id: installmentId,
                user_id: 1001
            };

            const response = await addMasterOnlinePaymentHeadGroup(payload);

            if (response.success) {
                toast.success(response.message || 'Online Payment Head Group updated successfully');
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update Online Payment Head Group');
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'An error occurred while updating');
        }
    };

    const handleReset = () => {
        if (selectedRow) {
            setClassId(selectedRow.asmcL_ID || null);
            setSubMerchantId(selectedRow.fpgd_id || null);
            setGroupId(selectedRow.fmg_id || null);
            setInstallmentId(selectedRow.fti_id || null);
            setTermId(selectedRow.fmt_id || null);
            setSelectedHeads(selectedRow.fmh_HeadId ? [selectedRow.fmh_HeadId] : []);
            setHeadSearchTerm('');

            reset({
                mI_Id: '30',
                institutionName: 'vidya_vikas_vidya_samste',
                asmaY_Id: selectedRow.asmaY_Id,
                classCategory: selectedRow.asmcL_ID?.toString() || '',
                subMerchantId: selectedRow.fpgd_id?.toString() || '',
                groupName: selectedRow.fmg_id?.toString() || '',
                installmentName: selectedRow.fti_id?.toString() || '',
                terms: selectedRow.fmt_id?.toString() || '',
                academicYear: selectedRow.asmaY_Id?.toString() || ''
            });
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        {/* Institution Name */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Institution Name' htmlFor='institutionName'>
                                Institution Name <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='institutionName'
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} disabled>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Vidya Vikas Vidya Samste (R)' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='vidya_vikas_vidya_samste'>Vidya Vikas Vidya Samste (R)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Academic Year' htmlFor='asmaY_Id'>
                                Academic Year <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            const numValue = Number(value);
                                            field.onChange(numValue);
                                            setAcademicYear(numValue);
                                            // Reset dependent fields
                                            setClassId(null);
                                            setSubMerchantId(null);
                                            setGroupId(null);
                                            setSelectedHeads([]);
                                            setInstallmentId(null);
                                        }}
                                        value={field.value?.toString() || ''}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYearLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : academicYearError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading data
                                                </SelectItem>
                                            ) : (
                                                academicYearData?.data?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Class */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Class' htmlFor='classCategory'>
                                Class <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='classCategory'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setClassId(Number(value));
                                        }}
                                        value={field.value}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterClassLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : classCategoryOptions.length > 0 ? (
                                                classCategoryOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value='no-data' disabled>
                                                    No classes available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.classCategory && <FormError>{errors.classCategory.message}</FormError>}
                        </div>

                        {/* Sub Merchant Id */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Sub Merchant Id' htmlFor='subMerchantId'>
                                Sub Merchant Id <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='subMerchantId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setSubMerchantId(Number(value));
                                        }}
                                        value={field.value}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Sub Merchant Id' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterSubMerchantLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : subMerchantIdOptions.length > 0 ? (
                                                subMerchantIdOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value='no-data' disabled>
                                                    No sub merchants available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.subMerchantId && <FormError>{errors.subMerchantId.message}</FormError>}
                        </div>

                        {/* Group Name */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Group Name' htmlFor='groupName'>
                                Group Name <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='groupName'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setGroupId(Number(value));
                                            setSelectedHeads([]);
                                            setHeadSearchTerm('');
                                        }}
                                        value={field.value}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Group Name' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterGroupNameLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : groupNameOptions.length > 0 ? (
                                                groupNameOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value='no-data' disabled>
                                                    No groups available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.groupName && <FormError>{errors.groupName.message}</FormError>}
                        </div>

                        {/* Head Name */}
                        <div className='group flex flex-col gap-1.5 md:col-span-2'>
                            <Label aria-label='Head Name'>
                                Head Name <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='min-h-[40px] rounded-md border bg-white px-3 py-2'>
                                <input
                                    type='text'
                                    placeholder='Search Head Name'
                                    className='mb-2 w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={headSearchTerm}
                                    onChange={(e) => setHeadSearchTerm(e.target.value)}
                                    disabled={!groupId}
                                />
                                <div className='flex max-h-40 flex-col gap-2 overflow-y-auto'>
                                    {masterHeadNameLoading ? (
                                        <span className='text-gray-400 text-sm'>Loading heads...</span>
                                    ) : !groupId ? (
                                        <span className='text-gray-400 text-sm'>Please select a Group Name first</span>
                                    ) : filteredHeadOptions.length > 0 ? (
                                        filteredHeadOptions.map((option) => (
                                            <label
                                                key={option.value}
                                                className='flex cursor-pointer items-center rounded p-1 hover:bg-gray-50'>
                                                <input
                                                    type='checkbox'
                                                    value={option.value}
                                                    checked={selectedHeads.includes(Number(option.value))}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setSelectedHeads((prev) =>
                                                            prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
                                                        );
                                                    }}
                                                    className='mr-2 h-4 w-4 accent-blue-600'
                                                />
                                                <span className='text-sm'>{option.label}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <span className='text-gray-400 text-sm'>No heads found for selected group</span>
                                    )}
                                </div>
                                {selectedHeads.length > 0 && (
                                    <div className='mt-2 text-blue-600 text-sm'>{selectedHeads.length} head(s) selected</div>
                                )}
                            </div>
                            {selectedHeads.length === 0 && <FormError>Please select at least one head</FormError>}
                        </div>

                        {/* Installment */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Installment' htmlFor='installment'>
                                Installment <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='installmentName'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setInstallmentId(Number(value));
                                        }}
                                        value={field.value}
                                        disabled={!academicYear}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Installment' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterInstallmentLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : installmentOptions.length === 0 ? (
                                                <SelectItem value='no-data' disabled>
                                                    No installments available
                                                </SelectItem>
                                            ) : (
                                                installmentOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.installmentName && <FormError>{errors.installmentName.message}</FormError>}
                        </div>

                        {/* Terms */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Terms' htmlFor='terms'>
                                Terms <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='terms'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setTermId(Number(value));
                                        }}
                                        value={field.value}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Terms' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterTermsLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : termsOptions.length > 0 ? (
                                                termsOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value='no-data' disabled>
                                                    No terms available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.terms && <FormError>{errors.terms.message}</FormError>}
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
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
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
