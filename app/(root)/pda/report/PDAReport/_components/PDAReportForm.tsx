'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Calendar as CalendarIcon, 
    Search, 
    RotateCcw, 
    FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
    usePDAAcademicYear, 
    usePDAClass, 
    usePDASection, 
    usePDAStudent 
} from '@/hooks/pda/usePDACommon';
import { toast } from 'sonner';

interface PDAReportFormProps {
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export default function PDAReportForm({
    onSubmit,
    onReset
}: PDAReportFormProps) {
    const [type, setType] = useState<'Ind' | 'All'>('Ind');
    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAsmcLId, setSelectedAsmcLId] = useState<string>('');
    const [selectedAmscId, setSelectedAmscId] = useState<string>('');
    const [selectedAmstId, setSelectedAmstId] = useState<string>('');
    
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);
    
    const [options, setOptions] = useState({
        detailed: false,
        stored: false,
        format1: false
    });

    const { data: yearsRes } = usePDAAcademicYear();
    const { data: classesRes } = usePDAClass(Number(selectedAsmayId));
    const { data: sectionsRes, isLoading: loadingSections } = usePDASection(Number(selectedAsmayId), Number(selectedAsmcLId));
    const { data: studentsRes, isLoading: loadingStudents } = usePDAStudent(Number(selectedAsmayId), Number(selectedAsmcLId), Number(selectedAmscId));

    const academicYearsList = (Array.isArray(yearsRes?.data) ? yearsRes?.data : yearsRes?.data?.data) || yearsRes?.data?.fillyear?.$values || [];
    const classesList = (Array.isArray(classesRes?.data) ? classesRes?.data : classesRes?.data?.data) || classesRes?.data?.classlist?.$values || [];
    const sectionsList = (Array.isArray(sectionsRes?.data) ? sectionsRes?.data : sectionsRes?.data?.data) || sectionsRes?.data?.fillsection?.$values || [];
    const studentsList = (Array.isArray(studentsRes?.data) ? studentsRes?.data : studentsRes?.data?.data) || studentsRes?.data?.fillstudent?.$values || [];


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAsmayId || !selectedAsmcLId || !selectedAmscId || !fromDate || !toDate) {
            toast.error('Please fill all required fields');
            return;
        }

        if (type === 'Ind' && !selectedAmstId) {
            toast.error('Please select a student');
            return;
        }

        onSubmit({
            ASMAY_Id: Number(selectedAsmayId),
            ASMCL_Id: Number(selectedAsmcLId),
            AMSC_Id: Number(selectedAmscId),
            AMST_Id: type === 'Ind' ? Number(selectedAmstId) : 0,
            From_Date: format(fromDate, 'yyyy-MM-dd'),
            To_Date: format(toDate, 'yyyy-MM-dd'),
            type: type,
            studentdata: options.detailed ? 1 : 0,
            refundamt: (options.stored || options.format1) ? 1 : 0,
            format1: options.format1
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <RadioGroup 
                    value={type} 
                    onValueChange={(val) => setType(val as 'Ind' | 'All')}
                    className="flex gap-8"
                >
                    <div className="flex items-center space-x-2 cursor-pointer group">
                        <RadioGroupItem value="Ind" id="ind" className="border-primary text-primary" />
                        <Label htmlFor="ind" className="font-semibold cursor-pointer group-hover:text-primary transition-colors">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2 cursor-pointer group">
                        <RadioGroupItem value="All" id="all" className="border-primary text-primary" />
                        <Label htmlFor="all" className="font-semibold cursor-pointer group-hover:text-primary transition-colors">All</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Academic Year <span className="text-red-500">*</span></Label>
                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                            {academicYearsList.map((year: any) => (
                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>{year.asmaY_Year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Class <span className="text-red-500">*</span></Label>
                    <Select value={selectedAsmcLId} onValueChange={setSelectedAsmcLId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            {classesList.map((cls: any) => (
                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>{cls.asmcL_ClassName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Section <span className="text-red-500">*</span></Label>
                    <Select 
                        value={selectedAmscId} 
                        onValueChange={setSelectedAmscId}
                        disabled={loadingSections || !selectedAsmcLId}
                    >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary">
                            <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            {sectionsList.map((s: any) => (
                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                    {s.asmC_SectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {type === 'Ind' && (
                    <div className="space-y-2 col-span-full">
                        <Label className="text-sm font-semibold text-gray-700">Student Name <span className="text-red-500">*</span></Label>
                        <Select 
                            value={selectedAmstId} 
                            onValueChange={setSelectedAmstId}
                            disabled={loadingStudents || !selectedAmscId}
                        >
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary">
                                <SelectValue placeholder={loadingStudents ? 'Loading students...' : 'Search or select student...'} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100">
                                {studentsList.map((s: any) => (
                                    <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>
                                        {s.amsT_FirstName} {s.amsT_MiddleName || ''} {s.amsT_LastName || ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">From Date <span className="text-red-500">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-11 justify-start text-left font-normal rounded-xl border-gray-200 bg-white shadow-sm hover:border-primary transition-all",
                                    !fromDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                onSelect={setFromDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">To Date <span className="text-red-500">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-11 justify-start text-left font-normal rounded-xl border-gray-200 bg-white shadow-sm hover:border-primary transition-all",
                                    !toDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                            <Calendar
                                mode="single"
                                selected={toDate}
                                onSelect={setToDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox 
                        id="detailed" 
                        checked={options.detailed}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, detailed: !!checked }))}
                        className="rounded-md border-primary text-primary"
                    />
                    <Label htmlFor="detailed" className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors">Detailed</Label>
                </div>
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox 
                        id="stored" 
                        checked={options.stored}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, stored: !!checked }))}
                        className="rounded-md border-primary text-primary"
                    />
                    <Label htmlFor="stored" className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors">Stored Transaction</Label>
                </div>
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox 
                        id="format1" 
                        checked={options.format1}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, format1: !!checked }))}
                        className="rounded-md border-primary text-primary"
                    />
                    <Label htmlFor="format1" className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors">Format-1</Label>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white w-32 h-10 rounded-md font-bold shadow-md transition-all active:scale-95"
                >
                    <FileText className="mr-2 h-5 w-5" />
                    Report
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onReset}
                    className="w-32 h-10 rounded-md font-bold shadow-md border-gray-200 hover:bg-gray-50 hover:scale-105 active:scale-95"
                >
                    <RotateCcw className="mr-2 h-5 w-5 text-gray-500" />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
