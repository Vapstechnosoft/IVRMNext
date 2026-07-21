'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hostelFoodConveyanceReportSchema, HostelFoodConveyanceReportValues } from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';
import { getHFCReportLoadData, getHFCReport, type HFCReportLoadDataResponse, type HFCReportResponse, type HFCReportStudent } from '@/server/hostel/hostel-management/reports/hostel-food-conveyance-report';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, Printer, XCircle, Minus, FileText, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToExcel } from '@/lib/export-to-file';
import { Heading } from '@/components/layout/heading';

export default function HostelFoodConveyanceReportPage() {
    const [reportData, setReportData] = useState<HFCReportStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate] = useState(new Date());

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const form = useForm<HostelFoodConveyanceReportValues>({
        resolver: zodResolver(hostelFoodConveyanceReportSchema),
        defaultValues: {
            hfcFlag: 'H',
        },
    });

    useEffect(() => {
        async function load() {
            const data: HFCReportLoadDataResponse | null = await getHFCReportLoadData();
            if (data) {
                setAcademicYears(data.allAcademicYear || []);
                setClasses(data.allClass || []);
                setSections(data.allSection || []);
            }
        }
        load();
    }, []);

    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');

    const prevYearRef = useRef<number | undefined>(undefined);
    const prevClassRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (prevYearRef.current !== undefined && prevYearRef.current !== watchYear) {
            form.setValue('asmcL_Id', undefined as any);
            form.setValue('asmC_Id', undefined as any);
        }
        prevYearRef.current = watchYear;
    }, [watchYear, form]);

    useEffect(() => {
        if (prevClassRef.current !== undefined && prevClassRef.current !== watchClass) {
            form.setValue('asmC_Id', undefined as any);
        }
        prevClassRef.current = watchClass;
    }, [watchClass, form]);

    async function onSubmit(values: HostelFoodConveyanceReportValues) {
        setLoading(true);
        try {
            const data: HFCReportResponse | null = await getHFCReport(values);
            if (data && data.studentlist && data.studentlist.length > 0) {
                const formattedList = data.studentlist.map((item: HFCReportStudent) => {
                    let name = item.stuFN || '';
                    if (item.stuMN) name += ' ' + item.stuMN;
                    if (item.stuLN) name += ' ' + item.stuLN;
                    return {
                        ...item,
                        namme: name.replace(/  +/g, ' ').trim()
                    };
                });
                setReportData(formattedList);
                toast.success(`Successfully loaded ${formattedList.length} record(s)`);
            } else {
                setReportData([]);
                toast.info("No data found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    }

    const handlePrint = () => {
        if (!reportData || reportData.length === 0) return;
        const tableContent = document.getElementById('reportTable');
        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>Hostel Food Conveyance Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4255a7; padding-bottom: 10px; }
                                .school-name { font-size: 24px; font-weight: bold; color: #4255a7; margin: 0; text-transform: uppercase; }
                                .report-title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #444; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                                .text-center { text-align: center; }
                                .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            <div class="header">
                                <h1 class="school-name">Hostel / Food / Conveyance Report</h1>
                                <div class="report-title">${form.getValues('hfcFlag') === 'H' ? 'HOSTEL' : 'CONVEYANCE'} DETAILS</div>
                            </div>
                            ${tableContent.outerHTML}
                            <div class="footer">
                                <div>Signature</div>
                                <div>Date: ${format(currentDate, 'dd/MM/yyyy')}</div>
                            </div>
                        </body>
                    </html>
                `);
                popupWindow.document.close();
            }
        }
    };

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const exportData = reportData.map((item, index) => ({
            sno: index + 1,
            regno: item.regno,
            admno: item.admno,
            studentname: item.namme,
            classname: item.class,
            sectionname: item.section
        }));

        const columns = JSON.stringify([
            { label: 'SL. No.', value: 'sno' },
            { label: 'Reg. No.', value: 'regno' },
            { label: 'Adm. No.', value: 'admno' },
            { label: 'Student Name', value: 'studentname' },
            { label: 'Class', value: 'classname' },
            { label: 'Section', value: 'sectionname' }
        ]);

        exportToExcel('HostelFoodConveyanceReport', columns, JSON.stringify(exportData), true);
    };

    return (
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Report &gt; HostelFoodConveyanceReport</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading 
                    title="Hostel / Food / Conveyance Report" 
                    description="View and generate hostel food conveyance reports."
                />

                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                        <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-[#4255a7] text-sm font-bold uppercase tracking-wider">
                                HOSTEL / FOOD / CONVEYANCE REPORT
                            </CardTitle>
                            <Minus className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                                    {/* HFC Type Selection Bar */}
                                    <div className="bg-gray-50/50 p-4 border-b flex justify-center">
                                        <Controller
                                            control={form.control}
                                            name="hfcFlag"
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex space-x-12"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="H" id="r-hostel" />
                                                        <Label htmlFor="r-hostel" className="cursor-pointer font-bold uppercase text-xs">Hostel</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="C" id="r-conveyance" />
                                                        <Label htmlFor="r-conveyance" className="cursor-pointer font-bold uppercase text-xs">Conveyance</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* Form Fields */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 max-w-5xl mx-auto">
                                            {/* Academic Year */}
                                            <Controller
                                                control={form.control}
                                                name="asmaY_Id"
                                                render={({ field, fieldState }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Academic Year: <span className="text-red-500">*</span></Label>
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger className="w-full bg-white border border-gray-200">
                                                                <SelectValue placeholder="Select Academic Year" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicYears.map((y: any) => (
                                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                        {y.asmaY_Year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />

                                            {/* Class */}
                                            <Controller
                                                control={form.control}
                                                name="asmcL_Id"
                                                render={({ field, fieldState }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Class: <span className="text-red-500">*</span></Label>
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger className="w-full bg-white border border-gray-200">
                                                                <SelectValue placeholder="Select Class" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classes.map((c: any) => (
                                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                        {c.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />

                                            {/* Section */}
                                            <Controller
                                                control={form.control}
                                                name="asmC_Id"
                                                render={({ field, fieldState }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Section: <span className="text-red-500">*</span></Label>
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger className="w-full bg-white border border-gray-200">
                                                                <SelectValue placeholder="Select Section" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sections.map((s: any) => (
                                                                    <SelectItem key={s.asmS_Id || s.asmC_Id} value={String(s.asmS_Id || s.asmC_Id)}>
                                                                        {s.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-center gap-4 mt-12">
                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                                            >
                                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-3 w-3" />}
                                                REPORT
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => {
                                                    form.reset();
                                                    setReportData([]);
                                                }} 
                                                className="w-32 bg-[#ff5c33] hover:bg-[#e64d26] text-white border-none rounded-md shadow-md uppercase font-bold text-xs"
                                            >
                                                <XCircle className="mr-2 h-3 w-3" />
                                                CANCEL
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </div>

                {reportData.length > 0 && (
                    <Card className="shadow-md border-t-4 border-t-[#4255a7] animate-in fade-in slide-in-from-top-4 duration-700">
                        <CardHeader className="bg-[#4255a7] py-1 px-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">REPORT DETAILS</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleExportExcel} className="h-6 text-white hover:bg-white/20 text-[10px]">
                                    <FileSpreadsheet className="h-3 w-3 mr-1" /> EXPORT
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handlePrint} className="h-6 text-white hover:bg-white/20 text-[10px]">
                                    <Printer className="h-3 w-3 mr-1" /> PRINT
                                </Button>
                                <Minus className="h-3 w-3 text-white cursor-pointer opacity-70" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table id="reportTable">
                                    <TableHeader className="bg-blue-50">
                                        <TableRow>
                                            <TableHead className="w-[80px] text-blue-900 font-bold border text-center">SL.No.</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Reg. No.</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Adm. No.</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Student Name</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Class</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Section</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="py-2 text-xs border text-center">{index + 1}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.regno || '-'}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.admno || '-'}</TableCell>
                                                <TableCell className="py-2 text-xs border font-semibold">{item.namme || '-'}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.class || '-'}</TableCell>
                                                <TableCell className="py-2 text-xs border text-center">{item.section || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
