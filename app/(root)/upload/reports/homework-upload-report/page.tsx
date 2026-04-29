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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { getHomeWorkInitialData, getHomeWorkReport, viewHomeWorkAttachmentData } from '@/server/upload/reports/homework-upload-report';
import type { IHomeWorkAttachment, IHomeWorkReport } from '@/types/upload/reports/homework-upload-report';
import { HomeWorkReportTable } from './_components/homework-report-table';
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

export default function HomeWorkUploadReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isReporting, setIsReporting] = useState(false);
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [reportData, setReportData] = useState<IHomeWorkReport[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState<IHomeWorkAttachment[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classarray: [],
        },
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await getHomeWorkInitialData();
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

            const response = await getHomeWorkReport(payload);
            if (response.success && response.data) {
                if (response.data.report && response.data.report.length > 0) {
                    setReportData(response.data.report);
                    toast.success('Report generated successfully');
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

    const handleViewAttachment = async (item: IHomeWorkReport) => {
        try {
            const payload = {
                Temp: 1,
                ihW_Id: item.Id
            };
            const response = await viewHomeWorkAttachmentData(payload);
            if (response.success && response.data) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setAttachments(response.data);
                    setIsModalOpen(true);
                } else {
                    toast.info("No attachments found for this homework.");
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
                <p className="text-muted-foreground animate-pulse font-medium">Initializing HomeWork Report...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-7xl animate-in fade-in duration-500">


            <CollapsibleSection
                title="Homework Upload Report"
                defaultOpen={true}
                className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            <div className="space-y-6">

                                {/* From Date */}
                                <FormField
                                    control={form.control}
                                    name="fromdate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-600 font-bold uppercase text-[11px] tracking-wider flex items-center gap-2">
                                                From Date <span className="text-red-500 font-black">*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-semibold h-12 rounded-xl border-slate-200 hover:border-primary/50 transition-all shadow-sm",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span className="uppercase text-[11px] tracking-widest opacity-60">Select from date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className="rounded-2xl"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-[10px] font-bold uppercase tracking-tighter" />
                                        </FormItem>
                                    )}
                                />

                                {/* To Date */}
                                <FormField
                                    control={form.control}
                                    name="todate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-600 font-bold uppercase text-[11px] tracking-wider flex items-center gap-2">
                                                To Date <span className="text-red-500 font-black">*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-semibold h-12 rounded-xl border-slate-200 hover:border-primary/50 transition-all shadow-sm",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span className="uppercase text-[11px] tracking-widest opacity-60">Select to date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            form.getValues('fromdate') && date < form.getValues('fromdate')
                                                        }
                                                        initialFocus
                                                        className="rounded-2xl"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-[10px] font-bold uppercase tracking-tighter" />
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
                                            <FormLabel className="text-slate-600 font-bold uppercase text-[11px] tracking-wider mb-2">Class Name Selection</FormLabel>
                                            <FormControl>
                                                <CustomMultiSelectBox
                                                    options={classes}
                                                    value={field.value ?? []}
                                                    onChange={field.onChange}
                                                    height="280px"
                                                    isSearchRequired
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase tracking-tighter" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-50">
                            <Button
                                type="submit"
                                disabled={isReporting}
                                className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 min-w-[160px]"
                            >
                                {isReporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Generate Report
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="h-12 px-8 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all min-w-[140px]"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CollapsibleSection>

            {/* Report Table Section */}
            {reportData.length > 0 && (
                <div className="animate-in slide-in-from-bottom duration-700">
                    <Card className="rounded-2xl shadow-xl border-none overflow-hidden">
                        <CardContent className="p-6 bg-slate-50/30">
                            <HomeWorkReportTable
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
