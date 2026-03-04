
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays, differenceInDays } from 'date-fns';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, Check, X, FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ILeaveBalance, ILeaveHistory } from '@/types/staff-portal/online-leave';
import { onlineLeaveSchema, OnlineLeaveValues } from '@/types/staff-portal/online-leave-schema';
import { toast } from 'sonner';
import { useOnlineLeave } from '@/hooks/staff-portal/useOnlineLeave';

interface Props {
    initialData: any | null | undefined;
    masterLeaveData: any | null | undefined;
}

const LeaveApplicationForm = ({ initialData, masterLeaveData }: Props) => {
    const { applyMutation } = useOnlineLeave();

    const employee = initialData?.employeeDetails?.[0];
    const leaveBalances = initialData?.employeeLeaveDetails || [];

    const form = useForm<OnlineLeaveValues>({
        resolver: zodResolver(onlineLeaveSchema),
        defaultValues: {
            leaveType: '',
            reason: '',
            contact: employee?.hrmE_MobileNo?.toString() || '',
            supportingDocument: '',
            isHalfDay: false,
        },
    });

    useEffect(() => {
        if (employee?.hrmE_MobileNo) {
            form.setValue('contact', employee.hrmE_MobileNo.toString());
        }
    }, [employee, form]);

    useEffect(() => {
        if (applyMutation.isSuccess) {
            form.reset({
                leaveType: '',
                reason: '',
                contact: employee?.hrmE_MobileNo?.toString() || '',
                supportingDocument: '',
                isHalfDay: false,
            });
        }
    }, [applyMutation.isSuccess, form, employee]);

    const selectedLeaveId = form.watch('leaveType');
    const fromDate = form.watch('fromDate');
    const toDate = form.watch('toDate');
    const isHalfDay = form.watch('isHalfDay');

    // Find in both lists to ensure we get all info, but prefer balance records
    const masterList = masterLeaveData?.data?.GridviewDetails || masterLeaveData?.data || [];
    const selectedLeaveInfo = [...leaveBalances, ...masterList].find((l: any) => l.hrmL_Id.toString() === selectedLeaveId);

    const totalDays = React.useMemo(() => {
        if (!fromDate || !toDate) return 0;
        let days = differenceInDays(toDate, fromDate) + 1;
        if (isHalfDay) days -= 0.5;
        return days > 0 ? days : 0;
    }, [fromDate, toDate, isHalfDay]);

    // Handle form submission
    const onSubmit = (values: OnlineLeaveValues) => {
        const payload = {
            hrmE_Id: employee?.hrmE_Id || 1207,
            hrelaP_Id: 0,
            hrelaP_ApplicationID: null,
            hrelaP_LeaveReason: values.reason,
            hrelT_LeaveReason: values.reason,
            hrelT_Reportingdate: values.reportingDate.toISOString(),
            hrelT_SupportingDocument: values.supportingDocument || 'leave_doc.pdf',
            asmay_id: 0,
            hrmE_MobileNo: Number(values.contact || employee?.hrmE_MobileNo || 0),
            frmToDates: [{
                hrelaP_FromDate: values.fromDate.toISOString(),
                hrelaP_ToDate: values.toDate.toISOString(),
                hrelaP_TotalDays: totalDays,
            }],
            temp_table_data: selectedLeaveInfo ? [{
                hrmL_Id: selectedLeaveInfo.hrmL_Id,
                hrmL_LeaveName: selectedLeaveInfo.hrmL_LeaveName,
                hrelS_Id: selectedLeaveInfo.hrelS_Id || 0,
                hrelS_CBLeaves: selectedLeaveInfo.hrelS_CBLeaves || 0
            }] : [],
        };

        console.log('📤 [FORM] Submitting Payload:', JSON.stringify(payload, null, 2));
        applyMutation.mutate(payload as any);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* 1. Employee Info Section */}
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="bg-primary/10 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            Online Leave Application
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InfoField label="Employee Name" value={employee?.hrmE_EmployeeName} />
                            <InfoField label="Designation" value={employee?.hrmdeS_DesignationName} />
                            <InfoField label="DOJ" value={employee?.hrmE_DOJ ? format(new Date(employee.hrmE_DOJ), 'dd-MM-yyyy') : ''} />
                            <InfoField label="Email" value={employee?.hrmE_EmailId} />
                            <InfoField label="Phone" value={employee?.hrmE_MobileNo} />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Leave Application Section */}
                <Card className="shadow-md">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-lg">Apply for Leave</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <FormField
                                control={form.control}
                                name="leaveType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Leave Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select leave type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Prioritize master leave list if available, else use balances */}
                                                {(masterLeaveData?.data?.GridviewDetails || masterLeaveData?.data || leaveBalances).map((l: any) => (
                                                    <SelectItem key={l.hrmL_Id} value={l.hrmL_Id.toString()}>
                                                        {l.hrmL_LeaveName} {l.hrelS_CBLeaves !== undefined ? `(Bal: ${l.hrelS_CBLeaves})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fromDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>From Date <span className="text-destructive">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="toDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>To Date <span className="text-destructive">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    disabled={(date) => fromDate ? date < fromDate : false}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem>
                                <FormLabel>Total Days</FormLabel>
                                <div className="flex items-center gap-4">
                                    <Input value={totalDays} readOnly className="w-20 bg-muted font-bold" />
                                    <FormField
                                        control={form.control}
                                        name="isHalfDay"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        id="isHalfDay"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <label htmlFor="isHalfDay" className="text-sm font-medium leading-none cursor-pointer">
                                                    Half Day
                                                </label>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reasons for Leave <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter reason for leave..." className="h-20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Number While on Leave <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="10 digit mobile number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reportingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date Reporting Back <span className="text-destructive">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supportingDocument"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supporting Document <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        readOnly
                                                        value={field.value ? 'Document Uploaded' : ''}
                                                        placeholder="Click to upload document"
                                                        className="cursor-pointer"
                                                        onClick={() => document.getElementById('leave-doc-upload')?.click()}
                                                    />
                                                    <input
                                                        type="file"
                                                        id="leave-doc-upload"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            // Mock upload for now, usually calls a server action or storage service
                                                            const file = e.target.files?.[0];
                                                            if (file) field.onChange(URL.createObjectURL(file));
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('leave-doc-upload')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" /> Upload
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-center gap-4 mt-10">
                            <Button
                                type="submit"
                                size="lg"
                                className="px-8 gap-2"
                                disabled={applyMutation.isPending}
                            >
                                <Send className="h-4 w-4" /> Apply Leave Now
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="px-8"
                                onClick={() => {
                                    form.reset();
                                }}
                            >
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
};

// Helper Components
const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="space-y-1">
        <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium border-b pb-1">{value || '--'}</p>
    </div>
);

export default LeaveApplicationForm;
