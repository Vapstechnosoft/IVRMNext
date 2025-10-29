'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSearchMassUpdationEmployees } from '@/hooks/hrms/useMassUpdation';
import { massUpdationSchema } from '@/schemas/hrms/mass-updation-schemas';
import type { EmployeeDetail, MassUpdationOnloadResponse } from '@/types/hrms/mass-updation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof massUpdationSchema.search>;

interface SearchFormProps {
    onloadData: MassUpdationOnloadResponse | undefined;
    isLoadingOnload: boolean;
    onSearch: (data: EmployeeDetail[]) => void;
    className?: string;
}

export default function SearchForm({ onloadData, isLoadingOnload, onSearch, className = '' }: SearchFormProps) {
    const { mutate: searchEmployees, isPending: isSearching } = useSearchMassUpdationEmployees();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(massUpdationSchema.search),
        mode: 'onChange',
        defaultValues: {
            HRMGT_Id: undefined,
            HRMD_Id: undefined,
            HRMDES_Id: undefined,
            employeeIdList: []
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = {
            MI_Id: HRMS_MI_ID,
            roleId: 2,
            LogInUserId: 5,
            groupTypeIdList: data.HRMGT_Id ? [data.HRMGT_Id] : [],
            hrmD_IdList: data.HRMD_Id ? [data.HRMD_Id] : [],
            hrmdeS_IdList: data.HRMDES_Id ? [data.HRMDES_Id] : []
        };

        searchEmployees(payload, {
            onSuccess: (response) => {
                if (response.employeeDetails) {
                    onSearch(response.employeeDetails);
                    toast.success(`Found ${response.employeeDetails.length} employees`);
                } else {
                    onSearch([]);
                    toast.info('No employees found for the selected criteria.');
                }
            },
            onError: (error) => {
                onSearch([]);
                toast.error(error.message || 'Failed to search employees.');
            }
        });
    };

    const handleReset = () => {
        reset();
        onSearch([]);
    };

    const groupTypes = onloadData?.groupTypedropdownlist || [];
    const departments = onloadData?.departmentdropdownlist || [];
    const designations = onloadData?.designationdropdownlist || [];

    const groupTypeOptions = groupTypes.map((gt) => ({
        label: gt.HRMGT_EmployeeGroupType,
        value: gt.HRMGT_Id.toString()
    }));
    const departmentOptions = departments.map((dept) => ({
        label: dept.HRMD_DepartmentName,
        value: dept.HRMD_Id.toString()
    }));
    const designationOptions = designations.map((desg) => ({
        label: desg.HRMDES_DesignationName,
        value: desg.HRMDES_Id.toString()
    }));

    return (
        <CollapsibleSection
            title='Search Employees for Mass Updation'
            description='Filter employees by group, department, and designation.'
            defaultOpen={true}
            className={`shadow-lg ${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Group Type */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='groupTypeIdList'>Group Type</Label>
                            <Controller
                                name='HRMGT_Id'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={groupTypeOptions}
                                        defaultValue={field.value ? [String(field.value)] : []}
                                        onValueChange={(values) => {
                                            const val = values.length > 0 ? Number(values[0]) : undefined;
                                            field.onChange(val);
                                        }}
                                        placeholder='Select group types'
                                        disabled={isLoadingOnload || isSearching}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                            {errors.HRMGT_Id && <FormError>{errors.HRMGT_Id.message}</FormError>}
                        </div>

                        {/* Department */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmD_IdList'>Department</Label>
                            <Controller
                                name='HRMD_Id'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={departmentOptions}
                                        defaultValue={field.value ? [String(field.value)] : []}
                                        onValueChange={(values) => {
                                            const val = values.length > 0 ? Number(values[0]) : undefined;
                                            field.onChange(val);
                                        }}
                                        placeholder='Select departments'
                                        disabled={isLoadingOnload || isSearching}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                            {errors.HRMD_Id && <FormError>{errors.HRMD_Id.message}</FormError>}
                        </div>

                        {/* Designation */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmdeS_IdList'>Designation</Label>
                            <Controller
                                name='HRMDES_Id'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={designationOptions}
                                        defaultValue={field.value ? [String(field.value)] : []}
                                        onValueChange={(values) => {
                                            const val = values.length > 0 ? Number(values[0]) : undefined;
                                            field.onChange(val);
                                        }}
                                        placeholder='Select designations'
                                        disabled={isLoadingOnload || isSearching}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                            {errors.HRMDES_Id && <FormError>{errors.HRMDES_Id.message}</FormError>}
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
                        disabled={isSubmitting || isSearching || isLoadingOnload}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isSearching || isLoadingOnload}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isSearching}
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Search className='mr-2 h-4 w-4' />
                            Search Employees
                        </div>
                    </Button>
                </div>
            </form>
        </CollapsibleSection>
    );
}
