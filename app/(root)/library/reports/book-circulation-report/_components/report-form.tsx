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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');

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
        if (initialData?.classList && (initialData.classList.length || 0) > 0) {
            const allClassIds = initialData.classList.map(c => c.asmcL_Id);
            setSelectedClasses(allClassIds);
            setValue('selectedClasslist', allClassIds.map(id => ({ asmcL_Id: id })));
        }
        if (initialData?.sectionList && (initialData.sectionList.length || 0) > 0) {
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
            LMAL_Id: Number(data.LMAL_Id),
            IssueFromDate: data.IssueFromDate ? format(data.IssueFromDate, 'yyyy-MM-dd') : undefined,
            IssueToDate: data.IssueToDate ? format(data.IssueToDate, 'yyyy-MM-dd') : undefined,
            DueFromdate: data.DueFromdate ? format(data.DueFromdate, 'yyyy-MM-dd') : undefined,
            DueTodate: data.DueTodate ? format(data.DueTodate, 'yyyy-MM-dd') : undefined,
            selectedClasslist: data.selectedClasslist || [],
            selectedSectionlist: data.selectedSectionlist || []
        };
        onSearch(requestData);
    };

    if (isInitialLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-4 p-4 bg-[#fdfdfd] rounded-lg shadow-xl border-t-4 border-[#4255a7] ring-1 ring-slate-200'>
            {/* Header Row: Library Name and Member Type */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b border-slate-100'>
                <div className='flex items-center gap-3'>
                    <Label className='min-w-[120px] text-right font-bold text-xs text-[#4255a7] uppercase tracking-wider'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Select 
                            value={watch('LMAL_Id')?.toString()}
                            onValueChange={(v) => setValue('LMAL_Id', Number(v), { shouldValidate: true })}
                        >
                            <SelectTrigger className='w-full border-slate-300 h-8 text-xs focus:ring-1 focus:ring-[#4255a7]'>
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

                <div className='bg-slate-50/50 p-2 rounded-sm border border-slate-200 flex justify-center items-center shadow-inner'>
                    <RadioGroup
                        value={agType}
                        onValueChange={(v) => setValue('AGType', v as any)}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        {['Student', 'Staff', 'Guest', 'Department'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <RadioGroupItem value={type} id={`r-${type}`} className="w-3.5 h-3.5 border-[#4454B4] text-[#4454B4]" />
                                <Label htmlFor={`r-${type}`} className="text-[10px] font-bold cursor-pointer text-slate-700 uppercase tracking-tighter">{type}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Left Column: Book Type, Status, Dates */}
                <div className='space-y-4'>
                    {/* BOOK TYPE Box */}
                    <div className='border border-slate-300 rounded-sm shadow-sm overflow-hidden bg-white'>
                        <div className='bg-[#4255a7] py-0.5 text-center'>
                            <Label className='font-bold text-white text-[10px] tracking-widest uppercase'>BOOK TYPE</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                value={watch('Type')}
                                onValueChange={(v) => setValue('Type', v)}
                                className="grid grid-cols-2 lg:grid-cols-3 gap-y-2.5 gap-x-2"
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
                                    <div key={bt.id} className="flex items-center space-x-1.5 group cursor-pointer">
                                        <RadioGroupItem value={bt.id} id={`bt-${bt.id}`} className="w-3.5 h-3.5 border-slate-400" />
                                        <Label htmlFor={`bt-${bt.id}`} className="text-[9px] font-semibold cursor-pointer text-slate-700 whitespace-nowrap group-hover:text-[#4255a7] transition-colors">{bt.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* TRANSACTION STATUS Box */}
                    <div className='border border-slate-300 rounded-sm shadow-sm overflow-hidden bg-white'>
                        <div className='bg-[#4255a7] py-0.5 text-center'>
                            <Label className='font-bold text-white text-[10px] tracking-widest uppercase'>TRANSACTION STATUS</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                value={watch('TrnType')}
                                onValueChange={(v) => setValue('TrnType', v)}
                                className="flex justify-around items-center"
                            >
                                {['ALL', 'Issue', 'Return'].map((status) => (
                                    <div key={status} className="flex items-center space-x-2 group cursor-pointer">
                                        <RadioGroupItem value={status === 'ALL' ? 'all' : status} id={`t-${status}`} className="w-3.5 h-3.5 border-slate-400" />
                                        <Label htmlFor={`t-${status}`} className="text-[10px] font-bold cursor-pointer text-slate-700 uppercase tracking-widest group-hover:text-[#4255a7] transition-colors">{status}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* Right Column: Selection Boxes (Class, Section, Subjects) */}
                <div className='space-y-4'>
                    {agType === 'Student' && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Class Selection */}
                            <div className='border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-white shadow-sm h-[150px]'>
                                <div className='bg-[#4255a7] py-0.5 text-center flex items-center justify-center gap-2'>
                                    <Label className='font-bold text-white text-[10px] tracking-widest uppercase'>Class Name</Label>
                                    <span className='text-red-400 text-[10px]'>*</span>
                                </div>
                                <div className='p-1 border-b bg-slate-50 flex items-center gap-1.5'>
                                    <Search className='h-3 w-3 text-slate-400' />
                                    <input 
                                        type="text" 
                                        placeholder="search here..." 
                                        className='w-full text-[10px] px-1 py-0.5 border-none bg-transparent focus:outline-none'
                                        value={classSearch}
                                        onChange={(e) => setClassSearch(e.target.value)}
                                    />
                                </div>
                                <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200'>
                                    <div className="flex items-center space-x-1.5 pb-0.5 border-b mb-0.5 bg-slate-100 px-2 py-0.5 sticky top-0 z-10">
                                        <Checkbox
                                            id="cls-all"
                                            checked={(initialData?.classList?.length || 0) > 0 && initialData?.classList?.length === selectedClasses.length}
                                            onCheckedChange={(checked) => handleAllClassesToggle(checked as boolean)}
                                            className="w-3.5 h-3.5 border-slate-400 data-[state=checked]:bg-[#4255a7]"
                                        />
                                        <Label htmlFor="cls-all" className="text-[10px] font-bold cursor-pointer text-slate-800 uppercase tracking-tighter">All</Label>
                                    </div>
                                    <div className="px-2">
                                        {initialData?.classList?.filter(c => {
                                            const name = (c.asmcL_ClassName || (c as any).ASMCL_CLASSNAME || '').toString().toLowerCase();
                                            return name.includes(classSearch.toLowerCase());
                                        }).map((cls) => {
                                            const classId = cls.asmcL_Id || (cls as any).ASMCL_ID;
                                            const className = cls.asmcL_ClassName || (cls as any).ASMCL_CLASSNAME;
                                            return (
                                                <div key={classId} className="flex items-center space-x-1.5 py-0.5 hover:bg-slate-50 transition-colors">
                                                    <Checkbox
                                                        id={`cls-${classId}`}
                                                        checked={selectedClasses.includes(classId)}
                                                        onCheckedChange={() => handleClassToggle(classId)}
                                                        className="w-3 h-3 border-slate-400 data-[state=checked]:bg-[#4255a7]"
                                                    />
                                                    <Label htmlFor={`cls-${classId}`} className="text-[9px] font-medium cursor-pointer text-slate-700 truncate">{className}</Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Section Selection */}
                            <div className='border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-white shadow-sm h-[150px]'>
                                <div className='bg-[#4255a7] py-0.5 text-center flex items-center justify-center gap-2'>
                                    <Label className='font-bold text-white text-[10px] tracking-widest uppercase'>Section Name</Label>
                                    <span className='text-red-400 text-[10px]'>*</span>
                                </div>
                                <div className='p-1 border-b bg-slate-50 flex items-center gap-1.5'>
                                    <Search className='h-3 w-3 text-slate-400' />
                                    <input 
                                        type="text" 
                                        placeholder="search here..." 
                                        className='w-full text-[10px] px-1 py-0.5 border-none bg-transparent focus:outline-none'
                                        value={sectionSearch}
                                        onChange={(e) => setSectionSearch(e.target.value)}
                                    />
                                </div>
                                <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200'>
                                    <div className="flex items-center space-x-1.5 pb-0.5 border-b mb-0.5 bg-slate-100 px-2 py-0.5 sticky top-0 z-10">
                                        <Checkbox
                                            id="sec-all"
                                            checked={(initialData?.sectionList?.length || 0) > 0 && initialData?.sectionList?.length === selectedSections.length}
                                            onCheckedChange={(checked) => handleAllSectionsToggle(checked as boolean)}
                                            className="w-3.5 h-3.5 border-slate-400 data-[state=checked]:bg-[#4255a7]"
                                        />
                                        <Label htmlFor="sec-all" className="text-[10px] font-bold cursor-pointer text-slate-800 uppercase tracking-tighter">All</Label>
                                    </div>
                                    <div className="px-2">
                                        {initialData?.sectionList?.filter(s => {
                                            const name = (s.asmC_SectionName || (s as any).ASMC_SECTIONNAME || (s as any).asmS_SectionName || (s as any).ASMS_SECTIONNAME || '').toString().toLowerCase();
                                            return name.includes(sectionSearch.toLowerCase());
                                        }).map((sec) => {
                                            const sectionId = sec.asmS_Id || (sec as any).ASMS_ID;
                                            const sectionName = sec.asmC_SectionName || (sec as any).ASMC_SECTIONNAME || (sec as any).asmS_SectionName || (sec as any).ASMS_SECTIONNAME || (sec as any).SECTIONNAME || (sec as any).SECTION_NAME || (sec as any).ASMC_SECTION_NAME || (sec as any).MC_SECTIONNAME || '';
                                            return (
                                                <div key={sectionId} className="flex items-center space-x-1.5 py-0.5 hover:bg-slate-50 transition-colors">
                                                    <Checkbox
                                                        id={`sec-${sectionId}`}
                                                        checked={selectedSections.includes(sectionId)}
                                                        onCheckedChange={() => handleSectionToggle(sectionId)}
                                                        className="w-3 h-3 border-slate-400 data-[state=checked]:bg-[#4255a7]"
                                                    />
                                                    <Label htmlFor={`sec-${sectionId}`} className="text-[9px] font-medium cursor-pointer text-slate-700 truncate">{sectionName}</Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Date Filters Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2'>
                        <div className='space-y-2 border border-slate-200 rounded-sm p-3 bg-slate-50/30 shadow-inner'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id="issue-count"
                                    checked={issueCount}
                                    onCheckedChange={(c) => setValue('Issuecount', c as boolean)}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="issue-count" className="text-[10px] font-extrabold cursor-pointer text-[#4255a7] uppercase tracking-wider">Issue Date</Label>
                            </div>
                            <div className='flex items-center gap-3 pl-6'>
                                <div className='flex-1 flex items-center gap-2'>
                                    <CalendarDatePicker
                                        date={issueFromDate}
                                        setDate={(d) => setValue('IssueFromDate', d)}
                                        placeholder="From"
                                        disabled={!issueCount}
                                    />
                                    <span className='text-[9px] font-black text-slate-400'>AND</span>
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

                        <div className='space-y-2 border border-slate-200 rounded-sm p-3 bg-slate-50/30 shadow-inner'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id="due-count"
                                    checked={dueCount}
                                    onCheckedChange={(c) => setValue('Duecount', c as boolean)}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="due-count" className="text-[10px] font-extrabold cursor-pointer text-[#4255a7] uppercase tracking-wider">Due Date</Label>
                            </div>
                            <div className='flex items-center gap-3 pl-6'>
                                <div className='flex-1 flex items-center gap-2'>
                                    <CalendarDatePicker
                                        date={dueFromDate}
                                        setDate={(d) => setValue('DueFromdate', d)}
                                        placeholder="From"
                                        disabled={!dueCount}
                                    />
                                    <span className='text-[9px] font-black text-slate-400'>AND</span>
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
                </div>
            </div>

            {/* Action Buttons - Centered Row */}
            <div className='flex flex-row justify-center items-center gap-3 pt-4 border-t border-slate-200 mt-2'>
                <Button 
                    type='submit' 
                    disabled={isLoading}
                    className='w-32 bg-[#4255a7] hover:bg-[#303f9f] text-white h-8 shadow-md rounded-sm border-none text-[9px] font-bold uppercase tracking-wider'
                >
                    {isLoading ? <Loader2 className='mr-1.5 h-3 w-3 animate-spin' /> : <LayoutGrid className='mr-1.5 h-3 w-3' />}
                    REPORT
                </Button>
                
                <Button 
                    type='button' 
                    className='w-32 bg-[#f47a1f] hover:bg-[#e64a19] text-white h-8 shadow-md rounded-sm border-none text-[9px] font-bold uppercase tracking-wider'
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
                        setClassSearch('');
                        setSectionSearch('');
                    }}
                >
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>

                <Button 
                    type='button' 
                    onClick={onPrint}
                    disabled={!hasData}
                    className='w-32 bg-[#1a237e] hover:bg-[#121858] text-white h-8 shadow-md rounded-sm border-none text-[9px] font-bold uppercase tracking-wider'
                >
                    <Printer className='mr-1.5 h-3 w-3' />
                    PRINT
                </Button>

                <Button 
                    type='button' 
                    onClick={onExport}
                    disabled={!hasData}
                    className='w-36 bg-[#1a237e] hover:bg-[#121858] text-white h-8 shadow-md rounded-sm border-none text-[9px] font-bold uppercase tracking-wider'
                >
                    <FileSpreadsheet className='mr-1.5 h-3 w-3' />
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
