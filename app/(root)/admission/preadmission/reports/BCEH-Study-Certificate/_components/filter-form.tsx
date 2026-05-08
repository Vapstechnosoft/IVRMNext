'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { FormError } from '@/components/ui/extension/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandInput as CommandSearchInput, CommandItem, CommandList } from '@/components/ui/command';
import { RefreshCcw, FileText, X, Search, Check, Loader2, CalendarIcon } from 'lucide-react';
import {
    bcehStudyCertificateSchema,
    BcehStudyCertificateSchema
} from '@/schemas/admission/preadmission/reports/bceh-study-certificate.schema';
import { useBcehStudyCertSearchStudent } from '@/hooks/admission/preadmission/reports/useBcehStudyCertificate';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const studentSearchMutation = useBcehStudyCertSearchStudent();

    const form = useForm<BcehStudyCertificateSchema>({
        resolver: zodResolver(bcehStudyCertificateSchema),
        defaultValues: {
            allorindii: 'A',
            optradio: 'S',
            Character: '0',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            amsT_Id: '',
            ASA_FromDate: new Date(),
        },
    });

    const { watch, formState: { errors } } = form;
    const watchAllOrIndi = watch('allorindii');
    const watchStudyingLeft = watch('optradio');
    const watchYear = watch('asmaY_Id');
    const watchClass = watch('asmcL_Id');
    const watchSection = watch('asmS_Id');

    // Cascading resets
    useEffect(() => {
        if (watchAllOrIndi === 'A') {
            form.setValue('asmcL_Id', '');
            form.setValue('asmS_Id', '');
            form.setValue('amsT_Id', '');
            setStudentList([]);
        }
    }, [watchAllOrIndi, form]);

    useEffect(() => {
        form.setValue('amsT_Id', '');
        setStudentList([]);
        setSearchTerm('');
    }, [watchYear, watchClass, watchSection, watchStudyingLeft]);

    // Student Search Logic
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear) return;
            if (debouncedSearch.length < 2) return;

            try {
                const payload = {
                    searchfilter: debouncedSearch,
                    ASMAY_Id: parseInt(watchYear),
                    AMST_SOL: watchStudyingLeft,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : (watchClass ? parseInt(watchClass) : 0),
                    ASMC_Id: watchAllOrIndi === 'A' ? 0 : (watchSection ? parseInt(watchSection) : 0),
                    allorindid: watchAllOrIndi
                };

                const response = await studentSearchMutation.mutateAsync(payload);
                const data = response.data || response;

                if (data && data.fillstudlist) {
                    setStudentList(data.fillstudlist);
                } else if (data && data.count === 0) {
                    setStudentList([]);
                    toast.info('No students found for this search criteria');
                }
            } catch (error) {
                console.error('Student search error:', error);
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchYear, watchClass, watchSection, watchStudyingLeft, watchAllOrIndi]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Mode Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="allorindii"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="font-semibold text-slate-700">Scope:</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="A" id="scope-all" />
                                            <label htmlFor="scope-all" className="text-sm cursor-pointer">All</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="I" id="scope-ind" />
                                            <label htmlFor="scope-ind" className="text-sm cursor-pointer">Individual</label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="optradio"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="font-semibold text-slate-700">Status:</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="S" id="status-studying" />
                                            <label htmlFor="status-studying" className="text-sm cursor-pointer">Studying</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="L" id="status-left" />
                                            <label htmlFor="status-left" className="text-sm cursor-pointer">Left</label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Character"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="font-semibold text-slate-700">Certificate Type:</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="0" id="type-study" />
                                            <label htmlFor="type-study" className="text-sm cursor-pointer font-medium text-primary">Study Certificate</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="2" id="type-noc" />
                                            <label htmlFor="type-noc" className="text-sm cursor-pointer font-medium text-primary">No Objection Cert</label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">Academic Year:<span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-slate-300">
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allAcademicYear?.map((yr: any) => (
                                                <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                    {yr.asmaY_Year}
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
                            name="asmcL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={cn("font-semibold text-slate-700", watchAllOrIndi === 'A' && "opacity-50")}>Class:{watchAllOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={watchAllOrIndi === 'A'}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-slate-300 disabled:bg-slate-100">
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
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="asmS_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={cn("font-semibold text-slate-700", watchAllOrIndi === 'A' && "opacity-50")}>Section:{watchAllOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={watchAllOrIndi === 'A'}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-slate-300 disabled:bg-slate-100">
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
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="ASA_FromDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="font-semibold text-slate-700 mb-1">Certificate Date:<span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-white border-slate-300",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amsT_Id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="font-semibold text-slate-700 mb-1">Student:<span className="text-red-500">*</span></FormLabel>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-10 bg-white border-slate-300 font-normal px-3 text-left shadow-sm",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <span className="truncate pr-2">
                                                        {studentSearchMutation.isPending ? "Searching..." : (field.value && studentList.find(s => s.amsT_Id.toString() === field.value)
                                                            ? studentList.find(s => s.amsT_Id.toString() === field.value).amsT_FirstName
                                                            : "Select or search Student")}
                                                    </span>
                                                    <div className="flex items-center shrink-0">
                                                        {studentSearchMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                                        ) : (
                                                            <Search className="h-4 w-4 opacity-50" />
                                                        )}
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full sm:w-[400px] p-0" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Type at least 2 characters to search..."
                                                    className="h-9"
                                                    onValueChange={setSearchTerm}
                                                    value={searchTerm}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {searchTerm.length < 2
                                                            ? "Please type at least 2 characters"
                                                            : (studentSearchMutation.isPending ? "Searching..." : "No student found.")}
                                                    </CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-y-auto">
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                key={s.amsT_Id}
                                                                value={s.amsT_Id.toString()}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id.toString());
                                                                    setStudentOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 py-1">
                                                                    <Check className={cn("h-4 w-4 text-primary shrink-0", field.value === s.amsT_Id.toString() ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold text-slate-900 leading-tight">{s.amsT_FirstName}</span>
                                                                        <span className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-wider">Adm No: {s.amsT_AdmNo}</span>
                                                                    </div>
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
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-8 border-t border-slate-100">
                    <Button
                        type="submit"
                        size="lg"
                        className="min-w-[160px] shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary"
                    >
                        <FileText className="mr-2 h-4 w-4" /> Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        className="min-w-[160px] border-slate-300 hover:bg-slate-50 transition-all"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    {/* <Button 
                        type="button" 
                        variant="ghost" 
                        size="lg" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[160px]"
                        onClick={handleReset}
                    >
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button> */}
                </div>
            </form>
        </Form>
    );
}
