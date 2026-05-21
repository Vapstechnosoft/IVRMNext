'use client';

import { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collegeConfirmReportSchema, CollegeConfirmReportValues } from '@/schemas/hostel/reports/college-confirm-report.schema';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Loader2, Printer, XCircle, Minus, FileSpreadsheet } from 'lucide-react';
import { DateField } from '@/components/ui/dateField';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCollegeConfirmReport, CollegeConfirmReportDto } from '@/server/hostel/hostel-management/reports/college-confirm-report';
import { Heading } from '@/components/layout/heading';
import * as XLSX from 'xlsx';

export default function CollegeConfirmReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'student' | 'staff'>('student');
    const [currentDate] = useState(new Date());

    const form = useForm<CollegeConfirmReportValues>({
        resolver: zodResolver(collegeConfirmReportSchema),
        defaultValues: {
            type: 'student',
            fromDate: new Date(),
            toDate: new Date(),
        },
    });

    async function onSubmit(values: CollegeConfirmReportValues) {
        setLoading(true);
        setType(values.type);
        try {
            const data: CollegeConfirmReportDto = await getCollegeConfirmReport(values);
            if (data?.grid_list) {
                setReportData(data.grid_list);
                if (data.grid_list.length === 0) {
                    toast.info("No data found for selected criteria");
                } else {
                    toast.success(`Successfully loaded ${data.grid_list.length} confirm report(s)`);
                }
            } else {
                setReportData([]);
                toast.info("No data found for selected criteria");
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
        const fromDate = form.getValues('fromDate');
        const toDate = form.getValues('toDate');

        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>College Hostel Confirm Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4255a7; padding-bottom: 10px; }
                                .school-name { font-size: 24px; font-weight: bold; color: #4255a7; margin: 0; text-transform: uppercase; }
                                .report-title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #444; }
                                .dates { font-size: 12px; margin-top: 5px; color: #666; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                                .text-center { text-align: center; }
                                .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            <div class="header">
                                <h1 class="school-name">College Hostel Confirm Report</h1>
                                <div class="report-title">Confirmation Details (${type.toUpperCase()})</div>
                                <div class="dates">
                                    From: ${format(fromDate, 'dd/MM/yyyy')} To: ${format(toDate, 'dd/MM/yyyy')}
                                </div>
                            </div>
                            ${tableContent.outerHTML}
                            <div class="footer">
                                <div>Principal Signature</div>
                                <div>Date: ${format(currentDate, 'dd/MM/yyyy')}</div>
                                <div>Hostel Warden</div>
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

        const formattedData = reportData.map((item, index) => {
            const row: any = {
                'SL.No.': index + 1,
            };

            if (type === 'student') {
                row['Student Name'] = item.studentname || 'N/A';
                row['Course'] = item.AMCO_CourseName || item.courseName || 'N/A';
                row['Semester'] = item.AMSE_SemesterName || item.semesterName || 'N/A';
            } else {
                row['Staff Name'] = item.empname || 'N/A';
                row['Department'] = item.HRMD_DepartmentName || 'N/A';
            }

            row['Hostel'] = item.HLMH_Name || 'N/A';
            row['Room No'] = item.HRMRM_RoomNo || 'N/A';
            
            const confirmDate = item.HLHSREQC_ConfirmDate || item.HLHSTREQC_ConfirmDate;
            row['Confirm Date'] = confirmDate ? format(new Date(confirmDate), 'dd/MM/yyyy') : '-';
            row['Remarks'] = item.HLHSREQC_Remarks || item.HLHSTREQC_Remarks || '-';

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Confirmations");
        XLSX.writeFile(workbook, `College_Hostel_Confirm_Report_${format(currentDate, 'yyyyMMdd')}.xlsx`);
    };

    return (
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Report &gt; CollegeConfirmReport</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading 
                    title="College Confirm Report" 
                    description="View and generate college hostel confirmation reports."
                />
                
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                        <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-[#4255a7] text-sm font-bold uppercase tracking-wider">
                                COLLEGE HOSTEL STUDENT AND STAFF CONFIRM REPORT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                                    {/* Type Selection Bar */}
                                    <div className="bg-gray-50/50 p-4 border-b flex justify-center">
                                        <Controller
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex space-x-12"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="student" id="student" />
                                                        <Label htmlFor="student" className="cursor-pointer font-bold uppercase text-xs">Student</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="staff" id="staff" />
                                                        <Label htmlFor="staff" className="cursor-pointer font-bold uppercase text-xs">Staff</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* Form Body */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-1 max-w-3xl mx-auto">
                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">From Date:<span className="text-red-500">*</span></Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={form.control}
                                                        name="fromDate"
                                                        render={({ field, fieldState }) => (
                                                            <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">To Date:<span className="text-red-500">*</span></Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={form.control}
                                                        name="toDate"
                                                        render={({ field, fieldState }) => (
                                                            <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Row */}
                                        <div className="flex items-center justify-center gap-4 mt-12">
                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                                            >
                                                {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <FileText className="mr-2 h-3 w-3" />}
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
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table id="reportTable">
                                    <TableHeader className="bg-blue-50">
                                        <TableRow>
                                            <TableHead className="w-[80px] text-blue-900 font-bold border text-center">SL.No.</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">{type === 'student' ? 'Student Name' : 'Staff Name'}</TableHead>
                                            {type === 'student' ? (
                                                <>
                                                    <TableHead className="text-blue-900 font-bold border">Course</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Semester</TableHead>
                                                </>
                                            ) : (
                                                <TableHead className="text-blue-900 font-bold border">Department</TableHead>
                                            )}
                                            <TableHead className="text-blue-900 font-bold border">Hostel</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Room No</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Confirm Date</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="py-2 text-xs border text-center">{index + 1}</TableCell>
                                                <TableCell className="py-2 text-xs border font-semibold">{type === 'student' ? (item.studentname || 'N/A') : (item.empname || 'N/A')}</TableCell>
                                                {type === 'student' ? (
                                                    <>
                                                        <TableCell className="py-2 text-xs border">{item.AMCO_CourseName || item.courseName || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.AMSE_SemesterName || item.semesterName || 'N/A'}</TableCell>
                                                    </>
                                                ) : (
                                                    <TableCell className="py-2 text-xs border">{item.HRMD_DepartmentName || 'N/A'}</TableCell>
                                                )}
                                                <TableCell className="py-2 text-xs border">{item.HLMH_Name || 'N/A'}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.HRMRM_RoomNo || 'N/A'}</TableCell>
                                                <TableCell className="py-2 text-xs border text-center whitespace-nowrap">
                                                    {(() => {
                                                        const confirmDate = item.HLHSREQC_ConfirmDate || item.HLHSTREQC_ConfirmDate;
                                                        return confirmDate ? format(new Date(confirmDate), 'dd/MM/yyyy') : '-';
                                                    })()}
                                                </TableCell>
                                                <TableCell className="py-2 text-xs border text-center">{item.HLHSREQC_Remarks || item.HLHSTREQC_Remarks || '-'}</TableCell>
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
