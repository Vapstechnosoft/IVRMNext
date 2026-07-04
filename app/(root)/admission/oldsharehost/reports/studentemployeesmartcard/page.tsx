'use client';

import React, { useState } from 'react';
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

import {
    useStudentEmployeeSmartCardInitialDetails,
    useStudentEmployeeSmartCardReport
} from '@/hooks/admission/oldsharehost/reports/useStudentEmployeeSmartCard';

// Add validation schema
const formSchema = z.object({
    flag1: z.enum(['Std', 'Emp']),
    asmaY_Id: z.string().optional(),
    asmcL_Id: z.string().optional(),
    asmC_Id: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.flag1 === 'Std') {
        if (!data.asmaY_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Academic Year is required',
                path: ['asmaY_Id']
            });
        }
        if (!data.asmcL_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Class is required',
                path: ['asmcL_Id']
            });
        }
        if (!data.asmC_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Section is required',
                path: ['asmC_Id']
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentEmployeeSmartCardPage() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentEmployeeSmartCardInitialDetails();
    const reportMutation = useStudentEmployeeSmartCardReport();

    const [items, setItems] = useState<any[]>([]);
    const [schooldetails, setSchoolDetails] = useState<any[]>([]);
    const [classteachername, setClassTeacherName] = useState('');
    const [classname, setClassname] = useState('');
    const [sectionname, setSectionname] = useState('');
    const [accyear, setAccyear] = useState('');
    const [totalstength, setTotalStrength] = useState(0);

    const [isGenerating, setIsGenerating] = useState(false);
    
    // For print layout
    const [std, setStd] = useState(false);
    const [emp, setEmp] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            flag1: 'Std',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: ''
        }
    });

    const watchFlag = form.watch('flag1');

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                asmaY_Id: data.asmaY_Id ? Number(data.asmaY_Id) : 0,
                asmcL_Id: data.asmcL_Id ? Number(data.asmcL_Id) : 0,
                asmC_Id: data.asmC_Id ? Number(data.asmC_Id) : 0,
                amsT_Id: 0,
                flag: data.flag1
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (!resultData?.getdetails || resultData.getdetails.length === 0) {
                toast.info('No Records Found!');
                setItems([]);
                setStd(false);
                setEmp(false);
                return;
            }

            setItems(resultData.getdetails);
            setTotalStrength(resultData.getdetails.length);
            setSchoolDetails(resultData.schooldetails || []);

            if (data.flag1 === 'Std') {
                setStd(true);
                setEmp(false);
                if (resultData.classteacher && resultData.classteacher.length > 0) {
                    setClassTeacherName(resultData.classteacher[0].empname);
                } else {
                    setClassTeacherName('');
                }
                
                // Get labels
                const years = initialData?.data?.accyear || [];
                const classes = initialData?.data?.classlist || [];
                const sections = initialData?.data?.sectionlist || [];

                const y = years.find((item: any) => item.asmaY_Id === payload.asmaY_Id);
                const c = classes.find((item: any) => item.asmcL_Id === payload.asmcL_Id);
                const s = sections.find((item: any) => item.asmS_Id === payload.asmC_Id);

                setAccyear(y ? y.asmaY_Year : '');
                setClassname(c ? c.asmcL_ClassName : '');
                setSectionname(s ? s.asmC_SectionName : '');

            } else {
                setStd(false);
                setEmp(true);
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        form.reset({
            flag1: 'Std',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: ''
        });
        setItems([]);
        setStd(false);
        setEmp(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (items.length === 0) return;
        
        let ws: XLSX.WorkSheet;
        if (std) {
            const dataToExport = items.map((item) => ({
                'Name': item.AMST_FirstName,
                'Father Name': item.AMST_FatherName,
                'Adm No': item.AMST_AdmNo,
                'DOB': item.AMST_DOB ? format(new Date(item.AMST_DOB), 'dd/MM/yyyy') : '',
                'Address': item.address,
                'Phone No': item.AMST_MobileNo,
                'Mobile No': item.AMST_MobileNo,
                'Email ID': item.AMST_emailId,
                'Blood Group': item.AMST_BloodGroup
            }));
            ws = XLSX.utils.json_to_sheet(dataToExport);
        } else {
            const dataToExport = items.map((item) => ({
                'Name': item.hrme_employeefirstname,
                'Emp Code': item.ecode,
                'Joining Date': item.HRME_DOJ ? format(new Date(item.HRME_DOJ), 'dd-MM-yyyy') : '',
                'DOB': item.hrme_DOB ? format(new Date(item.hrme_DOB), 'dd-MM-yyyy') : '',
                'Address': item.address,
                'Blood Group': item.HRME_BloodGroup
            }));
            ws = XLSX.utils.json_to_sheet(dataToExport);
        }
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Smart_Card");
        XLSX.writeFile(wb, "Student_Employee_Smart_Card.xlsx");
    };

    const logoUrl = schooldetails?.[0]?.asC_Logo_Path || '';

    return (
        <div className="min-h-screen p-4 space-y-6 bg-gray-50 print:bg-white print:p-0">
            <div className="print:hidden">
                <CollapsibleSection
                    title="Student Employee Smart Card Details"
                    defaultOpen={true}
                    variant="outline"
                    className="shadow-md"
                >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            
                            <div className="space-y-4">
                                <Controller
                                    name="flag1"
                                    control={form.control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val === 'Emp') {
                                                    form.setValue('asmaY_Id', '');
                                                    form.setValue('asmcL_Id', '');
                                                    form.setValue('asmC_Id', '');
                                                    form.clearErrors(['asmaY_Id', 'asmcL_Id', 'asmC_Id']);
                                                }
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex flex-row space-x-4 bg-gray-100 p-4 rounded-md justify-center"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Std" id="r-std" />
                                                <Label htmlFor="r-std">Student</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Emp" id="r-emp" />
                                                <Label htmlFor="r-emp">Employee</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                                {form.formState.errors.flag1 && (
                                    <span className="text-red-500 text-sm">{form.formState.errors.flag1.message}</span>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">
                                        Academic Year:{watchFlag === 'Std' && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Controller
                                        name="asmaY_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}
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
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">
                                        Class:{watchFlag === 'Std' && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Controller
                                        name="asmcL_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}
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
                                        Section:{watchFlag === 'Std' && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Controller
                                        name="asmC_Id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}
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
                <div className="bg-white p-6 rounded-lg shadow-md print:shadow-none print:p-0">
                    <div className="text-center mb-6">
                        {logoUrl && (
                            <img src={logoUrl} alt="School Logo" className="mx-auto h-24 object-contain" />
                        )}
                    </div>
                    
                    {std && (
                        <div>
                            <div className="text-center mb-6 space-y-2">
                                <h2 className="text-xl font-bold">Student Details Smart Card - {accyear}</h2>
                                <p className="font-semibold">Class: {classname}-{sectionname}</p>
                                <p className="font-semibold">Class Teacher: {classteachername} | Class Strength: {totalstength}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                                {items.map((user, idx) => (
                                    <div key={idx} className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/30 break-inside-avoid shadow-sm print:shadow-none print:border-indigo-400">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-bold w-1/3 py-1">NAME</td>
                                                    <td>: {user.AMST_FirstName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">FATHER NAME</td>
                                                    <td>: {user.AMST_FatherName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">ADM.NO</td>
                                                    <td>: {user.AMST_AdmNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">DOB</td>
                                                    <td>: {user.AMST_DOB ? format(new Date(user.AMST_DOB), 'dd/MM/yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1 align-top">ADDRESS</td>
                                                    <td>: {user.address}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">PHONE NO.</td>
                                                    <td>: {user.AMST_MobileNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">MOBILE NO.</td>
                                                    <td>: {user.AMST_MobileNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">EMAIL ID</td>
                                                    <td className="break-all">: {user.AMST_emailId}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">BLOOD GROUP</td>
                                                    <td>: {user.AMST_BloodGroup}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {emp && (
                        <div>
                            <div className="text-center mb-6 space-y-2">
                                <h2 className="text-xl font-bold">Employee Details Smart Card</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                                {items.map((user, idx) => (
                                    <div key={idx} className="border-2 border-green-200 rounded-lg p-4 bg-green-50/30 break-inside-avoid shadow-sm print:shadow-none print:border-green-400">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-bold w-1/3 py-1">NAME</td>
                                                    <td>: {user.hrme_employeefirstname}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">EMP CODE</td>
                                                    <td>: {user.ecode}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">JOINING DATE</td>
                                                    <td>: {user.HRME_DOJ ? format(new Date(user.HRME_DOJ), 'dd-MM-yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">DOB</td>
                                                    <td>: {user.hrme_DOB ? format(new Date(user.hrme_DOB), 'dd-MM-yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1 align-top">ADDRESS</td>
                                                    <td>: {user.address}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-1">BLOOD GROUP</td>
                                                    <td>: {user.HRME_BloodGroup}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
