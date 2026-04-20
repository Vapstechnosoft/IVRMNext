'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { smscConductCertificateSchema, type SMSCConductCertificateFormData } from '@/schemas/admission/sms/reports/smsc-conduct-certificate.schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { useSMSCConductCertLoadData, useSMSCConductCertYearChange, useSMSCConductCertCourseChange, useSMSCConductCertBranchChange, useSMSCConductCertSemesterChange, useSMSCConductCertSearchFilter } from '@/hooks/admission/sms/reports/useSMSCConductCertificate';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, X, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface FilterFormProps {
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: loadData, isLoading: isLoadLoading } = useSMSCConductCertLoadData();
    const yearChange = useSMSCConductCertYearChange();
    const courseChange = useSMSCConductCertCourseChange();
    const branchChange = useSMSCConductCertBranchChange();
    const semesterChange = useSMSCConductCertSemesterChange();
    const searchFilterMutation = useSMSCConductCertSearchFilter();

    const [yearList, setYearList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm<SMSCConductCertificateFormData>({
        resolver: zodResolver(smscConductCertificateSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            Character: '1',
            asmaY_Id: 0,
            amcO_Id: null,
            amB_Id: null,
            amsE_Id: null,
            acmS_Id: null,
            amcsT_Id: 0,
            date: new Date(),
            exmname: '',
            exmmonth: '',
            stdreg: '',
        },
    });

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = form;

    const watchAllOrIndi = watch('allorindi');
    const watchStatus = watch('optradio');
    const watchCertType = watch('Character');
    const watchAsmayId = watch('asmaY_Id');
    const watchCourseId = watch('amcO_Id');
    const watchBranchId = watch('amB_Id');
    const watchSemId = watch('amsE_Id');
    const watchAmstId = watch('amcsT_Id');

    // Initial Load
    useEffect(() => {
        if (loadData) {
            const data = (loadData as any)?.data;
            if (data) {
                setYearList(data.getyear || []);
                setSectionList(data.allsectionlist || []);
            }
        }
    }, [loadData]);

    // Handle Year Change
    useEffect(() => {
        if (watchAsmayId > 0) {
            setCourseList([]);
            setValue('amcO_Id', null);
            yearChange.mutate({ ASMAY_Id: watchAsmayId }, {
                onSuccess: (res: any) => {
                    setCourseList(res.data?.data?.getcourse || []);
                }
            });
        }
    }, [watchAsmayId]);

    // Handle Course Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchCourseId > 0) {
            setBranchList([]);
            setValue('amB_Id', null);
            courseChange.mutate({ ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId }, {
                onSuccess: (res: any) => {
                    setBranchList(res.data?.data?.getbranch || []);
                }
            });
        }
    }, [watchCourseId]);

    // Handle Branch Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchBranchId && watchBranchId > 0) {
            setSemesterList([]);
            setValue('amsE_Id', null);
            branchChange.mutate({ ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId, AMB_Id: watchBranchId }, {
                onSuccess: (res: any) => {
                    setSemesterList(res.data?.data?.getsemester || []);
                }
            });
        }
    }, [watchBranchId]);

    // Handle Semester Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchBranchId && watchSemId && watchSemId > 0) {
            setSectionList([]);
            setValue('acmS_Id', null);
            semesterChange.mutate({ ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId, AMB_Id: watchBranchId, AMSE_Id: watchSemId }, {
                onSuccess: (res: any) => {
                    setSectionList(res.data?.data?.getsection || []);
                }
            });
        }
    }, [watchSemId]);

    // Reset student list when status or report type changes
    useEffect(() => {
        setStudentList([]);
        setValue('amcsT_Id', 0);
    }, [watchStatus, watchAllOrIndi]);

    const handleStudentSearch = (value: string) => {
        searchFilterMutation.mutate({
            filterinitialdata: watchCertType,
            searchfilter: value,
            ASMAY_Id: watchAsmayId,
            AMCST_SOL: watchStatus,
            AMCO_Id: watchAllOrIndi === 'A' ? 0 : (watchCourseId || 0),
            AMB_Id: watchAllOrIndi === 'A' ? 0 : (watchBranchId || 0),
            AMSE_Id: watchAllOrIndi === 'A' ? 0 : (watchSemId || 0),
            ACMS_Id: watchAllOrIndi === 'A' ? 0 : (form.getValues('acmS_Id') || 0),
            allorindid: watchAllOrIndi,
        }, {
            onSuccess: (res: any) => {
                const list = res.data?.data?.getstudentlist || [];
                setStudentList(list);
                if (list.length === 0) {
                    toast.info('No students found for your search');
                }
            }
        });
    };

    useEffect(() => {
        if (searchQuery.length < 3) return;
        const timer = setTimeout(() => handleStudentSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFormError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const handleReset = () => {
        reset();
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);
        setSearchQuery('');
        onReset();
    };

    const selectedStudent = studentList.find(s => s.amcsT_Id === watchAmstId);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit, handleFormError)} className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* All / Individual */}
                    <FormField
                        control={form.control}
                        name="allorindi"
                        render={({ field }) => (
                            <FormItem className="space-y-4 p-5 rounded-2xl border bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                                <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground italic">Selection Mode</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="A" id="all" className="w-5 h-5 border-2" />
                                            <Label htmlFor="all" className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors">All</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="I" id="individual" className="w-5 h-5 border-2" />
                                            <Label htmlFor="individual" className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors">Individual</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Status */}
                    <FormField
                        control={form.control}
                        name="optradio"
                        render={({ field }) => (
                            <FormItem className="space-y-4 p-5 rounded-2xl border bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                                <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground italic">Student Status</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="S" id="studying" className="w-5 h-5 border-2 border-green-400 text-green-600" />
                                            <Label htmlFor="studying" className="text-base font-medium cursor-pointer group-hover:text-green-600 transition-colors">Studying</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="D" id="deactive" className="w-5 h-5 border-2 border-red-400 text-red-600" />
                                            <Label htmlFor="deactive" className="text-base font-medium cursor-pointer group-hover:text-red-600 transition-colors">Deactive</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Certificate Type */}
                    <FormField
                        control={form.control}
                        name="Character"
                        render={({ field }) => (
                            <FormItem className="space-y-4 p-5 rounded-2xl border bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                                <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground italic">Certificate Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="1" id="study" className="w-5 h-5 border-2 border-blue-400 text-blue-600" />
                                            <Label htmlFor="study" className="text-base font-medium cursor-pointer group-hover:text-blue-600 transition-colors">STUDY</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 group">
                                            <RadioGroupItem value="0" id="conduct" className="w-5 h-5 border-2 border-amber-400 text-amber-600" />
                                            <Label htmlFor="conduct" className="text-base font-medium cursor-pointer group-hover:text-amber-600 transition-colors">CONDUCT</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 border rounded-[2rem] bg-gradient-to-br from-slate-50 to-white shadow-xl shadow-slate-200/50">
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name="asmaY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    Academic Year <span className="text-red-500 text-lg">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 transition-all">
                                            <SelectValue placeholder="--Select--" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {yearList.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Course */}
                    <FormField
                        control={form.control}
                        name="amcO_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("flex items-center gap-2 text-sm font-bold text-slate-700", watchAllOrIndi === 'I' && "after:content-['*'] after:text-red-500 after:text-lg")}>
                                    Course
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || yearChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 transition-all">
                                            {yearChange.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="--Select--" />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {courseList.map((c: any) => (
                                            <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>
                                                {c.amcO_CourseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Branch */}
                    <FormField
                        control={form.control}
                        name="amB_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("flex items-center gap-2 text-sm font-bold text-slate-700", watchAllOrIndi === 'I' && "after:content-['*'] after:text-red-500 after:text-lg")}>
                                    Branch
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || courseChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 transition-all">
                                            {courseChange.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="--Select--" />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {branchList.map((b: any) => (
                                            <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>
                                                {b.amB_BranchName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Semester */}
                    <FormField
                        control={form.control}
                        name="amsE_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("flex items-center gap-2 text-sm font-bold text-slate-700", watchAllOrIndi === 'I' && "after:content-['*'] after:text-red-500 after:text-lg")}>
                                    Semester
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || branchChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 transition-all">
                                            {branchChange.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="--Select--" />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {semesterList.map((s: any) => (
                                            <SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>
                                                {s.amsE_SEMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name="acmS_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("flex items-center gap-2 text-sm font-bold text-slate-700", watchAllOrIndi === 'I' && "after:content-['*'] after:text-red-500 after:text-lg")}>
                                    Section
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || semesterChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 transition-all">
                                            {semesterChange.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="--Select--" />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>
                                                {s.acmS_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    Date <span className="text-red-500 text-lg">*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={(date) => field.onChange(date)}
                                        className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 transition-all"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Student Select */}
                    <FormField
                        control={form.control}
                        name="amcsT_Id"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    Student <span className="text-red-500 text-lg">*</span>
                                </FormLabel>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full h-12 rounded-xl border-slate-200 justify-between font-medium transition-all hover:bg-slate-50",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value && selectedStudent
                                                    ? selectedStudent.studentname
                                                    : "Search by name (min 3 characters)..."}
                                                <div className="flex items-center gap-2">
                                                    {field.value ? (
                                                        <X
                                                            className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                field.onChange(0);
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Search className="h-4 w-4 shrink-0 opacity-40" />
                                                </div>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Type student name..."
                                                className="h-12 border-none focus:ring-0"
                                                onValueChange={(v) => setSearchQuery(v)}
                                            />
                                            <CommandList className="max-h-[300px] overflow-y-auto">
                                                <CommandEmpty className="p-4 text-center text-slate-500">
                                                    {searchFilterMutation.isPending ? (
                                                        <div className="flex flex-col items-center gap-2 py-4">
                                                            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                                                            <span className="text-sm font-medium">Searching students...</span>
                                                        </div>
                                                    ) : searchQuery.length < 3 ? (
                                                        "Type at least 3 characters to search"
                                                    ) : (
                                                        "No results found"
                                                    )}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {studentList.map((s: any) => (
                                                        <CommandItem
                                                            value={`${s.studentname}-${s.amcsT_Id}`}
                                                            key={s.amcsT_Id}
                                                            onSelect={() => {
                                                                field.onChange(s.amcsT_Id);
                                                                setStudentOpen(false);
                                                            }}
                                                            className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{s.studentname}</span>
                                                                <span className="text-xs text-slate-500 uppercase tracking-tight">{s.admno} | {s.coursename}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-[10px] font-medium" />
                            </FormItem>
                        )}
                    />

                    {/* Conditional Fields for Conduct Certificate */}
                    {watchCertType === '0' && (
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 animate-in slide-in-from-top-4 duration-300">
                            <FormField
                                control={form.control}
                                name="exmname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Exam Name <span className="text-red-500 text-lg">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} placeholder="Enter exam name" className="h-12 rounded-xl border-slate-200" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="exmmonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-slate-700">Exam Month/Year</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} placeholder="MAY 2026" className="h-12 rounded-xl border-slate-200" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stdreg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-slate-700">Reg. No.</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} placeholder="Enter registration no" className="h-12 rounded-xl border-slate-200" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-8 border-t border-slate-100">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-[180px] h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                        Generate Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full sm:w-[150px] h-14 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Reset
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="w-full sm:w-[150px] h-14 rounded-2xl text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <X className="h-5 w-5" />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
