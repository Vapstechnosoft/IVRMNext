'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateField } from '@/components/ui/dateField';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText, Loader2, Printer, Search, XCircle, FileSpreadsheet } from 'lucide-react';
import { collegeAllotmentReportSchema, CollegeAllotmentReportSchema } from '@/schemas/hostel/reports/college-allotment-report.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { studentColumns, staffColumns, guestColumns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCollegeAllotmentReport } from '@/server/hostel/hostel-management/reports/college-allotment-report';
import { Heading } from '@/components/layout/heading';
import * as XLSX from 'xlsx';

interface ReportFormProps {
    dropdowns: {
        yearlist: any[];
        hostellist: any[];
    };
}

export default function CollegeAllotmentReportClient({ dropdowns }: ReportFormProps) {
    const methods = useForm<CollegeAllotmentReportSchema>({
        resolver: zodResolver(collegeAllotmentReportSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: 'Student',
            ASMAY_Id: 0,
            HLMH_Id: 0,
            frmdate: new Date(),
            todate: new Date(),
        }
    });

    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = methods;
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<string>('Student');
    const [currentDate] = useState(new Date());

    const selectedType = useWatch({ control, name: 'type' });

    const onSubmit = async (data: CollegeAllotmentReportSchema) => {
        try {
            setReportType(data.type);
            const res = await getCollegeAllotmentReport(data);
            if (res?.griddata) {
                setReportData(res.griddata);
                if (res.griddata.length === 0) {
                    toast.info('No records found for selected criteria');
                } else {
                    toast.success(`Successfully loaded ${res.griddata.length} allotment(s)`);
                }
            } else {
                setReportData([]);
                toast.info('No records found for selected criteria');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while generating report');
        }
    };

    const handlePrint = () => {
        if (!reportData || reportData.length === 0) return;

        const tableContent = document.getElementById('reportTable');
        const fromDate = methods.getValues('frmdate');
        const toDate = methods.getValues('todate');

        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>College Hostel Allotment Report</title>
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
                                <h1 class="school-name">College Hostel Allotment Report</h1>
                                <div class="report-title">Allotment Details (${reportType.toUpperCase()})</div>
                                <div class="dates">From: ${format(fromDate, 'dd/MM/yyyy')} To: ${format(toDate, 'dd/MM/yyyy')}</div>
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

        // Map data to clean excel columns
        const formattedData = reportData.map((item, index) => {
            const row: any = {
                'SL.No.': index + 1,
            };

            if (reportType === 'Student') {
                row['Year'] = item.ASMAY_Year || item.asmaY_Year || 'N/A';
                row['Student Name'] = item.StudentName || item.studentname || 'N/A';
                row['Adm No'] = item.AMST_AdmNo || item.AMCST_AdmNo || item.amcsT_AdmNo || 'N/A';
                row['Course'] = item.AMCO_CourseName || item.courseName || 'N/A';
                row['Semester'] = item.AMSE_SemesterName || item.semesterName || 'N/A';
            } else if (reportType === 'Staff') {
                row['Staff Name'] = item.StaffName || item.empname || 'N/A';
                row['Department'] = item.HRMD_DepartmentName || 'N/A';
                row['Designation'] = item.HRMDES_DesignationName || 'N/A';
                row['Code'] = item.HRME_EmployeeCode || 'N/A';
            } else {
                row['Guest Name'] = item.HLHGSTALT_GuestName || item.hlhgstalT_GuestName || 'N/A';
                row['Phone'] = item.HLHGSTALT_GuestPhoneNo || 'N/A';
                row['Email'] = item.HLHGSTALT_GuestEmailId || 'N/A';
                row['Address'] = item.HLHGSTALT_GuestAddress || 'N/A';
            }

            row['Hostel'] = item.HLMH_Name || item.hlmH_Name || 'N/A';
            row['Category'] = item.HLMRCA_RoomCategory || item.hlmrC_RoomCategory || 'N/A';
            row['Room No'] = item.HRMRM_RoomNo || item.hrmrM_RoomNo || 'N/A';
            
            const allotDate = item.HLHSALT_AllotmentDate || item.HLHSTALT_AllotmentDate || item.HLHGSTALT_AllotmentDate || item.hlhsalT_AllotmentDate || item.hlhstalT_AllotmentDate || item.hlhgstalT_AllotmentDate;
            row['Allotment Date'] = allotDate ? format(new Date(allotDate), 'dd/MM/yyyy') : '-';
            
            const allotRemarks = item.HLHSALT_AllotRemarks || item.HLHSTALT_AllotRemarks || item.HLHGSTALT_AllotRemarks || item.hlhsalT_AllotRemarks || '';
            row['Remarks'] = allotRemarks || '-';

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Allotments");
        XLSX.writeFile(workbook, `College_Hostel_Allotment_Report_${format(currentDate, 'yyyyMMdd')}.xlsx`);
    };

    return (
        <div className="flex-col">
            <div className="flex items-center justify-end px-8 py-2 text-[10px] text-gray-500 font-medium bg-gray-100/50">
                <span>Report &gt; CollegeAllotmentReport</span>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-4 bg-slate-50/50 min-h-screen">
                <Heading 
                    title="College Allotment Report" 
                    description="View and generate college hostel allotment reports."
                />
                
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                        <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-[#4255a7] text-sm font-bold uppercase tracking-wider">
                                COLLEGE HOSTEL ALLOTMENT REPORT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                                    {/* Type Selection Bar */}
                                    <div className="bg-gray-50/50 p-4 border-b flex justify-center">
                                        <Controller
                                            control={control}
                                            name="type"
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex space-x-12"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Student" id="Student" />
                                                        <Label htmlFor="Student" className="cursor-pointer font-bold uppercase text-xs">Student</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Staff" id="Staff" />
                                                        <Label htmlFor="Staff" className="cursor-pointer font-bold uppercase text-xs">Staff</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Guest" id="Guest" />
                                                        <Label htmlFor="Guest" className="cursor-pointer font-bold uppercase text-xs">Guest</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* Form Body */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4 max-w-4xl mx-auto">
                                            {/* Academic Year */}
                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">Academic Year:</Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={control}
                                                        name="ASMAY_Id"
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value !== undefined && field.value !== null ? String(field.value) : "0"}
                                                                onValueChange={(v) => field.onChange(Number(v))}
                                                            >
                                                                <SelectTrigger className="w-full bg-white">
                                                                    <SelectValue placeholder="--Select Year--" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="0">--All--</SelectItem>
                                                                    {dropdowns.yearlist?.map((y: any) => (
                                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                            {y.asmaY_Year}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Hostel */}
                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">Hostel:</Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={control}
                                                        name="HLMH_Id"
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value !== undefined && field.value !== null ? String(field.value) : "0"}
                                                                onValueChange={(v) => field.onChange(Number(v))}
                                                            >
                                                                <SelectTrigger className="w-full bg-white">
                                                                    <SelectValue placeholder="--Select Hostel--" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="0">--All--</SelectItem>
                                                                    {dropdowns.hostellist?.map((h: any) => (
                                                                        <SelectItem key={h.hlmH_Id} value={String(h.hlmH_Id)}>
                                                                            {h.hlmH_Name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* From Date */}
                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">From Date:<span className="text-red-500">*</span></Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={control}
                                                        name="frmdate"
                                                        render={({ field, fieldState }) => (
                                                            <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* To Date */}
                                            <div className="flex items-center py-1">
                                                <Label className="w-40 text-left text-gray-700 font-medium">To Date:<span className="text-red-500">*</span></Label>
                                                <span className="text-gray-500 mr-4">:</span>
                                                <div className="flex-1">
                                                    <Controller
                                                        control={control}
                                                        name="todate"
                                                        render={({ field, fieldState }) => (
                                                            <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Row */}
                                        <div className="flex items-center justify-center gap-4 mt-8">
                                            <Button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                                            >
                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-3 w-3" />}
                                                REPORT
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => {
                                                    reset();
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
                                            
                                            {reportType === 'Student' && (
                                                <>
                                                    <TableHead className="text-blue-900 font-bold border">Year</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Student Name</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Adm No</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Course</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Semester</TableHead>
                                                </>
                                            )}

                                            {reportType === 'Staff' && (
                                                <>
                                                    <TableHead className="text-blue-900 font-bold border">Staff Name</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Department</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Designation</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Code</TableHead>
                                                </>
                                            )}

                                            {reportType === 'Guest' && (
                                                <>
                                                    <TableHead className="text-blue-900 font-bold border">Guest Name</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Phone</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Email</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border">Address</TableHead>
                                                </>
                                            )}

                                            <TableHead className="text-blue-900 font-bold border">Hostel</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Category</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Room No</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Allotment Date</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="py-2 text-xs border text-center">{index + 1}</TableCell>
                                                
                                                {reportType === 'Student' && (
                                                    <>
                                                        <TableCell className="py-2 text-xs border">{item.ASMAY_Year || item.asmaY_Year || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border font-semibold">
                                                            {item.StudentName || item.studentname || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.AMST_AdmNo || item.AMCST_AdmNo || item.amcsT_AdmNo || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.AMCO_CourseName || item.courseName || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.AMSE_SemesterName || item.semesterName || 'N/A'}</TableCell>
                                                    </>
                                                )}

                                                {reportType === 'Staff' && (
                                                    <>
                                                        <TableCell className="py-2 text-xs border font-semibold">
                                                            {item.StaffName || item.empname || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HRMD_DepartmentName || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HRMDES_DesignationName || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HRME_EmployeeCode || 'N/A'}</TableCell>
                                                    </>
                                                )}

                                                {reportType === 'Guest' && (
                                                    <>
                                                        <TableCell className="py-2 text-xs border font-semibold">
                                                            {item.HLHGSTALT_GuestName || item.hlhgstalT_GuestName || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HLHGSTALT_GuestPhoneNo || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HLHGSTALT_GuestEmailId || 'N/A'}</TableCell>
                                                        <TableCell className="py-2 text-xs border">{item.HLHGSTALT_GuestAddress || 'N/A'}</TableCell>
                                                    </>
                                                )}

                                                <TableCell className="py-2 text-xs border">{item.HLMH_Name || item.hlmH_Name || 'N/A'}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.HLMRCA_RoomCategory || item.hlmrC_RoomCategory || 'N/A'}</TableCell>
                                                <TableCell className="py-2 text-xs border">{item.HRMRM_RoomNo || item.hrmrM_RoomNo || 'N/A'}</TableCell>
                                                <TableCell className="py-2 text-xs border text-center whitespace-nowrap">
                                                    {(() => {
                                                        const date = item.HLHSALT_AllotmentDate || item.HLHSTALT_AllotmentDate || item.HLHGSTALT_AllotmentDate || item.hlhsalT_AllotmentDate || item.hlhstalT_AllotmentDate || item.hlhgstalT_AllotmentDate;
                                                        return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
                                                    })()}
                                                </TableCell>
                                                <TableCell className="py-2 text-xs border text-center">
                                                    {item.HLHSALT_AllotRemarks || item.HLHSTALT_AllotRemarks || item.HLHGSTALT_AllotRemarks || item.hlhsalT_AllotRemarks || '-'}
                                                </TableCell>
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
