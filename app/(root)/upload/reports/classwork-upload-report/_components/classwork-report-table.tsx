'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Eye, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { IClassWorkReport } from '@/types/upload/reports/classwork-upload-report';
import { exportToExcel, exportToPdf } from '@/lib/export-to-file';

interface ClassWorkReportTableProps {
    data: IClassWorkReport[];
    onViewAttachment: (item: IClassWorkReport) => void;
}

export function ClassWorkReportTable({ data, onViewAttachment }: ClassWorkReportTableProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        return data.filter((item) =>
            Object.values(item).some(
                (val) => val && val.toString().toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [data, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>ClassWork Upload Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Inter', sans-serif; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px 8px; text-align: center; font-size: 11px; }
                        th { background-color: #0f172a; color: white; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                        h2 { text-align: center; color: #0f172a; font-family: 'Inter', sans-serif; text-transform: uppercase; margin-bottom: 5px; }
                        p { text-align: center; color: #64748b; font-size: 12px; margin-top: 0; }
                        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
                        .slno { width: 40px; }
                    </style>
                </head>
                <body>
                    <h2>ClassWork Upload Report</h2>
                    <p>Generated for selected classes and date range</p>
                    <table>
                        <thead>
                            <tr>
                                <th class="slno">SL.NO</th>
                                <th>Topic</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Subject</th>
                                <th>File Name</th>
                                <th>Upload Date</th>
                                <th>Uploaded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td style="text-align: left; font-weight: 600;">${item.Topic}</td>
                                    <td>${item.ClassName}</td>
                                    <td>${item.SectionName}</td>
                                    <td>${item.SubjectName}</td>
                                    <td>${item.FileName || 'N/A'}</td>
                                    <td>${new Date(item.UploadDate).toLocaleDateString('en-GB')}</td>
                                    <td>${item.EmployeeName || item.UserName || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        Report generated on ${new Date().toLocaleString()} | IVRM Next Generation
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleExportExcel = () => {
        const columns = [
            { label: 'SL.NO', value: 'slno' },
            { label: 'Topic', value: 'topic' },
            { label: 'Class', value: 'class' },
            { label: 'Section', value: 'section' },
            { label: 'Subject', value: 'subject' },
            { label: 'File Name', value: 'filename' },
            { label: 'Upload Date', value: 'date' },
            { label: 'Uploaded By', value: 'by' }
        ];

        const content = filteredData.map((item, index) => ({
            slno: index + 1,
            topic: item.Topic,
            class: item.ClassName,
            section: item.SectionName,
            subject: item.SubjectName,
            filename: item.FileName || 'N/A',
            date: new Date(item.UploadDate).toLocaleDateString('en-GB'),
            by: item.EmployeeName || item.UserName || 'N/A'
        }));

        exportToExcel(
            'ClassWork_Upload_Report',
            JSON.stringify(columns),
            JSON.stringify(content)
        );
    };

    const handleExportPdf = () => {
        const columns = ['SL.NO', 'Topic', 'Class', 'Section', 'Subject', 'File Name', 'Date', 'By'];
        
        const content = filteredData.map((item, index) => [
            index + 1,
            item.Topic,
            item.ClassName,
            item.SectionName,
            item.SubjectName,
            item.FileName || 'N/A',
            new Date(item.UploadDate).toLocaleDateString('en-GB'),
            item.EmployeeName || item.UserName || 'N/A'
        ]);

        exportToPdf('ClassWork_Upload_Report', columns, content);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Records</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-800 leading-none">{data.length}</span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-primary/20">Total</span>
                        </div>
                    </div>
                    
                    {search && (
                        <div className="flex flex-col gap-0.5 animate-in slide-in-from-left duration-300">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Search Results</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-amber-500 leading-none">{filteredData.length}</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-amber-200">Found</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 max-w-sm relative group">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search records across all columns..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-11 h-11 rounded-full bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>

                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportExcel} 
                        className="h-11 rounded-full px-5 border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all active:scale-95 shadow-sm font-bold uppercase text-[11px] tracking-widest flex items-center gap-2"
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Export Excel
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportPdf} 
                        className="h-11 rounded-full px-5 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm font-bold uppercase text-[11px] tracking-widest flex items-center gap-2"
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Export PDF
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePrint} 
                        className="h-11 rounded-full px-5 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm font-bold uppercase text-[11px] tracking-widest flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" /> Print Report
                    </Button>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-100 overflow-hidden bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-900 border-none">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center px-4">SL.NO</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest">Topic Details</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center">Class / Section</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center">Subject</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center">File Metadata</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center">Upload Timeline</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center">Uploader Info</TableHead>
                                <TableHead className="text-white h-14 uppercase text-[10px] font-black tracking-widest text-center px-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-slate-50/80 transition-all group border-slate-50">
                                    <TableCell className="text-center font-black text-slate-400 text-xs">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-slate-800 text-sm leading-tight tracking-tight group-hover:text-primary transition-colors">{item.Topic}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Topic Title</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-700">{item.ClassName}</span>
                                            <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{item.SectionName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 tracking-tight">{item.SubjectName}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px] italic" title={item.FileName || 'No File'}>
                                                {item.FileName || 'N/A'}
                                            </span>
                                            {item.FileName && (
                                                <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-1.5 rounded uppercase tracking-tighter">System File</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-slate-700">{new Date(item.UploadDate).toLocaleDateString('en-GB')}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.UploadDate).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase border border-slate-200 shadow-sm">
                                                {(item.EmployeeName || item.UserName || 'U').charAt(0)}
                                            </div>
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-xs font-black text-slate-700 leading-none">{item.EmployeeName || item.UserName || 'N/A'}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{item.EmployeeName ? 'Staff' : 'User'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center px-4">
                                        {item.FileName || item.Filepath ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewAttachment(item)}
                                                className="h-9 w-20 rounded-full text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95"
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                                            </Button>
                                        ) : (
                                            <div className="h-9 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-40 italic">No Media</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-80 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-slate-100 rounded-full scale-150 blur-2xl opacity-50" />
                                                <div className="relative p-8 bg-white rounded-full shadow-2xl border border-slate-50">
                                                    <Search className="h-16 w-16 text-slate-200" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">No matching records</h3>
                                                <p className="text-slate-400 font-medium max-w-[300px] mx-auto text-sm leading-relaxed">
                                                    We couldn't find any classwork records matching your current search criteria.
                                                </p>
                                            </div>
                                            <Button variant="outline" onClick={() => setSearch('')} className="rounded-full h-11 px-8 border-slate-200 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 active:scale-95 transition-all">
                                                Clear Search
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 animate-in slide-in-from-bottom duration-500">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-11 px-6 rounded-full font-black uppercase text-[11px] tracking-widest transition-all hover:bg-slate-100 disabled:opacity-30 flex items-center gap-2 border border-slate-100"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    
                    <div className="flex items-center bg-white border border-slate-100 rounded-full px-6 h-11 shadow-sm">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">Page</span>
                        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{currentPage}</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">of {totalPages}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-11 px-6 rounded-full font-black uppercase text-[11px] tracking-widest transition-all hover:bg-slate-100 disabled:opacity-30 flex items-center gap-2 border border-slate-100"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
