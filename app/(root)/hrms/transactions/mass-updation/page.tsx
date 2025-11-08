'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetEmployeeDetailsBySelection, useMassUpdationOnload, useSearchMassUpdationEmployees } from '@/hooks/hrms/useTransactions';
import type {
    DepartmentDropdown,
    DesignationDropdown,
    EarningDeductionHead,
    EmployeeDropdown,
    GroupTypeDropdown
} from '@/types/hrms/mass-updation';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Employee extends EmployeeDropdown {
    selected?: boolean;
}

interface MassUpdateForm {
    groupType: string[];
    department: string[];
    designation: string[];
    selectedHead: string;
    updateType: 'Percentage' | 'Amount';
    updateValue: number;
    effectiveDate: string;
    earningDeduction: 'Earning' | 'Deduction';
    addRemove: 'Add' | 'Remove';
}

export default function MassUpdationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const _formRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset, watch, control, getValues } = useForm<MassUpdateForm>({
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
        MI_Id: 30,
        roleId: 2
    });
    const searchMutation = useSearchMassUpdationEmployees();
    const saveMutation = useGetEmployeeDetailsBySelection();

    // Debug logging
    React.useEffect(() => {
        console.log('=== Mass Updation Onload Debug ===');
        console.log('Is Loading:', isLoading);
        console.log('Onload Data:', onloadData);
        if (onloadData) {
            console.log('groupTypedropdownlist:', onloadData.groupTypedropdownlist?.length || 0);
            console.log('groupTypedropdown:', onloadData.groupTypedropdown?.length || 0);
            console.log('departmentdropdownlist:', onloadData.departmentdropdownlist?.length || 0);
            console.log('departmentdropdown:', onloadData.departmentdropdown?.length || 0);
            console.log('designationdropdownlist:', onloadData.designationdropdownlist?.length || 0);
            console.log('designationdropdown:', onloadData.designationdropdown?.length || 0);
            console.log('All keys in onloadData:', Object.keys(onloadData));
        }
    }, [onloadData, isLoading]);

    // Handle both field name variants (with and without 'list' suffix)
    // Memoize arrays to prevent unnecessary re-renders
    const groupTypes = useMemo(() => {
        return (onloadData?.groupTypedropdownlist && onloadData.groupTypedropdownlist.length > 0) 
            ? onloadData.groupTypedropdownlist 
            : (onloadData?.groupTypedropdown || []);
    }, [onloadData?.groupTypedropdownlist, onloadData?.groupTypedropdown]);
    
    const departments = useMemo(() => {
        return (onloadData?.departmentdropdownlist && onloadData.departmentdropdownlist.length > 0)
            ? onloadData.departmentdropdownlist
            : (onloadData?.departmentdropdown || []);
    }, [onloadData?.departmentdropdownlist, onloadData?.departmentdropdown]);
    
    const designations = useMemo(() => {
        return (onloadData?.designationdropdownlist && onloadData.designationdropdownlist.length > 0)
            ? onloadData.designationdropdownlist
            : (onloadData?.designationdropdown || []);
    }, [onloadData?.designationdropdownlist, onloadData?.designationdropdown]);
    
    const heads = useMemo(() => onloadData?.headdropdown || [], [onloadData?.headdropdown]);

    // Debug log the final values
    React.useEffect(() => {
        console.log('=== Final Dropdown Values ===');
        console.log('Group Types:', groupTypes.length);
        console.log('Departments:', departments.length);
        console.log('Designations:', designations.length);
        console.log('Heads:', heads.length);
    }, [groupTypes, departments, designations, heads]);

    const filteredHeads = React.useMemo(() => {
        if (!heads || heads.length === 0) return [];

        const filtered = heads.filter((head: any) => {
            const earnDedMatch = head.HRMED_EarnDedFlag === watchedEarningDeduction;
            const amountPercentMatch = head.HRMED_AmountPercentFlag === watchedUpdateType;
            return earnDedMatch && amountPercentMatch;
        });

        return filtered;
    }, [heads, watchedEarningDeduction, watchedUpdateType]);

    // Memoize filterEmployees to prevent infinite loops
    const filterEmployees = useCallback(() => {
        let filtered = employees;

        if (watchedGroupType && watchedGroupType.length > 0) {
            const groupTypeIds = new Set(watchedGroupType.map((v) => Number(v)));
            filtered = filtered.filter((emp: any) => groupTypeIds.has(emp.HRMGT_Id));
        }

        if (watchedDepartment && watchedDepartment.length > 0) {
            const departmentIds = new Set(watchedDepartment.map((v) => Number(v)));
            filtered = filtered.filter((emp: any) => departmentIds.has(emp.HRMD_Id));
        }

        if (watchedDesignation && watchedDesignation.length > 0) {
            const designationIds = new Set(watchedDesignation.map((v) => Number(v)));
            filtered = filtered.filter((emp: any) => designationIds.has(emp.HRMDES_Id));
        }

        setFilteredEmployees(filtered);
    }, [watchedGroupType, watchedDepartment, watchedDesignation, employees]);

    useEffect(() => {
        if (hasSearched) {
            filterEmployees();
        }
    }, [hasSearched, filterEmployees]);

    const onSubmit: SubmitHandler<MassUpdateForm> = async (data: MassUpdateForm) => {
        const searchPayload = {
            MI_Id: 30,
            roleId: 2,
            Type: 'string',
            HRME_Id: 0,
            groupTypeselected: data.groupType.map((v) => Number(v)),
            departmentselected: data.department.map((v) => Number(v)),
            designationselected: data.designation.map((v) => Number(v)),
            employeeselected: [0],
            EarningDeduction: 'string',
            AmountPercentage: 'string',
            HREED_Amount: 0,
            HREED_Percentage: 'string',
            HRMED_Id: 0,
            AddRemove: 'string',
            LogInUserId: 0,
            hrmgT_IdList: data.groupType.map((v) => Number(v)),
            employeeTypeIdList: [0],
            hrmD_IdList: data.department.map((v) => Number(v)),
            hrmdeS_IdList: data.designation.map((v) => Number(v)),
            groupTypeIdList: data.groupType.map((v) => Number(v))
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
        if (!values.selectedHead) {
            toast.error('Please select a Head');
            return;
        }
        if (!values.updateType) {
            toast.error('Please choose Amount or Percentage');
            return;
        }
        if (!values.updateValue || Number(values.updateValue) <= 0) {
            toast.error('Please enter a valid value');
            return;
        }

        const payload = {
            MI_Id: 30,
            roleId: 2,
            Type: 'string',
            HRME_Id: 0,
            employeeselected: selectedEmployees,
            EarningDeduction: values.earningDeduction,
            AmountPercentage: values.updateType,
            HREED_Amount: values.updateType === 'Amount' ? Number(values.updateValue) : 0,
            HREED_Percentage: values.updateType === 'Percentage' ? String(values.updateValue) : '0',
            HRMED_Id: Number(values.selectedHead),
            AddRemove: values.addRemove,
            LogInUserId: 0,
            groupTypeselected: values.groupType.map((v) => Number(v)),
            departmentselected: values.department.map((v) => Number(v)),
            designationselected: values.designation.map((v) => Number(v)),
            hrmgT_IdList: values.groupType.map((v) => Number(v)),
            hrmD_IdList: values.department.map((v) => Number(v)),
            hrmdeS_IdList: values.designation.map((v) => Number(v)),
            groupTypeIdList: values.groupType.map((v) => Number(v))
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

    const EmployeeTable = ({
        employees,
        isLoading,
        onSelectAll,
        onEmployeeSelect
    }: {
        employees: Employee[];
        isLoading: boolean;
        onSelectAll: (selected: boolean) => void;
        onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    }) => {
        const columns: ColumnDef<Employee>[] = [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={employees.length > 0 && selectedEmployees.length === employees.length}
                        onCheckedChange={(value) => onSelectAll(!!value)}
                        aria-label='Select all'
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedEmployees.includes(row.original.HRME_Id)}
                        onCheckedChange={(value) => onEmployeeSelect(row.original.HRME_Id, !!value)}
                        aria-label='Select row'
                    />
                ),
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'HRME_EmployeeCode',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
                cell: ({ row }) => <div>{row.getValue('HRME_EmployeeCode')}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRME_EmployeeFirstName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
                cell: ({ row }) => {
                    const emp = row.original;
                    return (
                        <div>
                            {`${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim()}
                        </div>
                    );
                },
                enableSorting: true,
                enableHiding: true
            }
        ];

        return (
            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable<Employee, any> columns={columns} data={employees} totalItems={employees.length} isLoading={isLoading} />
            </div>
        );
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Search Criteria'
                    description='Select filters to search for employees'
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
                                            options={groupTypes.map((gt) => ({
                                                value: gt.HRMGT_Id.toString(),
                                                label: gt.HRMGT_EmployeeGroupType
                                            }))}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Select Group Types'
                                            className='w-full'
                                        />
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Department *</Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departments.map((d) => ({
                                                value: d.HRMD_Id.toString(),
                                                label: d.HRMD_DepartmentName
                                            }))}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Select Departments'
                                            className='w-full'
                                        />
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Designation *</Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designations.map((d) => ({
                                                value: d.HRMDES_Id.toString(),
                                                label: d.HRMDES_DesignationName
                                            }))}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Select Designations'
                                            className='w-full'
                                        />
                                    )}
                                />
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
                        title='Employee Records'
                        description={`Found ${filteredEmployees.length} employees`}
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
                                            <Label>Head</Label>
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
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>{watch('updateType') === 'Amount' ? 'Amount' : 'Percentage'}</Label>
                                            <InputText
                                                type='number'
                                                step='any'
                                                placeholder={`Enter ${watch('updateType') === 'Amount' ? 'amount' : 'percentage'}`}
                                                {...register('updateValue', { valueAsNumber: true })}
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
                                    <Button onClick={handleMassUpdate} disabled={saveMutation.isPending} className='flex items-center gap-2'>
                                        <Users className='h-4 w-4' />
                                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            )}

                            <EmployeeTable
                                employees={filteredEmployees}
                                isLoading={isLoading || searchMutation.isPending}
                                onSelectAll={handleSelectAll}
                                onEmployeeSelect={handleEmployeeSelect}
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
