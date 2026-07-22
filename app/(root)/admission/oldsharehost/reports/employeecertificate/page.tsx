'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Loader2, Printer, Search, X } from 'lucide-react';

import {
    useEmployeeCertificateInitialDetails,
    useEmployeeCertificateReport,
} from '@/hooks/admission/oldsharehost/reports/useEmployeeCertificate';

const formSchema = z.object({
    certificateType: z.enum(['S', 'L'], {
        required_error: 'Please select a certificate type',
    }),
    empid: z.string().min(1, 'Please select an employee'),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportData {
    empname: string;
    doa: string;
    deptname: string;
    amsT_Sex: string;
}

export default function EmployeeCertificatePage() {
    const { data: initialData, isLoading: isInitialDataLoading } = useEmployeeCertificateInitialDetails();
    const { mutate: fetchReport, isPending: isReportPending } = useEmployeeCertificateReport();

    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [certificateType, setCertificateType] = useState<'S' | 'L' | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            certificateType: 'S',
            empid: '',
        },
    });

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Employee Certificate</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: auto; margin: 20mm; }
                                body { padding: 0; margin: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function() { window.print(); }, 500);">
                        ${printContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const onSubmit = (values: FormValues) => {
        const payload = {
            empid: parseInt(values.empid, 10),
        };

        fetchReport(payload, {
            onSuccess: (data) => {
                const studentList = data?.data?.studentlist as any[];
                if (Array.isArray(studentList) && studentList.length > 0) {
                    setReportData(studentList[0]);
                    setCertificateType(values.certificateType);
                } else {
                    toast.error('No Record Found');
                    setReportData(null);
                    setCertificateType(null);
                }
            },
            onError: () => {
                toast.error('Failed to fetch report data.');
                setReportData(null);
                setCertificateType(null);
            },
        });
    };

    const onClear = () => {
        window.location.reload();
    };

    const employeedetails = (initialData?.data?.employeedetails as any[]) || [];

    const getGenderPronoun = (sex?: string) => {
        if (!sex) return 'his/her';
        if (sex.toUpperCase() === 'FEMALE') return 'her';
        if (sex.toUpperCase() === 'MALE') return 'his';
        return 'his/her';
    };

    const renderCertificate = () => {
        if (!reportData || !certificateType) return null;

        const pronoun = getGenderPronoun(reportData.amsT_Sex);
        const todayStr = format(new Date(), 'dd/MM/yyyy');
        const doaStr = reportData.doa ? format(new Date(reportData.doa), 'dd.MM.yyyy') : '';

        const title = certificateType === 'S' ? 'SERVICE CERTIFICATE' : 'TO WHOM SOEVER IT MAY CONCERN';

        return (
            <div ref={printRef} className="p-8 bg-white text-black min-h-[500px] font-sans">
                <style type="text/css" media="print">
                    {`
                        @page { size: auto; margin: 20mm; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    `}
                </style>
                <div className="flex justify-end mb-16">
                    <h4 className="text-lg font-semibold">DATE : {todayStr}</h4>
                </div>

                <div className="text-center mb-12 mt-16">
                    <h3 className="text-2xl font-bold underline underline-offset-4">{title}</h3>
                </div>

                <div className="text-lg leading-loose mb-24 max-w-4xl mx-auto text-justify">
                    <p>
                        This is to certify that <strong>{reportData.empname}</strong> is working in this institution from <strong>{doaStr}</strong> to till date as a <strong>{reportData.deptname}</strong>.
                    </p>
                    <p className="mt-6">
                        During the above period {pronoun} conduct and character were good.
                    </p>
                </div>

                <div className="flex justify-end mt-32 max-w-4xl mx-auto">
                    <h5 className="text-xl font-bold">PRINCIPAL</h5>
                </div>
            </div>
        );
    };

    if (isInitialDataLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Admission Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="certificateType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-row space-x-4 p-4 border rounded-md justify-center"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="S" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            Service Certificate
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="L" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            Conduct Certificate
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="empid"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-4">
                                            <FormLabel className="w-1/3 text-right">Employee Name :<span className="text-red-500">*</span></FormLabel>
                                            <div className="w-2/3">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Employee" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {employeedetails.map((emp: any) => (
                                                            <SelectItem key={emp.empid} value={emp.empid.toString()}>
                                                                {emp.empname}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-center space-x-4">
                                <Button type="submit" disabled={isReportPending}>
                                    {isReportPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Report
                                </Button>
                                <Button type="button" variant="destructive" onClick={onClear}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                {reportData && (
                                    <Button type="button" variant="default" onClick={handlePrint}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {reportData && certificateType && (
                <Card>
                    <CardHeader>
                        <CardTitle>Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md overflow-hidden bg-gray-100 p-4">
                            {renderCertificate()}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
