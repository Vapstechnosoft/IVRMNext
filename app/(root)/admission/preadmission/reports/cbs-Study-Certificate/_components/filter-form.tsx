'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cbsStudyCertificateSchema, type TCbsStudyCertificateSchema } from '@/schemas/admission/preadmission/reports/cbs-study-certificate.schema';
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
import { Search, Loader2, X, FileText } from 'lucide-react';
import { useCbsStudyCertSearchFilter } from '@/hooks/admission/preadmission/reports/useCbsStudyCertificate';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const searchMutation = useCbsStudyCertSearchFilter();

    const form = useForm<TCbsStudyCertificateSchema>({
        resolver: zodResolver(cbsStudyCertificateSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            character: '0',
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            boardType: 'ICSE',
            charType: 'satisfactory',
            date: new Date(),
            amsT_Id: undefined,
            address_opt: 'address_per',
            paretsnamefather: '0',
        },
    });

    const watchAllOrIndi = form.watch('allorindi');
    const watchAcademicYear = form.watch('asmaY_Id');
    const watchStatus = form.watch('optradio');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');
    const watchMI = initialData?.masterCompany?.[0]?.mI_Id;

    // Handle student search
    useEffect(() => {
        const fetchStudents = async () => {
            if (debouncedSearch.length >= 2 && watchAcademicYear) {
                const payload = {
                    filterinitialdata: watchStatus,
                    searchfilter: debouncedSearch,
                    ASMAY_Id: watchAcademicYear,
                    AMST_SOL: watchStatus,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : (watchClass || 0),
                    ASMC_Id: watchAllOrIndi === 'A' ? 0 : (watchSection || 0),
                    allorindid: watchAllOrIndi
                };

                try {
                    const response = await searchMutation.mutateAsync(payload);
                    if (response.data && response.data.fillstudlist) {
                        setStudentList(response.data.fillstudlist);
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

    const handleFormReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* View Type */}
                    <div className="p-4 border rounded-lg bg-slate-50 flex flex-col justify-center">
                        <FormField
                            control={form.control}
                            name="allorindi"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Filter View</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="A" /><FormLabel className="font-normal">All</FormLabel></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="I" /><FormLabel className="font-normal">Individual</FormLabel></div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Student Status */}
                    <div className="p-4 border rounded-lg bg-slate-50 flex flex-col justify-center">
                        <FormField
                            control={form.control}
                            name="optradio"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Student Status</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="S" /><FormLabel className="font-normal text-green-700 font-semibold">Studying</FormLabel></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="L" /><FormLabel className="font-normal text-red-700 font-semibold">Left</FormLabel></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="D" /><FormLabel className="font-normal text-slate-700 font-semibold">Deactive</FormLabel></div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Certificate Type */}
                    <div className="p-4 border rounded-lg bg-teal-50 flex flex-col justify-center">
                        <FormField
                            control={form.control}
                            name="character"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Certificate Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="1" /><FormLabel className="font-normal">Character Certificate</FormLabel></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="0" /><FormLabel className="font-normal">Study Certificate</FormLabel></div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Academic & Class Info */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                        <SelectContent>{initialData?.allAcademicYear?.map((y: any) => <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>)}</SelectContent>
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
                                    <FormLabel>Class {watchAllOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                    <Select disabled={watchAllOrIndi === 'A'} onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                        <SelectContent>{initialData?.allclasslist?.map((c: any) => <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>)}</SelectContent>
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
                                    <FormLabel>Section {watchAllOrIndi === 'I' && <span className="text-red-500">*</span>}</FormLabel>
                                    <Select disabled={watchAllOrIndi === 'A'} onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger></FormControl>
                                        <SelectContent>{initialData?.allsectionlist?.map((s: any) => <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <FormField
                                control={form.control}
                                name="boardType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Board Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="ISC">ISC</SelectItem><SelectItem value="ICSE">ICSE</SelectItem></SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="charType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Character Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="good">Good</SelectItem><SelectItem value="satisfactory">Satisfactory</SelectItem></SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Student & Date Info */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-1">Date <span className="text-red-500">*</span></FormLabel>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amsT_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student <span className="text-red-500">*</span></FormLabel>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Type name to search..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger></FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {studentList.length > 0 ? studentList.map((s: any) => <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>{s.amsT_FirstName}</SelectItem>) : <SelectItem disabled value="0">Search for a student</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address Options */}
                        <div className="p-4 border rounded-lg bg-orange-50 space-y-3">
                            <FormField
                                control={form.control}
                                name="address_opt"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Address Choice</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="address_per" /><FormLabel className="font-normal">Permanent</FormLabel></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="address_con" /><FormLabel className="font-normal">Communication</FormLabel></div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Parent Options (Baldwin specific logic or always show if needed) */}
                        <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
                            <FormField
                                control={form.control}
                                name="paretsnamefather"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Display Parent Name</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="0" /><FormLabel className="font-normal">Father</FormLabel></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="1" /><FormLabel className="font-normal">Mother</FormLabel></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="2" /><FormLabel className="font-normal">Both</FormLabel></div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-6 border-t">
                    <Button type="submit" className="bg-primary min-w-[150px]"><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
                    <Button type="button" variant="outline" onClick={handleFormReset} className="border-red-500 text-red-500 hover:bg-red-50 min-w-[150px]"><X className="mr-2 h-4 w-4" /> Cancel</Button>
                </div>
            </form>
        </Form>
    );
}
