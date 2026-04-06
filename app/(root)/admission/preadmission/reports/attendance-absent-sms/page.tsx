'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Bell, CalendarIcon, Mail, MessageSquare, Save } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { CalendarYear } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useAttendanceAbsentSmsReport, useAttendanceAbsentInitialDetails, useAttendanceAbsentCommunication } from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { getExcelAttendanceAbsentSmsReport } from '@/server/admission/preadmission/reports/month_end_report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { absentStudentColumns, attendanceSummaryColumns } from './_components/columns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// helper to compare local dates
const isSameLocalDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Local schema for this form
const attendanceAbsentSmsSchema = z.object({
    frequency: z.enum(['once', 'twice']).default('once'),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    amC_Id: z.number().optional().default(0),
    from_date: z.string().nonempty('Date is required')
});

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type FormFields = z.infer<typeof attendanceAbsentSmsSchema>;

export default function OverallDailyAttendanceAbsentPage(props: { searchParams: SearchParams }) {
    const searchParams = (React as any).use(props.searchParams);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // OTP/Dialog States
    const [isOtpSelectionOpen, setIsOtpSelectionOpen] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [otpType, setOtpType] = useState<'M' | 'E'>('M');
    const [communicationType, setCommunicationType] = useState<'SMS' | 'EMAIL' | 'NOTICE'>('SMS');
    const [otpValue, setOtpValue] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(attendanceAbsentSmsSchema),
        defaultValues: {
            frequency: 'once',
            from_date: new Date().toISOString(),
            amC_Id: 0
        }
    });

    const frequency = watch('frequency');
    const asmaY_Id = watch('asmaY_Id');
    const from_date = watch('from_date');
    const amC_Id = watch('amC_Id');

    // Hooks
    const { data: academicYears, isLoading: ayLoading } = useAcademicYearDropdown();
    const { data: initialDetails } = useAttendanceAbsentInitialDetails();
    const { data: response, refetch, isLoading: reportLoading } = useAttendanceAbsentSmsReport(
        asmaY_Id,
        from_date,
        frequency === 'once' ? 'once' : 'twice',
        amC_Id,
        frequency === 'once' ? 'D' : 'H',
        searchParams
    );
    const { sendSms, sendEmail, sendNotice, sendOtp, verifyOtp } = useAttendanceAbsentCommunication();

    const categoryDropdown = initialDetails?.data?.category_list ?? [];
    const categoryFlag = initialDetails?.data?.categoryflag ?? false;

    // Config for OTP
    const configSettings = initialDetails?.data?.configsettings?.[0] ?? {};
    const emailOtpEnabled = configSettings?.ivrmgC_emailValOTPFlag === 1;
    const mobileOtpEnabled = configSettings?.ivrmgC_MobileValOTPFlag === 1;
    const otpMobileNo = configSettings?.ivrmgC_OTPMobileNo?.toString() ?? '';
    const otpEmailId = configSettings?.ivrmgC_OTPMailId ?? '';

    useEffect(() => {
        if (!emailOtpEnabled && mobileOtpEnabled) setOtpType('M');
        if (emailOtpEnabled && !mobileOtpEnabled) setOtpType('E');
    }, [emailOtpEnabled, mobileOtpEnabled]);

    const onSubmit = async () => {
        if (!asmaY_Id || asmaY_Id === 0) {
            toast.error('Please select Academic Year');
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await refetch();
            if (data?.message) {
                toast.success(data.message);
            } else if (!data?.data?.studentAttendanceList?.length && !data?.data?.absentStudentList?.length) {
                toast.error('No data found for the selected criteria');
            }
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommunicationTrigger = (type: 'SMS' | 'EMAIL' | 'NOTICE') => {
        if (selectedRows.length === 0) {
            toast.error('Kindly select at least one student!');
            return;
        }
        setCommunicationType(type);
        if (emailOtpEnabled || mobileOtpEnabled) {
            setIsOtpSelectionOpen(true);
        } else {
            setIsOtpVerified(true);
            setIsVerificationOpen(true);
        }
    };

    const handleSendOtp = async () => {
        try {
            const payload = {
                clickedlinkname: otpType,
                Mobile: otpMobileNo,
                Email: otpEmailId
            };
            const res = await sendOtp.mutateAsync(payload);
            if (res) {
                setIsOtpSelectionOpen(false);
                setIsVerificationOpen(true);
                toast.success('OTP sent successfully');
            }
        } catch {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = (await verifyOtp.mutateAsync({ EMAILOTP: otpValue })) as any;
            if (res === 'Success' || res?.data === 'Success') {
                setIsOtpVerified(true);
                toast.success('OTP verified');
            } else {
                toast.error('Invalid OTP');
            }
        } catch {
            toast.error('Failed to verify OTP');
        }
    };

    const handleFinalAction = async () => {
        try {
            const payload = {
                absentlist: selectedRows,
                ASMAY_Id: asmaY_Id,
                fromdate: new Date(from_date).toDateString(),
                attType: frequency === 'once' ? 'D' : 'H'
            };

            let res;
            if (communicationType === 'SMS') res = await sendSms.mutateAsync(payload);
            else if (communicationType === 'EMAIL') res = await sendEmail.mutateAsync(payload);
            else res = await sendNotice.mutateAsync(payload);

            if (res) {
                toast.success(res.message || 'Action completed successfully');
                setIsVerificationOpen(false);
                setOtpValue('');
                setIsOtpVerified(false);
                onSubmit(); // Refresh
            }
        } catch {
            toast.error('Action failed');
        }
    };

    const downloadExcel = async () => {
        try {
            if (!asmaY_Id || !from_date || !frequency) {
                toast.error('Please fill all required fields!');
                return;
            }

            const response = await getExcelAttendanceAbsentSmsReport(asmaY_Id, from_date, frequency, searchParams);

            const blob =
                response instanceof Blob
                    ? response
                    : new Blob([new Uint8Array(response)], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `AttendanceAbsentSmsReport_${format(new Date(), 'yyyyMMdd')}.xlsx`;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    const studentAttendanceList = (response as any)?.data?.studentAttendanceList ?? [];
    const absentStudentList = (response as any)?.data?.student_teacherList ?? (response as any)?.data?.absentStudentList ?? [];
    const totalAttendanceRecords = studentAttendanceList.length;
    const totalAbsentRecords = absentStudentList.length;

    return (
        <div className='min-h-screen space-y-6'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4 rounded-xl border bg-card p-6 shadow-xl'>
                    <div className='mb-6 text-center'>
                        <div className='mt-3 mb-6 flex justify-center'>
                            <Controller
                                name='frequency'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='once' id='once' />
                                            <Label htmlFor='once'>Daily Once</Label>
                                        </div>

                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='twice' id='twice' />
                                            <Label htmlFor='twice'>Daily Twice</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.frequency && <FormError>{errors.frequency.message}</FormError>}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>Academic Year <span className='text-red-500'>*</span></Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayLoading ? (
                                                <SelectItem value='0' disabled>Loading...</SelectItem>
                                            ) : (
                                                academicYears?.data?.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Category (Conditional) */}
                        {categoryFlag && (
                            <div className='flex flex-col gap-1.5'>
                                <Label>Category</Label>
                                <Controller
                                    name='amC_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {categoryDropdown.map((c: any) => (
                                                    <SelectItem key={c.amC_Id} value={c.amC_Id.toString()}>
                                                        {c.amC_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {/* Date Picker */}
                        <Controller
                            name='from_date'
                            control={control}
                            render={({ field }) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Date <span className='text-red-500'>*</span></Label>
                                    <Popover
                                        open={openPopover === 'From_Date'}
                                        onOpenChange={(open) => setOpenPopover(open ? 'From_Date' : null)}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground',
                                                    errors.from_date && 'border-red-500'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    date && field.onChange(date.toISOString());
                                                    setOpenPopover(null);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    <div className='mt-6 flex flex-wrap justify-center gap-3 border-t pt-4'>
                        <Button type='submit' disabled={isSubmitting} isLoading={isLoading || isSubmitting} className='w-fit'>
                            <Save className='mr-2 h-4 w-4' /> Report
                        </Button>
                        <Button type='button' variant='outline' onClick={() => { reset(); setSelectedRows([]); }} className='w-fit'>
                            Reset
                        </Button>
                        <Button type='button' onClick={() => handleCommunicationTrigger('SMS')} disabled={studentAttendanceList.length === 0} className='w-fit bg-blue-600 hover:bg-blue-700'>
                            <MessageSquare className='mr-2 h-4 w-4' /> Send SMS
                        </Button>
                        <Button type='button' onClick={() => handleCommunicationTrigger('EMAIL')} disabled={studentAttendanceList.length === 0} className='w-fit bg-green-600 hover:bg-green-700'>
                            <Mail className='mr-2 h-4 w-4' /> Send Email
                        </Button>
                        <Button type='button' onClick={() => handleCommunicationTrigger('NOTICE')} disabled={studentAttendanceList.length === 0} className='w-fit bg-orange-600 hover:bg-orange-700'>
                            <Bell className='mr-2 h-4 w-4' /> Send Notice
                        </Button>
                        <Button type='button' variant='outline' onClick={downloadExcel} className='w-fit'>
                            Export to Excel
                        </Button>
                    </div>
                </div>
            </form>

            <div className='container space-y-8 p-0'>
                <CollapsibleSection title='Overall Daily Attendance Summary' defaultOpen={true} variant='outline'>
                    <GenericDataTable
                        data={studentAttendanceList}
                        totalItems={totalAttendanceRecords}
                        columns={attendanceSummaryColumns}
                        isLoading={reportLoading}
                        noDataTitle='No Attendance Data'
                        showViewOptions={false}
                    />
                </CollapsibleSection>

                <CollapsibleSection title='Absent Student List' defaultOpen={true} variant='outline'>
                    <GenericDataTable
                        data={absentStudentList}
                        totalItems={totalAbsentRecords}
                        columns={absentStudentColumns(frequency)}
                        isLoading={reportLoading}
                        noDataTitle='No Absent Students'
                        onRowSelectionChange={setSelectedRows}
                        showViewOptions={false}
                    />
                </CollapsibleSection>
            </div>

            {/* OTP Selection Dialog */}
            <Dialog open={isOtpSelectionOpen} onOpenChange={setIsOtpSelectionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select OTP Verification Type</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-4'>
                        <RadioGroup value={otpType} onValueChange={(v: any) => setOtpType(v)} className='flex gap-6'>
                            {mobileOtpEnabled && (
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='M' id='m_otp' />
                                    <Label htmlFor='m_otp'>Mobile OTP (******{otpMobileNo.slice(-4)})</Label>
                                </div>
                            )}
                            {emailOtpEnabled && (
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='E' id='e_otp' />
                                    <Label htmlFor='e_otp'>Email OTP ({otpEmailId.slice(0, 4)}******)</Label>
                                </div>
                            )}
                        </RadioGroup>
                        <p className='text-sm text-yellow-600'>OTP will be sent to the authorized {otpType === 'M' ? 'Mobile Number' : 'Email ID'}.</p>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsOtpSelectionOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendOtp} isLoading={sendOtp.isPending}>Send OTP</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verification Dialog */}
            <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Verification Details - {communicationType}</DialogTitle>
                    </DialogHeader>
                    <div className='max-h-60 overflow-y-auto border p-2'>
                        <table className='w-full text-sm border-collapse'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='p-2 text-left'>Sl. No.</th>
                                    <th className='p-2 text-left'>Class-Section</th>
                                    <th className='p-2 text-left'>Student Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map((row, idx) => (
                                    <tr key={idx} className='border-b'>
                                        <td className='p-2'>{idx + 1}</td>
                                        <td className='p-2'>{row.classsection}</td>
                                        <td className='p-2'>{row.studentname}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isOtpVerified && (emailOtpEnabled || mobileOtpEnabled) ? (
                        <div className='mt-4 flex flex-col gap-2'>
                            <Label>Enter OTP</Label>
                            <div className='flex gap-2'>
                                <Input value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder='Enter OTP' />
                                <Button onClick={handleVerifyOtp} isLoading={verifyOtp.isPending}>Verify</Button>
                                <Button variant='ghost' size='sm' onClick={handleSendOtp} disabled={sendOtp.isPending}>Resend</Button>
                            </div>
                        </div>
                    ) : (
                        <div className='mt-4 p-3 bg-green-50 text-green-700 rounded-md'>
                            Verification completed. Ready to send {communicationType.toLowerCase()}.
                        </div>
                    )}

                    <DialogFooter className='mt-6'>
                        <Button variant='outline' onClick={() => setIsVerificationOpen(false)}>Close</Button>
                        <Button onClick={handleFinalAction} disabled={!isOtpVerified && (emailOtpEnabled || mobileOtpEnabled)} className='bg-primary'>
                            SEND
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
