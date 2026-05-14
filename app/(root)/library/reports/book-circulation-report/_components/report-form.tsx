'use client';
import React from 'react';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, X, FileText, Printer, FileSpreadsheet, LayoutGrid } from 'lucide-react';
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
    onPrint: () => void;
    onExport: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, hasData }: ReportFormProps) => {
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
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-4xl space-y-3 p-3 bg-white rounded-lg shadow-md border-t-4 border-[#3f51b5]'>
            {/* Member Type Selection at top - Centered */}
            <div className='flex justify-center pb-3 border-b border-slate-100'>
                <RadioGroup
                    defaultValue="Student"
                    onValueChange={(v) => setValue('AGType', v as any)}
                    className="flex flex-wrap justify-center gap-6"
                >
                    {['Student', 'Staff', 'Guest', 'Department'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                            <RadioGroupItem value={type} id={`r-${type}`} className="w-3.5 h-3.5 border-[#4454B4] text-[#4454B4]" />
                            <Label htmlFor={`r-${type}`} className="text-xs font-semibold cursor-pointer text-slate-700">{type}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Library Selection - Compact Row */}
            <div className='flex justify-center pt-1'>
                <div className='flex items-center gap-3 w-full max-w-xl'>
                    <Label className='min-w-[120px] text-right font-bold text-xs text-[#4454B4]'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Select onValueChange={(v) => setValue('LMAL_Id', Number(v))}>
                            <SelectTrigger className='w-full border-slate-300 h-8 text-xs'>
                                <SelectValue placeholder="Select Library" />
                            </SelectTrigger>
                            <SelectContent>
                                {initialData?.lib_list?.map((lib) => (
                                    <SelectItem key={lib.lmaL_Id} value={lib.lmaL_Id.toString()} className="text-xs">
                                        {lib.lmaL_LibraryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.LMAL_Id && <p className="text-[9px] text-red-500 mt-0.5">{errors.LMAL_Id.message}</p>}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-2'>
                {/* Left Column: Book Type & Transaction Status */}
                <div className='space-y-4'>
                    {/* BOOK TYPE Box */}
                    <div className='border rounded-sm shadow-sm overflow-hidden'>
                        <div className='bg-slate-50 border-b py-0.5 text-center'>
                            <Label className='font-bold text-[#4454B4] text-[10px] tracking-widest uppercase'>BOOK TYPE</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                defaultValue="all"
                                onValueChange={(v) => setValue('Type', v)}
                                className="grid grid-cols-3 gap-y-2 gap-x-1"
                            >
                                {[
                                    { id: 'all', label: 'ALL' },
                                    { id: 'Issue', label: 'Issue' },
                                    { id: 'Reference', label: 'Reference' },
                                    { id: 'Issuable', label: 'Issuable' },
                                    { id: 'NotIssuable', label: 'Not Issuable' },
                                    { id: 'ReferenceonlyIssuable', label: 'Ref Iss' },
                                    { id: 'ReferenceonlyNon-Issuable', label: 'Ref Non-Iss' }
                                ].map((bt) => (
                                    <div key={bt.id} className="flex items-center space-x-1.5">
                                        <RadioGroupItem value={bt.id} id={`bt-${bt.id}`} className="w-3 h-3" />
                                        <Label htmlFor={`bt-${bt.id}`} className="text-[9px] font-medium cursor-pointer text-slate-600">{bt.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* TRANSACTION STATUS Box */}
                    <div className='border rounded-sm shadow-sm overflow-hidden'>
                        <div className='bg-slate-50 border-b py-0.5 text-center'>
                            <Label className='font-bold text-[#4454B4] text-[10px] tracking-widest uppercase'>TRANSACTION STATUS</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                defaultValue="all"
                                onValueChange={(v) => setValue('TrnType', v)}
                                className="flex justify-around items-center"
                            >
                                {['ALL', 'Issue', 'Return'].map((status) => (
                                    <div key={status} className="flex items-center space-x-1.5">
                                        <RadioGroupItem value={status === 'ALL' ? 'all' : status} id={`t-${status}`} className="w-3 h-3" />
                                        <Label htmlFor={`t-${status}`} className="text-[9px] font-medium cursor-pointer text-slate-600">{status}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* Right Column: Student Selection Boxes */}
                <div className='space-y-3'>
                    {agType === 'Student' && (
                        <>
                            <div className='flex items-start gap-3'>
                                <Label className='min-w-[80px] text-right font-bold text-[10px] pt-1.5 text-slate-600'>Class Name :*</Label>
                                <div className='flex-1 border border-slate-200 rounded-sm p-0.5 h-28 overflow-y-auto bg-white'>
                                    <div className="flex items-center space-x-1.5 pb-0.5 border-b mb-0.5 bg-slate-50 px-1">
                                        <Checkbox
                                            id="cls-all"
                                            checked={initialData?.classList?.length === selectedClasses.length}
                                            onCheckedChange={(checked) => handleAllClassesToggle(checked as boolean)}
                                            className="w-3 h-3"
                                        />
                                        <Label htmlFor="cls-all" className="text-[10px] font-bold cursor-pointer">All</Label>
                                    </div>
                                    <div className="px-1">
                                        {initialData?.classList?.map((cls) => (
                                            <div key={cls.asmcL_Id} className="flex items-center space-x-1.5 py-0.5">
                                                <Checkbox
                                                    id={`cls-${cls.asmcL_Id}`}
                                                    checked={selectedClasses.includes(cls.asmcL_Id)}
                                                    onCheckedChange={() => handleClassToggle(cls.asmcL_Id)}
                                                    className="w-3 h-3"
                                                />
                                                <Label htmlFor={`cls-${cls.asmcL_Id}`} className="text-[9px] cursor-pointer text-slate-600">{cls.asmcL_ClassName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <Label className='min-w-[80px] text-right font-bold text-[10px] pt-1.5 text-slate-600'>Section Name :*</Label>
                                <div className='flex-1 border border-slate-200 rounded-sm p-0.5 h-28 overflow-y-auto bg-white'>
                                    <div className="flex items-center space-x-1.5 pb-0.5 border-b mb-0.5 bg-slate-50 px-1">
                                        <Checkbox
                                            id="sec-all"
                                            checked={initialData?.sectionList?.length === selectedSections.length}
                                            onCheckedChange={(checked) => handleAllSectionsToggle(checked as boolean)}
                                            className="w-3 h-3"
                                        />
                                        <Label htmlFor="sec-all" className="text-[10px] font-bold cursor-pointer">All</Label>
                                    </div>
                                    <div className="px-1">
                                        {initialData?.sectionList?.map((sec) => (
                                            <div key={sec.asmS_Id} className="flex items-center space-x-1.5 py-0.5">
                                                <Checkbox
                                                    id={`sec-${sec.asmS_Id}`}
                                                    checked={selectedSections.includes(sec.asmS_Id)}
                                                    onCheckedChange={() => handleSectionToggle(sec.asmS_Id)}
                                                    className="w-3 h-3"
                                                />
                                                <Label htmlFor={`sec-${sec.asmS_Id}`} className="text-[9px] cursor-pointer text-slate-600">{sec.asmC_SectionName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Date Filters Row - Very Compact Layout */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-3 border-t border-slate-100'>
                <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                        <Checkbox
                            id="issue-count"
                            checked={issueCount}
                            onCheckedChange={(c) => setValue('Issuecount', c as boolean)}
                            className="w-3.5 h-3.5"
                        />
                        <Label htmlFor="issue-count" className="text-[11px] font-bold cursor-pointer text-slate-700">Issue Date</Label>
                    </div>
                    <div className='flex items-center gap-2 pl-6'>
                        <Label className='text-[9px] font-medium text-slate-500 whitespace-nowrap'>Date Between</Label>
                        <div className='flex-1 flex items-center gap-1.5'>
                            <CalendarDatePicker
                                date={issueFromDate}
                                setDate={(d) => setValue('IssueFromDate', d)}
                                placeholder="From"
                                disabled={!issueCount}
                            />
                            <span className='text-[9px] font-bold text-slate-400'>-</span>
                            <CalendarDatePicker
                                date={watch('IssueToDate')}
                                setDate={(d) => setValue('IssueToDate', d)}
                                placeholder="To"
                                minDate={issueFromDate}
                                disabled={!issueCount}
                            />
                        </div>
                    </div>
                </div>

                <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                        <Checkbox
                            id="due-count"
                            checked={dueCount}
                            onCheckedChange={(c) => setValue('Duecount', c as boolean)}
                            className="w-3.5 h-3.5"
                        />
                        <Label htmlFor="due-count" className="text-[11px] font-bold cursor-pointer text-slate-700">Due Date</Label>
                    </div>
                    <div className='flex items-center gap-2 pl-6'>
                        <Label className='text-[9px] font-medium text-slate-500 whitespace-nowrap'>Date Between</Label>
                        <div className='flex-1 flex items-center gap-1.5'>
                            <CalendarDatePicker
                                date={dueFromDate}
                                setDate={(d) => setValue('DueFromdate', d)}
                                placeholder="From"
                                disabled={!dueCount}
                            />
                            <span className='text-[9px] font-bold text-slate-400'>-</span>
                            <CalendarDatePicker
                                date={watch('DueTodate')}
                                setDate={(d) => setValue('DueTodate', d)}
                                placeholder="To"
                                minDate={dueFromDate}
                                disabled={!dueCount}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Compact Row */}
            <div className='flex flex-row flex-wrap justify-center gap-3 pt-4 mt-2'>
                <Button 
                    type='submit' 
                    disabled={isLoading}
                    className='w-fit min-w-[120px] bg-[#3f51b5] hover:bg-[#303f9f] text-white px-4 h-8 shadow-sm rounded-sm border-none text-[10px] font-bold uppercase tracking-wider'
                >
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <LayoutGrid className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                
                <Button 
                    type='button' 
                    className='w-fit min-w-[120px] bg-[#ff5722] hover:bg-[#e64a19] text-white px-4 h-8 shadow-sm rounded-sm border-none text-[10px] font-bold uppercase tracking-wider'
                    onClick={() => {
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
                    }}
                >
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>

                <Button 
                    type='button' 
                    onClick={onPrint}
                    disabled={!hasData}
                    className='w-fit min-w-[120px] bg-[#3f51b5] hover:bg-[#303f9f] text-white px-4 h-8 shadow-sm rounded-sm border-none text-[10px] font-bold uppercase tracking-wider'
                >
                    <Printer className='mr-1.5 h-3.5 w-3.5' />
                    PRINT
                </Button>

                <Button 
                    type='button' 
                    onClick={onExport}
                    disabled={!hasData}
                    className='w-fit min-w-[120px] bg-[#3f51b5] hover:bg-[#303f9f] text-white px-4 h-8 shadow-sm rounded-sm border-none text-[10px] font-bold uppercase tracking-wider'
                >
                    <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                    EXPORT TO EXCEL
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
                        "w-full justify-start text-left font-normal h-7 px-2 text-[10px]",
                        !date && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-1.5 h-3 w-3" />
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
