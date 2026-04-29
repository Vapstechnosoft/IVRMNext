'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, RefreshCcw, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { cn } from '@/lib/utils';

import { getClassWorkInitialData, getClassWorkReport, viewClassWorkAttachmentData } from '@/server/upload/reports/classwork-upload-report';
import type { IClassWorkAttachment, IClassWorkReport } from '@/types/upload/reports/classwork-upload-report';
import { ClassWorkReportTable } from './_components/classwork-report-table';
import { AttachmentViewModal } from './_components/attachment-view-modal';

const formSchema = z.object({
    fromdate: z.date({
        required_error: "Select from date",
    }),
    todate: z.date({
        required_error: "Select to date",
    }),
    classarray: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClassWorkUploadReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isReporting, setIsReporting] = useState(false);
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [reportData, setReportData] = useState<IClassWorkReport[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState<IClassWorkAttachment[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classarray: [],
        },
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await getClassWorkInitialData();
                if (response.success && response.data) {
                    setClasses(response.data.classes.map(c => ({
                        value: String(c.ASMCL_Id),
                        label: c.ASMCL_ClassName
                    })));
                } else {
                    toast.error(response.message || "Failed to load initial data");
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
                toast.error("An error occurred while fetching initial data");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);


    const onSubmit = async (values: FormValues) => {
        setIsReporting(true);
        try {
            const payload = {
                fromdate: format(values.fromdate, "yyyy-MM-dd'T'00:00:00"),
                todate: format(values.todate, "yyyy-MM-dd'T'23:59:59"),
                classarray: values.classarray?.map(id => ({ asmcL_Id: Number(id) })),
            };

            const response = await getClassWorkReport(payload);
            if (response.success && response.data) {
                if (response.data.report && response.data.report.length > 0) {
                    setReportData(response.data.report);
                } else {
                    setReportData([]);
                    toast.info("No records found for the selected criteria.");
                }
            } else {
                toast.error(response.message || "Failed to generate report");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("An error occurred while generating the report");
        } finally {
            setIsReporting(false);
        }
    };

    const handleViewAttachment = async (item: IClassWorkReport) => {
        try {
            const selectedId = item.Id || (item as any).ICW_Id || 0;
            const payload = {
                Temp: 0,
                ICW_Id: selectedId,
            };
            const response = await viewClassWorkAttachmentData(payload);
            if (response.success && response.data) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setAttachments(response.data);
                    setIsModalOpen(true);
                } else {
                    toast.info("No attachments found for this classwork.");
                }
            } else {
                toast.error(response.message || "Failed to fetch attachments");
            }
        } catch (error) {
            console.error("Error fetching attachments:", error);
            toast.error("An error occurred while fetching attachments");
        }
    };

    const handleCancel = () => {
        form.reset({
            fromdate: undefined,
            todate: undefined,
            classarray: [],
        });
        setReportData([]);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner size="lg" className="text-primary" />
                <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Initializing ClassWork Module...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-7xl animate-in fade-in duration-700">

            <CollapsibleSection
                title="Classwork Upload Report"
                defaultOpen={true}
                className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
                            <div className="space-y-8">

                                {/* From Date */}
                                <FormField
                                    control={form.control}
                                    name="fromdate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-500 font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2 mb-3">
                                                From Date <span className="text-red-500 font-black">*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-4 text-left font-black h-14 rounded-2xl border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-[0.98]",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span className="uppercase text-[11px] tracking-widest">Select From Date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-slate-50" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className="rounded-3xl p-4"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-[10px] font-black uppercase tracking-tighter text-red-500 mt-2" />
                                        </FormItem>
                                    )}
                                />

                                {/* To Date */}
                                <FormField
                                    control={form.control}
                                    name="todate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-500 font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2 mb-3">
                                                To Date <span className="text-red-500 font-black">*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-4 text-left font-black h-14 rounded-2xl border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-[0.98]",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span className="uppercase text-[11px] tracking-widest">Select To Date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-slate-50" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            form.getValues('fromdate') && date < form.getValues('fromdate')
                                                        }
                                                        initialFocus
                                                        className="rounded-3xl p-4"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-[10px] font-black uppercase tracking-tighter text-red-500 mt-2" />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            {/* Class Multi-Select Box */}
                            <div className="lg:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="classarray"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col h-full">
                                            <FormLabel className="text-slate-500 font-black uppercase text-[10px] tracking-[0.15em] mb-3">Filter by Class Selection</FormLabel>
                                            <FormControl>
                                                <CustomMultiSelectBox
                                                    options={classes}
                                                    value={field.value ?? []}
                                                    onChange={field.onChange}
                                                    height="320px"
                                                    isSearchRequired
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-black uppercase tracking-tighter text-red-500 mt-2" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 pt-10 border-t border-slate-50">
                            <Button
                                type="submit"
                                disabled={isReporting}
                                className="h-16 px-12 rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 min-w-[220px] font-black uppercase text-[13px] tracking-[0.2em] flex items-center gap-3"
                            >
                                {isReporting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" /> Generate Report
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="h-16 px-12 rounded-full border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95 min-w-[180px] font-black uppercase text-[13px] tracking-[0.2em]"
                            >
                                <RefreshCcw className="mr-2 h-5 w-5" /> Reset Form
                            </Button>
                        </div>
                    </form>
                </Form>
            </CollapsibleSection>

            {/* Report Table Section */}
            {reportData.length > 0 && (
                <div className="animate-in slide-in-from-bottom duration-1000 stagger-1">
                    <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-slate-50/20 backdrop-blur-sm">
                        <CardContent className="p-10">
                            <ClassWorkReportTable
                                data={reportData}
                                onViewAttachment={handleViewAttachment}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attachment Modal */}
            <AttachmentViewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attachments={attachments}
            />
        </div>
    );
}
