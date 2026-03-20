'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { DetailedTimePicker } from './_components/detailed-time-picker';
import {
    useReportGroupTypes,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation
} from '@/hooks/hrms/useReports';
import { useSaveEmployeePunch, useEmployeePunchDetails, useTogglePunchDetail } from '@/hooks/hrms/attendance-management/useFrontOfficeAddLogs';
import { Loader2, Save, X, Trash2 } from 'lucide-react';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FilterFormValues {
    groupType: string[];
    department: string[];
    designation: string[];
    date: Date;
    employee: string;
    punchTime: string; // HH:mm format
    inOutFlag: 'I' | 'O' | '';
}

export default function FrontOfficeAddLogsPage() {
    return (
        <FormProvider>
            <FrontOfficeAddLogsContent />
        </FormProvider>
    );
}

function FrontOfficeAddLogsContent() {
    const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FilterFormValues>({
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            date: new Date(),
            employee: '',
            punchTime: 'HH:MM',
            inOutFlag: 'I'
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedEmployee = watch('employee');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => watchedGroupType.map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const { data: groupTypesData } = useReportGroupTypes();
    const { data: departmentsData } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData } = useReportEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds);

    console.log("employeesData", watchedEmployee);

    // Fetch existing punch details
    const watchedDate = watch('date');
    const formattedDate = watchedEmployee && watchedDate ? format(watchedDate, "yyyy-MM-dd") : '';
    console.log("formattedDate", formattedDate);
    const { data: punchDetailsData, isLoading: isPunchDetailsLoading, refetch: refetchPunchDetails } = useEmployeePunchDetails(
        formattedDate,
        Number(watchedEmployee)
    );
    console.log("punchDetailsData", punchDetailsData);
    // Transforms
    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
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
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.hrmE_Id || emp.id;
                if (!id) return null;

                return {
                    id: Number(id),
                    employeeName: emp.employeeFullName || 'Unknown Employee',
                    employeeCode: emp.hrmE_EmployeeCode || id.toString()
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    const { mutateAsync: savePunch, isPending } = useSaveEmployeePunch();
    const { mutate: deletePunch, isPending: isDeleting } = useTogglePunchDetail();

    const onSubmit = async (data: FilterFormValues) => {
        if (!data.employee || !data.punchTime || !data.inOutFlag) {
            toast.error('Please select Employee, Time, and In-Out direction');
            return;
        }
        const formattedDate = format(data.date, "yyyy-MM-dd")
        console.log('data', data);
        const payload = {
            punchLogs: [
                {
                    hrmE_Id: Number(data.employee),
                    foeP_PunchDate: formattedDate,
                    foepD_PunchTime: data.punchTime,
                    inOutFlag: data.inOutFlag as 'I' | 'O'
                }
            ]
        };

        try {
            await savePunch(payload);
            reset({
                groupType: [],
                department: [],
                designation: [],
                date: new Date(),
                employee: '',
                punchTime: 'HH:MM',
                inOutFlag: ''
            });
        } catch (error) {
            console.error('Save Error:', error);
        }
    };

    const resetHandler = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            date: new Date(),
            employee: '',
            punchTime: 'HH:MM',
            inOutFlag: ''
        });
    };

    // Disable future dates
    const maxDate = format(new Date(), 'yyyy-MM-dd');

    return (
        <div className='container min-h-screen space-y-4 p-4'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight uppercase text-primary'>Front Office</h2>
            </div>

            <CollapsibleSection defaultOpen={true} title='EMPLOYEE LOGS INSERTION' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Filters Section */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-2'>
                            <Label>Group Type</Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={groupTypesDataTransformed.map((gt: any) => ({
                                            label: gt.name,
                                            value: String(gt.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Group Types'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Department</Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={departmentsDataTransformed.map((dept: any) => ({
                                            label: dept.name,
                                            value: String(dept.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Departments'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Designation</Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={designationsDataTransformed.map((desg: any) => ({
                                            label: desg.name,
                                            value: String(desg.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Designations'
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Date and Employee Name Row */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                            <Label>Date <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='date'
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Select Date'
                                        disabled={{ after: new Date() }}
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Employee Name <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='employee'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value ? 'selected' : 'empty'}
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Employee' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesDataTransformed.map((emp: any) => (
                                                <SelectItem key={emp.id} value={String(emp.id)}>
                                                    {emp.employeeName} - [{emp.employeeCode}]
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Punch Details Section - VISIBLE ONLY IF EMPLOYEE IS SELECTED */}
                    {watchedEmployee && (
                        <div className='flex flex-wrap lg:flex-nowrap gap-8 bg-muted/20 p-8 rounded-xl border border-primary/20 transition-all animate-in fade-in slide-in-from-top-4 mt-4'>
                            {/* Existing Punch Logs Table */}
                            {(punchDetailsData as any)?.data && (punchDetailsData as any).data.length > 0 && (
                                <div className='flex-1 min-w-[300px] border border-primary/20 rounded overflow-hidden'>
                                    <table className='w-full text-sm border-collapse'>
                                        <thead className='bg-[#0066cc] text-white'>
                                            <tr>
                                                <th className='border border-white/20 p-2 font-bold whitespace-nowrap'>SL. No.</th>
                                                <th className='border border-white/20 p-2 font-bold whitespace-nowrap'>Times</th>
                                                <th className='border border-white/20 p-2 font-bold whitespace-nowrap'>IN / OUT</th>
                                                <th className='border border-white/20 p-2 font-bold whitespace-nowrap'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white'>
                                            {isPunchDetailsLoading ? (
                                                <tr>
                                                    <td colSpan={4} className='p-4 text-center'>
                                                        <Loader2 className='h-4 w-4 animate-spin mx-auto text-primary' />
                                                    </td>
                                                </tr>
                                            ) : (
                                                (punchDetailsData as any).data.map((punch: any, index: number) => (
                                                    <tr key={punch.foepD_Id} className='text-center hover:bg-muted/30'>
                                                        <td className='border border-muted p-2'>{index + 1}</td>
                                                        <td className='border border-muted p-2 font-bold'>{punch.foepD_PunchTime}</td>
                                                        <td className='border border-muted p-2 font-bold'>{punch.foepD_InOutFlg === 'I' ? 'IN' : 'OUT'}</td>
                                                        <td className='border border-muted p-2'>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 text-destructive hover:text-white hover:bg-destructive'
                                                                title='Delete Punch'
                                                                onClick={() => setDeleteId(punch.foepD_Id)}
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Time Picker Side */}
                            <div className='flex flex-col w-fit'>
                                <Controller
                                    name='punchTime'
                                    control={control}
                                    rules={{ 
                                        required: 'Select Time',
                                        validate: (val) => val !== 'HH:MM' || 'Select Time'
                                    }}
                                    render={({ field, fieldState }) => (
                                        <DetailedTimePicker 
                                            value={field.value} 
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Flag Side */}
                            <div className='flex flex-col gap-1  w-fit md:min-w-[200px]'>
                                <div className=' border-[#3b82f6] pb-1  w-fit px-2'>
                                    <span className='font-bold text-[#3b82f6] text-sm uppercase tracking-wide'>In-Out</span>
                                </div>
                                <Controller
                                    name='inOutFlag'
                                    control={control}
                                    rules={{ required: 'Select Display Type' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className='h-12 border-2 border-[#3b82f6] focus:ring-[#3b82f6]/20 bg-white rounded'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='I'>IN (I)</SelectItem>
                                                <SelectItem value='O'>OUT (O)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.inOutFlag && (
                                    <p className='text-red-500 text-sm font-medium mt-1'>
                                        {errors.inOutFlag.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-6 pt-6'>
                        <Button
                            type='submit'
                            disabled={isPending || !watchedEmployee}
                            className='w-40 h-11 bg-blue-800 hover:bg-blue-900 text-white font-bold text-base shadow-md transition-all active:scale-95'
                        >
                            {isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Save className='mr-2 h-5 w-5' />}
                            SAVE
                        </Button>
                        <Button
                            type='button'
                            disabled={isPending}
                            className='w-40 h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-md transition-all active:scale-95'
                            onClick={(e) => {
                                e.preventDefault();
                                resetHandler();
                            }}
                        >
                            <X className='mr-2 h-5 w-5' />
                            CANCEL
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {/* Delete Confirmation Dialog */}
            <AdaptiveDialog
                title='Delete Punch Detail'
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
            >
                <div className='flex flex-col gap-4'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <p>
                            Are you sure you want to delete this punch record?
                        </p>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='secondary' onClick={() => setDeleteId(null)} type='button'>
                            Cancel
                        </Button>
                        <Button
                            type='button'
                            isLoading={isDeleting}
                            variant={'destructive'}
                            onClick={() => {
                                if (deleteId) {
                                    deletePunch(deleteId, {
                                        onSuccess: () => {
                                            setDeleteId(null);
                                        }
                                    });
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </AdaptiveFooter>
                </div>
            </AdaptiveDialog>
        </div>
    );
}
