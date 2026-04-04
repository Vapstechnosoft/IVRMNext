'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelect } from '@/components/ui/multi-select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
    useReportGroupTypes, 
    useReportDepartments, 
    useReportDesignations, 
    useReportEmployeesByGroupTypeDeptAndDesignation 
} from '@/hooks/hrms/useReports';
import { employeeAbsentReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface AddEmployeeAbsentReportFormProps {
    onSuccess?: () => void;
    resolvedSearchParams?: any;
}

export default function AddEmployeeAbsentReportForm({
    onSuccess,
    resolvedSearchParams: searchParams
}: AddEmployeeAbsentReportFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof employeeAbsentReportFilterSchema>>({
        resolver: zodResolver(employeeAbsentReportFilterSchema),
        defaultValues: {
            type: searchParams?.type ? String(searchParams.type).split(',') : [],
            department: searchParams?.department ? String(searchParams.department).split(',') : [],
            designation: searchParams?.designation ? String(searchParams.designation).split(',') : [],
            allOrIndividual: (searchParams?.allOrIndividual as 'All' | 'Individual') || 'All',
            employeeIds: searchParams?.employee ? String(searchParams.employee).split(',') : [],
            fromDate: searchParams?.fromDate || '',
            toDate: searchParams?.toDate || ''
        }
    });

    const { watch, setValue, reset } = form;
    const selectedTypes = watch('type');
    const selectedDepts = watch('department');
    const selectedDesigs = watch('designation');
    const allOrIndividual = watch('allOrIndividual');

    // Cascading data fetching using report-specific hooks
    const { data: groupTypesData, isLoading: isTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDeptLoading } = useReportDepartments(
        selectedTypes.join(',')
    );
    const { data: designationsData, isLoading: isDesigLoading } = useReportDesignations(
        selectedTypes.join(','),
        selectedDepts.join(',')
    );
    const { data: employeesData, isLoading: isEmpLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        selectedTypes.map(Number),
    selectedDepts.map(Number),
    selectedDesigs.map(Number)
    );
    console.log("employeesData",employeesData)
    // Derived options - accessing .data property from the ApiResponse with robust key fallbacks
    const typeOptions = useMemo(() => 
        groupTypesData?.data?.map((t: any) => ({ 
            label: t.value || t.hrmgT_EmployeeGroupType || 'Unknown Type', 
            value: String(t.key || t.hrmgT_Id) 
        })) || [], 
    [groupTypesData]);

    const deptOptions = useMemo(() => 
        departmentsData?.data?.map((d: any) => ({ 
            label: d.value || d.hrmD_DepartmentName || d.hrmd_departmentName || 'Unknown Dept', 
            value: String(d.key || d.hrmD_Id || d.hrmd_id) 
        })) || [], 
    [departmentsData]);

    const desigOptions = useMemo(() => 
        designationsData?.data?.map((d: any) => ({ 
            label: d.value || d.hrmdeS_DesignationName || d.hrmdes_designationName || 'Unknown Desig', 
            value: String(d.key || d.hrmdeS_Id || d.hrmdes_id) 
        })) || [], 
    [designationsData]);

    const empOptions = useMemo(() => 
        employeesData?.data?.employeeNames?.map((e: any) => {
            const fullName = e.employeeFullName || e.hrme_employee_first_name || e.hrmE_EmployeeFirstName || '';
            return { 
                label: e.value || fullName || 'Unknown Employee', 
                value: String(e.key || e.hrme_id || e.hrmE_Id) 
            };
        }) || [], 
    [employeesData]);

    // Handle cascading resets
    useEffect(() => { if (selectedTypes.length === 0) setValue('department', []); }, [selectedTypes, setValue]);
    useEffect(() => { if (selectedDepts.length === 0) setValue('designation', []); }, [selectedDepts, setValue]);
    useEffect(() => { if (selectedDesigs.length === 0) setValue('employeeIds', []); }, [selectedDesigs, setValue]);

    async function onSubmit(values: z.infer<typeof employeeAbsentReportFilterSchema>) {
        setIsSubmitting(true);
        try {
            const params = new URLSearchParams();
            params.set('type', values.type.join(','));
            params.set('department', values.department.join(','));
            params.set('designation', values.designation.join(','));
            params.set('allOrIndividual', values.allOrIndividual);
            
            // Map employee IDs based on selection
            let hrme_ids = '0';
            if (values.allOrIndividual === 'Individual' && values.employeeIds) {
                hrme_ids = values.employeeIds.join(',');
            } else if (values.allOrIndividual === 'All' && empOptions.length > 0) {
                hrme_ids = empOptions.map((o: { value: string }) => o.value).join(',');
            }
            params.set('employee', hrme_ids);
            
            params.set('fromDate', values.fromDate);
            params.set('toDate', values.toDate);

            router.push(`${pathname}?${params.toString()}`);
            toast.success('Generating Absent Report...');
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: [],
            fromDate: '',
            toDate: ''
        });
        router.push(pathname);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Cascading Selects */}
                    <FormField
                        control={form.control}
                        name='type'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Group Type <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={typeOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isTypesLoading ? 'Loading...' : 'Select Group Types'}
                                        maxCount={2}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='department'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={deptOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isDeptLoading ? 'Loading...' : 'Select Departments'}
                                        disabled={selectedTypes.length === 0}
                                        maxCount={2}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='designation'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={desigOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isDesigLoading ? 'Loading...' : 'Select Designations'}
                                        disabled={selectedDepts.length === 0}
                                        maxCount={2}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Employee Selection */}
                    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                        <FormField
                            control={form.control}
                            name='allOrIndividual'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <FormLabel>Employee Filter</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex gap-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl><RadioGroupItem value='All' /></FormControl>
                                                <FormLabel className='font-normal'>All Employees</FormLabel>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl><RadioGroupItem value='Individual' /></FormControl>
                                                <FormLabel className='font-normal'>Individual</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {allOrIndividual === 'Individual' && (
                            <FormField
                                control={form.control}
                                name='employeeIds'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Employees <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={empOptions}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                placeholder={isEmpLoading ? 'Loading...' : 'Select Employees'}
                                                disabled={selectedDesigs.length === 0}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name='fromDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Date <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date: Date | undefined) => field.onChange(date?.toISOString())}
                                            placeholder="Select From Date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='toDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Date <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date: Date | undefined) => field.onChange(date?.toISOString())}
                                            placeholder="Select To Date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='flex flex-col md:justify-end gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='px-8 shadow-sm hover:bg-muted'
                        disabled={isSubmitting}>
                        <RotateCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    <Button 
                        type='submit' 
                        className='bg-primary px-8 text-primary-foreground shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg'
                        disabled={isSubmitting || isTypesLoading}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                            </>
                        ) : (
                            <>
                                <Search className='mr-2 h-4 w-4' /> Get Report
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
