'use client';

import { useEffect, useState } from 'react';
import CollegeVacateReportForm from './_components/report-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getCollegeVacateReportLoadData } from '@/server/hostel/hostel-management/reports/college-vacate-report';
import * as XLSX from 'xlsx';

export default function CollegeVacateReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<any>('student');
    const [loadData, setLoadData] = useState<any>(null);
    const [currentDate] = useState(new Date());

    useEffect(() => {
        (async () => {
            try {
                const res = await getCollegeVacateReportLoadData('student');
                if (res) setLoadData(res);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load initial data');
            }
        })();
    }, []);

    const handleReportGenerated = (data: any[], type: string) => {
        setReportData(data);
        setReportType(type);
    };

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
                            <title>College Hostel Vacate Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2e57a0; padding-bottom: 10px; }
                                .school-name { font-size: 24px; font-weight: bold; color: #2e57a0; margin: 0; text-transform: uppercase; }
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
                                <h1 class="school-name">College Hostel Vacate Report</h1>
                                <div class="report-title">
                                    ${reportType === 'student' ? 'Student' : reportType === 'staff' ? 'Staff' : 'Guest'} Vacate Details
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
        
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vacate Report");
        XLSX.writeFile(workbook, `College_Hostel_Vacate_Report_${format(currentDate, 'yyyyMMdd')}.xlsx`);
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50/50 min-h-screen">
                <Card className="shadow-md border-t-4 border-t-[#4255a7]">
                    <CardHeader className="bg-[#4255a7] py-1 px-4">
                        <CardTitle className="text-white text-[11px] font-bold uppercase tracking-wider">HOSTEL VACATE REPORT</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadData ? (
                            <CollegeVacateReportForm
                                initialData={loadData}
                                onReportGenerated={handleReportGenerated}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                                <p className="text-gray-500 font-medium text-sm">Loading form data...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {reportData.length > 0 && (
                    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-gray-50/50">
                            <CardTitle className="text-blue-800 font-bold">Report Results (${reportData.length} Records)</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-green-600 text-green-700 hover:bg-green-50">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrint} className="border-blue-600 text-blue-700 hover:bg-blue-50">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-md border shadow-sm overflow-hidden">
                                <Table id="reportTable">
                                    <TableHeader className="bg-blue-50">
                                        <TableRow>
                                            <TableHead className="w-[60px] text-blue-900 font-bold text-center border">SL.No.</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">
                                                {reportType === 'student' ? 'Student Name' : reportType === 'staff' ? 'Staff Name' : 'Guest Name'}
                                            </TableHead>
                                            {reportType === 'student' && (
                                                <>
                                                    <TableHead className="text-blue-900 font-bold border">Course</TableHead>
                                                    <TableHead className="text-blue-900 font-bold border text-center">Semester</TableHead>
                                                </>
                                            )}
                                            {reportType === 'staff' && (
                                                <TableHead className="text-blue-900 font-bold border">Dept</TableHead>
                                            )}
                                            <TableHead className="text-blue-900 font-bold border">Hostel Name</TableHead>
                                            <TableHead className="text-blue-900 font-bold border">Room Name</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center whitespace-nowrap">Vacate date</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center whitespace-nowrap">Allot date</TableHead>
                                            <TableHead className="text-blue-900 font-bold border text-center">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="text-center font-medium border">{index + 1}</TableCell>
                                                <TableCell className="font-semibold border">
                                                    {item.studentname || item.empname || item.hlhgstalT_GuestName}
                                                </TableCell>
                                                {reportType === 'student' && (
                                                    <>
                                                        <TableCell className="border">{item.AMCO_CourseName}</TableCell>
                                                        <TableCell className="text-center border">{item.AMSE_SemesterName}</TableCell>
                                                    </>
                                                )}
                                                {reportType === 'staff' && (
                                                    <TableCell className="border">{item.HRMD_DepartmentName}</TableCell>
                                                )}
                                                <TableCell className="border">{item.HLMH_Name}</TableCell>
                                                <TableCell className="border">{item.HRMRM_RoomNo || item.HRMRM_RoomName}</TableCell>
                                                <TableCell className="text-center border whitespace-nowrap">
                                                    {item.HLHSV_VacateDate || item.HLHSTV_VacateDate || item.HLHGV_VacateDate 
                                                        ? format(new Date(item.HLHSV_VacateDate || item.HLHSTV_VacateDate || item.HLHGV_VacateDate), 'dd/MM/yyyy') 
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-center border whitespace-nowrap">
                                                    {item.HLHSALT_AllotmentDate 
                                                        ? format(new Date(item.HLHSALT_AllotmentDate), 'dd/MM/yyyy') 
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="border">{item.HLHSV_VacateRemarks || item.HLHSTV_VacateRemarks || item.HLHGV_VacateRemarks || '-'}</TableCell>
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
