'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StthomasTcCustomReportSchema, type StthomasTcCustomReportFields } from '@/schemas/admission/preadmission/reports/stthomas-tc-custom-report';
import { 
    useStthomasTcLoadData, 
    useStthomasTcYearChange, 
    useStthomasTcClassChange, 
    useStthomasTcSectionChange 
} from '@/hooks/admission/preadmission/useStthomasTcCustomReport';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Loader2, Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface FilterFormProps {
    onSubmit: (data: StthomasTcCustomReportFields) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: initialData, isLoading: isLoadDataLoading } = useStthomasTcLoadData();
    const yearChangeMutation = useStthomasTcYearChange();
    const classChangeMutation = useStthomasTcClassChange();
    const sectionChangeMutation = useStthomasTcSectionChange();

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const form = useForm<StthomasTcCustomReportFields>({
        resolver: zodResolver(StthomasTcCustomReportSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            ASMAY_Id: 0,
            AMST_Id: undefined,
            ASMCL_Id: 0,
            ASMS_Id: 0
        }
    });

    const { watch, setValue, reset } = form;
    const reportType = watch('reporttype');
    const temporper = watch('temporper');
    const selectedYear = watch('ASMAY_Id');
    const selectedClass = watch('ASMCL_Id');
    const selectedSection = watch('ASMS_Id');
    const selectedAmstId = watch('AMST_Id');

    // Handle initial load data population
    useEffect(() => {
        if (initialData?.data) {
            const data = initialData.data;
            setClassList(data.accclass || []);
            setSectionList(data.accsection || []);
            if (reportType === 'All') {
                setStudentList(data.studentlist || []);
            }
        }
    }, [initialData, reportType]);

    // Handle Year Change
    useEffect(() => {
        if (selectedYear && selectedYear > 0) {
            // Reset dependent fields
            setValue('ASMCL_Id', 0);
            setValue('ASMS_Id', 0);
            setValue('AMST_Id', undefined);
            setSectionList([]);
            setStudentList([]);

            yearChangeMutation.mutate({
                ASMAY_Id: selectedYear,
                tctemporper: temporper,
                report_type: reportType
            }, {
                onSuccess: (response: any) => {
                    const data = response.data;
                    setClassList(data?.accclass || []);
                    if (reportType === 'All') {
                        setStudentList(data?.studentlist || []);
                    }
                }
            });
        }
    }, [selectedYear, reportType, temporper]);

    // Handle Class Change
    useEffect(() => {
        if (selectedClass && selectedClass > 0 && selectedYear && selectedYear > 0) {
            // Reset dependent fields
            setValue('ASMS_Id', 0);
            setValue('AMST_Id', undefined);
            setSectionList([]);
            setStudentList([]);

            classChangeMutation.mutate({
                ASMAY_Id: selectedYear,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: selectedClass
            }, {
                onSuccess: (response: any) => {
                    setSectionList(response.data?.accsection || []);
                }
            });
        }
    }, [selectedClass]);

    // Handle Section Change
    useEffect(() => {
        if (selectedSection && selectedSection > 0 && selectedClass && selectedClass > 0 && selectedYear && selectedYear > 0) {
            // Reset student selection
            setValue('AMST_Id', undefined);
            setStudentList([]);

            sectionChangeMutation.mutate({
                ASMAY_Id: selectedYear,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: selectedClass,
                ASMS_Id: selectedSection
            }, {
                onSuccess: (response: any) => {
                    setStudentList(response.data?.studentlist || []);
                }
            });
        }
    }, [selectedSection]);

    const handleReset = () => {
        reset();
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    const selectedStudent = studentList.find(s => s.amsT_Id === selectedAmstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report Type */}
                    <FormField
                        control={form.control}
                        name="reporttype"
                        render={({ field }) => (
                            <FormItem className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                <FormLabel className="font-bold">Report Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-6"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FormControl>
                                                <RadioGroupItem value="All" id="all" />
                                            </FormControl>
                                            <Label htmlFor="all" className="font-normal cursor-pointer">All Students</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FormControl>
                                                <RadioGroupItem value="indi" id="indi" />
                                            </FormControl>
                                            <Label htmlFor="indi" className="font-normal cursor-pointer">Individual</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* TC Type */}
                    <FormField
                        control={form.control}
                        name="temporper"
                        render={({ field }) => (
                            <FormItem className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                <FormLabel className="font-bold">TC Duration</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-6"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FormControl>
                                                <RadioGroupItem value="Temp" id="temp" />
                                            </FormControl>
                                            <Label htmlFor="temp" className="font-normal cursor-pointer">Temporary TC</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FormControl>
                                                <RadioGroupItem value="Per" id="per" />
                                            </FormControl>
                                            <Label htmlFor="per" className="font-normal cursor-pointer">Permanent TC</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name="ASMAY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold whitespace-nowrap">Academic Year <span className="text-red-500">*</span></FormLabel>
                                <Select 
                                    onValueChange={(v) => field.onChange(Number(v))} 
                                    value={field.value ? field.value.toString() : ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select Academic Year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(initialData as any)?.data?.accyear?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name="ASMCL_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("font-bold", reportType === 'indi' && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
                                    Class
                                </FormLabel>
                                <Select 
                                    disabled={reportType !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))} 
                                    value={field.value ? field.value.toString() : ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classList.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name="ASMS_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("font-bold", reportType === 'indi' && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
                                    Section
                                </FormLabel>
                                <Select 
                                    disabled={reportType !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))} 
                                    value={field.value ? field.value.toString() : ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Student Selection (Searchable) */}
                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="AMST_Id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="font-bold">Student Name <span className="text-red-500">*</span></FormLabel>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between font-normal bg-white h-10",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value && selectedStudent
                                                        ? selectedStudent.studentname
                                                        : "Select Student"}
                                                    <div className="flex items-center gap-2">
                                                        {field.value ? (
                                                            <X 
                                                                className="h-4 w-4 opacity-50 hover:opacity-100" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(undefined);
                                                                }}
                                                            />
                                                        ) : null}
                                                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[450px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search student name..." className="h-9" />
                                                <CommandList className="max-h-[300px]">
                                                    <CommandEmpty>No students found for this selection.</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                value={s.studentname}
                                                                key={s.amsT_Id}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id);
                                                                    setStudentOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === s.amsT_Id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {s.studentname}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-6 border-t">
                    <Button type="submit" size="lg" className="min-w-[160px] bg-indigo-600 hover:bg-indigo-700 h-11" disabled={yearChangeMutation.isPending}>
                        {yearChangeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Generate Report
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={handleReset} className="min-w-[160px] h-11">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reset Form
                    </Button>
                </div>
            </form>
        </Form>
    );
}
