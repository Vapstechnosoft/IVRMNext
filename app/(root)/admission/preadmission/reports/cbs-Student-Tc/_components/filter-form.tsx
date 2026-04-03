'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CbsStudentTcSchema, type CbsStudentTcFields } from '@/schemas/admission/preadmission/reports/cbs-student-tc.schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { 
    useCbsTcInitialData, 
    useCbsTcYearChange, 
    useCbsTcClassChange, 
    useCbsTcSectionChange 
} from '@/hooks/admission/preadmission/useCbsStudentTc';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const RESULT_TYPES = [
    "He appeared for and passed the ISC Examiniaton (Year XII) in March ",
    "He appeared for and passed the ICSE Examiniaton (Year X) in March",
    "Promotion has been granted",
    "He is presently studying in Class"
];

interface FilterFormProps {
    onSubmit: (data: CbsStudentTcFields) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: initialData, isLoading: isInitialLoading } = useCbsTcInitialData();
    const yearChangeMutation = useCbsTcYearChange();
    const classChangeMutation = useCbsTcClassChange();
    const sectionChangeMutation = useCbsTcSectionChange();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const form = useForm<CbsStudentTcFields>({
        resolver: zodResolver(CbsStudentTcSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            asmaY_Id: 0,
            amsT_Id: undefined,
            asmcL_Id: 0,
            asmS_Id: 0,
            BSPID: '',
            Boardtype: 'ICSE',
            resulttype: RESULT_TYPES[0],
        },
    });

    const { watch, setValue, reset } = form;
    const reportType = watch('reporttype');
    const asmayId = watch('asmaY_Id');
    const asmcLId = watch('asmcL_Id');
    const asmsId = watch('asmS_Id');
    const temporper = watch('temporper');

    // Load initial data
    useEffect(() => {
        if (initialData) {
            const data = initialData?.data || initialData;
            // Explicitly map from the provided JSON structure
            if (data?.accclass) {
                const classes = data.accclass?.$values || (Array.isArray(data.accclass) ? data.accclass : []);
                setClassList(classes);
            }
            if (data?.accsection) {
                const sections = data.accsection?.$values || (Array.isArray(data.accsection) ? data.accsection : []);
                setSectionList(sections);
            }
        }
    }, [initialData]);

    // Handle Year Change
    useEffect(() => {
        if (asmayId > 0) {
            yearChangeMutation.mutate({
                ASMAY_Id: asmayId,
                tctemporper: temporper,
                report_type: reportType
            }, {
                onSuccess: (response: any) => {
                    const data = response?.data || response;
                    
                    // Update student list if present
                    const students = data?.studentlist?.$values || data?.studentlist || [];
                    if (Array.isArray(students)) setStudentList(students);
                    
                    // Update class list if present
                    const classes = data?.accclass?.$values || data?.accclass || [];
                    if (Array.isArray(classes) && classes.length > 0) setClassList(classes);

                    // Update section list if present
                    const sections = data?.accsection?.$values || data?.accsection || [];
                    if (Array.isArray(sections) && sections.length > 0) setSectionList(sections);
                }
            });
        }
    }, [asmayId, reportType, temporper]);

    // Handle Class Change
    useEffect(() => {
        if (asmcLId && asmcLId > 0 && reportType === 'indi') {
            classChangeMutation.mutate({
                ASMAY_Id: asmayId,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: Number(asmcLId)
            }, {
                onSuccess: (response: any) => {
                    const data = response?.data || response;
                    const sections = data?.accsection?.$values || data?.accsection || [];
                    if (Array.isArray(sections)) setSectionList(sections);
                }
            });
        }
    }, [asmcLId]);

    // Handle Section Change
    useEffect(() => {
        if (asmsId && asmsId > 0 && reportType === 'indi') {
            sectionChangeMutation.mutate({
                ASMAY_Id: asmayId,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: Number(asmcLId),
                ASMS_Id: Number(asmsId)
            }, {
                onSuccess: (response: any) => {
                    const data = response?.data || response;
                    const students = data?.studentlist?.$values || data?.studentlist || [];
                    if (Array.isArray(students)) setStudentList(students);
                }
            });
        }
    }, [asmsId]);

    // Reset fields when report type changes
    useEffect(() => {
        setValue('amsT_Id', undefined);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setStudentList([]);
    }, [reportType, setValue]);

    const handleReset = () => {
        reset();
        setStudentList([]);
        onReset();
    };

    const isPending = yearChangeMutation.isPending || classChangeMutation.isPending || sectionChangeMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report Type & Student Type */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-inner">
                        <FormField
                            control={form.control}
                            name="reporttype"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">Report Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex items-center gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="All" id="all" />
                                                <Label htmlFor="all" className="cursor-pointer">All</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="indi" id="indi" />
                                                <Label htmlFor="indi" className="cursor-pointer">Individual</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temporper"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">TC Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex items-center gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Temp" id="temp" />
                                                <Label htmlFor="temp" className="cursor-pointer">Temporary TC</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Per" id="per" />
                                                <Label htmlFor="per" className="cursor-pointer">Permanent TC</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Academic Year & Student Selection */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-inner">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">Academic Year <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-slate-200">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(() => {
                                                const years = initialData?.data?.accyear || initialData?.accyear || [];
                                                return Array.isArray(years) && years.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ));
                                            })()}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amsT_Id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase mb-1">Student <span className="text-red-500">*</span></FormLabel>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    disabled={studentList.length === 0}
                                                    className={cn(
                                                        "w-full justify-between h-10 bg-white border-slate-200",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? field.value.studentname
                                                        : "Select or Search Student"}
                                                    <div className="flex items-center gap-2">
                                                        {field.value && (
                                                            <X 
                                                                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(undefined);
                                                                }}
                                                            />
                                                        )}
                                                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Type to search..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>{isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "No student found."}</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-y-auto">
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                value={s.studentname}
                                                                key={s.amsT_Id}
                                                                onSelect={() => {
                                                                    field.onChange(s);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <span className="font-medium">{s.studentname}</span>
                                                                {field.value?.amsT_Id === s.amsT_Id && <Check className="h-4 w-4 text-indigo-600" />}
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

                    {/* Class & Section (Only for Individual) */}
                    {reportType === 'indi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-inner animate-in slide-in-from-top-4 duration-300">
                            <FormField
                                control={form.control}
                                name="asmcL_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase">Class <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
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

                            <FormField
                                control={form.control}
                                name="asmS_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase">Section <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
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
                        </div>
                    )}

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 shadow-inner">
                        <FormField
                            control={form.control}
                            name="BSPID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">BSP ID <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="Boardtype"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">Board Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Board" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ISC">ISC</SelectItem>
                                            <SelectItem value="ICSE">ICSE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="resulttype"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="text-sm font-bold text-slate-600 uppercase">Result Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {RESULT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100">
                    <Button 
                        type="submit" 
                        disabled={isPending || isInitialLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] font-bold shadow-lg"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                        REPORT
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleReset} 
                        className="min-w-[150px] font-bold border-slate-200"
                    >
                        CANCEL
                    </Button>
                </div>
            </form>
        </Form>
    );
}
