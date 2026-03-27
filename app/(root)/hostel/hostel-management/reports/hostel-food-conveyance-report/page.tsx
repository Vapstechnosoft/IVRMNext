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
import { Loader2, Printer, Search, Download, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToExcel } from '@/lib/export-to-file';

export default function HostelFoodConveyanceReportPage() {
    const [reportData, setReportData] = useState<HFCReportStudent[]>([]);
    const [loading, setLoading] = useState(false);

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
        const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
        if (popupWindow) {
            popupWindow.document.open();
            popupWindow.document.write(`
                <html>
                    <head>
                        <title>Hostel Food Conveyance Report</title>
                        <style>
                            body { font-family: 'Times New Roman', serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .school-name { font-size: 24px; font-weight: bold; color: #2e57a0; margin: 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                            th, td { border: 1px solid black; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <div class="header">
                            <h1 class="school-name">Hostel / Food / Conveyance Report</h1>
                        </div>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>SL. No.</th>
                                    <th>Reg. No.</th>
                                    <th>Adm. No.</th>
                                    <th>Student Name</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.map((item, index) => `
                                    <tr>
                                        <td style="text-align: center;">${index + 1}</td>
                                        <td>${item.regno || ''}</td>
                                        <td>${item.admno || ''}</td>
                                        <td>${item.namme || ''}</td>
                                        <td>${item.class || ''}</td>
                                        <td>${item.section || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
                            <div>Signature</div>
                            <div>Date: ${format(new Date(), 'dd/MM/yyyy')}</div>
                        </div>
                    </body>
                </html>
            `);
            popupWindow.document.close();
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
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>Hostel/Food/Conveyance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <Controller
                                                control={form.control}
                                                name="hfcFlag"
                                                render={({ field }) => (
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-6"
                                                    >
                                                        <div className="flex items-center space-x-2 space-y-0">
                                                            <RadioGroupItem value="H" id="r-hostel" />
                                                            <Label htmlFor="r-hostel" className="font-normal cursor-pointer">Hostel</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 space-y-0">
                                                            <RadioGroupItem value="C" id="r-conveyance" />
                                                            <Label htmlFor="r-conveyance" className="font-normal cursor-pointer">Conveyance</Label>
                                                        </div>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                        <Controller
                                            control={form.control}
                                            name="asmaY_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="flex items-center">
                                                    <Label className="w-1/3 text-right pr-4">Academic Year: <span className="text-red-500">*</span></Label>
                                                    <div className="w-2/3">
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger>
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
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4 pt-10">
                                        <Controller
                                            control={form.control}
                                            name="asmcL_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="flex items-center">
                                                    <Label className="w-1/3 text-right pr-4">Class: <span className="text-red-500">*</span></Label>
                                                    <div className="w-2/3">
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger>
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
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            control={form.control}
                                            name="asmC_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="flex items-center">
                                                    <Label className="w-1/3 text-right pr-4">Section: <span className="text-red-500">*</span></Label>
                                                    <div className="w-2/3">
                                                        <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                                            <SelectTrigger>
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
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                                <hr className="mt-6" />
                                <div className="flex justify-center gap-4 mt-6">
                                    <Button type="submit" disabled={loading} className="w-32 bg-[#4c5a7d] hover:bg-[#3b4763]">
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                        Report
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={() => { form.reset(); setReportData([]); }} className="w-32">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button type="button" variant="default" onClick={handleExportExcel} disabled={!reportData.length} className="w-32 bg-[#1b8a53] hover:bg-[#156e42]">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                    <Button type="button" variant="default" onClick={handlePrint} disabled={!reportData.length} className="w-32 bg-[#e0aa0f] hover:bg-[#b88c0c]">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>

                {reportData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hostel/Food/Conveyance Report ({reportData.length} records)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table id="reportTable">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center">SL.No.</TableHead>
                                            <TableHead>Reg. No.</TableHead>
                                            <TableHead>Adm. No.</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Section</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>{item.regno}</TableCell>
                                                <TableCell>{item.admno}</TableCell>
                                                <TableCell>{item.namme}</TableCell>
                                                <TableCell>{item.class}</TableCell>
                                                <TableCell>{item.section}</TableCell>
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
