'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cbsNoObjectionCertSchema, type TCbsNoObjectionCertSchema } from '@/schemas/admission/preadmission/reports/cbs-no-objection-cert.schema';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X, FileText, Printer, Check } from 'lucide-react';
import { useCBSNoObjectionSearchFilter, useCBSNoObjectionAcademicYearChange, useCBSNoObjectionStudentStatusChange } from '@/hooks/admission/preadmission/reports/useCBSNoObjectionCert';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface FilterFormProps {
    initialData: {
        allAcademicYear: any[];
        allclasslist: any[];
        allsectionlist: any[];
        masterCompany: any[];
    } | null;
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const searchMutation = useCBSNoObjectionSearchFilter();
    const academicYearMutation = useCBSNoObjectionAcademicYearChange();
    const studentStatusMutation = useCBSNoObjectionStudentStatusChange();

    const form = useForm<TCbsNoObjectionCertSchema>({
        resolver: zodResolver(cbsNoObjectionCertSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            date: new Date(),
            amsT_Id: undefined,
        },
    });

    const watchAllOrIndi = form.watch('allorindi');
    const watchAcademicYear = form.watch('asmaY_Id');
    const watchStatus = form.watch('optradio');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');

    // Handle student search
    useEffect(() => {
        const fetchStudents = async () => {
            if (debouncedSearch.length >= 3 && watchAcademicYear) {
                const payload = {
                    filterinitialdata: watchStatus,
                    searchfilter: debouncedSearch,
                    ASMAY_Id: watchAcademicYear,
                    AMST_SOL: watchStatus,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : (watchClass || 0),
                    ASMS_Id: watchAllOrIndi === 'A' ? 0 : (watchSection || 0),
                    allorindid: watchAllOrIndi === 'A' ? 'all' : 'indi'
                };

                try {
                    const response = await searchMutation.mutateAsync(payload);
                    if (response.data && response.data.fillstudlist) {
                        setStudentList(response.data.fillstudlist);
                    } else if (response.data && Array.isArray(response.data)) {
                        setStudentList(response.data);
                    } else if (response.data && response.data.count === 0) {
                        setStudentList([]);
                        toast.info('No students found for your search');
                    }
                } catch (error) {
                    console.error('Student search error:', error);
                }
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchAcademicYear, watchStatus, watchAllOrIndi, watchClass, watchSection]);

    // Handle status change
    const onStatusChange = async (val: string) => {
        form.setValue('optradio', val);
        form.setValue('amsT_Id', undefined as any);
        setStudentList([]);
        try {
            const response = await studentStatusMutation.mutateAsync({ AMST_SOL: val });
            if (response?.data?.fillstudlist) {
                setStudentList(response.data.fillstudlist);
            }
        } catch (error) {
            console.error('Status change error:', error);
        }
    };

    // Handle academic year change
    const onAcademicYearChange = async (val: number) => {
        form.setValue('asmaY_Id', val);
        form.setValue('amsT_Id', undefined as any);
        setStudentList([]);
        try {
            const payload = {
                ASMAY_Id: val,
                AMST_SOL: watchStatus
            };
            const response = await academicYearMutation.mutateAsync(payload);
            // Based on user provided JSON, data is a direct array if successful
            if (response?.data && Array.isArray(response.data)) {
                setStudentList(response.data);
            } else if (response?.data?.fillstudlist) {
                setStudentList(response.data.fillstudlist);
            }
        } catch (error) {
            console.error('Academic year change error:', error);
        }
    };

    const handleFormReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filter Type */}
                    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                        <FormField
                            control={form.control}
                            name="allorindi"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Filter View</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="A" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    All
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="I" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Individual
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Student Status */}
                    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                        <FormField
                            control={form.control}
                            name="optradio"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Student Status</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={onStatusChange}
                                            defaultValue={field.value}
                                            className="flex flex-wrap gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="S" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-green-700 font-semibold">
                                                    Studying
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="L" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-red-700 font-semibold">
                                                    Left
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="D" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-slate-700 font-semibold">
                                                    Deactive
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Academic Year */}
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year <span className="text-destructive">*</span></FormLabel>
                                    <Select 
                                        onValueChange={(val) => onAcademicYearChange(Number(val))} 
                                        value={field.value?.toString() || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allAcademicYear?.map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
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
                            name="asmcL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class {watchAllOrIndi === 'I' && <span className="text-destructive">*</span>}</FormLabel>
                                    <Select 
                                        disabled={watchAllOrIndi === 'A'}
                                        onValueChange={(val) => field.onChange(Number(val))} 
                                        value={field.value?.toString() || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allclasslist?.map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
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
                            name="asmS_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section {watchAllOrIndi === 'I' && <span className="text-destructive">*</span>}</FormLabel>
                                    <Select 
                                        disabled={watchAllOrIndi === 'A'}
                                        onValueChange={(val) => field.onChange(Number(val))} 
                                        value={field.value?.toString() || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allsectionlist?.map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date <span className="text-destructive">*</span></FormLabel>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Student Selection with Search (GMVPS Style Combobox) */}
                        <FormField
                            control={form.control}
                            name="amsT_Id"
                            render={({ field }) => {
                                const selectedStudent = studentList.find((s: any) => s.amsT_Id === field.value);
                                return (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Student <span className="text-destructive">*</span></FormLabel>
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value && selectedStudent
                                                            ? selectedStudent.amsT_FirstName || selectedStudent.studentname
                                                            : "Select Student"}
                                                        <div className="flex items-center gap-2">
                                                            {field.value ? (
                                                                <X 
                                                                    className="h-4 w-4 opacity-50 hover:opacity-100" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        field.onChange(undefined);
                                                                        setSearchTerm('');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <Search className="h-4 w-4 shrink-0 opacity-50" />
                                                        </div>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput 
                                                        placeholder="Search student (min 3 chars)..." 
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        {searchMutation.isPending && (
                                                            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                                            </div>
                                                        )}
                                                        {!searchMutation.isPending && studentList.length === 0 && (
                                                            <CommandEmpty>No student found.</CommandEmpty>
                                                        )}
                                                        <CommandGroup>
                                                            {studentList.map((stud: any) => (
                                                                <CommandItem
                                                                    key={stud.amsT_Id}
                                                                    onSelect={() => {
                                                                        field.onChange(stud.amsT_Id);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="flex items-center gap-2">
                                                                            {stud.amsT_FirstName || stud.studentname}
                                                                            {field.value === stud.amsT_Id && <Check className="h-3 w-3 text-primary" />}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            Adm: {stud.amsT_AdmNo || stud.admno} | {stud.asmaY_Year || ''}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-32">
                        <FileText className="mr-2 h-4 w-4" /> Report
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleFormReset}
                        className="border-warn text-warn hover:bg-warn/10 min-w-32"
                    >
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
