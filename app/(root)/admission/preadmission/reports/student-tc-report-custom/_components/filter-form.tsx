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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RefreshCcw, FileText, Search, Check, Loader2 } from 'lucide-react';
import { useStudentTcStudentList, useStudentTcACS } from '@/hooks/admission/preadmission/reports/useStudentTcReportCustom';
import { cn } from '@/lib/utils';
import { studentTcReportCustomSchema, type StudentTcReportCustomFields } from '@/schemas/admission/preadmission/reports/student-tc-report-custom.schema';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: StudentTcReportCustomFields) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const searchMutation = useStudentTcStudentList();
    const acsMutation = useStudentTcACS();

    const miid = initialData?.masterCompany?.[0]?.miid || initialData?.masterCompany?.[0]?.mI_Id || 0;
    const isGirls = parseInt(miid) === 4;
    const isBoys = parseInt(miid) === 6;

    const form = useForm<StudentTcReportCustomFields>({
        resolver: zodResolver(studentTcReportCustomSchema),
        defaultValues: {
            asmaY_Id: '',
            admname: 'regno',
            asmcL_Id: '',
            ASMC_Id: '',
            AMST_Id: null,
            prom: '',
            pervious: '',
            ASMCL_Id1: '',
        },
    });

    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('ASMC_Id');

    // Triggered when basic filters change to fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear) return;

            try {
                const payload = {
                    ASMAY_Id: parseInt(watchYear),
                    ASMCL_Id: watchClass ? parseInt(watchClass) : undefined,
                    ASMC_Id: watchSection ? parseInt(watchSection) : undefined,
                };

                const response = await searchMutation.mutateAsync(payload);
                const data = (response?.data || response) as any;

                const studentData = data.studentlist || data.studentList || [];
                setStudentList(Array.isArray(studentData) ? studentData : []);
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchStudents();
    }, [watchYear, watchClass, watchSection]);

    // Handle initial year change student load (getACS)
    useEffect(() => {
        if (watchYear) {
            const fetchAcsStudents = async () => {
                try {
                    const response = await acsMutation.mutateAsync(parseInt(watchYear));
                    const data = (response?.data || response) as any;
                    const studentData = data.studentlist || data.studentList || [];
                    setStudentList(Array.isArray(studentData) ? studentData : []);
                } catch (error) {
                    console.error('getACS failed:', error);
                }
            };
            fetchAcsStudents();
        }
    }, [watchYear]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">Left Year <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-10 border-slate-200">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.academicList?.map((yr: any, index: number) => (
                                                <SelectItem key={`${yr.asmaY_Id}-${index}`} value={yr.asmaY_Id.toString()}>
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
                            name="admname"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="font-semibold text-slate-700">Select Radio Button <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all hover:bg-slate-100"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="regno" /></FormControl>
                                                <FormLabel className="font-medium cursor-pointer text-slate-600">Adm.No.</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="stdname" /></FormControl>
                                                <FormLabel className="font-medium cursor-pointer text-slate-600">Name</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="asmcL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">Class <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-10 border-slate-200">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillclass?.map((cls: any, index: number) => (
                                                <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* {isGirls && (
                            <FormField
                                control={form.control}
                                name="ASMCL_Id1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-slate-700">Admitted Class <span className="text-red-500">*</span></FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white h-10 border-slate-200">
                                                    <SelectValue placeholder="Select Admitted Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData?.fillclass?.map((cls: any, index: number) => (
                                                    <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )} */}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ASMC_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">Section <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-10 border-slate-200">
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillsec?.map((sec: any, index: number) => (
                                                <SelectItem key={`${sec.asmS_Id}-${index}`} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
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
                            name="AMST_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">Student Name <span className="text-red-500">*</span></FormLabel>
                                    <div className="relative">
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between h-10 bg-white border-slate-200 font-normal hover:bg-slate-50 transition-colors shadow-sm",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate pr-2 font-medium">
                                                            {field.value
                                                                ? (field.value.amsT_FirstName ? `${field.value.amsT_FirstName} ${field.value.amsT_MiddleName || ''} ${field.value.amsT_LastName || ''}` : field.value.studentname)
                                                                : "Select Or Search Student"}
                                                        </span>
                                                        <Search className="h-4 w-4 opacity-50 shrink-0" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[450px] p-0 shadow-xl border-slate-200" align="start">
                                                <Command className="rounded-lg">
                                                    <CommandInput placeholder="Search student..." className="h-10" />
                                                    <CommandList>
                                                        <CommandEmpty className="p-4 text-sm text-slate-500 text-center">No student found.</CommandEmpty>
                                                        <CommandGroup className="max-h-72 overflow-y-auto">
                                                            {studentList.map((s: any, index: number) => (
                                                                <CommandItem
                                                                    key={`${s.amsT_Id || s.amst_id}-${index}`}
                                                                    value={`${s.amsT_FirstName || s.studentname} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''} ${s.amsT_AdmNo || s.amst_admno || ''}`}
                                                                    onSelect={() => {
                                                                        field.onChange(s);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                    className="px-4 py-2 cursor-pointer hover:bg-slate-100 transition-colors"
                                                                >
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-semibold text-slate-800">
                                                                            {s.amsT_FirstName || s.studentname}
                                                                            {s.amsT_MiddleName ? ` ${s.amsT_MiddleName}` : ''}
                                                                            {s.amsT_LastName ? ` ${s.amsT_LastName}` : ''}
                                                                        </span>
                                                                        {(s.amsT_AdmNo || s.amst_admno) && (
                                                                            <span className="text-xs font-medium text-indigo-500">
                                                                                Admission No: {s.amsT_AdmNo || s.amst_admno}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {(field.value?.amsT_Id === s.amsT_Id || field.value?.amst_id === s.amst_id) && <Check className="ml-auto h-4 w-4 text-indigo-600" />}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {searchMutation.isPending && (
                                            <div className="absolute right-12 top-2.5">
                                                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isGirls && (
                            <FormField
                                control={form.control}
                                name="prom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-slate-700">Promotion Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white h-10 border-slate-200">
                                                    <SelectValue placeholder="Select Promotion Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Granted">Granted</SelectItem>
                                                <SelectItem value="Refused">Refused</SelectItem>
                                                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                                                <SelectItem value="Passed ICSE">Passed ICSE</SelectItem>
                                                <SelectItem value="ISC">ISC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {(isGirls || isBoys) && (
                            <FormField
                                control={form.control}
                                name="pervious"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-slate-700">Previous School</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter previous school name"
                                                className="h-10 bg-white border-slate-200 shadow-sm focus:border-indigo-400"
                                                maxLength={50}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-8 border-t border-slate-100">
                    <Button
                        type="submit"
                        size="lg"
                        className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-95 transition-all font-semibold"
                        disabled={searchMutation.isPending}
                    >
                        <FileText className="mr-2 h-5 w-5" /> Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        className="min-w-[140px] shadow-sm active:scale-95 transition-all text-slate-600 border-slate-200 font-semibold"
                    >
                        <RefreshCcw className="mr-2 h-5 w-5" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
