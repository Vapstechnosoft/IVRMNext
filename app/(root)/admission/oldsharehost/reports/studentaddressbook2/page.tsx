'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Loader2, Printer, X, FileSpreadsheet } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import {
    useStudentAddressBook2InitialData,
    useStudentAddressBook2SectionChange,
    useStudentAddressBook2Report
} from '@/hooks/admission/oldsharehost/reports/useStudentAddressBook2';

const formSchema = z.object({
    sall: z.string(), // "1" = All, "0" = Individual
    flag: z.string(), // "S" = Studying, "L" = Left
    asmaY_Id: z.string().min(1, 'Select Academic Year'),
    asmcL_Id: z.string().min(1, 'Select Class'),
    asmC_Id: z.string().min(1, 'Select Section'),
    amsT_Id: z.string().optional(),
    
    email: z.boolean().default(false),
    dob: z.boolean().default(false),
    ph: z.boolean().default(false),
    tc: z.boolean().default(false),
    per: z.string().default("1")
}).superRefine((data, ctx) => {
    if (data.sall === '0' && (!data.amsT_Id || data.amsT_Id === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Select Student',
            path: ['amsT_Id']
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentAddressBook2Page() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentAddressBook2InitialData();
    const sectionChangeMutation = useStudentAddressBook2SectionChange();
    const reportMutation = useStudentAddressBook2Report();

    const [items, setItems] = useState<any[]>([]);
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [viewOptions, setViewOptions] = useState({
        email: false,
        dob: false,
        ph: false,
        tc: false,
        per: "1"
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sall: '1',
            flag: 'S',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: '',
            amsT_Id: '',
            email: false,
            dob: false,
            ph: false,
            tc: false,
            per: '1'
        }
    });

    const watchSall = form.watch('sall');
    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmC_Id');
    const watchFlag = form.watch('flag');

    useEffect(() => {
        if (watchSall === '0' && watchYear && watchClass && watchSection) {
            sectionChangeMutation.mutateAsync({
                ASMAY_Id: Number(watchYear),
                ASMCL_Id: Number(watchClass),
                ASMC_Id: Number(watchSection),
                flag: watchFlag
            }).then(res => {
                if (res?.data?.studentlist) {
                    setStudentDropdown(res.data.studentlist);
                }
            }).catch(() => {
                toast.error('Failed to fetch students');
            });
        }
    }, [watchYear, watchClass, watchSection, watchFlag, watchSall]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                asmaY_Id: Number(data.asmaY_Id),
                asmcL_Id: Number(data.asmcL_Id),
                asmC_Id: Number(data.asmC_Id),
                amsT_Id: data.sall === '0' ? Number(data.amsT_Id) : 0,
                flag: data.flag,
                sall: data.sall
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (!resultData?.getdetails || resultData.getdetails.length === 0) {
                toast.info('No Records Found!');
                setItems([]);
                return;
            }

            setItems(resultData.getdetails);
            setViewOptions({
                email: data.email,
                dob: data.dob,
                ph: data.ph,
                tc: data.tc,
                per: data.per
            });
            
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        form.reset({
            sall: '1',
            flag: 'S',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: '',
            amsT_Id: '',
            email: false,
            dob: false,
            ph: false,
            tc: false,
            per: '1'
        });
        setItems([]);
        setStudentDropdown([]);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (items.length === 0) return;
        
        const dataToExport = items.map((item) => ({
            'Student Name': item.AMST_FirstName,
            'Admission No': item.AMST_AdmNo,
            'Reg No': item.AMST_RegistrationNo,
            'DOA': item.AMST_Date ? format(new Date(item.AMST_Date), 'dd-MM-yyyy') : '',
            'Class Name': `${item.ASMCL_ClassName} - ${item.ASMC_SectionName}`,
            'Gender': item.AMST_Sex,
            'Blood Group': item.AMST_BloodGroup,
            'Father Name': item.AMST_FatherName,
            'Mother Name': item.AMST_MotherName,
            ...(viewOptions.dob ? { 'DOB': item.AMST_DOB ? format(new Date(item.AMST_DOB), 'dd-MM-yyyy') : '' } : {}),
            ...(viewOptions.email ? { 'Email': item.AMST_emailId } : {}),
            ...(viewOptions.ph ? { 'Phone No': item.AMST_MobileNo } : {}),
            ...(viewOptions.tc ? { 'School TC Submited': item.AMST_SOL === 'L' ? 'Yes' : 'No' } : {}),
            'Address': viewOptions.per === '1' 
                ? `${item.AMST_PerStreet || ''}, ${item.AMST_PerArea || ''}, ${item.AMST_PerCity || ''}`
                : `${item.AMST_ConStreet || ''}, ${item.AMST_ConArea || ''}, ${item.AMST_ConCity || ''}`
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Address_Book");
        XLSX.writeFile(wb, "Student_Address_Book.xlsx");
    };

    const ddate = new Date();
    const usrname = typeof window !== 'undefined' ? localStorage.getItem('username') || 'User' : 'User';

    return (
        <div className="min-h-screen p-4 space-y-6 bg-gray-50 print:bg-white print:p-0">
            <div className="print:hidden">
                <CollapsibleSection
                    title="Student Address Book 2"
                    defaultOpen={true}
                    variant="outline"
                    className="shadow-md"
                >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            
                            <div className="space-y-4">
                                <div className="p-4 border rounded-md bg-gray-50">
                                    <Controller
                                        name="sall"
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val === '1') {
                                                        form.setValue('amsT_Id', '');
                                                    }
                                                }}
                                                value={field.value}
                                                className="flex flex-row space-x-4 justify-center"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="1" id="sal-1" />
                                                    <Label htmlFor="sal-1">All</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="0" id="sal-0" />
                                                    <Label htmlFor="sal-0">Individual</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>

                                <div className="p-4 border rounded-md bg-gray-50">
                                    <Controller
                                        name="flag"
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-4 justify-center"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="S" id="flag-s" />
                                                    <Label htmlFor="flag-s">Studying</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="L" id="flag-l" />
                                                    <Label htmlFor="flag-l">Left</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">
                                        Academic Year:<span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="asmaY_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.accyear?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmaY_Id && (
                                        <span className="text-red-500 text-sm">{form.formState.errors.asmaY_Id.message}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">
                                        Class:<span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="asmcL_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.classlist?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmcL_Id && (
                                        <span className="text-red-500 text-sm">{form.formState.errors.asmcL_Id.message}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">
                                        Section:<span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="asmC_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.sectionlist?.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmC_Id && (
                                        <span className="text-red-500 text-sm">{form.formState.errors.asmC_Id.message}</span>
                                    )}
                                </div>

                                {watchSall === '0' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">
                                            Student:<span className="text-red-500">*</span>
                                        </Label>
                                        <Controller
                                            name="amsT_Id"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={studentDropdown.length === 0}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {studentDropdown.map((item: any) => (
                                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                                {item.amsT_FirstName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.amsT_Id && (
                                            <span className="text-red-500 text-sm">{form.formState.errors.amsT_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border rounded-md bg-gray-50 flex flex-wrap gap-4 justify-center">
                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="email" checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor="email">Email</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="dob"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="dob" checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor="dob">Date Of Birth</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="ph"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="ph" checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor="ph">Phone No.</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="tc"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="tc" checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor="tc">Previous School TC Submited</Label>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="p-4 border rounded-md bg-gray-50 flex flex-col space-y-4">
                                    <Label className="font-semibold">Address:</Label>
                                    <Controller
                                        name="per"
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-4 justify-center"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="1" id="per-1" />
                                                    <Label htmlFor="per-1">Permanent</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="2" id="per-2" />
                                                    <Label htmlFor="per-2">Temporary</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isGenerating}
                                className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Submit
                            </Button>
                            
                            <Button
                                type="button"
                                onClick={handleClear}
                                variant="destructive"
                                className="min-w-[120px] font-bold"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>

                            {items.length > 0 && (
                                <>
                                    <Button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold"
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handlePrint}
                                        className="min-w-[120px] bg-gray-600 hover:bg-gray-700 text-white font-bold"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CollapsibleSection>
            </div>

            {/* Print Section */}
            {items.length > 0 && (
                <div className="print:block space-y-8 mt-6">
                    {items.map((user, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-lg shadow-md print:shadow-none border border-gray-200 break-inside-avoid">
                            <h3 className="text-center font-bold text-lg border-b pb-2 mb-4">
                                {user.AMST_FirstName} Address Book
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-2 text-sm">
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Student Name</span>
                                        <span className="col-span-2">: {user.AMST_FirstName}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Admission No</span>
                                        <span className="col-span-2">: {user.AMST_AdmNo}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Reg No</span>
                                        <span className="col-span-2">: {user.AMST_RegistrationNo}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">DOA</span>
                                        <span className="col-span-2">: {user.AMST_Date ? format(new Date(user.AMST_Date), 'dd-MM-yyyy') : ''}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Class Name</span>
                                        <span className="col-span-2">: {user.ASMCL_ClassName} - {user.ASMC_SectionName}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Gender</span>
                                        <span className="col-span-2">: {user.AMST_Sex}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Blood Group</span>
                                        <span className="col-span-2">: {user.AMST_BloodGroup}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Father Name</span>
                                        <span className="col-span-2">: {user.AMST_FatherName}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <span className="font-semibold col-span-1">Mother Name</span>
                                        <span className="col-span-2">: {user.AMST_MotherName}</span>
                                    </div>

                                    {viewOptions.dob && (
                                        <div className="grid grid-cols-3">
                                            <span className="font-semibold col-span-1">DOB</span>
                                            <span className="col-span-2">: {user.AMST_DOB ? format(new Date(user.AMST_DOB), 'dd-MM-yyyy') : ''}</span>
                                        </div>
                                    )}
                                    {viewOptions.email && (
                                        <div className="grid grid-cols-3">
                                            <span className="font-semibold col-span-1">Email</span>
                                            <span className="col-span-2 break-all">: {user.AMST_emailId}</span>
                                        </div>
                                    )}
                                    {viewOptions.ph && (
                                        <div className="grid grid-cols-3">
                                            <span className="font-semibold col-span-1">Phone No.</span>
                                            <span className="col-span-2">: {user.AMST_MobileNo}</span>
                                        </div>
                                    )}
                                    {viewOptions.tc && (
                                        <div className="grid grid-cols-3">
                                            <span className="font-semibold col-span-1">School TC Submited</span>
                                            <span className="col-span-2 font-bold">: {user.AMST_SOL === 'L' ? 'Yes' : 'No'}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 mt-4">
                                        <span className="font-semibold col-span-1">
                                            {viewOptions.per === '1' ? 'Permanent Address :' : 'Temporary Address :'}
                                        </span>
                                        <span className="col-span-2">
                                            {viewOptions.per === '1' 
                                                ? `${user.AMST_PerStreet || ''}, ${user.AMST_PerArea || ''}, ${user.AMST_PerCity || ''}`
                                                : `${user.AMST_ConStreet || ''}, ${user.AMST_ConArea || ''}, ${user.AMST_ConCity || ''}`
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 border p-1 rounded">
                                    {user.AMST_Photoname ? (
                                        <img src={user.AMST_Photoname} alt={user.AMST_FirstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm text-center p-2">
                                            Image not available
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-between mt-12 px-8">
                                <span className="font-semibold border-t border-black pt-1 px-4">Class Teacher's Sign</span>
                                <span className="font-semibold border-t border-black pt-1 px-4">Parent's Sign</span>
                            </div>
                        </div>
                    ))}
                    <div className="text-center text-sm font-semibold mt-8 border-t pt-4 print:mt-auto">
                        Date: {format(ddate, 'dd/MM/yyyy')} | UserName: {usrname}
                    </div>
                </div>
            )}
        </div>
    );
}
