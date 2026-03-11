'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useReportDepartments,
    useReportDesignations,
    useReportGroupTypes,
    useMonthEndReport
} from '@/hooks/hrms/useReports';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { Loader2, Search, Users, UserPlus, UserMinus, ImageOff, Mail, Phone, FileCheck, FileText, Printer } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';

const MONTH_LIST = [
    { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
    { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
    { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
    { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
];

const MonthEndReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required')
});

type FormFields = z.infer<typeof MonthEndReportSchema>;

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function HRMSMonthEndReportPage() {
    const [reportData, setReportData] = useState<any>(null);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(MonthEndReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        }
    });

    const watchedGroupTypes = watch('groupType');
    const watchedDepartments = watch('department');

    const { data: groupTypesData, isLoading: groupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: departmentsLoading } = useReportDepartments((Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(','));
    const { data: designationsData, isLoading: designationsLoading } = useReportDesignations((Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(','), (Array.isArray(watchedDepartments) ? watchedDepartments : []).join(','));
    const { data: yearsData, isLoading: yearsLoading } = useLeaveYearDropdown();

    const { mutate: generateReport, isPending: isSearching } = useMonthEndReport();

    const onSearch = (data: FormFields) => {
        const selectedYearObj = (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(data.year ?? ''));
        const yearStr = selectedYearObj?.hrmlY_LeaveYear || String(data.year ?? '0');
        generateReport({
            hreS_Year: Number(yearStr),
            hreS_Month: data.month,
            hrmd_ids: (data.department || []).map(Number),
            hrmgt_ids: (data.groupType || []).map(Number),
            hrmdes_ids: (data.designation || []).map(Number)
        }, {
            onSuccess: (res) => {
                if (res.success && res.data) {
                    setReportData(res.data);
                    toast.success('Report generated successfully');
                } else {
                    toast.error(res.message || 'No data found');
                    setReportData(null);
                }
            }
        });
    };

    const handleReset = () => {
        reset();
        setReportData(null);
    };

    const employeeStatusData = reportData ? [
        { name: 'Working', value: reportData.workingEmployeeCount },
        { name: 'Left', value: reportData.leftEmployeeCount },
        { name: 'New', value: reportData.newEmployeeCount }
    ].filter(item => item.value > 0) : [];

    const missingInfoData = reportData ? [
        { name: 'Photos', Working: reportData.missingPhotoWorking, Left: reportData.missingPhotoLeft, New: reportData.missingPhotoNew },
        { name: 'Emails', Working: reportData.missingEmailWorking, Left: reportData.missingEmailLeft, New: reportData.missingEmailNew },
        { name: 'Mobiles', Working: reportData.missingMobileWorking, Left: reportData.missingMobileLeft, New: reportData.missingMobileNew }
    ] : [];

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-3xl font-bold tracking-tight'>HRMS Month End Report</h2>
            </div>

            <CollapsibleSection title='Report Criteria' defaultOpen={true} variant='outline' className='shadow-md border-primary/20 bg-card/50 backdrop-blur-sm'>
                <form onSubmit={handleSubmit(onSearch)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>Group Type <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(groupTypesData?.data || []).filter(Boolean).map((gt: any) => ({
                                            label: String(gt.value || ''),
                                            value: String(gt.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Group Types'
                                        disabled={groupTypesLoading}
                                    />
                                )}
                            />
                            {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Department <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(departmentsData?.data || []).filter(Boolean).map((d: any) => ({
                                            label: String(d.hrmD_DepartmentName || d.value || ''),
                                            value: String(d.hrmD_Id ?? d.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Departments'
                                        disabled={departmentsLoading}
                                    />
                                )}
                            />
                            {errors.department && <FormError>{errors.department.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Designation <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(designationsData?.data || []).filter(Boolean).map((d: any) => ({
                                            label: String(d.hrmdeS_DesignationName || d.value || ''),
                                            value: String(d.hrmdeS_Id ?? d.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Designations'
                                        disabled={designationsLoading}
                                    />
                                )}
                            />
                            {errors.designation && <FormError>{errors.designation.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Year <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(yearsData?.data || []).filter(Boolean).map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={String(y.hrmlY_Id ?? '')}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.year && <FormError>{errors.year.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Month <span className='text-destructive'>*</span></Label>
                            <Controller
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.name}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.month && <FormError>{errors.month.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-end gap-3'>
                        <Button type='button' variant='outline' onClick={handleReset} className='hover:bg-accent hover:text-accent-foreground transition-all duration-200'>
                            Reset
                        </Button>
                        <Button type='submit' disabled={isSearching} className='bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md'>
                            {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate Report
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <div className='space-y-8 animate-in fade-in zoom-in duration-500'>
                    {/* Summary Cards */}
                    <div className='grid gap-4 md:grid-cols-3'>
                        <Card className='bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-sm'>
                            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                                <CardTitle className='text-sm font-medium'>Working Employees</CardTitle>
                                <Users className='h-4 w-4 text-green-500' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{reportData.workingEmployeeCount}</div>
                                <p className='text-xs text-muted-foreground'>Total active staff members</p>
                            </CardContent>
                        </Card>
                        <Card className='bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 shadow-sm'>
                            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                                <CardTitle className='text-sm font-medium'>New Joinings</CardTitle>
                                <UserPlus className='h-4 w-4 text-blue-500' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{reportData.newEmployeeCount}</div>
                                <p className='text-xs text-muted-foreground'>Newly recruited this month</p>
                            </CardContent>
                        </Card>
                        <Card className='bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 shadow-sm'>
                            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                                <CardTitle className='text-sm font-medium'>Employees Left</CardTitle>
                                <UserMinus className='h-4 w-4 text-red-500' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{reportData.leftEmployeeCount}</div>
                                <p className='text-xs text-muted-foreground'>Staff who resigned</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Salary & Communication Progress */}
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <div className='flex items-center gap-4 p-4 rounded-xl border bg-card shadow-sm'>
                            <div className='p-3 rounded-lg bg-orange-500/10'>
                                <FileCheck className='h-6 w-6 text-orange-500' />
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Generated</p>
                                <p className='text-xl font-bold'>{reportData.salaryGenerated}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 p-4 rounded-xl border bg-card shadow-sm'>
                            <div className='p-3 rounded-lg bg-emerald-500/10'>
                                <FileText className='h-6 w-6 text-emerald-500' />
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Slips</p>
                                <p className='text-xl font-bold'>{reportData.salarySlipGenerated}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 p-4 rounded-xl border bg-card shadow-sm'>
                            <div className='p-3 rounded-lg bg-indigo-500/10'>
                                <Mail className='h-6 w-6 text-indigo-500' />
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>Emails Sent</p>
                                <p className='text-xl font-bold'>{reportData.emailCount}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 p-4 rounded-xl border bg-card shadow-sm'>
                            <div className='p-3 rounded-lg bg-cyan-500/10'>
                                <Phone className='h-6 w-6 text-cyan-500' />
                            </div>
                            <div>
                                <p className='text-sm font-medium text-muted-foreground'>SMS Sent</p>
                                <p className='text-xl font-bold'>{reportData.smsCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Completeness Alerts (Missing Info) */}
                    <Card className='border-amber-500/20 bg-amber-500/5'>
                        <CardHeader>
                            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                                <Loader2 className='h-5 w-5 text-amber-500 animate-spin' />
                                Data Completeness Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-6 md:grid-cols-3'>
                                <div className='space-y-4'>
                                    <h4 className='font-semibold flex items-center gap-2'><Users className='h-4 w-4' /> Working Staff</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between text-sm'>
                                            <span className='flex items-center gap-2 text-muted-foreground'><ImageOff className='h-3 w-3' /> Missing Photos</span>
                                            <span className='font-bold text-red-500'>{reportData.missingPhotoWorking}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='flex items-center gap-2 text-muted-foreground'><Mail className='h-3 w-3' /> Missing Emails</span>
                                            <span className='font-bold text-red-500'>{reportData.missingEmailWorking}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='flex items-center gap-2 text-muted-foreground'><Phone className='h-3 w-3' /> Missing Mobiles</span>
                                            <span className='font-bold text-red-500'>{reportData.missingMobileWorking}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-4'>
                                    <h4 className='font-semibold flex items-center gap-2'><UserPlus className='h-4 w-4' /> New Joinings</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Photos</span>
                                            <span className='font-bold text-red-500'>{reportData.missingPhotoNew}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Emails</span>
                                            <span className='font-bold text-red-500'>{reportData.missingEmailNew}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Mobiles</span>
                                            <span className='font-bold text-red-500'>{reportData.missingMobileNew}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-4'>
                                    <h4 className='font-semibold flex items-center gap-2'><UserMinus className='h-4 w-4' /> Left Staff</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Photos</span>
                                            <span className='font-bold text-red-500'>{reportData.missingPhotoLeft}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Emails</span>
                                            <span className='font-bold text-red-500'>{reportData.missingEmailLeft}</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-muted-foreground'>Missing Mobiles</span>
                                            <span className='font-bold text-red-500'>{reportData.missingMobileLeft}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Analytics */}
                    <div className='grid gap-6 md:grid-cols-2'>
                        <Card className='shadow-sm overflow-hidden border-primary/10'>
                            <CardHeader className='bg-muted/30'>
                                <CardTitle className='text-lg font-semibold'>Employee Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6'>
                                <ResponsiveContainer width='100%' height={300}>
                                    <PieChart>
                                        <Pie
                                            data={employeeStatusData}
                                            cx='50%'
                                            cy='50%'
                                            labelLine={false}
                                            outerRadius={80}
                                            fill='#8884d8'
                                            dataKey='value'
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {employeeStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className='shadow-sm overflow-hidden border-primary/10'>
                            <CardHeader className='bg-muted/30'>
                                <CardTitle className='text-lg font-semibold'>Missing Data Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6'>
                                <ResponsiveContainer width='100%' height={300}>
                                    <BarChart data={missingInfoData}>
                                        <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                        <XAxis dataKey='name' />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey='Working' fill='#22c55e' radius={[4, 4, 0, 0]} />
                                        <Bar dataKey='New' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                                        <Bar dataKey='Left' fill='#ef4444' radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Footer */}
                    <div className='flex justify-center pt-6 border-t'>
                        <Button
                            variant='outline'
                            size='lg'
                            onClick={() => window.print()}
                            className='gap-2 shadow-sm transition-transform hover:scale-105 active:scale-95'
                        >
                            <Printer className='h-5 w-5' />
                            Print Summary Report
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
