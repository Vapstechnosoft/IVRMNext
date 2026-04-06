'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RefreshCcw, FileText, X, Search, Check, Loader2 } from 'lucide-react';
import { useBbhsStudyCertSearchFilter, useBbhsStudyCertAcademicYearChange } from '@/hooks/admission/preadmission/reports/useBbhsStudyCertificate';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const formSchema = z.object({
    allorindii: z.enum(['A', 'I']),
    optradio: z.enum(['S', 'L', 'D']),
    character: z.enum(['0', '1']),
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    asmcL_Id: z.string().optional(),
    asmS_Id: z.string().optional(),
    paretsnamefather: z.enum(['0', '1', '2']),
    amsT_Id: z.string().min(1, 'Student is required'),
    date: z.date({
        required_error: "Date is required",
    }),
});

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
    const [classList, setClassList] = useState<any[]>(initialData?.allclasslist || []);
    const [sectionList, setSectionList] = useState<any[]>(initialData?.allsectionlist || []);

    const searchMutation = useBbhsStudyCertSearchFilter();
    const yearChangeMutation = useBbhsStudyCertAcademicYearChange();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allorindii: 'A',
            optradio: 'S',
            character: '0',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            paretsnamefather: '0',
            amsT_Id: '',
            date: new Date(),
        },
    });

    const watchAllOrIndi = form.watch('allorindii');
    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');
    const watchOptRadio = form.watch('optradio');

    // Fetch students when debounced search or filters change
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear || !watchOptRadio) return;

            if (debouncedSearch.length < 2) {
                if (watchAllOrIndi === 'I') {
                    // Initial load for individual mode if needed, 
                    // though legacy seems to rely on search mostly.
                }
                return;
            }

            try {
                const payload = {
                    searchfilter: debouncedSearch,
                    ASMAY_Id: parseInt(watchYear),
                    AMST_SOL: watchOptRadio,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : (parseInt(watchClass || '0')),
                    ASMC_Id: watchAllOrIndi === 'A' ? 0 : (parseInt(watchSection || '0')),
                    allorindid: watchAllOrIndi
                };

                const response = await searchMutation.mutateAsync(payload);
                const data = response.data || response;

                if (data && data.fillstudlist) {
                    setStudentList(data.fillstudlist);
                } else {
                    setStudentList([]);
                }
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchYear, watchOptRadio, watchAllOrIndi, watchClass, watchSection]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Selection Type */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <FormField
                            control={form.control}
                            name="allorindii"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Report For</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="A" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">All</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="I" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Individual</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Student Status */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <FormField
                            control={form.control}
                            name="optradio"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Student Status</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="S" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Studying</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="L" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Left</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="D" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Deactive</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Certificate Type */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <FormField
                            control={form.control}
                            name="character"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Certificate Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="0" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Study Certificate</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="1" /></FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Character Certificate</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Academic Year <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Academic Year" />
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
                                    <FormLabel className="font-semibold">Class</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={watchAllOrIndi === 'A'}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classList.map((cls: any) => (
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

                        <FormField
                            control={form.control}
                            name="asmS_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Section</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={watchAllOrIndi === 'A'}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sectionList.map((sec: any) => (
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
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <FormField
                                control={form.control}
                                name="paretsnamefather"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Parent Name On Certificate</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-wrap gap-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="0" /></FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Father Name</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="1" /></FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Mother Name</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="2" /></FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Both</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="amsT_Id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center space-y-0">
                                    <FormLabel className="col-span-1 text-sm font-bold text-slate-700 pr-2">Student:<span className="text-red-500">*</span></FormLabel>
                                    <div className="col-span-3">
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between h-8 bg-white border-slate-300 font-normal shadow-sm px-3",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {searchMutation.isPending ? "Searching..." : (field.value && studentList.find(s => s.amsT_Id.toString() === field.value)
                                                                ? (studentList.find(s => s.amsT_Id.toString() === field.value).studentname || studentList.find(s => s.amsT_Id.toString() === field.value).amsT_FirstName)
                                                                : "Search Student...")}
                                                        </span>
                                                        <div className="flex items-center shrink-0">
                                                            {searchMutation.isPending ? (
                                                                <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                                                            ) : (
                                                                <>
                                                                    {field.value && (
                                                                        <X
                                                                            className="h-3 w-3 mr-1 opacity-50 hover:opacity-100 transition-opacity"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                field.onChange("");
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <Search className="h-3 w-3 opacity-50" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full sm:w-[450px] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Type name to search student (min 2 chars)..."
                                                        className="h-9"
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>{searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" /> : "No student found."}</CommandEmpty>
                                                        <CommandGroup className="max-h-64 overflow-y-auto w-full">
                                                            {studentList.map((s: any) => (
                                                                <CommandItem
                                                                    key={s.amsT_Id}
                                                                    value={s.amsT_Id.toString()}
                                                                    className="aria-selected:bg-slate-100"
                                                                    onSelect={() => {
                                                                        field.onChange(s.amsT_Id.toString());
                                                                        setStudentOpen(false);
                                                                        setSearchTerm("");
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col py-1">
                                                                        <span className="font-semibold text-slate-900 group-aria-selected:text-black">
                                                                            {s.studentname || s.amsT_FirstName}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground/60 uppercase">
                                                                            {s.class && s.section ? `${s.class} - ${s.section}` : (s.asmcL_ClassName ? `${s.asmcL_ClassName} - ${s.asmC_SectionName}` : "Details Not Available")}
                                                                        </span>
                                                                    </div>
                                                                    {field.value === s.amsT_Id.toString() && <Check className="ml-auto h-4 w-4 text-primary shrink-0" />}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="font-semibold mb-1">Issue Date <span className="text-red-500">*</span></FormLabel>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        className="min-w-[140px] shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        <FileText className="mr-2 h-4 w-4" /> Generate Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        className="min-w-[140px] hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Reset Form
                    </Button>
                    {/* <Button 
                        type="button" 
                        variant="ghost" 
                        size="lg" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleReset}
                    >
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button> */}
                </div>
            </form>
        </Form>
    );
}
