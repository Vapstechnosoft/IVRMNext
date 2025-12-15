'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesignationDropdownForMassUpdation, useDepartmentDropdownForMassUpdation, useGetEmployeeDetailsBySelection, useGroupTypeDropdownForMassUpdation, useMassUpdationOnload, useSearchMassUpdationEmployees } from '@/hooks/hrms/useTransactions';
import { getMassUpdationColumns } from './_components/columns';
import { hrmsTransactionSchemas } from '@/schemas/hrms/transaction';
import type { EmployeeDropdown } from '@/types/hrms/mass-updation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
interface Employee extends EmployeeDropdown {
    selected?: boolean;
}
type MassUpdateForm = z.infer<typeof hrmsTransactionSchemas.massUpdation.form>;
export default function MassUpdationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const _formRef = useRef<HTMLDivElement>(null);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        getValues,
        setValue,
        formState: { errors }
    } = useForm<MassUpdateForm>({
        resolver: zodResolver(hrmsTransactionSchemas.massUpdation.form),
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            selectedHead: '',
            updateType: 'Percentage',
            updateValue: 0,
            effectiveDate: '',
            earningDeduction: 'Earning',
            addRemove: 'Add'
        }
    });
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedEarningDeduction = watch('earningDeduction');
    const watchedUpdateType = watch('updateType');
    const { data: onloadData, isLoading } = useMassUpdationOnload({
        MI_Id: 0,
        roleId: 0
    });
    const searchMutation = useSearchMassUpdationEmployees();
    const saveMutation = useGetEmployeeDetailsBySelection();
    
    // Dropdown hooks - individual APIs following salary-approval pattern
    const { data: groupTypeData, isLoading: isLoadingGroupType } = useGroupTypeDropdownForMassUpdation();
    
    // Extract Group Type IDs from selected group types for cascading department dropdown
    const selectedGroupTypeIds = useMemo(() => {
        if (!watchedGroupType || !Array.isArray(watchedGroupType) || watchedGroupType.length === 0) {
            return undefined;
        }
        // Map selected group type values (names) to their IDs (keys)
        const rawData = Array.isArray(groupTypeData) ? groupTypeData : (groupTypeData as any)?.data || [];
        const ids = watchedGroupType
            .map((selectedValue: string) => {
                const groupType = rawData.find((item: any) => 
                    item.value === selectedValue || 
                    item.HRMGT_EmployeeGroupType === selectedValue ||
                    (item.key !== undefined && item.value === selectedValue)
                );
                return groupType?.key || groupType?.HRMGT_Id;
            })
            .filter((id: number | undefined): id is number => id !== undefined && id > 0);
        return ids.length > 0 ? ids : undefined;
    }, [watchedGroupType, groupTypeData]);
    
    const { data: departmentData, isLoading: isLoadingDepartment } = useDepartmentDropdownForMassUpdation(selectedGroupTypeIds);
    
    // Extract Department IDs from selected departments for cascading designation dropdown
    const selectedDepartmentIds = useMemo(() => {
        if (!watchedDepartment || !Array.isArray(watchedDepartment) || watchedDepartment.length === 0) {
            return undefined;
        }
        // Map selected department values (names) to their IDs (keys)
        const rawData = Array.isArray(departmentData) ? departmentData : (departmentData as any)?.data || [];
        const ids = watchedDepartment
            .map((selectedValue: string) => {
                const department = rawData.find((item: any) => 
                    item.value === selectedValue || 
                    item.HRMD_DepartmentName === selectedValue ||
                    (item.key !== undefined && item.value === selectedValue)
                );
                return department?.key || department?.HRMD_Id;
            })
            .filter((id: number | undefined): id is number => id !== undefined && id > 0);
        return ids.length > 0 ? ids : undefined;
    }, [watchedDepartment, departmentData]);
    
    const { data: designationData, isLoading: isLoadingDesignation } = useDesignationDropdownForMassUpdation(selectedDepartmentIds);
    
    // Transform GroupType dropdown from { key, value } format
    const groupTypeOptions = useMemo(() => {
        const rawData = Array.isArray(groupTypeData) ? groupTypeData : (groupTypeData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMGT_Id: item.key,
                    HRMGT_EmployeeGroupType: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [groupTypeData]);
    
    // Transform Department dropdown from { key, value } format
    const departmentOptions = useMemo(() => {
        const rawData = Array.isArray(departmentData) ? departmentData : (departmentData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMD_Id: item.key,
                    HRMD_DepartmentName: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [departmentData]);
    
    // Transform Designation dropdown from { key, value } format
    const designationOptions = useMemo(() => {
        const rawData = Array.isArray(designationData) ? designationData : (designationData as any)?.data || [];
        return rawData.map((item: any) => {
            // Handle { key, value } format from API
            if (item.key !== undefined && item.value !== undefined) {
                return {
                    key: item.key,
                    value: item.value,
                    // For backward compatibility with existing code
                    HRMDES_Id: item.key,
                    HRMDES_DesignationName: item.value
                };
            }
            // Fallback for other formats
            return item;
        });
    }, [designationData]);
    const heads = useMemo(() => onloadData?.headdropdown || [], [onloadData?.headdropdown]);
    // Debug log the final values - dependencies tracked for memoization
    const filteredHeads = React.useMemo(() => {
        if (!heads || heads.length === 0) return [];
        const filtered = heads.filter((head: any) => {
            const earnDedMatch = head.HRMED_EarnDedFlag === watchedEarningDeduction;
            const amountPercentMatch = head.HRMED_AmountPercentFlag === watchedUpdateType;
            return earnDedMatch && amountPercentMatch;
        });
        return filtered;
    }, [heads, watchedEarningDeduction, watchedUpdateType]);
    // Reset department and designation when group type changes
    useEffect(() => {
        if (!watchedGroupType || (Array.isArray(watchedGroupType) && watchedGroupType.length === 0)) {
            setValue('department', []);
            setValue('designation', []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedGroupType]);
    
    // Reset designation when department changes
    useEffect(() => {
        if (!watchedDepartment || (Array.isArray(watchedDepartment) && watchedDepartment.length === 0)) {
            setValue('designation', []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedDepartment]);
    
    // Memoize filterEmployees to prevent infinite loops
    const filterEmployees = useCallback(() => {
        let filtered = employees;
        if (watchedGroupType && watchedGroupType.length > 0) {
            // watchedGroupType contains the value (group type name) from MultiSelect
            const groupTypeNames = new Set(watchedGroupType);
            filtered = filtered.filter((emp: any) => groupTypeNames.has(emp.HRMGT_EmployeeGroupType));
        }
        if (watchedDepartment && watchedDepartment.length > 0) {
            const departmentNames = new Set(watchedDepartment);
            filtered = filtered.filter((emp: any) => departmentNames.has(emp.HRMD_DepartmentName));
        }
        if (watchedDesignation && watchedDesignation.length > 0) {
            const designationNames = new Set(watchedDesignation);
            filtered = filtered.filter((emp: any) => designationNames.has(emp.HRMDES_DesignationName));
        }
        setFilteredEmployees(filtered);
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees]);
    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [hasSearched, filterEmployees]);
    const onSubmit: SubmitHandler<MassUpdateForm> = async (data: MassUpdateForm) => {
        // Validate search criteria
        const searchValidation = hrmsTransactionSchemas.massUpdation.search.safeParse({
            groupType: data.groupType,
            department: data.department,
            designation: data.designation
        });
        if (!searchValidation.success) {
            const firstError = searchValidation.error.errors[0];
            toast.error(firstError.message);
            return;
        }
        // Map selected group type values (names) to their IDs (keys)
        const groupTypeIds: number[] = [];
        if (data.groupType && Array.isArray(data.groupType) && data.groupType.length > 0) {
            data.groupType.forEach((gt: string) => {
                const groupType = groupTypeOptions.find((g: any) => 
                    g.value === gt || g.HRMGT_EmployeeGroupType === gt
                );
                if (groupType) {
                    groupTypeIds.push(groupType.key || groupType.HRMGT_Id);
                }
            });
        }
        // Map selected department values (names) to their IDs (keys)
        const departmentIds: number[] = [];
        if (data.department && Array.isArray(data.department) && data.department.length > 0) {
            data.department.forEach((dept: string) => {
                const department = departmentOptions.find((d: any) => 
                    d.value === dept || d.HRMD_DepartmentName === dept
                );
                if (department) {
                    departmentIds.push(department.key || department.HRMD_Id);
                }
            });
        }
        // Map selected designation values (names) to their IDs (keys)
        const designationIds: number[] = [];
        if (data.designation && Array.isArray(data.designation) && data.designation.length > 0) {
            data.designation.forEach((desg: string) => {
                const designation = designationOptions.find((d: any) => 
                    d.value === desg || d.HRMDES_DesignationName === desg
                );
                if (designation) {
                    designationIds.push(designation.key || designation.HRMDES_Id);
                }
            });
        }
        
        const searchPayload = {
            MI_Id: 0,
            roleId: 0,
            Type: '',
            HRME_Id: 0,
            groupTypeselected: groupTypeIds,
            departmentselected: departmentIds,
            designationselected: designationIds,
            employeeselected: [0],
            EarningDeduction: '',
            AmountPercentage: '',
            HREED_Amount: 0,
            HREED_Percentage: '',
            HRMED_Id: 0,
            AddRemove: '',
            LogInUserId: 0,
            hrmgT_IdList: groupTypeIds,
            employeeTypeIdList: [0],
            hrmD_IdList: departmentIds,
            hrmdeS_IdList: designationIds,
            groupTypeIdList: groupTypeIds
        };
        searchMutation.mutate(searchPayload, {
            onSuccess: (responseData) => {
                const hasEmployeeData = responseData.employeedropdown && responseData.employeedropdown.length > 0;
                if (hasEmployeeData) {
                    const mappedEmployees: Employee[] = responseData.employeedropdown.map((emp: any) => ({
                        ...emp,
                        selected: false
                    }));
                    setEmployees(mappedEmployees);
                    setFilteredEmployees(mappedEmployees);
                    setHasSearched(true);
                    toast.success(`Found ${mappedEmployees.length} employee records`);
                } else {
                    setEmployees([]);
                    setFilteredEmployees([]);
                    setHasSearched(true);
                    const errorMsg = responseData.retrunMsg || 'No employees found matching the criteria';
                    if (errorMsg.toLowerCase().includes('error') || errorMsg.toLowerCase().includes('no data')) {
                        toast.warning(errorMsg);
                    } else {
                        toast.info(errorMsg);
                    }
                }
            }
        });
    };
    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
        } else {
            setSelectedEmployees([]);
        }
    };
    const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
        if (selected) {
            setSelectedEmployees((prev) => [...prev, employeeId]);
        } else {
            setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
        }
    };
    const handleMassUpdate = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }
        const values = getValues();
        // Validate employee records section - use a partial schema for validation
        const updateFieldsSchema = z.object({
            selectedHead: z.string().min(1, 'Head is required'),
            updateType: z.enum(['Percentage', 'Amount'], {
                required_error: 'Please select Amount or Percentage'
            }),
            updateValue: z.number().min(0, 'Value must be greater than or equal to 0'),
            earningDeduction: z.enum(['Earning', 'Deduction'], {
                required_error: 'Please select Earning or Deduction'
            }),
            addRemove: z.enum(['Add', 'Remove'], {
                required_error: 'Please select an Action'
            })
        });
        const updateValidation = updateFieldsSchema.safeParse({
            selectedHead: values.selectedHead,
            updateType: values.updateType,
            updateValue: values.updateValue,
            earningDeduction: values.earningDeduction,
            addRemove: values.addRemove
        });
        if (!updateValidation.success) {
            const firstError = updateValidation.error.errors[0];
            toast.error(firstError.message);
            return;
        }
        const payload = {
            roleId: 0,
            Type: '',
            HRME_Id: 0,
            employeeselected: selectedEmployees,
            EarningDeduction: values.earningDeduction,
            AmountPercentage: values.updateType,
            HREED_Amount: values.updateType === 'Amount' ? Number(values.updateValue) : 0,
            HREED_Percentage: values.updateType === 'Percentage' ? String(values.updateValue) : '0',
            HRMED_Id: Number(values.selectedHead),
            AddRemove: values.addRemove,
            LogInUserId: 0,
            groupTypeselected: (() => {
                const ids: number[] = [];
                if (values.groupType && Array.isArray(values.groupType) && values.groupType.length > 0) {
                    values.groupType.forEach((gt: string) => {
                        const groupType = groupTypeOptions.find((g: any) => 
                            g.value === gt || g.HRMGT_EmployeeGroupType === gt
                        );
                        if (groupType) {
                            ids.push(groupType.key || groupType.HRMGT_Id);
                        }
                    });
                }
                return ids;
            })(),
            departmentselected: (() => {
                const ids: number[] = [];
                if (values.department && Array.isArray(values.department) && values.department.length > 0) {
                    values.department.forEach((dept: string) => {
                        const department = departmentOptions.find((d: any) => 
                            d.value === dept || d.HRMD_DepartmentName === dept
                        );
                        if (department) {
                            ids.push(department.key || department.HRMD_Id);
                        }
                    });
                }
                return ids;
            })(),
            designationselected: (() => {
                const ids: number[] = [];
                if (values.designation && Array.isArray(values.designation) && values.designation.length > 0) {
                    values.designation.forEach((desg: string) => {
                        const designation = designationOptions.find((d: any) => 
                            d.value === desg || d.HRMDES_DesignationName === desg
                        );
                        if (designation) {
                            ids.push(designation.key || designation.HRMDES_Id);
                        }
                    });
                }
                return ids;
            })(),
            hrmgT_IdList: (() => {
                const ids: number[] = [];
                if (values.groupType && Array.isArray(values.groupType) && values.groupType.length > 0) {
                    values.groupType.forEach((gt: string) => {
                        const groupType = groupTypeOptions.find((g: any) => 
                            g.value === gt || g.HRMGT_EmployeeGroupType === gt
                        );
                        if (groupType) {
                            ids.push(groupType.key || groupType.HRMGT_Id);
                        }
                    });
                }
                return ids;
            })(),
            hrmD_IdList: (() => {
                const ids: number[] = [];
                if (values.department && Array.isArray(values.department) && values.department.length > 0) {
                    values.department.forEach((dept: string) => {
                        const department = departmentOptions.find((d: any) => 
                            d.value === dept || d.HRMD_DepartmentName === dept
                        );
                        if (department) {
                            ids.push(department.key || department.HRMD_Id);
                        }
                    });
                }
                return ids;
            })(),
            hrmdeS_IdList: (() => {
                const ids: number[] = [];
                if (values.designation && Array.isArray(values.designation) && values.designation.length > 0) {
                    values.designation.forEach((desg: string) => {
                        const designation = designationOptions.find((d: any) => 
                            d.value === desg || d.HRMDES_DesignationName === desg
                        );
                        if (designation) {
                            ids.push(designation.key || designation.HRMDES_Id);
                        }
                    });
                }
                return ids;
            })(),
            groupTypeIdList: (() => {
                const ids: number[] = [];
                if (values.groupType && Array.isArray(values.groupType) && values.groupType.length > 0) {
                    values.groupType.forEach((gt: string) => {
                        const groupType = groupTypeOptions.find((g: any) => 
                            g.value === gt || g.HRMGT_EmployeeGroupType === gt
                        );
                        if (groupType) {
                            ids.push(groupType.key || groupType.HRMGT_Id);
                        }
                    });
                }
                return ids;
            })()
        } as any;
        saveMutation.mutate(payload, {
            onSuccess: (responseData) => {
                toast.success('Mass update applied successfully');
                if (responseData?.employeedropdown) {
                    const updatedEmployees: Employee[] = responseData.employeedropdown.map((emp: any) => ({
                        ...emp,
                        selected: false
                    }));
                    setEmployees(updatedEmployees);
                    setFilteredEmployees(updatedEmployees);
                }
            }
        });
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                                <Label>Group Type *</Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions.map((gt: any) => ({
                                                label: gt.value || gt.HRMGT_EmployeeGroupType || '',
                                                value: gt.value || gt.HRMGT_EmployeeGroupType || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder='Select Group Types'
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingGroupType}
                                        />
                                    )}
                                />
                                {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                            </div>
                            <div className='space-y-2'>
                                <Label>Department *</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentOptions.map((d: any) => ({
                                                label: d.value || d.HRMD_DepartmentName || '',
                                                value: d.value || d.HRMD_DepartmentName || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={
                                                !selectedGroupTypeIds || selectedGroupTypeIds.length === 0
                                                    ? 'Select Group Type first'
                                                    : isLoadingDepartment
                                                    ? 'Loading departments...'
                                                    : 'Select Departments'
                                            }
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDepartment || !selectedGroupTypeIds || selectedGroupTypeIds.length === 0}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department.message}</FormError>}
                            </div>
                            <div className='space-y-2'>
                                <Label>Designation *</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationOptions.map((d: any) => ({
                                                label: d.value || d.HRMDES_DesignationName || '',
                                                value: d.value || d.HRMDES_DesignationName || ''
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={
                                                !selectedDepartmentIds || selectedDepartmentIds.length === 0
                                                    ? 'Select Department first'
                                                    : isLoadingDesignation
                                                    ? 'Loading designations...'
                                                    : 'Select Designations'
                                            }
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDesignation || !selectedDepartmentIds || selectedDepartmentIds.length === 0}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation.message}</FormError>}
                            </div>
                        </div>
                        <div className='flex gap-4'>
                            <Button type='submit' disabled={searchMutation.isPending} className='flex items-center gap-2'>
                                <Search className='h-4 w-4' />
                                Search
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setEmployees([]);
                                    setFilteredEmployees([]);
                                    setSelectedEmployees([]);
                                    setHasSearched(false);
                                }}
                                className='flex items-center gap-2'>
                                <X className='h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
                {hasSearched && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <div className='space-y-4 rounded-md border p-4'>
                                    <div className='flex items-center gap-6'>
                                        <span className='font-medium'>Earning</span>
                                        <Controller
                                            name='earningDeduction'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    className='flex items-center gap-6'
                                                    value={field.value}
                                                    onValueChange={field.onChange}>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Earning' id='rd-earn' />
                                                        <Label htmlFor='rd-earn'>Earning</Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Deduction' id='rd-ded' />
                                                        <Label htmlFor='rd-ded'>Deduction</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    <div className='flex items-center gap-6'>
                                        <span className='font-medium'>Amount</span>
                                        <Controller
                                            name='updateType'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    className='flex items-center gap-6'
                                                    value={field.value}
                                                    onValueChange={field.onChange}>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Amount' id='rd-amt' />
                                                        <Label htmlFor='rd-amt'>Amount</Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Percentage' id='rd-per' />
                                                        <Label htmlFor='rd-per'>Percentage</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                            <Label>Head *</Label>
                                            <Controller
                                                name='selectedHead'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Head' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredHeads.length === 0 ? (
                                                                <div className='p-2 text-center text-muted-foreground text-sm'>
                                                                    No heads available for selected Earning/Deduction and Amount/Percentage
                                                                </div>
                                                            ) : (
                                                                filteredHeads.map((h) => (
                                                                    <SelectItem key={h.HRMED_Id} value={h.HRMED_Id.toString()}>
                                                                        {h.HRMED_Name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.selectedHead && <FormError>{errors.selectedHead.message}</FormError>}
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>{watch('updateType') === 'Amount' ? 'Amount' : 'Percentage'} *</Label>
                                            <InputText
                                                type='number'
                                                step='any'
                                                placeholder={`Enter ${watch('updateType') === 'Amount' ? 'amount' : 'percentage'}`}
                                                {...register('updateValue', { valueAsNumber: true })}
                                                error={errors.updateValue?.message as string | undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-4 rounded-md border p-4'>
                                    <div className='flex items-center gap-6'>
                                        <span className='font-medium'>Action</span>
                                        <Controller
                                            name='addRemove'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    className='flex items-center gap-6'
                                                    value={field.value}
                                                    onValueChange={field.onChange}>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Add' id='rd-add' />
                                                        <Label htmlFor='rd-add'>Add</Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Remove' id='rd-rem' />
                                                        <Label htmlFor='rd-rem'>Remove</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    <div className='flex items-center gap-4 pt-6'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => {
                                                reset({
                                                    ...getValues(),
                                                    earningDeduction: 'Earning',
                                                    updateType: 'Percentage',
                                                    updateValue: 0,
                                                    selectedHead: '',
                                                    addRemove: 'Add'
                                                });
                                            }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {selectedEmployees.length > 0 && (
                                <div className='flex items-center gap-4 rounded-lg bg-blue-50 p-4'>
                                    <span className='font-medium text-sm'>{selectedEmployees.length} employee(s) selected</span>
                                    <Button
                                        onClick={handleMassUpdate}
                                        disabled={saveMutation.isPending}
                                        className='flex items-center gap-2'>
                                        <Users className='h-4 w-4' />
                                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            )}
                            <GenericDataTable<Employee>
                                data={filteredEmployees}
                                totalItems={filteredEmployees.length}
                                columns={getMassUpdationColumns({
                                    selectedEmployees,
                                    onSelectAll: handleSelectAll,
                                    onEmployeeSelect: handleEmployeeSelect,
                                    employees: filteredEmployees
                                })}
                                isLoading={isLoading || searchMutation.isPending}
                                error={null}
                                showViewOptions={true}
                                loadingMessage='Loading employees...'
                                noDataTitle='No Employees Found'
                                noDataDescription='No employees match your search criteria'
                                errorTitle='Error Loading Employees'
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
