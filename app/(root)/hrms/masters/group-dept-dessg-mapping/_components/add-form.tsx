'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useGroupDeptDessgMapping, useSaveGroupDeptDessgMapping } from '@/hooks/hrms/useMasters';
import { groupDeptDessgMappingSchema } from '@/schemas/hrms/group-dept-dessg-mapping-schemas';
import type { GroupDeptDessgMappingInput } from '@/types/hrms/group-dept-dessg-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type FormFields = z.infer<typeof groupDeptDessgMappingSchema.addOrUpdate>;
interface AddGroupDeptDessgMappingFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddGroupDeptDessgMappingForm({ onSuccess, className = '' }: AddGroupDeptDessgMappingFormProps) {
    const { data: response } = useGroupDeptDessgMapping();
    const { mutate: saveMapping, isPending } = useSaveGroupDeptDessgMapping();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(groupDeptDessgMappingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            mI_Id: HRMS_MI_ID,
            hrmgT_Id: 0,
            hrmD_Id: 0,
            hrmdeS_Id: 0,
            designationids: [],
            hrgtddS_ActiveFlg: true,
            hrgtddS_CreatedBy: 5,
            logInUserId: 5
        }
    });
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const submitData: GroupDeptDessgMappingInput = {
                ...data,
                hrmdeS_Id: data.hrmdeS_Id || (data.designationids && data.designationids.length > 0 ? data.designationids[0] : 0),
                hrgtddS_Id: 0
            };
            saveMapping(submitData, {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || 'Mapping saved successfully');
                        reset();
                        onSuccess?.();
                    } else {
                        toast.error(response.message || 'Failed to save mapping');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'An error occurred');
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };
    const handleReset = () => {
        reset();
    };
    const groupTypes = useMemo(() => {
        const responseData = response?.data as any;
        return responseData?.data?.groupTypedropdown || responseData?.groupTypedropdown || [];
    }, [response?.data]);
    const departments = useMemo(() => {
        const responseData = response?.data as any;
        return responseData?.data?.departmentdropdown || responseData?.departmentdropdown || [];
    }, [response?.data]);
    const designations = useMemo(() => {
        const responseData = response?.data as any;
        return responseData?.data?.designationdropdown || responseData?.designationdropdown || [];
    }, [response?.data]);
    const designationOptions = useMemo(() => {
        return designations.map((desig: any, index: number) => ({
            label: desig.HRMDES_DesignationName,
            value: desig.HRMDES_Id?.toString(),
            _index: index
        }));
    }, [designations]);
    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmgT_Id'>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmgT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() || ''}
                                        onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='hrmgT_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select group type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypes.map((group: any, index: number) => (
                                                <SelectItem key={`group-${group.HRMGT_Id}-${index}`} value={group.HRMGT_Id?.toString()}>
                                                    {group.HRMGT_EmployeeGroupType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmgT_Id && <FormError>{errors.hrmgT_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmD_Id'>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmD_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() || ''}
                                        onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='hrmD_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept: any, index: number) => (
                                                <SelectItem key={`dept-${dept.HRMD_Id}-${index}`} value={dept.HRMD_Id?.toString()}>
                                                    {dept.HRMD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmD_Id && <FormError>{errors.hrmD_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5 md:col-span-3'>
                            <Label htmlFor='designationids'>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designationids'
                                control={control}
                                render={({ field }) => {
                                    const stringValues = field.value?.map((id) => id.toString()) || [];
                                    return (
                                        <MultiSelect
                                            options={designationOptions}
                                            defaultValue={stringValues}
                                            onValueChange={(values) => {
                                                field.onChange(values.map((v) => Number(v)));
                                            }}
                                            placeholder='Select designations'
                                            maxCount={3}
                                            maxHeight={300}
                                            className='w-full'
                                        />
                                    );
                                }}
                            />
                            {errors.designationids && <FormError>{errors.designationids.message}</FormError>}
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
                            Save Mapping
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
