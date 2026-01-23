'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useFilterSalaryUpdationEmployees,
    useGetSalaryUpdationEmployeeDetailsBySelection,
    useSalaryUpdationList
} from '@/hooks/hrms/useTransactions';
import {
    getDepartmentDropdownByGroupType,
    getDesignationDropdownByGroupTypeAndDesignation,
    getGroupTypeDropdown,
    getHeadDropdown
} from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import type {
    DeductionResultItem,
    DepartmentDropdown,
    DesignationDropdown,
    EarningResultItem,
    EmployeeDropdown,
    SalaryUpdationItem
} from '@/types/hrms/salary-updation';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import FormSections from './_components/form-sections';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function SalaryUpdationPage(_props: { searchParams: SearchParams }) {
    const { listQuery } = useSalaryUpdationList({
        page: 0,
        page_size: 0,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: true,
        MIID: HRMS_MI_ID,
        LoginUserId: 0, // TODO: Get from auth context
        UserRole: '' // TODO: Get from auth context
    });
    return (
        <FormProvider<SalaryUpdationItem>>
            <SalaryUpdationPageContent
                response={listQuery.data}
                isLoading={listQuery.isLoading}
                error={listQuery.error}
                refetch={listQuery.refetch}
            />
        </FormProvider>
    );
}
function SalaryUpdationPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<SalaryUpdationItem>();
    const [hasSearched, setHasSearched] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDropdown[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [cascadingDepartments, setCascadingDepartments] = useState<DepartmentDropdown[]>([]);
    const [cascadingDesignations, setCascadingDesignations] = useState<DesignationDropdown[]>([]);
    const { mutate: filterEmployees, isPending: isFiltering } = useFilterSalaryUpdationEmployees();
    const { mutate: getEmployeeDetails, isPending: isGettingDetails } = useGetSalaryUpdationEmployeeDetailsBySelection();
    // Simplified: Removed mutation hooks for dropdowns

    // Safely extract data with proper defaults to prevent hydration mismatches
    // Use useMemo to prevent unnecessary re-renders and infinite loops
    // Support both new format (groupTypedropdown) and legacy format (groupTypedropdownlist)
    const [groupTypes, setGroupTypes] = useState<any[]>([]);

    // Initial departments/designations from load (if any)
    // We will merge/override these with cascading values

    const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
    const [designations, setDesignations] = useState<DesignationDropdown[]>([]);
    const [headsData, setHeadsData] = useState<any[]>([]);

    useEffect(() => {
        // Fetch group types on mount
        async function fetchGroupTypes() {
            try {
                const { groupTypedropdown } = await getGroupTypeDropdown();
                setGroupTypes(groupTypedropdown || []);
            } catch (err) {
                console.error("Failed to load group types", err);
                setGroupTypes([]);
            }
        }
        fetchGroupTypes();

        async function fetchHeads() {
            try {
                const { headdropdown } = await getHeadDropdown();
                setHeadsData(headdropdown || []);
            } catch (err) {
                console.error("Failed to load heads", err);
                setHeadsData([]);
            }
        }
        fetchHeads();

        if (response?.departmentdropdown || response?.departmentdropdownlist) {
            setDepartments(response?.departmentdropdown || response?.departmentdropdownlist || []);
        }
        if (response?.designationdropdown || response?.designationdropdownlist) {
            setDesignations(response?.designationdropdown || response?.designationdropdownlist || []);
        }
    }, [response]);

    const _employees = useMemo(() => response?.employeedropdown || [], [response?.employeedropdown]);
    // Get all head dropdowns from response or local state
    const allHeads = useMemo(() => {
        if (headsData.length > 0) return headsData;
        return response?.headdropdown || [];
    }, [response?.headdropdown, headsData]);

    const earningHeadsList = useMemo(() => {
        if (headsData.length > 0) {
            return headsData.filter((h: any) => h.HRMED_EarnDedFlag?.toLowerCase() === 'earning');
        }
        return response?.earningdropdown || [];
    }, [response?.earningdropdown, headsData]);

    const deductionHeadsList = useMemo(() => {
        if (headsData.length > 0) {
            return headsData.filter((h: any) => h.HRMED_EarnDedFlag?.toLowerCase() === 'deduction');
        }
        return response?.detectiondropdown || [];
    }, [response?.detectiondropdown, headsData]);
    const _monthOptions = useMemo(() => response?.monthdropdown || [], [response?.monthdropdown]);
    const _leaveYearOptions = useMemo(() => response?.leaveyeardropdown || [], [response?.leaveyeardropdown]);
    // Initialize date values client-side only to prevent hydration mismatches
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    const { control, handleSubmit, reset, watch, register, getValues, setValue } = useForm({
        defaultValues: {
            groupType: [] as string[],
            department: [] as string[],
            designation: [] as string[],
            earningDeduction: 'All Earning & Deduction',
            amountType: 'All',
            amountValue: '',
            heads: [] as (string | number)[],
            selectedHead: '',
            updateValue: '',
            addRemove: 'Add'
        }
    });
    // Track if form has been initialized to prevent unnecessary resets
    const [isFormInitialized, setIsFormInitialized] = useState(false);
    // Initialize form values on client side after hydration
    useEffect(() => {
        if (isClient && !isFormInitialized) {
            setValue('earningDeduction', 'All Earning & Deduction');
            setValue('amountType', 'All');
            setIsFormInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isClient, isFormInitialized]);
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const _watchedDesignation = watch('designation');
    const _watchedHeads = watch('heads');
    const watchedEarningDeduction = watch('earningDeduction');
    const watchedAmountType = watch('amountType');
    const watchedSelectedHead = watch('selectedHead');
    const watchedUpdateValue = watch('updateValue');
    const _watchedAddRemove = watch('addRemove');
    // Dynamically filter heads based on earning/deduction and amount/percentage selection
    const earningHeads = useMemo(() => {
        let filteredHeads: any[] = [];
        // Step 1: Filter by Earning/Deduction selection
        if (watchedEarningDeduction === 'Earning') {
            filteredHeads = [...earningHeadsList];
        } else if (watchedEarningDeduction === 'Deduction') {
            filteredHeads = [...deductionHeadsList];
        } else {
            // "All Earning & Deduction" - use headdropdown
            filteredHeads = [...allHeads];
        }
        // Step 2: Filter by Amount/Percentage selection
        if (watchedAmountType === 'Amount') {
            filteredHeads = filteredHeads.filter((h: any) => h.HRMED_AmountPercentFlag === 'Amount');
        } else if (watchedAmountType === 'Percentage') {
            filteredHeads = filteredHeads.filter((h: any) => h.HRMED_AmountPercentFlag === 'Percentage');
        }
        // If "All" is selected, don't filter by AmountPercentFlag
        return filteredHeads;
    }, [watchedEarningDeduction, watchedAmountType, allHeads, earningHeadsList, deductionHeadsList]);
    // Cascading dropdown: Fetch departments when group type changes
    useEffect(() => {
        if (!isClient || !isFormInitialized) return;

        async function fetchDepartments() {
            if (watchedGroupType && Array.isArray(watchedGroupType) && watchedGroupType.length > 0) {
                const groupTypeIds = watchedGroupType
                    .map((gt: string) => Number(gt))
                    .filter((id) => !Number.isNaN(id));

                if (groupTypeIds.length > 0) {
                    const ids = groupTypeIds.join(',');
                    try {
                        const { departmentdropdown } = await getDepartmentDropdownByGroupType(ids);
                        setDepartments(departmentdropdown || []);
                        // Reset selections
                        setValue('department', []);
                        setValue('designation', []);
                        setDesignations([]);
                    } catch (error) {
                        console.error("Failed to load departments", error);
                        setDepartments([]);
                    }
                } else {
                    setDepartments([]);
                    setDesignations([]);
                }
            } else {
                setDepartments([]);
                setDesignations([]);
                setValue('department', []);
                setValue('designation', []);
            }
        }

        fetchDepartments();
    }, [watchedGroupType, isClient, isFormInitialized, setValue]);

    // Cascading dropdown: Fetch designations when department changes
    useEffect(() => {
        if (!isClient || !isFormInitialized) return;

        async function fetchDesignations() {
            if (
                watchedDepartment &&
                Array.isArray(watchedDepartment) &&
                watchedDepartment.length > 0 &&
                watchedGroupType &&
                Array.isArray(watchedGroupType) &&
                watchedGroupType.length > 0
            ) {
                const groupTypeIds = watchedGroupType
                    .map((gt: string) => Number(gt))
                    .filter((id) => !Number.isNaN(id));

                const departmentIds = watchedDepartment
                    .map((dept: string) => Number(dept))
                    .filter((id) => !Number.isNaN(id));

                if (groupTypeIds.length > 0 && departmentIds.length > 0) {
                    const gIds = groupTypeIds.join(',');
                    const dIds = departmentIds.join(',');

                    try {
                        const { designationdropdown } = await getDesignationDropdownByGroupTypeAndDesignation(gIds, dIds);
                        setDesignations(designationdropdown || []);
                        // Reset designation when department changes
                        setValue('designation', []);
                    } catch (error) {
                        console.error("Failed to load designations", error);
                        setDesignations([]);
                    }
                } else {
                    setDesignations([]);
                }
            } else if (!watchedDepartment || (Array.isArray(watchedDepartment) && watchedDepartment.length === 0)) {
                setDesignations([]);
                setValue('designation', []);
            }
        }

        fetchDesignations();
    }, [watchedDepartment, watchedGroupType, isClient, isFormInitialized, setValue]);
    // Reset heads when earning/deduction or amount/percentage selection changes
    useEffect(() => {
        if (isClient && isFormInitialized) {
            setValue('heads', []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedEarningDeduction, watchedAmountType, isClient, isFormInitialized]);
    const onSubmit = async (formData: any) => {
        try {
            // Map form values to API request format
            const groupTypeIds: number[] = [];
            if (formData.groupType && Array.isArray(formData.groupType) && formData.groupType.length > 0) {
                formData.groupType.forEach((gt: string) => {
                    if (gt !== 'All') groupTypeIds.push(Number(gt));
                });
            }
            const departmentIds: number[] = [];
            if (formData.department && Array.isArray(formData.department) && formData.department.length > 0) {
                formData.department.forEach((dept: string) => {
                    if (dept !== 'All') departmentIds.push(Number(dept));
                });
            }
            const designationIds: number[] = [];
            if (formData.designation && Array.isArray(formData.designation) && formData.designation.length > 0) {
                formData.designation.forEach((desg: string) => {
                    if (desg !== 'All') designationIds.push(Number(desg));
                });
            }
            const headIds: number[] = [];
            if (formData.heads && Array.isArray(formData.heads) && formData.heads.length > 0) {
                // formData.heads now contains HRMED_Id as strings, convert to numbers
                formData.heads.forEach((headId: string | number) => {
                    const id = typeof headId === 'string' ? Number.parseInt(headId, 10) : headId;
                    if (!Number.isNaN(id) && id > 0) {
                        headIds.push(id);
                    }
                });
            }
            // Call API to filter employees
            filterEmployees(
                {
                    MI_Id: HRMS_MI_ID,
                    LogInUserId: 0,
                    designationselected: designationIds,
                    departmentselected: departmentIds,
                    groupTypeselected: groupTypeIds,
                    headselected: headIds
                },
                {
                    onSuccess: (data) => {
                        setFilteredEmployees(data.employeedropdown || []);
                        setHasSearched(true);
                        toast.success('Search completed successfully');
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Search failed');
                    }
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'Search failed');
        }
    };
    const handleUpdate = () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }
        // Get current form values
        const formValues = watch();
        // Validate required fields
        if (!formValues.selectedHead) {
            toast.error('Please select a head');
            return;
        }
        if (!formValues.updateValue) {
            toast.error(`Please enter ${formValues.amountType === 'Amount' ? 'amount' : 'percentage'}`);
            return;
        }
        // Get all available heads (not filtered) for finding the selected head
        const allAvailableHeads = [
            ...(response?.headdropdown || []),
            ...(response?.earningdropdown || []),
            ...(response?.detectiondropdown || [])
        ];
        const headId = Number.parseInt(formValues.selectedHead, 10);
        if (Number.isNaN(headId) || headId <= 0) {
            toast.error('Invalid head selected');
            return;
        }
        const selectedHead = allAvailableHeads.find((h: any) => h.HRMED_Id === headId);
        if (!selectedHead) {
            toast.error('Selected head not found');
            return;
        }
        const isEarning = formValues.earningDeduction === 'Earning';
        const amountValue = Number.parseFloat(formValues.updateValue || '0') || 0;
        // Build earning and deduction arrays based on form selections
        const earningresult: EarningResultItem[] = [];
        const deductionresult: DeductionResultItem[] = [];
        // Create item for each selected employee
        selectedEmployees.forEach((employeeId) => {
            const item = {
                HREED_Id: 0,
                MI_Id: HRMS_MI_ID,
                HRME_Id: employeeId,
                HRMED_Id: headId,
                HREED_Amount: formValues.amountType === 'Amount' ? amountValue : 0,
                HREED_Percentage: formValues.amountType === 'Percentage' ? amountValue.toString() : '0',
                HREED_ActiveFlag: true,
                HREED_MaxApplicableFlg: true,
                HREED_ApplicableMaxValue: 0
            };
            if (isEarning) {
                earningresult.push(item as EarningResultItem);
            } else {
                deductionresult.push(item as DeductionResultItem);
            }
        });
        // Call API to save employee details
        getEmployeeDetails(
            {
                earningresult: earningresult.length > 0 ? earningresult : undefined,
                deductionresult: deductionresult.length > 0 ? deductionresult : undefined,
                LogInUserId: 0
            },
            {
                onSuccess: (data) => {
                    // Update filtered employees with the response
                    if (data.employeedropdown && data.employeedropdown.length > 0) {
                        setFilteredEmployees(data.employeedropdown);
                        toast.success('Employee details saved successfully');
                        // Reset form fields
                        setValue('selectedHead', '');
                        setValue('updateValue', '');
                        setSelectedEmployees([]);
                    } else {
                        toast.info('No employee details found for the selected criteria');
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to save employee details');
                }
            }
        );
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Forms Section */}
                <FormSections onloadData={response} onSuccess={refetch} />
                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Top Row: Group Type, Department, Designation */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            {/* Group Type */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>
                                    Group Type <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => {
                                        const currentValue = Array.isArray(field.value) ? field.value : [];
                                        const allGroupTypeValues = groupTypes.map((gt: any) => gt.HRMGT_Id?.toString() || '');
                                        const isAllSelected =
                                            allGroupTypeValues.length > 0 &&
                                            allGroupTypeValues.every((val: string) => currentValue.includes(val));
                                        return (
                                            <MultiSelect
                                                options={[
                                                    { label: 'All', value: 'All' },
                                                    ...groupTypes.map((gt: any) => ({
                                                        label: gt.HRMGT_EmployeeGroupType,
                                                        value: gt.HRMGT_Id?.toString() || ''
                                                    }))
                                                ]}
                                                onValueChange={(vals) => {
                                                    if (vals.includes('All') && !isAllSelected) {
                                                        // If "All" is selected, select all group types
                                                        field.onChange(allGroupTypeValues);
                                                    } else if (vals.includes('All') && isAllSelected) {
                                                        // If "All" is clicked when all are selected, deselect all
                                                        field.onChange([]);
                                                    } else {
                                                        // Remove "All" if individual items are selected
                                                        const filteredVals = vals.filter((v) => v !== 'All');
                                                        field.onChange(filteredVals);
                                                    }
                                                }}
                                                defaultValue={currentValue}
                                                placeholder='Select Group Types'
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        );
                                    }}
                                />
                            </div>
                            {/* Department */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>
                                    Department <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => {
                                        const currentValue = Array.isArray(field.value) ? field.value : [];
                                        const allDeptValues = departments.map((d: any) => d.HRMD_Id?.toString() || '');
                                        const isAllSelected =
                                            allDeptValues.length > 0 && allDeptValues.every((val: string) => currentValue.includes(val));
                                        return (
                                            <MultiSelect
                                                options={[
                                                    { label: 'All', value: 'All' },
                                                    ...departments.map((dept: any) => ({
                                                        label: dept.HRMD_DepartmentName,
                                                        value: dept.HRMD_Id?.toString() || ''
                                                    }))
                                                ]}
                                                onValueChange={(vals) => {
                                                    if (vals.includes('All') && !isAllSelected) {
                                                        field.onChange(allDeptValues);
                                                    } else if (vals.includes('All') && isAllSelected) {
                                                        field.onChange([]);
                                                    } else {
                                                        const filteredVals = vals.filter((v) => v !== 'All');
                                                        field.onChange(filteredVals);
                                                    }
                                                }}
                                                defaultValue={currentValue}
                                                placeholder='Select Departments'
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        );
                                    }}
                                />
                            </div>
                            {/* Designation */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>
                                    Designation <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => {
                                        const currentValue = Array.isArray(field.value) ? field.value : [];
                                        const allDesgValues = designations.map((d: any) => d.HRMDES_Id?.toString() || '');
                                        const isAllSelected =
                                            allDesgValues.length > 0 && allDesgValues.every((val: string) => currentValue.includes(val));
                                        return (
                                            <MultiSelect
                                                options={[
                                                    { label: 'All', value: 'All' },
                                                    ...designations.map((desg: any) => ({
                                                        label: desg.HRMDES_DesignationName,
                                                        value: desg.HRMDES_Id?.toString() || ''
                                                    }))
                                                ]}
                                                onValueChange={(vals) => {
                                                    if (vals.includes('All') && !isAllSelected) {
                                                        field.onChange(allDesgValues);
                                                    } else if (vals.includes('All') && isAllSelected) {
                                                        field.onChange([]);
                                                    } else {
                                                        const filteredVals = vals.filter((v) => v !== 'All');
                                                        field.onChange(filteredVals);
                                                    }
                                                }}
                                                defaultValue={currentValue}
                                                placeholder='Select Designations'
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        );
                                    }}
                                />
                            </div>
                        </div>
                        {/* Middle Section: Radio Buttons and Head Selection */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            {/* Left Column: Earning/Deduction and Amount/Percentage */}
                            <div className='space-y-6'>
                                {/* Earning & Deduction Selection */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold'>
                                        Earning & Deduction <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='earningDeduction'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value || 'All Earning & Deduction'}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                                className='flex flex-col gap-3'>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='All Earning & Deduction' id='ed-all' />
                                                    <Label htmlFor='ed-all' className='cursor-pointer font-normal'>
                                                        All Earning & Deduction
                                                    </Label>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='Earning' id='ed-earning' />
                                                    <Label htmlFor='ed-earning' className='cursor-pointer font-normal'>
                                                        Earning
                                                    </Label>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='Deduction' id='ed-deduction' />
                                                    <Label htmlFor='ed-deduction' className='cursor-pointer font-normal'>
                                                        Deduction
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                                {/* Amount / Percentage Selection */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold'>
                                        Amount / Percentage <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='amountType'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value || 'All'}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                                className='flex flex-col gap-3'>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='All' id='amt-all' />
                                                    <Label htmlFor='amt-all' className='cursor-pointer font-normal'>
                                                        All
                                                    </Label>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='Amount' id='amt-amount' />
                                                    <Label htmlFor='amt-amount' className='cursor-pointer font-normal'>
                                                        Amount
                                                    </Label>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='Percentage' id='amt-percentage' />
                                                    <Label htmlFor='amt-percentage' className='cursor-pointer font-normal'>
                                                        Percentage
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>
                            {/* Right Column: Head Selection */}
                            <div className='space-y-3'>
                                <Label className='font-semibold'>
                                    Head <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='heads'
                                    control={control}
                                    render={({ field }) => {
                                        const currentValue = Array.isArray(field.value) ? field.value.map((v) => String(v)) : [];
                                        // Use HRMED_Id as value to ensure uniqueness, but display HRMED_Name
                                        const allHeadValues = earningHeads.map((h: any) => h.HRMED_Id?.toString() || '').filter(Boolean);
                                        const isAllSelected =
                                            allHeadValues.length > 0 && allHeadValues.every((val: string) => currentValue.includes(val));
                                        return (
                                            <MultiSelect
                                                options={[
                                                    { label: 'All', value: 'All' },
                                                    ...earningHeads
                                                        .filter((h: any) => h.HRMED_Name && h.HRMED_Id)
                                                        .map((head: any) => ({
                                                            label: head.HRMED_Name || '',
                                                            value: head.HRMED_Id?.toString() || ''
                                                        }))
                                                ]}
                                                onValueChange={(vals) => {
                                                    if (vals.includes('All') && !isAllSelected) {
                                                        field.onChange(allHeadValues);
                                                    } else if (vals.includes('All') && isAllSelected) {
                                                        field.onChange([]);
                                                    } else {
                                                        const filteredVals = vals.filter((v) => v !== 'All');
                                                        field.onChange(filteredVals);
                                                    }
                                                }}
                                                defaultValue={currentValue}
                                                placeholder='Select Heads'
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        );
                                    }}
                                />
                            </div>
                        </div>
                        {/* Bottom Row: Action Buttons */}
                        <div className='flex items-end gap-2'>
                            <Button type='submit' className='w-fit transition-all duration-200 hover:scale-105' disabled={isFiltering}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isFiltering ? 'animate-spin' : ''}`} />
                                {isFiltering ? 'SEARCHING...' : 'SEARCH'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={() => {
                                    reset({
                                        groupType: [],
                                        department: [],
                                        designation: [],
                                        earningDeduction: 'All Earning & Deduction',
                                        amountType: 'All',
                                        amountValue: '',
                                        heads: [],
                                        selectedHead: '',
                                        updateValue: '',
                                        addRemove: 'Add'
                                    });
                                    setHasSearched(false);
                                    setSelectedEmployees([]);
                                    setCascadingDepartments([]);
                                    setCascadingDesignations([]);
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
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
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                {/* Left Panel - Employee Details Form */}
                                <div className='space-y-4 rounded-lg border p-4'>
                                    <h3 className='font-semibold text-lg'>EMPLOYEE DETAILS</h3>
                                    {/* Earning/Deduction Radio Buttons */}
                                    <div className='space-y-2'>
                                        <Label className='font-semibold'>
                                            Earning <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='earningDeduction'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value === 'All Earning & Deduction' ? 'Earning' : field.value || 'Earning'}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('selectedHead', '');
                                                        setValue('updateValue', '');
                                                    }}
                                                    className='flex gap-6'>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Earning' id='ed-earn-details' />
                                                        <Label htmlFor='ed-earn-details' className='cursor-pointer font-normal'>
                                                            Earning
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Deduction' id='ed-ded-details' />
                                                        <Label htmlFor='ed-ded-details' className='cursor-pointer font-normal'>
                                                            Deduction
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    {/* Amount/Percentage Radio Buttons */}
                                    <div className='space-y-2'>
                                        <Label className='font-semibold'>
                                            Amount <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='amountType'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value === 'All' ? 'Percentage' : field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('selectedHead', '');
                                                        setValue('updateValue', '');
                                                    }}
                                                    className='flex gap-6'>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Amount' id='amt-amt-details' />
                                                        <Label htmlFor='amt-amt-details' className='cursor-pointer font-normal'>
                                                            Amount
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Percentage' id='amt-per-details' />
                                                        <Label htmlFor='amt-per-details' className='cursor-pointer font-normal'>
                                                            Percentage
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    {/* Head Dropdown */}
                                    <div className='space-y-2'>
                                        <Label className='font-semibold'>
                                            Head :<span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='selectedHead'
                                            control={control}
                                            render={({ field }) => {
                                                // Filter heads based on current selections in the left panel
                                                // watchedEarningDeduction in left panel will be 'Earning' or 'Deduction'
                                                // watchedAmountType in left panel will be 'Amount' or 'Percentage'
                                                const filteredHeadsForDropdown = earningHeads.filter((h: any) => {
                                                    const earnDedMatch = h.HRMED_EarnDedFlag === watchedEarningDeduction;
                                                    const amountPercentMatch = h.HRMED_AmountPercentFlag === watchedAmountType;
                                                    return earnDedMatch && amountPercentMatch;
                                                });
                                                return (
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredHeadsForDropdown.length === 0 ? (
                                                                <div className='p-2 text-center text-muted-foreground text-sm'>
                                                                    No heads available
                                                                </div>
                                                            ) : (
                                                                filteredHeadsForDropdown.map((head: any) => (
                                                                    <SelectItem key={head.HRMED_Id} value={head.HRMED_Id.toString()}>
                                                                        {head.HRMED_Name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                );
                                            }}
                                        />
                                    </div>
                                    {/* Amount/Percentage Input */}
                                    {(watchedAmountType === 'Amount' || watchedAmountType === 'Percentage') && (
                                        <div className='space-y-2'>
                                            <Label className='font-semibold'>
                                                {watchedAmountType === 'Amount' ? 'Amount' : 'Percentage'}:
                                                <span className='text-destructive'>*</span>
                                            </Label>
                                            <InputText
                                                type='number'
                                                step='0.01'
                                                placeholder={`Enter ${watchedAmountType === 'Amount' ? 'amount' : 'percentage'}`}
                                                {...register('updateValue')}
                                                className='w-full'
                                            />
                                        </div>
                                    )}
                                    {/* Add/Remove Radio Buttons */}
                                    <div className='space-y-2'>
                                        <Label className='font-semibold'>
                                            Add <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='addRemove'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value || 'Add'}
                                                    onValueChange={field.onChange}
                                                    className='flex gap-6'>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Add' id='ar-add' />
                                                        <Label htmlFor='ar-add' className='cursor-pointer font-normal'>
                                                            Add
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RadioGroupItem value='Remove' id='ar-remove' />
                                                        <Label htmlFor='ar-remove' className='cursor-pointer font-normal'>
                                                            Remove
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                </div>
                                {/* Right Panel - Employee List */}
                                <div className='space-y-4'>
                                    <h3 className='font-semibold text-lg'>Employee List</h3>
                                    <GenericDataTable<EmployeeDropdown>
                                        data={filteredEmployees}
                                        totalItems={filteredEmployees.length}
                                        columns={[
                                            {
                                                id: 'select',
                                                header: () => (
                                                    <Checkbox
                                                        checked={
                                                            filteredEmployees.length > 0 &&
                                                            selectedEmployees.length === filteredEmployees.length
                                                        }
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
                                                            } else {
                                                                setSelectedEmployees([]);
                                                            }
                                                        }}
                                                        aria-label='Select all'
                                                    />
                                                ),
                                                cell: ({ row }) => (
                                                    <Checkbox
                                                        checked={selectedEmployees.includes(row.original.HRME_Id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedEmployees((prev) => [...prev, row.original.HRME_Id]);
                                                            } else {
                                                                setSelectedEmployees((prev) =>
                                                                    prev.filter((id) => id !== row.original.HRME_Id)
                                                                );
                                                            }
                                                        }}
                                                        aria-label='Select row'
                                                    />
                                                ),
                                                enableSorting: false,
                                                enableHiding: false
                                            },
                                            {
                                                id: 'slNo',
                                                header: 'SL. No',
                                                cell: ({ row, table }) => {
                                                    const pageIndex = table.getState().pagination.pageIndex;
                                                    const pageSize = table.getState().pagination.pageSize;
                                                    return <div>{pageIndex * pageSize + row.index + 1}</div>;
                                                },
                                                enableSorting: false
                                            },
                                            {
                                                accessorKey: 'HRME_EmployeeCode',
                                                header: 'Employee Code',
                                                cell: ({ row }) => <div className='font-medium'>{row.original.HRME_EmployeeCode}</div>
                                            },
                                            {
                                                accessorKey: 'employeeName',
                                                header: 'Employee Name',
                                                cell: ({ row }) => {
                                                    const fullName = [
                                                        row.original.HRME_EmployeeFirstName,
                                                        row.original.HRME_EmployeeMiddleName,
                                                        row.original.HRME_EmployeeLastName
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ');
                                                    return <div className='font-medium'>{fullName}</div>;
                                                }
                                            }
                                        ]}
                                        isLoading={isFiltering || isLoading}
                                        error={error}
                                        showViewOptions={true}
                                        loadingMessage='Filtering employees...'
                                        noDataTitle='No Employees Found'
                                        noDataDescription='No employees match your search criteria'
                                        errorTitle='Error Loading Employees'
                                    />
                                </div>
                            </div>
                            {/* Bottom Action Buttons */}
                            <div className='flex justify-end gap-2 border-t pt-4'>
                                <Button
                                    onClick={handleUpdate}
                                    className='w-fit bg-blue-600 transition-all duration-200 hover:scale-105 hover:bg-blue-700'
                                    disabled={
                                        isGettingDetails || selectedEmployees.length === 0 || !watchedSelectedHead || !watchedUpdateValue
                                    }>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isGettingDetails ? 'animate-spin' : ''}`} />
                                    {isGettingDetails ? 'SAVING...' : 'SAVE'}
                                </Button>
                                <Button
                                    variant='outline'
                                    className='w-fit border-orange-500 text-orange-600 transition-all duration-200 hover:scale-105 hover:bg-orange-50'
                                    onClick={() => {
                                        reset({
                                            groupType: [],
                                            department: [],
                                            designation: [],
                                            earningDeduction: 'All Earning & Deduction',
                                            amountType: 'All',
                                            amountValue: '',
                                            heads: [],
                                            selectedHead: '',
                                            updateValue: '',
                                            addRemove: 'Add'
                                        });
                                        setHasSearched(false);
                                        setSelectedEmployees([]);
                                        setCascadingDepartments([]);
                                        setCascadingDesignations([]);
                                    }}>
                                    <X className='mr-2 h-4 w-4' />
                                    CANCEL
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
                {!hasSearched && (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Please use the search form above to find employee salary records
                            </div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
