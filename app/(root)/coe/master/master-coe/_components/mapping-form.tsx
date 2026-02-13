"use client";


import { mappingEventCoeSchema } from "@/schemas/coe/master";
import { MappedEventCoe } from "@/types/coe/master-coe";
import { MasterEventCoe } from "@/types/coe/masterevent";
import { IMasterFeeClassDropDownList } from "@/types/fees/masters/masters";
import { IFeeAcademicYearDropdownList } from "@/types/fees/reports/reports";
import { IMasterDepartmentList } from "@/types/hrms/hrms-config/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMasterEventCoe } from "@/hooks/coe/usemMaster";
import { useFeeDefaulterReport } from "@/hooks/fees/useReports";
import { useStudentClassDropDown } from "@/hooks/fees/useMasters";
import { useMasterDepartment } from "@/hooks/hrms/useMasters";
import { EventDetailsById, saveMappedEvent } from "@/server/coe/masters/masterevent";

type FormValues = z.infer<typeof mappingEventCoeSchema.addOrUpdate>;

interface MappingFormProps {
    initialData?: MappedEventCoe;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function MappingForm({ initialData, onSuccess, onCancel }: MappingFormProps) {
    const { data: eventListData, isLoading: eventLoading } = useMasterEventCoe();
    const { data: academicYearData, isLoading: yearLoading } = useFeeDefaulterReport();
    const { data: classData, isLoading: classLoading } = useStudentClassDropDown(true);
    const { data: departmentData, isLoading: deptLoading } = useMasterDepartment();
    const { refetchAll } = useMasterEventCoe();


    console.log("eventListData", eventListData);
    console.log("academicYearData", academicYearData);
    console.log("classData", classData);
    console.log("departmentData", departmentData);

    const events: MasterEventCoe[] = eventListData?.data && Array.isArray(eventListData.data) ? eventListData.data : [];
    const academicYears: IFeeAcademicYearDropdownList[] = academicYearData?.data && Array.isArray(academicYearData.data) ? academicYearData.data : [];
    const classes: IMasterFeeClassDropDownList[] = classData?.data && Array.isArray(classData.data) ? classData.data : [];
    const departments: IMasterDepartmentList[] = departmentData?.data && Array.isArray(departmentData.data) ? departmentData.data : [];

    const isLoading = eventLoading || yearLoading || classLoading || deptLoading;
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Derived state for read-only fields (from getEventDetails
    const [eventDetails, setEventDetails] = useState<{
        smsMessage: string;
        mailSubject: string;
        mailHeader: string;
        mailFooter: string;
        mailMessage: string;
        mailTemplate: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(mappingEventCoeSchema.addOrUpdate),
        defaultValues: {
            asmaY_Id: initialData?.asmaY_Id,
            coemE_Id: initialData?.coemE_Id,
            startDate: initialData?.coee_EStartDate ? new Date(initialData.coee_EStartDate) : undefined,
            endDate: initialData?.coee_EEndDate ? new Date(initialData.coee_EEndDate) : undefined,
            startTime: initialData?.coee_EStartTime ? new Date(`1970-01-01T${initialData.coee_EStartTime}`) : undefined,
            endTime: initialData?.coee_EEndTime ? new Date(`1970-01-01T${initialData.coee_EEndTime}`) : undefined,
            reminderDate: initialData?.coee_ReminderDate ? new Date(initialData.coee_ReminderDate) : undefined,
            reminderSchedule: initialData?.coee_ReminderSchedule || "",
            smsActiveFlag: initialData?.coee_SMSActiveFlag || false,
            mailActiveFlag: initialData?.coee_MailActiveFlag || false,
            repeatFlag: initialData?.coee_RepeatFlag || false,
            studentFlag: initialData?.coee_StudentFlag || false,
            alumniFlag: initialData?.coee_AlumniFlag || false,
            employeeFlag: initialData?.coee_EmployeeFlag || false,
            otherFlag: initialData?.coee_OtherFlag || false,
            classes: initialData?.stu_class_list?.map(c => c.asmcL_Id) || [],
            staffTypes: initialData?.emp_type_list?.map(s => s.hrmD_Id) || [],
            others: initialData?.others_list || [],
            uploads: [], // TODO: Map initialData?.images_listCoe if needed
            videos: [], // TODO: Map initialData?.videos_list if needed
            coee_Id: initialData?.coee_Id || 0,
        },
    });

    const { fields: otherFields, append: appendOther, remove: removeOther } = useFieldArray({
        control: form.control,
        name: "others",
    });

    const { fields: uploadFields, append: appendUpload, remove: removeUpload } = useFieldArray({
        control: form.control,
        name: "uploads",
    });

    const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({
        control: form.control,
        name: "videos",
    });

    const watchEventId = form.watch("coemE_Id");
    const watchStudentFlag = form.watch("studentFlag");
    const watchEmployeeFlag = form.watch("employeeFlag");
    const watchAlumniFlag = form.watch("alumniFlag");
    const watchOtherFlag = form.watch("otherFlag");
    const watchRepeatFlag = form.watch("repeatFlag");

    // Fetch event details when Event ID changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (watchEventId) {
                setIsLoadingDetails(true);
                const res = await EventDetailsById(watchEventId);
                if (res?.data && res.data.length > 0) {
                    const details = res.data[0];
                    setEventDetails({
                        smsMessage: details.coemE_SMSMessage,
                        mailSubject: details.coemE_MailSubject,
                        mailHeader: details.coemE_MailHeader,
                        mailFooter: details.coemE_MailFooter,
                        mailMessage: details.coemE_Mail_Message,
                        mailTemplate: details.coemE_MailHTMLTemplate,
                    });
                }
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [watchEventId]);

    const onSubmit = async (data: FormValues) => {
        const payload = {
            ...data,
            // Format dates/times as needed by backend
            COEE_EStartDate: data.startDate?.toISOString(),
            COEE_EEndDate: data.endDate?.toISOString(),
            COEE_ReminderDate: data.reminderDate?.toISOString(),
            COEE_EStartTime: data.startTime ? format(data.startTime, "h:mm a") : "",
            COEE_EEndTime: data.endTime ? format(data.endTime, "h:mm a") : "",
            // Map flags
            COEE_SMSActiveFlag: data.smsActiveFlag,
            COEE_MailActiveFlag: data.mailActiveFlag,
            COEE_RepeatFlag: data.repeatFlag,
            COEE_StudentFlag: data.studentFlag,
            COEE_AlumniFlag: data.alumniFlag,
            COEE_EmployeeFlag: data.employeeFlag,
            COEE_OtherFlag: data.otherFlag,
            // Map lists
            stu_class_list: data.classes?.map(id => ({ asmcL_Id: id })) || [],
            emp_type_list: data.staffTypes?.map(id => ({ hrmD_Id: id })) || [],
            others_list: data.others || [],
            images_listCoe: data.uploads?.map(u => ({ COEEI_Images: u.fileKey || u.name })) || [],
            videos_list: data.videos?.map(v => ({ COEEV_Videos: v.url || v.name })) || [],
            // Include read-only details in payload if needed
            COEE_SMSMessage: eventDetails?.smsMessage || "",
            COEE_MailSubject: eventDetails?.mailSubject || "",
            COEE_MailHeader: eventDetails?.mailHeader || "",
            COEE_MailFooter: eventDetails?.mailFooter || "",
            COEE_Mail_Message: eventDetails?.mailMessage || "",
            COEE_MailHTMLTemplate: eventDetails?.mailTemplate || "", // This might be editable?
        };

        const response = await saveMappedEvent(payload);
        if (response.success) {
            toast.success(response.message);
            onSuccess?.();
            refetchAll();
        } else {
            toast.error(response.message);
        }
    };

    const eventOptions = useMemo(() =>
        events.map(e => ({ label: e.coemE_EventName, value: e.coemE_Id.toString() }))
        , [events]);

    const academicYearOptions = useMemo(() =>
        academicYears.map(y => ({ label: y.asmaY_Year, value: y.asmaY_Id.toString() }))
        , [academicYears]);

    const classOptions = useMemo(() =>
        classes.map(c => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))
        , [classes]);

    const staffTypeOptions = useMemo(() =>
        departments.map(d => ({ label: d.hrmD_DepartmentName, value: d.hrmD_Id.toString() }))
        , [departments]);

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="asmaY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Academic Year: <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {academicYearOptions.map((year) => (
                                                <SelectItem key={year.value} value={year.value}>
                                                    {year.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="coemE_Id"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Event Name: <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {eventOptions.map((event) => (
                                                <SelectItem key={event.value} value={event.value}>
                                                    {event.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">Email Subject: <span className="text-destructive">*</span></FormLabel>
                            <Input value={eventDetails?.mailSubject || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">Email Header: <span className="text-destructive">*</span></FormLabel>
                            <Input value={eventDetails?.mailHeader || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">Email Footer: <span className="text-destructive">*</span></FormLabel>
                            <Input value={eventDetails?.mailFooter || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">Email Message:</FormLabel>
                            <Input value={eventDetails?.mailMessage || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">SMS Message:</FormLabel>
                            <Input value={eventDetails?.smsMessage || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                    <FormItem>
                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                            <FormLabel className="text-right">Email Template: <span className="text-destructive">*</span></FormLabel>
                            <Input value={eventDetails?.mailTemplate || ""} disabled className="bg-muted/50" />
                        </div>
                    </FormItem>
                </div>

                {/* Row 5: Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Start Date: <span className="text-destructive">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Enter date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">End Date: <span className="text-destructive">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Enter date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus required />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 6: Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Start Time:</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                                            <input
                                                type="time"
                                                className="w-full bg-transparent outline-none"
                                                value={field.value ? format(field.value, "HH:mm") : ""}
                                                onChange={(e) => {
                                                    const date = new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
                                                    field.onChange(date);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">End Time:</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                                            <input
                                                type="time"
                                                className="w-full bg-transparent outline-none"
                                                value={field.value ? format(field.value, "HH:mm") : ""}
                                                onChange={(e) => {
                                                    const date = new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
                                                    field.onChange(date);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 7: Reminder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="reminderDays"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Reminder Days:</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="" />
                                    </FormControl>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reminderDate"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Reminder Date:</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Enter date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 8: Flags (Email/SMS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="mailActiveFlag"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Email:</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val) => field.onChange(val === "true")}
                                            defaultValue={field.value ? "true" : "false"}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="true" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Yes</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="false" />
                                                </FormControl>
                                                <FormLabel className="font-normal">No</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="smsActiveFlag"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">SMS: <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val) => field.onChange(val === "true")}
                                            defaultValue={field.value ? "true" : "false"}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="true" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Yes</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="false" />
                                                </FormControl>
                                                <FormLabel className="font-normal">No</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 9: Uploads & Videos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Uploads Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm">Upload File</h4>
                            <Button type="button" size="sm" onClick={() => appendUpload({ name: "", fileKey: "" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 bg-muted/50 p-2 text-sm font-medium">
                                <span>SL NO</span>
                                <span>File Name</span>
                                <span>Upload</span>
                                <span>Action</span>
                            </div>
                            {uploadFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-2 p-2 items-center border-t">
                                    <span className="text-center w-10">{index + 1}</span>
                                    <FormField
                                        control={form.control}
                                        name={`uploads.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input {...field} placeholder="File Name" className="h-8" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        {/* Actual file input would be here, for now just a button or dummy input */}
                                        <FormLabel className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 rounded-md flex items-center justify-center text-xs">
                                            Browse
                                            <Input type="file" className="hidden" />
                                        </FormLabel>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeUpload(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {uploadFields.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground text-sm">No files added</div>
                            )}
                        </div>
                    </div>

                    {/* Videos Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm">Videos</h4>
                            <Button type="button" size="sm" onClick={() => appendVideo({ name: "", url: "" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 bg-muted/50 p-2 text-sm font-medium">
                                <span>SL NO</span>
                                <span>Video Name</span>
                                <span>Upload/URL</span>
                                <span>Action</span>
                            </div>
                            {videoFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-2 p-2 items-center border-t">
                                    <span className="text-center w-10">{index + 1}</span>
                                    <FormField
                                        control={form.control}
                                        name={`videos.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input {...field} placeholder="Video Name" className="h-8" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        {/* Actual file input or URL input */}
                                        <FormLabel className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 rounded-md flex items-center justify-center text-xs">
                                            Browse
                                            <Input type="file" className="hidden" accept="video/*" />
                                        </FormLabel>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVideo(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {videoFields.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground text-sm">No videos added</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 10: Repeat Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField
                        control={form.control}
                        name="repeatFlag"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Repeat Schedule:</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val) => field.onChange(val === "true")}
                                            defaultValue={field.value ? "true" : "false"}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="true" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Yes</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="false" />
                                                </FormControl>
                                                <FormLabel className="font-normal">No</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reminderSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <FormLabel className="text-right">Repeat Schedule: <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <FormMessage className="ml-[156px]" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* To Whom Section */}
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                        <FormLabel className="text-right">To Whom:</FormLabel>
                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="studentFlag"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Student</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="alumniFlag"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Alumni Student</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employeeFlag"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Staff</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="otherFlag"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Others</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Student Class Selection */}
                        {watchStudentFlag && (
                            <FormField
                                control={form.control}
                                name="classes"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                            <FormLabel className="text-right pt-2">Class: <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={classOptions}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder="Select Classes"
                                                    className="min-h-[100px]"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage className="ml-[156px]" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Staff Type Selection */}
                        {watchEmployeeFlag && (
                            <FormField
                                control={form.control}
                                name="staffTypes"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                            <FormLabel className="text-right pt-2">Staff: <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={staffTypeOptions}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder="Select Staff Types"
                                                    className="min-h-[100px]"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage className="ml-[156px]" />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Alumni Year Selection */}
                        {watchAlumniFlag && (
                            <FormField
                                control={form.control}
                                name="alumniYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                            <FormLabel className="text-right">Academic Year Of Old Students: <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="--Select--" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {academicYearOptions.map((year) => (
                                                        <SelectItem key={year.value} value={year.value}>
                                                            {year.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage className="ml-[156px]" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Others - Dynamic List */}
                        {watchOtherFlag && (
                            <div className="col-span-2 space-y-4 ml-[156px]">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-sm">Other Recipients</h4>
                                    <Button type="button" size="sm" onClick={() => appendOther({ name: "", mobile: "", email: "" })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add
                                    </Button>
                                </div>
                                {otherFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border p-2 rounded">
                                        <FormField
                                            control={form.control}
                                            name={`others.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name: <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`others.${index}.mobile`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile No: <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} maxLength={10} placeholder="Mobile Start with 7,8 or 9" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`others.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email-Id: <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Email-Id" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeOther(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center gap-2 pt-4">
                    <Button type="submit" className="bg-primary">Save</Button>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
            </form>
        </Form>
    );
}
