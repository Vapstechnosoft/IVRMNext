'use client';

import { useState, useRef } from 'react';
import { useSophiaSmartcardReport } from '@/hooks/admission/preadmission/reports/useSophiaSmartcardReport';
import { FilterForm } from './_components/filter-form';
import { SmartcardPrint } from './_components/smart-card-print';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import {
    FileBarChart,
    Search,
    Download,
    Printer,
    Users,
    AlertCircle,
    UserCircle,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SmartcardReportPage() {
    const { reportMutation, loadData } = useSophiaSmartcardReport();
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Fetching smart card details...', { id: 'smartcard-report' });
            
            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id,
                ASMC_Id: formData.ASMC_Id,
                stdmobilenumber: formData.Admnoallind
            };

            const response = await reportMutation.mutateAsync(payload) as any;
            const data = response.data?.getcarddetails || response.data || [];

            if (Array.isArray(data) && data.length > 0) {
                setStudents(data);
                setSelectedStudents([]); // Reset selection on new report
                setShowReport(true);
                toast.success(`Found ${data.length} records!`, { id: 'smartcard-report' });
            } else {
                toast.error('No records found for the selected criteria.', { id: 'smartcard-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please check server logs.', { id: 'smartcard-report' });
        }
    };

    const handleReset = () => {
        setStudents([]);
        setSelectedStudents([]);
        setShowReport(false);
        setSearchQuery('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Smart Card Details Report'
    });

    const exportToExcel = () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select students to export.');
            return;
        }

        const headers = ["SL.NO", "Student Name", "Father Name", "Adm No.", "Street", "Area", "City", "Mobile", "Email ID", "Blood Group"];
        const rows = selectedStudents.map((s, i) => [
            i + 1,
            s.studentnam,
            s.FatherName,
            s.AdmNo,
            s.Street,
            s.Area,
            s.city,
            s.Mobile,
            s.Emailid,
            s.BloodGroup
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.map(cell => `"${cell || ''}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Sophia_Smart_Card_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${selectedStudents.length} records!`);
    };

    const filteredStudents = students.filter(s => 
        (s.studentnam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.AdmNo || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(filteredStudents);
        } else {
            setSelectedStudents([]);
        }
    };

    const toggleStudent = (student: any, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, student]);
        } else {
            setSelectedStudents(prev => prev.filter(s => s.amst_id !== student.amst_id));
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <UserCircle className="w-9 h-9 text-sky-600" />
                        Sophia Smart Card Details
                    </h1>
                    <p className="text-slate-500 font-medium ml-12">
                        Comprehensive report for student ID details and card management.
                    </p>
                </div>
                {showReport && (
                    <div className="flex gap-4 p-2 bg-white rounded-xl shadow-sm border px-6">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-sky-600">{students.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-2" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-emerald-600">{selectedStudents.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Selected</span>
                        </div>
                    </div>
                )}
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-white pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileBarChart className="w-5 h-5 text-sky-500" />
                        Report Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </CardContent>
            </Card>

            {showReport && (
                <Card className="border-none shadow-xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <CardHeader className="border-b bg-slate-50/30 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-lg font-bold">Generated List</CardTitle>
                            <Badge variant="secondary" className="bg-sky-100 text-sky-700 font-bold px-3">
                                <Users className="w-3 h-3 mr-1.5" /> {filteredStudents.length} Students
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by name or adm no..." 
                                    className="pl-9 h-10 w-[250px] border-slate-200 focus:ring-sky-500 focus:border-sky-500 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                className="border-slate-300 font-bold hover:bg-slate-50 text-slate-700 shadow-sm"
                                onClick={exportToExcel}
                                disabled={selectedStudents.length === 0}
                            >
                                <Download className="w-4 h-4 mr-2" /> Excel
                            </Button>
                            <Button 
                                className="bg-slate-900 border-none font-bold shadow-lg hover:bg-slate-800"
                                onClick={() => handlePrint()}
                                disabled={selectedStudents.length === 0}
                            >
                                <Printer className="w-4 h-4 mr-2" /> Print Selected
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px] w-full">
                            <Table className="relative border-collapse border-slate-200">
                                <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-b-2">
                                        <TableHead className="w-[50px] text-center">
                                            <Checkbox 
                                                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                onCheckedChange={(checked) => toggleAll(!!checked)}
                                                className="border-slate-400"
                                            />
                                        </TableHead>
                                        <TableHead className="w-[60px] text-center font-bold">SL</TableHead>
                                        <TableHead className="font-bold text-slate-700">Student Name</TableHead>
                                        <TableHead className="font-bold text-slate-700">Father Name</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Adm No.</TableHead>
                                        <TableHead className="font-bold text-slate-700">City</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center uppercase tracking-tighter">Blood Group</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => {
                                            const isSelected = selectedStudents.some(s => s.amst_id === student.amst_id);
                                            return (
                                                <TableRow key={student.amst_id || index} className={isSelected ? "bg-sky-50/40 hover:bg-sky-50/60" : "hover:bg-slate-50/80"}>
                                                    <TableCell className="text-center">
                                                        <Checkbox 
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => toggleStudent(student, !!checked)}
                                                            className={isSelected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300"}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-400">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-slate-800">{student.studentnam}</div>
                                                       
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{student.FatherName}</TableCell>
                                                    <TableCell className="text-center font-mono text-xs font-semibold bg-slate-50/50">{student.AdmNo}</TableCell>
                                                    <TableCell className="capitalize text-slate-600">{student.city || '-'}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-red-200 text-red-600 font-bold bg-red-50/30">
                                                            {student.BloodGroup || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isSelected ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <div className="w-5 h-5 border-2 border-dashed border-slate-200 rounded-full mx-auto" />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-64 text-center">
                                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                                    <AlertCircle className="w-12 h-12 stroke-[1.5]" />
                                                    <p className="font-semibold text-lg">No students matching your search.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Hidden Print Wrapper */}
            <div className="hidden">
                <SmartcardPrint ref={printRef} data={selectedStudents} />
            </div>
        </div>
    );
}
