'use client';

import { useState, useRef } from 'react';
import { useSophiaSmartcardReport } from '@/hooks/admission/preadmission/reports/useSophiaSmartcardReport';
import { FilterForm } from './_components/filter-form';
import { SmartcardPrint } from './_components/smart-card-print';
import { SectionSummaryTable, ReligionSummaryTable } from './_components/summary-tables';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SmartcardReportPage() {
    const { reportMutation, loadData } = useSophiaSmartcardReport();
    const [students, setStudents] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [detailedSummaryData, setDetailedSummaryData] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [institution, setInstitution] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Fetching smart card details...', { id: 'smartcard-report' });

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id,
                ASMS_Id: formData.ASMS_Id,
                SPCCMH_Id: formData.SPCCMH_Id || 0,
                stdmobilenumber: formData.Admnoallind
            };

            const response = await reportMutation.mutateAsync(payload) as any;
            const resData = response.data || {};

            // Map the different lists from the response
            const studentsList = resData.studentList || resData.getcarddetails || (Array.isArray(resData) ? resData : []);
            const summaryList = resData.studentList1 || [];
            const detailedSummaryList = resData.studentList3 || [];

            if (studentsList.length > 0 || summaryList.length > 0 || detailedSummaryList.length > 0) {
                setStudents(studentsList);
                setSummaryData(summaryList);
                setDetailedSummaryData(detailedSummaryList);
                setInstitution(resData.masterCompany?.[0] || null);
                setSelectedStudents([]); // Reset selection on new report
                setShowReport(true);
                toast.success('Report generated successfully!', { id: 'smartcard-report' });
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
        setSummaryData([]);
        setDetailedSummaryData([]);
        setSelectedStudents([]);
        setShowReport(false);
        setSearchQuery('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Smart Card Details Report'
    });

    const exportToExcel = () => {
        let headers: string[] = [];
        let rows: any[][] = [];
        let fileName = "Sophia_Smart_Card_Report.csv";

        if (activeTab === 'list') {
            const dataToExport = filteredStudents;
            if (dataToExport.length === 0) {
                toast.warning('No student records found to export.');
                return;
            }
            headers = ["SL.NO", "Student Name", "Father Name", "Adm No.", "Street", "Area", "City", "Mobile", "Email ID", "Blood Group"];
            rows = dataToExport.map((s, i) => [
                i + 1,
                s.studentname || '',
                s.fathername || '',
                s.admno || '',
                s.street || '',
                s.area || '',
                s.city || '',
                s.mobile || '',
                s.emailid || '',
                s.bloodgroup || ''
            ]);
            fileName = "Sophia_Smart_Card_Student_List.csv";
        } else if (activeTab === 'summary') {
            if (summaryData.length === 0) {
                toast.warning('No summary data found to export.');
                return;
            }
            headers = ["SL.NO", "Class", "Section", "Male", "Female", "Total"];
            rows = summaryData.map((s, i) => [
                i + 1,
                s.asmcl_classname || '',
                s.asmc_sectionname || '',
                s.male || 0,
                s.female || 0,
                s.totalcount || 0
            ]);
            fileName = "Sophia_Smart_Card_Section_Summary.csv";
        } else if (activeTab === 'detailed') {
            if (detailedSummaryData.length === 0) {
                toast.warning('No detailed summary records found to export.');
                return;
            }
            headers = ["SL.NO", "Class", "Section", "M_Gen", "F_Gen", "M_OBC", "F_OBC", "M_SC", "F_SC", "M_ST", "F_ST", "M_Hindu", "F_Hindu", "M_Chris", "F_Chris", "M_Islam", "F_Islam", "M_Other", "F_Other", "Male_Total", "Female_Total", "New", "Old", "Total"];
            rows = detailedSummaryData.map((s, i) => [
                i + 1,
                s.asmcl_classname || '',
                s.asmc_sectionname || '',
                s.male_general || 0,
                s.female_general || 0,
                s.male_obc || 0,
                s.female_obc || 0,
                s.male_sc || 0,
                s.female_sc || 0,
                s.male_st || 0,
                s.female_st || 0,
                s.male_hindu || 0,
                s.female_hindu || 0,
                s.male_christian || 0,
                s.female_christian || 0,
                s.male_islam || 0,
                s.female_islam || 0,
                s.male_other || 0,
                s.female_other || 0,
                s.male || 0,
                s.female || 0,
                s.newst_totalcount || 0,
                s.oldst_totalcount || 0,
                s.total || 0
            ]);
            fileName = "Sophia_Smart_Card_Religious_Summary.csv";
        }

        const csvContent = headers.join(",") + "\n"
            + rows.map(r => r.map(cell => {
                const val = String(cell ?? '').replace(/"/g, '""');
                return `"${val}"`;
            }).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${rows.length} records!`);
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
            setSelectedStudents(prev => prev.filter(s => (s.amst_id || s.admno) !== (student.amst_id || student.admno)));
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

            <Card className="rounded-none border-t-2 border-t-[#3c8dbc] shadow-md overflow-hidden bg-white">
                <CardHeader className="bg-white border-b py-2 px-4 h-10 flex justify-center">
                    <CardTitle className="text-sm font-bold text-[#337ab7]">
                        SMART CARD DETAILS REPORT
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <FilterForm 
                        onSubmit={handleReport} 
                        onReset={handleReset}
                        onExport={exportToExcel}
                        onPrint={() => handlePrint()}
                        hasData={students.length > 0}
                        hasSelectedData={selectedStudents.length > 0}
                    />
                </CardContent>
            </Card>

            {showReport && (
                <Card className="rounded-none border-t-2 border-t-[#3c8dbc] shadow-md bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <CardHeader className="bg-white border-b py-2 px-4 h-10 flex justify-center">
                        <CardTitle className="text-sm font-bold text-[#337ab7]">
                            SMART CARD DETAILS REPORT
                        </CardTitle>
                    </CardHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <CardHeader className="border-b bg-white flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 p-4">
                            <TabsList className="grid grid-cols-3 w-full md:w-[600px] h-11 bg-slate-100 p-1">
                                <TabsTrigger value="list" className="rounded-md font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Student List
                                </TabsTrigger>
                                <TabsTrigger value="summary" className="rounded-md font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Section Summary
                                </TabsTrigger>
                                <TabsTrigger value="detailed" className="rounded-md font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Religious/Category
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="search here..."
                                        className="pl-9 h-10 w-full md:w-[250px] border-slate-300 focus:ring-sky-500 focus:border-sky-500 font-medium bg-white rounded-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="bg-white p-4">
                            <TabsContent value="list" className="mt-0 outline-none">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-sm shadow-sm">
                                        <span className="text-sm font-bold text-slate-700">Total Grid Records :</span>
                                        <Badge className="bg-[#3c8dbc] text-white hover:bg-[#3c8dbc] rounded-full w-6 h-6 flex items-center justify-center p-0">
                                            {filteredStudents.length}
                                        </Badge>
                                    </div>
                                </div>
                                <ScrollArea className="h-[600px] w-full border rounded-md">
                                    <Table className="relative border-collapse">
                                        <TableHeader className="bg-[#337ab7] sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-b">
                                                <TableHead className="w-[50px] text-center text-white font-bold">
                                                    <Checkbox
                                                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                        onCheckedChange={(checked) => toggleAll(!!checked)}
                                                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#337ab7]"
                                                    />
                                                </TableHead>
                                                <TableHead className="w-[60px] text-center text-white font-bold">SL.NO</TableHead>
                                                <TableHead className="text-white font-bold">Student Name</TableHead>
                                                <TableHead className="text-white font-bold">Father Name</TableHead>
                                                <TableHead className="text-white font-bold text-center">Adm No.</TableHead>
                                                <TableHead className="text-white font-bold">Street</TableHead>
                                                <TableHead className="text-white font-bold">Area</TableHead>
                                                <TableHead className="text-white font-bold">city</TableHead>
                                                <TableHead className="text-white font-bold text-center">Mobile</TableHead>
                                                <TableHead className="text-white font-bold text-center">Email_ID</TableHead>
                                                <TableHead className="text-white font-bold text-center uppercase tracking-tighter">BloodGroup</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((student, index) => {
                                                    const isSelected = selectedStudents.some(s => (s.amst_id || s.admno) === (student.amst_id || student.admno));
                                                    return (
                                                        <TableRow key={student.amst_id || student.admno || index} className={isSelected ? "bg-sky-50/40 hover:bg-sky-50/60" : "hover:bg-slate-50/80"}>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={(checked) => toggleStudent(student, !!checked)}
                                                                    className={isSelected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300"}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-slate-500">{index + 1}</TableCell>
                                                            <TableCell>
                                                                <div className="font-bold text-slate-800 uppercase text-xs">{student.studentname}</div>
                                                            </TableCell>
                                                            <TableCell className="text-slate-600 uppercase text-xs">{student.fathername}</TableCell>
                                                            <TableCell className="text-center font-mono text-[10px] font-semibold">{student.admno}</TableCell>
                                                            <TableCell className="text-slate-600 uppercase text-[10px]">{student.street || '-'}</TableCell>
                                                            <TableCell className="text-slate-600 uppercase text-[10px]">{student.area || '-'}</TableCell>
                                                            <TableCell className="uppercase text-slate-600 text-[10px]">{student.city || '-'}</TableCell>
                                                            <TableCell className="text-center text-slate-600 text-[10px]">{student.mobile || '-'}</TableCell>
                                                            <TableCell className="text-slate-600 text-[10px]">{student.emailid || '-'}</TableCell>
                                                            <TableCell className="text-center font-bold text-slate-700 text-[10px]">
                                                                {student.bloodgroup || '-'}
                                                            </TableCell>
                                                            {/* <TableCell className="text-center">
                                                                {isSelected ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                                ) : (
                                                                    <div className="w-5 h-5 border-2 border-dashed border-slate-200 rounded-full mx-auto" />
                                                                )}
                                                            </TableCell> */}
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
                            </TabsContent>

                            <TabsContent value="summary" className="mt-0 outline-none">
                                <SectionSummaryTable data={summaryData} />
                            </TabsContent>

                            <TabsContent value="detailed" className="mt-0 outline-none">
                                <ReligionSummaryTable data={detailedSummaryData} />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            )}

            {/* Hidden Print Wrapper */}
            <div className="hidden">
                <SmartcardPrint 
                    ref={printRef} 
                    data={selectedStudents.length > 0 ? selectedStudents : students} 
                    summaryData={summaryData}
                    detailedSummaryData={detailedSummaryData}
                    imgName={institution?.logo}
                    institutionName={institution?.name}
                />
            </div>
        </div>
    );
}
