
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, X, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onlineLeaveSchema, OnlineLeaveValues } from '@/types/staff-portal/online-leave-schema';
import { useOnlineLeave } from '@/hooks/staff-portal/useOnlineLeave';
import { toast } from 'sonner';
import { saveLeaveRequestDocument } from '@/server/hrms/leave-management/transaction/online-leave-application';

interface Props {
    selectedLeave: any | null | undefined;
    selectedFromDate: Date | undefined;
    selectedToDate: Date | undefined;
    totalDays: number | undefined;
    isHalfDay: boolean;
    setIsHalfDay: (val: boolean) => void;
    onSuccess?: () => void;
    employeeId?: number;
}

const LeaveApplicationForm = ({
    selectedLeave,
    selectedFromDate,
    selectedToDate,
    totalDays,
    isHalfDay,
    setIsHalfDay,
    onSuccess,
    employeeId
}: Props) => {
    const { applyMutation } = useOnlineLeave();
    const [isReportingDateOpen, setIsReportingDateOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    

    const handleFileUrl = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const hrmeId = employeeId;

        if (!hrmeId || hrmeId === 0) {
            toast.error('Employee details not loaded yet');
            return;
        }

        if (file) {
            try {
                setIsUploading(true);
                const formData = new FormData();

                // The swagger UI specifically expects the key 'leave_document'
                formData.append('leave_document', file);
                const response = await saveLeaveRequestDocument(hrmeId, formData);
                console.log("Upload API response:", response);

                if (response.success && response.data) {
                    form.setValue('supportingDocument', response.data);
                    setUploadedFileName(file.name);
                    toast.success('Document uploaded successfully');
                } else {
                    toast.error(response.message || 'Failed to upload document');
                }
            } catch (error: any) {
                toast.error(error.message || 'Error uploading document');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleViewFile = () => {
        const file = form.getValues('supportingDocument');
        if (file) {
            setPreviewFile(file);
        }
    };

    const form = useForm<OnlineLeaveValues>({
        resolver: zodResolver(onlineLeaveSchema),
        defaultValues: {
            leaveType: '',
            reason: '',
            contact: '',
            supportingDocument: '',
            isHalfDay: false,
        },
    });

    // Reset uploaded file name if the form is reset or successful
    useEffect(() => {
        if (!form.watch('supportingDocument')) {
            setUploadedFileName(null);
        }
    }, [form.watch('supportingDocument')]);

    // Sync with props
    useEffect(() => {
        if (selectedLeave) {
            form.setValue('leaveType', selectedLeave.hrmL_Id.toString());
            form.setValue('reportingDate', new Date());
        }
    }, [selectedLeave, form]);

    useEffect(() => {
        if (selectedFromDate) form.setValue('fromDate', selectedFromDate);
    }, [selectedFromDate, form]);

    useEffect(() => {
        if (selectedToDate) {
            form.setValue('toDate', selectedToDate);
            // Auto-set reporting date to day after toDate
            form.setValue('reportingDate', addDays(selectedToDate, 1));
        }
    }, [selectedToDate, form]);

    useEffect(() => {
        form.setValue('isHalfDay', isHalfDay);
    }, [isHalfDay, form]);

    // Handle form submission
    const onSubmit = (values: OnlineLeaveValues) => {
        if (!selectedLeave) {
            toast.error('Please select a leave type from the grid');
            return;
        }

        const payload = {
            hrelaP_Id: 0,
            hrelaP_ApplicationID: null,
            hrelaP_LeaveReason: values.reason,
            hrelT_LeaveReason: values.reason,
            hrelT_Reportingdate: values.reportingDate.toISOString(),
            hrelT_SupportingDocument: values.supportingDocument || 'leave_doc.pdf',
            asmay_id: 0,
            hrmE_MobileNo: Number(values.contact),
            frmToDates: [{
                hrelaP_FromDate: (selectedFromDate || values.fromDate).toISOString(),
                hrelaP_ToDate: (selectedToDate || values.toDate).toISOString(),
                hrelaP_TotalDays: totalDays || 0,
            }],
            temp_table_data: [{
                hrmL_Id: selectedLeave.hrmL_Id,
                hrmL_LeaveName: selectedLeave.hrmL_LeaveName,
                hrelS_Id: selectedLeave.hrelS_Id || 0,
                hrelS_CBLeaves: selectedLeave.hrelS_CBLeaves || 0
            }],
        };

        applyMutation.mutate(payload as any, {
            onSuccess: (res: any) => {
                if (res.success) {
                    form.reset({
                        leaveType: '',
                        reason: '',
                        contact: '',
                        supportingDocument: '',
                        isHalfDay: false,
                    });
                    onSuccess?.();
                }
            }
        });
    };

    return (
        <div className='px-6 pb-6 pt-2 space-y-8 animate-in slide-in-from-top-2 duration-300'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

                    {/* Form Fields */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        <FormField
                            control={form.control}
                            name='reason'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Reasons for Leave: <span className='text-red-500'>*</span></FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input className='h-11 border-sky-100 focus:ring-sky-100 rounded-xl bg-white shadow-sm' {...field} placeholder="Enter reason..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='contact'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex items-center gap-1 mb-1'>
                                        <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Contact Number: <span className='text-red-500'>*</span></FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            className='h-11 border-sky-100 focus:ring-sky-100 rounded-xl bg-white shadow-sm'
                                            type="text"
                                            maxLength={10}
                                            {...field}
                                            placeholder="10 digit mobile"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='reportingDate'
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block'>Date Reporting Back: <span className='text-red-500'>*</span></FormLabel>
                                    <Popover open={isReportingDateOpen} onOpenChange={setIsReportingDateOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant='outline' className={cn('w-full h-11 text-left font-normal border-slate-200 rounded-xl bg-white', !field.value && 'text-muted-foreground')}>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-slate-400' />
                                                    {field.value ? format(field.value, 'dd-MM-yyyy') : 'Pick a date'}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setIsReportingDateOpen(false);
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                            name='supportingDocument'
                            render={({ field }) => (
                                <FormItem className='flex flex-col justify-end'>
                                    <div className='flex items-center gap-1 mb-1'>
                                        <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Supporting Document:</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                type='file'
                                                className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                                onChange={handleFileUrl}
                                                disabled={isUploading}
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                disabled={isUploading}
                                                className='w-full h-11 bg-amber-400 hover:bg-amber-500 text-slate-900 border-none font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm uppercase text-[10px] cursor-pointer'
                                            >
                                                <FileText className='h-4 w-4' /> {isUploading ? 'Uploading...' : 'Choose File'}
                                            </Button>
                                            <div className='flex items-center gap-2 mt-2'>
                                                {uploadedFileName && (
                                                    <span className='text-[10px] text-slate-400 italic truncate w-full' title={uploadedFileName}>
                                                        {uploadedFileName}
                                                    </span>
                                                )}
                                                {
                                                    uploadedFileName && (
                                                        <div className='text-[12px] font-semibold pr-2 cursor-pointer hover:text-orange-500' onClick={handleViewFile}>
                                                            View
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {previewFile && (
                                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                                            {/* Popup Box */}
                                            <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full">
                                                {/* Close Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFile(null)}
                                                    className="absolute top-2 right-2 text-white bg-red-500 px-3 py-1 rounded"
                                                >
                                                    ✕
                                                </button>
                                                {/* Image */}
                                                <img
                                                    src={previewFile}
                                                    alt="Preview"
                                                    className="w-full max-h-[70vh] object-contain rounded"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='pt-8 flex flex-col items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <Button
                                type='submit'
                                disabled={applyMutation.isPending || !selectedLeave}
                                className='bg-orange-500 hover:bg-orange-600 text-white font-black h-12 px-16 rounded-full shadow-xl shadow-orange-200 flex items-center gap-3 uppercase text-sm transition-all active:scale-95'
                            >
                                APPLY LEAVE NOW <ArrowRight className='h-5 w-5' />
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='text-slate-400 font-bold h-12 px-10 rounded-full border-slate-200 flex items-center gap-2 uppercase text-xs transition-all hover:bg-slate-50 hover:text-slate-600'
                                onClick={() => {
                                    form.reset();
                                }}
                            >
                                <span className='text-xl leading-none'>×</span> CANCEL
                            </Button>
                        </div>

                        <p className='text-[10px] text-slate-400 font-medium tracking-widest uppercase opacity-60'>
                            Your application will be sent for approval once submitted.
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default LeaveApplicationForm;
