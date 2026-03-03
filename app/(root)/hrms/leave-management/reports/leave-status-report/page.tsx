'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown, useMasterLeaveDropdown } from '@/hooks/hrms/useMasters';
import {
    useReportGroupTypes,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByDeptAndDesignation,
    useLeaveStatusReport
} from '@/hooks/hrms/useReports';
import { Download, Loader2, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { columns } from './_components/columns';

interface FilterFormValues {
    year: string;
    groupType: string[];
    department: string[];
    designation: string[];
    employees: string[];
    leaves: string[];
}

export default function LeaveStatusReportPage() {
    return (
        <FormProvider>
            <LeaveStatusReportContent />
        </FormProvider>
    );
}

function LeaveStatusReportContent() {
    const [reportData, setReportData] = useState<any>(null);
    const { control, handleSubmit, watch, reset } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            groupType: [],
            department: [],
            designation: [],
            employees: [],
            leaves: []
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => watchedGroupType.map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const { data: yearsData, isLoading: yearsLoading } = useLeaveYearDropdown();
    const { data: leavesData } = useMasterLeaveDropdown();
    const { data: groupTypesData, isLoading: groupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData } = useReportEmployeesByDeptAndDesignation(deptIds.toString(), desigIds.toString());
    console.log('employeesData', employeesData);
    // Transforms
    const leavesDataTransformed = useMemo(() => {
        return (
            leavesData?.data?.map((lv: any) => ({
                id: lv.hrmL_Id || lv.key || lv.id,
                name: lv.hrmL_LeaveName || lv.value || lv.name
            })) || []
        ).filter((lv: any) => lv.id != null);
    }, [leavesData]);

    // Transforms
    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null)
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const firstName = (emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '').trim();
                const middleName = (emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '').trim();
                const lastName = (emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '').trim();

                const employeeName =
                    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
                    emp.value ||
                    emp.employeeName ||
                    'Unknown Employee';

                const employeeCode =
                    emp.HRME_EmployeeCode ||
                    emp.hrmE_EmployeeCode ||
                    emp.employeeCode ||
                    id.toString();

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);

    }, [employeesData]);

    console.log('employeesDataTransformed', employeesDataTransformed);

    const { mutateAsync: fetchLeaveStatusReport } = useLeaveStatusReport();
    const [isPending, setIsPending] = useState(false);

    const onSubmit = async (data: FilterFormValues) => {
        if (!data.year || data.department.length === 0 || data.designation.length === 0 || data.employees.length === 0 || data.leaves.length === 0) {
            toast.error('Please select Year, Department, Designation, Employees, and Leaves');
            return;
        }
        console.log('data', data);
        const payload = {
            hrmlY_Id: data.year,
            hrme_Ids: data.employees.join(','),
            hrml_Ids: data.leaves.join(',')
        };

        setIsPending(true);

        try {
            const response = await fetchLeaveStatusReport(payload);
            console.log('response', response);
            if (response.success && response.data) {
                setReportData(response.data);
                console.log('response.data', response.data);
                if (response.data.length === 0) {
                    toast.info('No data found for selected criteria');
                } else {
                    toast.success('Report generated successfully');
                }
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error('Submit Error:', error);
            setReportData([]);
        } finally {
            setIsPending(false);
        }
    };

    const handlePrint = () => {
        if (!reportData) {
            toast.error('No data to print');
            return;
        }
        window.print();
    };

    const handleExport = () => {
        if (!reportData) {
            toast.error('No data to export');
            return;
        }
        toast.info('Export functionality not yet linked');
    };


    const resetHandler = () => {
        reset({
            year: '',
            groupType: [],
            department: [],
            designation: [],
            employees: [],
            leaves: []
        });
        setReportData(null);
    };

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Leave Status Report</h2>
            </div>

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>

                        {/* Group Type */}
                        <div className='space-y-2'>
                            <Label>Group Type <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={

                                            groupTypesDataTransformed.map((gt: any) => ({
                                                label: gt.name,
                                                value: String(gt.id)
                                            }))
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Group Types'
                                    />
                                )}
                            />
                        </div>

                        {/* Department */}
                        <div className='space-y-2'>
                            <Label>Department <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            departmentsDataTransformed.map((dept: any) => ({
                                                label: dept.name,
                                                value: String(dept.id)
                                            }))
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Departments'
                                    />
                                )}
                            />
                        </div>

                        {/* Designation */}
                        <div className='space-y-2'>
                            <Label>Designation <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            designationsDataTransformed.map((desg: any) => ({
                                                label: desg.name,
                                                value: String(desg.id)
                                            }))
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Designations'
                                    />
                                )}
                            />
                        </div>

                        {/* Employees */}
                        <div className='space-y-2 '>
                            <Label>Employees <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='employees'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            employeesDataTransformed.map((emp: any) => ({
                                                label: `${emp.employeeName} - [${emp.employeeCode}]`,
                                                value: String(emp.id)
                                            }))
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Employees'
                                    />
                                )}
                            />
                        </div>

                        {/* Leaves */}
                        <div className='space-y-2'>
                            <Label>Leaves <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='leaves'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            leavesDataTransformed.map((lv: any) => ({
                                                label: lv.name,
                                                value: String(lv.id)
                                            }))
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Leave Types'
                                    />
                                )}
                            />
                        </div>

                        {/* Year */}
                        <div className='space-y-2'>
                            <Label>Year <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='year'
                                control={control}

                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} key={field.value ?? 'empty'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                    </div>

                    <div className='flex justify-center gap-4'>
                        <Button type='submit' disabled={isPending} className='w-32'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                        <Button
                            type='button'
                            disabled={isPending}
                            className='w-32'
                            variant='outline'
                            onClick={(e) => {
                                e.preventDefault();
                                resetHandler();
                            }}
                        >
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className='border shadow-md'
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handleExport} className='gap-2'>
                                <Download className='h-4 w-4' />
                                Export
                            </Button>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='h-[500px] overflow-y-auto print:hidden'>
                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            totalItems={reportData.length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            showSearchColumns={false}
                            isLoading={isPending}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
