'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, LayoutGrid, Loader2, Printer, Search, X } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z
    .object({
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
        selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional()
    })
    .refine(
        (data) => {
            if (data.Issuecount) {
                return !!data.IssueFromDate && !!data.IssueToDate;
            }
            return true;
        },
        {
            message: 'Select Search date',
            path: ['IssueToDate']
        }
    )
    .refine(
        (data) => {
            if (data.Duecount) {
                return !!data.DueFromdate && !!data.DueTodate;
            }
            return true;
        },
        {
            message: 'Select Search date',
            path: ['DueTodate']
        }
    )
    .refine(
        (data) => {
            if (data.AGType === 'Student') {
                const hasClasses = data.selectedClasslist && data.selectedClasslist.length > 0;
                const hasSections = data.selectedSectionlist && data.selectedSectionlist.length > 0;
                return hasClasses && hasSections;
            }
            return true;
        },
        {
            message: 'Select Class and Section',
            path: ['selectedClasslist']
        }
    );

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IBookCirculationReportRequest) => void;
    isLoading: boolean;
    onPrint: () => void;
    onExport: () => void;
    hasData: boolean;
    initialData: any;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, hasData, initialData: initialDataProp }: ReportFormProps) => {
    const initialData = (initialDataProp as any)?.data || initialDataProp;

    // Local state for multi-select to handle UI before sync with form
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);

    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');

    const sectionList = React.useMemo(() => {
        if (!initialData?.sectionList) return [];
        return initialData.sectionList.map((sec: any, index) => {
            // 1. Try to find the section name by checking standard keys
            let name =
                sec.asmC_SectionName ||
                sec.asmc_SectionName ||
                sec.asmS_SectionName ||
                sec.asms_SectionName ||
                sec.asmc_sectionname ||
                sec.asms_sectionname ||
                sec.ASMC_SECTIONNAME ||
                sec.ASMS_SECTIONNAME ||
                sec.ASMC_SectionName ||
                sec.ASMS_SectionName ||
                sec.sectionName ||
                sec.SectionName ||
                sec.sectionname ||
                sec.SECTIONNAME ||
                sec.SECTION_NAME ||
                sec.ASMC_SECTION_NAME ||
                sec.MC_SECTIONNAME ||
                '';

            // 2. Dynamic fallback: Scan all keys for anything containing "section" or "sec"
            if (!name || name.trim() === '') {
                for (const key in sec) {
                    const lowerKey = key.toLowerCase();
                    if (
                        (lowerKey.includes('section') || lowerKey.includes('sec')) &&
                        !lowerKey.includes('id') &&
                        sec[key] &&
                        typeof sec[key] === 'string' &&
                        sec[key].trim() !== ''
                    ) {
                        name = sec[key];
                        break;
                    }
                }
            }

            // 3. Last fallback: Alphabet index
            if (!name || name.trim() === '') {
                const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                name = alphabet[index % alphabet.length] || `Section ${index + 1}`;
            }

            return {
                ...sec,
                asmC_SectionName: name
            };
        });
    }, [initialData?.sectionList]);

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
        if (initialData?.lib_list && initialData.lib_list.length > 0 && !watch('LMAL_Id')) {
            setValue('LMAL_Id', initialData.lib_list[0].lmaL_Id);
        }
        if (initialData?.classList && (initialData.classList.length || 0) > 0) {
            const allClassIds = initialData.classList.map((c) => c.asmcL_Id);
            setSelectedClasses(allClassIds);
            setValue(
                'selectedClasslist',
                allClassIds.map((id) => ({ asmcL_Id: id }))
            );
        }
        if (sectionList && (sectionList.length || 0) > 0) {
            const allSectionIds = sectionList.map((s) => s.asmS_Id);
            setSelectedSections(allSectionIds);
            setValue(
                'selectedSectionlist',
                allSectionIds.map((id) => ({ asmS_Id: id }))
            );
        }
    }, [initialData, sectionList, setValue, watch]);

    const handleClassToggle = (id: number) => {
        let newSelected = [...selectedClasses];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter((i) => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedClasses(newSelected);
        setValue(
            'selectedClasslist',
            newSelected.map((i) => ({ asmcL_Id: i }))
        );
    };

    const handleAllClassesToggle = (checked: boolean) => {
        if (checked && initialData?.classList) {
            const allIds = initialData.classList.map((c) => c.asmcL_Id);
            setSelectedClasses(allIds);
            setValue(
                'selectedClasslist',
                allIds.map((i) => ({ asmcL_Id: i }))
            );
        } else {
            setSelectedClasses([]);
            setValue('selectedClasslist', []);
        }
    };

    const handleSectionToggle = (id: number) => {
        let newSelected = [...selectedSections];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter((i) => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedSections(newSelected);
        setValue(
            'selectedSectionlist',
            newSelected.map((i) => ({ asmS_Id: i }))
        );
    };

    const handleAllSectionsToggle = (checked: boolean) => {
        if (checked && sectionList) {
            const allIds = sectionList.map((s) => s.asmS_Id);
            setSelectedSections(allIds);
            setValue(
                'selectedSectionlist',
                allIds.map((i) => ({ asmS_Id: i }))
            );
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

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto max-w-5xl space-y-4 rounded-lg border bg-white p-6 shadow-sm'>
            {/* Header Row: Library Name and Member Type */}
            <div className='grid grid-cols-1 gap-6 border-slate-100 border-b pb-2 md:grid-cols-2'>
                <div className='flex items-center gap-3'>
                    <Label className='min-w-[120px] text-right font-bold text-[#4255a7] text-xs uppercase tracking-wider'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Select
                            value={watch('LMAL_Id')?.toString()}
                            onValueChange={(v) => setValue('LMAL_Id', Number(v), { shouldValidate: true })}>
                            <SelectTrigger className='h-8 w-full border-slate-300 text-xs focus:ring-1 focus:ring-[#4255a7]'>
                                <SelectValue placeholder='Select Library' />
                            </SelectTrigger>
                            <SelectContent>
                                {initialData?.lib_list?.map((lib) => (
                                    <SelectItem key={lib.lmaL_Id} value={lib.lmaL_Id.toString()} className='text-xs'>
                                        {lib.lmaL_LibraryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.LMAL_Id && <p className='mt-0.5 text-[9px] text-red-500'>{errors.LMAL_Id.message}</p>}
                    </div>
                </div>

                <div className='flex items-center justify-center rounded-sm border border-slate-200 bg-slate-50/50 p-2 shadow-inner'>
                    <RadioGroup
                        value={agType}
                        onValueChange={(v) => setValue('AGType', v as any)}
                        className='flex flex-wrap justify-center gap-6'>
                        {['Student', 'Staff', 'Guest', 'Department'].map((type) => (
                            <div key={type} className='flex items-center space-x-2'>
                                <RadioGroupItem value={type} id={`r-${type}`} className='h-3.5 w-3.5 border-[#4454B4] text-[#4454B4]' />
                                <Label
                                    htmlFor={`r-${type}`}
                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase tracking-tighter'>
                                    {type}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                {/* Left Column: Book Type, Status, Dates */}
                <div className='space-y-4'>
                    {/* BOOK TYPE Box */}
                    <div className='overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm'>
                        <div className='bg-[#4255a7] py-0.5 text-center'>
                            <Label className='font-bold text-[10px] text-white uppercase tracking-widest'>BOOK TYPE</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                value={watch('Type')}
                                onValueChange={(v) => setValue('Type', v)}
                                className='grid grid-cols-2 gap-x-2 gap-y-2.5 lg:grid-cols-3'>
                                {[
                                    { id: 'all', label: 'ALL' },
                                    { id: 'Issue', label: 'Issue' },
                                    { id: 'Reference', label: 'Reference' },
                                    { id: 'Issuable', label: 'Issuable' },
                                    { id: 'NotIssuable', label: 'Not Issuable' },
                                    { id: 'ReferenceonlyIssuable', label: 'Ref Iss' },
                                    { id: 'ReferenceonlyNon-Issuable', label: 'Ref Non-Iss' }
                                ].map((bt) => (
                                    <div key={bt.id} className='group flex cursor-pointer items-center space-x-1.5'>
                                        <RadioGroupItem value={bt.id} id={`bt-${bt.id}`} className='h-3.5 w-3.5 border-slate-400' />
                                        <Label
                                            htmlFor={`bt-${bt.id}`}
                                            className='cursor-pointer whitespace-nowrap font-semibold text-[9px] text-slate-700 transition-colors group-hover:text-[#4255a7]'>
                                            {bt.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* TRANSACTION STATUS Box */}
                    <div className='overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm'>
                        <div className='bg-[#4255a7] py-0.5 text-center'>
                            <Label className='font-bold text-[10px] text-white uppercase tracking-widest'>TRANSACTION STATUS</Label>
                        </div>
                        <div className='p-3'>
                            <RadioGroup
                                value={watch('TrnType')}
                                onValueChange={(v) => setValue('TrnType', v)}
                                className='flex items-center justify-around'>
                                {['ALL', 'Issue', 'Return'].map((status) => (
                                    <div key={status} className='group flex cursor-pointer items-center space-x-2'>
                                        <RadioGroupItem
                                            value={status === 'ALL' ? 'all' : status}
                                            id={`t-${status}`}
                                            className='h-3.5 w-3.5 border-slate-400'
                                        />
                                        <Label
                                            htmlFor={`t-${status}`}
                                            className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase tracking-widest transition-colors group-hover:text-[#4255a7]'>
                                            {status}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* Right Column: Selection Boxes (Class, Section, Subjects) */}
                <div className='space-y-4'>
                    {agType === 'Student' && (
                        <div className='space-y-1'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                {/* Class Selection */}
                                <div className='flex h-[150px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm'>
                                    <div className='flex items-center justify-center gap-2 bg-[#4255a7] py-0.5 text-center'>
                                        <Label className='font-bold text-[10px] text-white uppercase tracking-widest'>Class Name</Label>
                                        <span className='text-[10px] text-red-400'>*</span>
                                    </div>
                                    <div className='flex items-center gap-1.5 border-b bg-slate-50 p-1'>
                                        <Search className='h-3 w-3 text-slate-400' />
                                        <input
                                            type='text'
                                            placeholder='search here...'
                                            className='w-full border-none bg-transparent px-1 py-0.5 text-[10px] focus:outline-none'
                                            value={classSearch}
                                            onChange={(e) => setClassSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className='scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto'>
                                        <div className='sticky top-0 z-10 mb-0.5 flex items-center space-x-1.5 border-b bg-slate-100 px-2 py-0.5 pb-0.5'>
                                            <Checkbox
                                                id='cls-all'
                                                checked={
                                                    (initialData?.classList?.length || 0) > 0 &&
                                                    initialData?.classList?.length === selectedClasses.length
                                                }
                                                onCheckedChange={(checked) => handleAllClassesToggle(checked as boolean)}
                                                className='h-3.5 w-3.5 border-slate-400 data-[state=checked]:bg-[#4255a7]'
                                            />
                                            <Label
                                                htmlFor='cls-all'
                                                className='cursor-pointer font-bold text-[10px] text-slate-800 uppercase tracking-tighter'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='px-2'>
                                            {initialData?.classList
                                                ?.filter((c) => {
                                                    const name = (c.asmcL_ClassName || (c as any).ASMCL_CLASSNAME || '')
                                                        .toString()
                                                        .toLowerCase();
                                                    return name.includes(classSearch.toLowerCase());
                                                })
                                                .map((cls) => {
                                                    const classId =
                                                        cls.asmcL_Id ||
                                                        (cls as any).ASMCL_ID ||
                                                        (cls as any).asmcL_ID ||
                                                        (cls as any).asmcl_id ||
                                                        (cls as any).asmcL_id ||
                                                        (cls as any).asmcL_ClassId ||
                                                        (cls as any).asmcL_ClassID ||
                                                        (cls as any).id;
                                                    const className =
                                                        cls.asmcL_ClassName || (cls as any).ASMCL_CLASSNAME || (cls as any).className || '';
                                                    return (
                                                        <div
                                                            key={classId}
                                                            className='flex items-center space-x-1.5 py-0.5 transition-colors hover:bg-slate-50'>
                                                            <Checkbox
                                                                id={`cls-${classId}`}
                                                                checked={selectedClasses.includes(classId)}
                                                                onCheckedChange={() => handleClassToggle(classId)}
                                                                className='h-3 w-3 border-slate-400 data-[state=checked]:bg-[#4255a7]'
                                                            />
                                                            <Label
                                                                htmlFor={`cls-${classId}`}
                                                                className='cursor-pointer truncate font-medium text-[9px] text-slate-700'>
                                                                {className}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Selection */}
                                <div className='flex h-[150px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm'>
                                    <div className='flex items-center justify-center gap-2 bg-[#4255a7] py-0.5 text-center'>
                                        <Label className='font-bold text-[10px] text-white uppercase tracking-widest'>Section Name</Label>
                                        <span className='text-[10px] text-red-400'>*</span>
                                    </div>
                                    <div className='flex items-center gap-1.5 border-b bg-slate-50 p-1'>
                                        <Search className='h-3 w-3 text-slate-400' />
                                        <input
                                            type='text'
                                            placeholder='search here...'
                                            className='w-full border-none bg-transparent px-1 py-0.5 text-[10px] focus:outline-none'
                                            value={sectionSearch}
                                            onChange={(e) => setSectionSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className='scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto'>
                                        <div className='sticky top-0 z-10 mb-0.5 flex items-center space-x-1.5 border-b bg-slate-100 px-2 py-0.5 pb-0.5'>
                                            <Checkbox
                                                id='sec-all'
                                                checked={(sectionList?.length || 0) > 0 && sectionList?.length === selectedSections.length}
                                                onCheckedChange={(checked) => handleAllSectionsToggle(checked as boolean)}
                                                className='h-3.5 w-3.5 border-slate-400 data-[state=checked]:bg-[#4255a7]'
                                            />
                                            <Label
                                                htmlFor='sec-all'
                                                className='cursor-pointer font-bold text-[10px] text-slate-800 uppercase tracking-tighter'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='px-2'>
                                            {sectionList
                                                ?.filter((s) => {
                                                    const name = (s.asmC_SectionName || '').toString().toLowerCase();
                                                    return name.includes(sectionSearch.toLowerCase());
                                                })
                                                .map((sec) => {
                                                    const sectionId =
                                                        (sec as any).asmS_Id ||
                                                        (sec as any).ASMS_ID ||
                                                        (sec as any).asmS_ID ||
                                                        (sec as any).asms_id ||
                                                        (sec as any).asmS_id ||
                                                        (sec as any).asmC_Id ||
                                                        (sec as any).asmc_id ||
                                                        (sec as any).asmC_ID ||
                                                        (sec as any).ASMC_ID ||
                                                        (sec as any).id;
                                                    const sectionName = sec.asmC_SectionName || '';
                                                    return (
                                                        <div
                                                            key={sectionId}
                                                            className='flex items-center space-x-1.5 py-0.5 transition-colors hover:bg-slate-50'>
                                                            <Checkbox
                                                                id={`sec-${sectionId}`}
                                                                checked={selectedSections.includes(sectionId)}
                                                                onCheckedChange={() => handleSectionToggle(sectionId)}
                                                                className='h-3 w-3 border-slate-400 data-[state=checked]:bg-[#4255a7]'
                                                            />
                                                            <Label
                                                                htmlFor={`sec-${sectionId}`}
                                                                className='cursor-pointer truncate font-medium text-[9px] text-slate-700'>
                                                                {sectionName}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {errors.selectedClasslist && (
                                <p className='font-semibold text-[10px] text-red-500'>{errors.selectedClasslist.message}</p>
                            )}
                        </div>
                    )}

                    {/* Date Filters Row */}
                    <div className='grid grid-cols-1 gap-4 pt-2 lg:grid-cols-2'>
                        <div className='space-y-2 rounded-sm border border-slate-200 bg-slate-50/30 p-3 shadow-inner'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='issue-count'
                                    checked={issueCount}
                                    onCheckedChange={(c) => setValue('Issuecount', c as boolean)}
                                    className='h-4 w-4'
                                />
                                <Label
                                    htmlFor='issue-count'
                                    className='cursor-pointer font-extrabold text-[#4255a7] text-[10px] uppercase tracking-wider'>
                                    Issue Date
                                </Label>
                            </div>
                            <div className='flex items-center gap-3 pl-6'>
                                <div className='flex flex-1 items-center gap-2'>
                                    <CalendarDatePicker
                                        date={issueFromDate}
                                        setDate={(d) => setValue('IssueFromDate', d)}
                                        placeholder='From'
                                        disabled={!issueCount}
                                    />
                                    <span className='font-black text-[9px] text-slate-400'>AND</span>
                                    <CalendarDatePicker
                                        date={watch('IssueToDate')}
                                        setDate={(d) => setValue('IssueToDate', d)}
                                        placeholder='To'
                                        minDate={issueFromDate}
                                        disabled={!issueCount}
                                    />
                                </div>
                            </div>
                            {errors.IssueToDate && (
                                <p className='mt-1 pl-6 font-semibold text-[10px] text-red-500'>{errors.IssueToDate.message}</p>
                            )}
                        </div>

                        <div className='space-y-2 rounded-sm border border-slate-200 bg-slate-50/30 p-3 shadow-inner'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='due-count'
                                    checked={dueCount}
                                    onCheckedChange={(c) => setValue('Duecount', c as boolean)}
                                    className='h-4 w-4'
                                />
                                <Label
                                    htmlFor='due-count'
                                    className='cursor-pointer font-extrabold text-[#4255a7] text-[10px] uppercase tracking-wider'>
                                    Due Date
                                </Label>
                            </div>
                            <div className='flex items-center gap-3 pl-6'>
                                <div className='flex flex-1 items-center gap-2'>
                                    <CalendarDatePicker
                                        date={dueFromDate}
                                        setDate={(d) => setValue('DueFromdate', d)}
                                        placeholder='From'
                                        disabled={!dueCount}
                                    />
                                    <span className='font-black text-[9px] text-slate-400'>AND</span>
                                    <CalendarDatePicker
                                        date={watch('DueTodate')}
                                        setDate={(d) => setValue('DueTodate', d)}
                                        placeholder='To'
                                        minDate={dueFromDate}
                                        disabled={!dueCount}
                                    />
                                </div>
                            </div>
                            {errors.DueTodate && (
                                <p className='mt-1 pl-6 font-semibold text-[10px] text-red-500'>{errors.DueTodate.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Centered Row */}
            <div className='mt-2 flex flex-row items-center justify-center gap-3 border-slate-200 border-t pt-4'>
                <Button
                    type='submit'
                    disabled={isLoading}
                    className='h-8 w-32 rounded-sm border-none bg-[#4255a7] font-bold text-[9px] text-white uppercase tracking-wider shadow-md hover:bg-[#303f9f]'>
                    {isLoading ? <Loader2 className='mr-1.5 h-3 w-3 animate-spin' /> : <LayoutGrid className='mr-1.5 h-3 w-3' />}
                    REPORT
                </Button>

                <Button
                    type='button'
                    className='h-8 w-32 rounded-sm border-none bg-[#f47a1f] font-bold text-[9px] text-white uppercase tracking-wider shadow-md hover:bg-[#e64a19]'
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
                    }}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>

                <Button
                    type='button'
                    onClick={onPrint}
                    disabled={!hasData}
                    className='h-8 w-32 rounded-sm border-none bg-[#1a237e] font-bold text-[9px] text-white uppercase tracking-wider shadow-md hover:bg-[#121858]'>
                    <Printer className='mr-1.5 h-3 w-3' />
                    PRINT
                </Button>

                <Button
                    type='button'
                    onClick={onExport}
                    disabled={!hasData}
                    className='h-8 w-36 rounded-sm border-none bg-[#1a237e] font-bold text-[9px] text-white uppercase tracking-wider shadow-md hover:bg-[#121858]'>
                    <FileSpreadsheet className='mr-1.5 h-3 w-3' />
                    EXPORT TO EXCEL
                </Button>
            </div>
        </form>
    );
};

function CalendarDatePicker({
    date,
    setDate,
    placeholder,
    minDate,
    disabled
}: { date?: Date; setDate: (d?: Date) => void; placeholder: string; minDate?: Date; disabled?: boolean }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn('h-7 w-full justify-start px-2 text-left font-normal text-[10px]', !date && 'text-muted-foreground')}
                    disabled={disabled}>
                    <CalendarIcon className='mr-1.5 h-3 w-3' />
                    {date ? format(date, 'dd/MM/yyyy') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
                <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => (minDate ? date < minDate : false)}
                />
            </PopoverContent>
        </Popover>
    );
}
