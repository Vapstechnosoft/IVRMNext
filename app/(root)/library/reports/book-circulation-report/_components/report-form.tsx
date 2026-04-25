'use client';
import React from 'react';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, X } from 'lucide-react';
import { useBookCirculationReportInitialData } from '@/hooks/library/reports/useBookCirculationReport';
import { IBookCirculationReportRequest, IBookCirculationReportInitialData } from '@/types/library/reports/book-circulation-report';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const reportFormSchema = z.object({
    LMAL_Id: z.coerce.number().min(1, 'Library is required'),
    AGType: z.enum(['Student', 'Staff', 'Guest', 'Department', 'all']),
    Type: z.string(),
    TrnType: z.string(),
    Issuecount: z.boolean().optional(),
    IssueFromDate: z.date().optional(),
    IssueToDate: z.date().optional(),
    Duecount: z.boolean().optional(),
    DueFromdate: z.date().optional(),
    DueTodate: z.date().optional(),
    selectedClasslist: z.array(z.object({ asmcL_Id: z.number() })).optional(),
    selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional(),
}).refine((data) => {
    if (data.Issuecount) {
        return !!data.IssueFromDate && !!data.IssueToDate;
    }
    return true;
}, {
    message: "Select Search date",
    path: ["IssueToDate"]
}).refine((data) => {
    if (data.Duecount) {
        return !!data.DueFromdate && !!data.DueTodate;
    }
    return true;
}, {
    message: "Select Search date",
    path: ["DueTodate"]
}).refine((data) => {
    if (data.AGType === 'Student') {
        const hasClasses = data.selectedClasslist && data.selectedClasslist.length > 0;
        const hasSections = data.selectedSectionlist && data.selectedSectionlist.length > 0;
        return hasClasses && hasSections;
    }
    return true;
}, {
    message: "Select Class and Section",
    path: ["selectedClasslist"]
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IBookCirculationReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialData, isLoading: isInitialLoading } = useBookCirculationReportInitialData() as { data: IBookCirculationReportInitialData | undefined, isLoading: boolean };

    // Local state for multi-select to handle UI before sync with form
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);

    const {
        handleSubmit,
        setValue,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            AGType: 'Student',
            Type: 'all',
            TrnType: 'all',
            Issuecount: false,
            Duecount: false,
            selectedClasslist: [],
            selectedSectionlist: []
        }
    });

    const agType = useWatch({ control, name: 'AGType' });
    const issueCount = useWatch({ control, name: 'Issuecount' });
    const dueCount = useWatch({ control, name: 'Duecount' });
    const issueFromDate = useWatch({ control, name: 'IssueFromDate' });
    const dueFromDate = useWatch({ control, name: 'DueFromdate' });

    // Initialize checkboxes on load
    useEffect(() => {
        if (initialData?.classList && initialData.classList.length > 0) {
            const allClassIds = initialData.classList.map(c => c.asmcL_Id);
            setSelectedClasses(allClassIds);
            setValue('selectedClasslist', allClassIds.map(id => ({ asmcL_Id: id })));
        }
        if (initialData?.sectionList && initialData.sectionList.length > 0) {
            const allSectionIds = initialData.sectionList.map(s => s.asmS_Id);
            setSelectedSections(allSectionIds);
            setValue('selectedSectionlist', allSectionIds.map(id => ({ asmS_Id: id })));
        }
    }, [initialData, setValue]);

    const handleClassToggle = (id: number) => {
        let newSelected = [...selectedClasses];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter(i => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedClasses(newSelected);
        setValue('selectedClasslist', newSelected.map(i => ({ asmcL_Id: i })));
    };

    const handleAllClassesToggle = (checked: boolean) => {
        if (checked && initialData?.classList) {
            const allIds = initialData.classList.map(c => c.asmcL_Id);
            setSelectedClasses(allIds);
            setValue('selectedClasslist', allIds.map(i => ({ asmcL_Id: i })));
        } else {
            setSelectedClasses([]);
            setValue('selectedClasslist', []);
        }
    };

    const handleSectionToggle = (id: number) => {
        let newSelected = [...selectedSections];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter(i => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedSections(newSelected);
        setValue('selectedSectionlist', newSelected.map(i => ({ asmS_Id: i })));
    };

    const handleAllSectionsToggle = (checked: boolean) => {
        if (checked && initialData?.sectionList) {
            const allIds = initialData.sectionList.map(s => s.asmS_Id);
            setSelectedSections(allIds);
            setValue('selectedSectionlist', allIds.map(i => ({ asmS_Id: i })));
        } else {
            setSelectedSections([]);
            setValue('selectedSectionlist', []);
        }
    };

    const onSubmit = (data: ReportFormValues) => {
        const requestData: IBookCirculationReportRequest = {
            ...data,
            IssueFromDate: data.IssueFromDate ? format(data.IssueFromDate, 'yyyy-MM-dd') : undefined,
            IssueToDate: data.IssueToDate ? format(data.IssueToDate, 'yyyy-MM-dd') : undefined,
            DueFromdate: data.DueFromdate ? format(data.DueFromdate, 'yyyy-MM-dd') : undefined,
            DueTodate: data.DueTodate ? format(data.DueTodate, 'yyyy-MM-dd') : undefined,
        };
        onSearch(requestData);
    };

    if (isInitialLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Library */}
                        <div>
                            <Label>Library Name <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(v) => setValue('LMAL_Id', Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Library" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialData?.lib_list?.map((lib) => (
                                        <SelectItem key={lib.lmaL_Id} value={lib.lmaL_Id.toString()}>
                                            {lib.lmaL_LibraryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.LMAL_Id && <p className="text-sm text-red-500 mt-1">{errors.LMAL_Id.message}</p>}
                        </div>

                        {/* Member Type - AGType */}
                        <div>
                            <Label className="mb-2 block font-semibold">Member Type <span className="text-red-500">*</span></Label>
                            <RadioGroup
                                defaultValue="Student"
                                onValueChange={(v) => setValue('AGType', v as any)}
                                className="flex flex-wrap gap-4 p-3 border rounded-md justify-around bg-slate-50"
                            >
                                {['Student', 'Staff', 'Guest', 'Department'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <RadioGroupItem value={type} id={`r-${type}`} />
                                        <Label htmlFor={`r-${type}`}>{type}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Book Type - Type */}
                        <div>
                            <Label className="mb-2 block font-semibold">Book Type <span className="text-red-500">*</span></Label>
                            <RadioGroup
                                defaultValue="all"
                                onValueChange={(v) => setValue('Type', v)}
                                className="grid grid-cols-2 md:grid-cols-2 gap-2 p-3 border rounded-md bg-slate-50"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="bt-all" />
                                    <Label htmlFor="bt-all">ALL</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Issue" id="bt-Issue" />
                                    <Label htmlFor="bt-Issue">Issue</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Reference" id="bt-Reference" />
                                    <Label htmlFor="bt-Reference">Reference</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Issuable" id="bt-Issuable" />
                                    <Label htmlFor="bt-Issuable">Issuable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="NotIssuable" id="bt-NotIssuable" />
                                    <Label htmlFor="bt-NotIssuable">Not Issuable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ReferenceonlyIssuable" id="bt-RefIssuable" />
                                    <Label htmlFor="bt-RefIssuable">Ref only Issuable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ReferenceonlyNon-Issuable" id="bt-RefNonIssuable" />
                                    <Label htmlFor="bt-RefNonIssuable">Ref only Non-Issuable</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Transaction Status - TrnType */}
                        <div>
                            <Label className="mb-2 block font-semibold">Transaction Status <span className="text-red-500">*</span></Label>
                            <RadioGroup
                                defaultValue="all"
                                onValueChange={(v) => setValue('TrnType', v)}
                                className="flex gap-4 p-3 border rounded-md justify-around bg-slate-50"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="t-all" />
                                    <Label htmlFor="t-all">ALL</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Issue" id="t-issue" />
                                    <Label htmlFor="t-issue">Issue</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Return" id="t-return" />
                                    <Label htmlFor="t-return">Return</Label>
                                </div>
                            </RadioGroup>
                        </div>

                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Student Filters */}
                    {agType === 'Student' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Student Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Class Selection */}
                                <div>
                                    <Label>Class Name <span className="text-red-500">*</span></Label>
                                    <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-2 bg-white">
                                        <div className="flex items-center space-x-2 pb-2 border-b">
                                            <Checkbox
                                                id="cls-all"
                                                checked={initialData?.classList?.length === selectedClasses.length && initialData?.classList?.length > 0}
                                                onCheckedChange={(checked) => handleAllClassesToggle(checked as boolean)}
                                            />
                                            <Label htmlFor="cls-all" className="font-bold">All</Label>
                                        </div>
                                        {initialData?.classList?.map((cls) => (
                                            <div key={cls.asmcL_Id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cls-${cls.asmcL_Id}`}
                                                    checked={selectedClasses.includes(cls.asmcL_Id)}
                                                    onCheckedChange={() => handleClassToggle(cls.asmcL_Id)}
                                                />
                                                <Label htmlFor={`cls-${cls.asmcL_Id}`}>{cls.asmcL_ClassName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {(errors.selectedClasslist || (errors as any).selectedClasslist?.root) &&
                                        <p className="text-sm text-red-500 mt-1">Select Class</p>
                                    }
                                </div>

                                {/* Section Selection */}
                                <div>
                                    <Label>Section Name <span className="text-red-500">*</span></Label>
                                    <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-2 bg-white">
                                        <div className="flex items-center space-x-2 pb-2 border-b">
                                            <Checkbox
                                                id="sec-all"
                                                checked={initialData?.sectionList?.length === selectedSections.length && initialData?.sectionList?.length > 0}
                                                onCheckedChange={(checked) => handleAllSectionsToggle(checked as boolean)}
                                            />
                                            <Label htmlFor="sec-all" className="font-bold">All</Label>
                                        </div>
                                        {initialData?.sectionList?.map((sec) => (
                                            <div key={sec.asmS_Id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`sec-${sec.asmS_Id}`}
                                                    checked={selectedSections.includes(sec.asmS_Id)}
                                                    onCheckedChange={() => handleSectionToggle(sec.asmS_Id)}
                                                />
                                                <Label htmlFor={`sec-${sec.asmS_Id}`}>{sec.asmC_SectionName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.selectedSectionlist && <p className="text-sm text-red-500 mt-1">{errors.selectedSectionlist.message}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Date Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Date Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Issue Date */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="issue-count"
                                        checked={issueCount}
                                        onCheckedChange={(c) => {
                                            setValue('Issuecount', c as boolean);
                                        }}
                                    />
                                    <Label htmlFor="issue-count">Issue Date</Label>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <span className="text-xs text-muted-foreground">From</span>
                                        <CalendarDatePicker
                                            date={issueFromDate}
                                            setDate={(d) => setValue('IssueFromDate', d)}
                                            placeholder="From Date"
                                            disabled={!issueCount}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-xs text-muted-foreground">To</span>
                                        <CalendarDatePicker
                                            date={watch('IssueToDate')}
                                            setDate={(d) => setValue('IssueToDate', d)}
                                            placeholder="To Date"
                                            minDate={issueFromDate}
                                            disabled={!issueCount}
                                        />
                                    </div>
                                </div>
                                {errors.IssueToDate && <p className="text-sm text-red-500">{errors.IssueToDate.message}</p>}
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="due-count"
                                        checked={dueCount}
                                        onCheckedChange={(c) => setValue('Duecount', c as boolean)}
                                    />
                                    <Label htmlFor="due-count">Due Date</Label>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <span className="text-xs text-muted-foreground">From</span>
                                        <CalendarDatePicker
                                            date={dueFromDate}
                                            setDate={(d) => setValue('DueFromdate', d)}
                                            placeholder="From Date"
                                            disabled={!dueCount}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-xs text-muted-foreground">To</span>
                                        <CalendarDatePicker
                                            date={watch('DueTodate')}
                                            setDate={(d) => setValue('DueTodate', d)}
                                            placeholder="To Date"
                                            minDate={dueFromDate}
                                            disabled={!dueCount}
                                        />
                                    </div>
                                </div>
                                {errors.DueTodate && <p className="text-sm text-red-500">{errors.DueTodate.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Report
                </Button>
                <Button type="button" variant="destructive" onClick={() => {
                    reset({
                        AGType: 'Student',
                        Type: 'all',
                        TrnType: 'all',
                        Issuecount: false,
                        Duecount: false,
                        selectedClasslist: [],
                        selectedSectionlist: []
                    });
                    setSelectedClasses([]);
                    setSelectedSections([]);
                }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </form>
    );
};

function CalendarDatePicker({ date, setDate, placeholder, minDate, disabled }: { date?: Date, setDate: (d?: Date) => void, placeholder: string, minDate?: Date, disabled?: boolean }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => minDate ? date < minDate : false}
                />
            </PopoverContent>
        </Popover>
    )
}
