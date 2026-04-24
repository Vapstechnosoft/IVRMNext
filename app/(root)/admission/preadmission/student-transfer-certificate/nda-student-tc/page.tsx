'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { FilterForm } from './_components/FilterForm';
import { NdaStudentTcApplicationGrid } from './_components/NdaStudentTcApplicationGrid';
import { NdaStudentTcDetailsTable } from './_components/NdaStudentTcDetailsTable';
import { NdaStudentTcPdfDialog } from './_components/NdaStudentTcPdfDialog';
import {
    useNdaStudentTcInitialData,
    useNdaStudentTcSearch,
    useNdaStudentTcSave,
    useNdaStudentTcPdf,
    useNdaStudentTcApprovalStatus
} from '@/hooks/admission/preadmission/useNdaStudentTc';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function NdaStudentTcPage() {
    const { data: initialData, refetch: refetchInitial } = useNdaStudentTcInitialData();
    const searchMutation = useNdaStudentTcSearch();
    const saveMutation = useNdaStudentTcSave();
    const pdfMutation = useNdaStudentTcPdf();
    const statusMutation = useNdaStudentTcApprovalStatus();

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchPayload, setSearchPayload] = useState<any>(null);
    const [pdfData, setPdfData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const handleSearch = async (formData: any) => {
        try {
            toast.loading('Searching students...', { id: 'search-tc' });
            const payload = {
                ASMAY_Id: Number(formData.academic_year),
                ASMCL_Id: Number(formData.classname),
                ASMS_Id: Number(formData.sectionname),
            };
            setSearchPayload(payload);
            const response = await searchMutation.mutateAsync(payload) as any;
            const data = response?.data || response;
            const studentList = Array.isArray(data) ? data : (data.ndastudentlistsearch || []);
            if (studentList.length > 0) {
                setSearchResults(studentList);
                toast.success('Students found', { id: 'search-tc' });
            } else {
                setSearchResults([]);
                toast.error('No records found for the selected criteria', { id: 'search-tc' });
            }
        } catch (error) {
            toast.error('Search failed', { id: 'search-tc' });
        }
    };

    const handleSave = async (selectedStudents: any[]) => {
        const confirm = await Swal.fire({
            title: "Submit TC Requests?",
            text: `You are applying for ${selectedStudents.length} student(s).`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            confirmButtonText: "Yes, Request",
            cancelButtonText: "Cancel"
        });

        if (!confirm.isConfirmed) return;

        try {
            toast.loading('Submitting requests...', { id: 'save-tc' });

            // Map settings to lowercase 'imn_' prefix as requested
            const rawSettings = (initialData as any)?.data?.admTransNumSetting?.[0] || (initialData as any)?.admTransNumSetting?.[0] || {};
            const transformedSettings: any = {};
            for (const key in rawSettings) {
                // Change imN_... to imn_...
                const newKey = key.startsWith('imN_') ? key.replace('imN_', 'imn_') : key;
                transformedSettings[newKey] = rawSettings[key];
            }
            // Ensure asmay_Id is present in settings (capital I)
            if (searchPayload?.ASMAY_Id) {
                transformedSettings.asmay_Id = searchPayload.ASMAY_Id;
            }

            // Map student data to requested casing (capital I in _Id)
            const mappedStudents = selectedStudents.map(s => ({
                amst_Id: s.AMST_Id,
                asmay_Id: searchPayload?.ASMAY_Id,
                asmcl_Id: searchPayload?.ASMCL_Id,
                asms_Id: searchPayload?.ASMS_Id,
                astc_Remarks: s.ASTC_Remarks
            }));

            const payload = {
                studentTCdata: mappedStudents,
                transnumconfigsettings: transformedSettings,
                tcflagexists: ""
            };

            const response = await saveMutation.mutateAsync(payload) as any;
            const data = response?.data || response;
            if (data.returnval === true) {
                toast.success('Requests saved successfully', { id: 'save-tc' });
                setSearchResults([]);
                refetchInitial(); // Update the approved list
            } else {
                toast.error('Failed to save requests', { id: 'save-tc' });
            }
        } catch (error) {
            toast.error('Submission failed', { id: 'search-tc' });
        }
    };

    const handleViewPdf = async (student: any) => {
        setIsPdfOpen(true);
        setPdfData([]);
        try {
            const response = await pdfMutation.mutateAsync({ AMST_Id: student.AMST_Id }) as any;
            const data = response?.data || response;
            const pdfList = Array.isArray(data) ? data : (data.studenttcpdf || []);
            setPdfData(pdfList);
        } catch (error) {
            toast.error('Failed to load certificate');
            setIsPdfOpen(false);
        }
    };

    const handleViewStatus = async (student: any) => {
        setIsStatusOpen(true);
        setStatusData([]);
        try {
            const response = await statusMutation.mutateAsync({ AMST_Id: student.AMST_Id, ASMAY_Id: searchPayload?.ASMAY_Id }) as any;
            const data = response?.data || response;
            const statusList = Array.isArray(data) ? data : (data.studentapprovedpendingdetails || []);
            setStatusData(statusList);
        } catch (error) {
            toast.error('Failed to load status');
            setIsStatusOpen(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">TC</span>
                            <span className="font-black text-xs uppercase tracking-[0.3em] opacity-60">Preadmission Services</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight uppercase italic">Student TC Apply</h1>
                        <p className="text-indigo-100 font-bold opacity-80 backdrop-blur-sm bg-black/5 p-4 rounded-2xl border border-white/5 inline-block">Official portal for Transfer Certificate applications and records management.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-[3000ms] pointer-events-none">
                    <FileText className="w-72 h-72" />
                </div>
            </div>

            {/* Filter Section */}
            <CollapsibleSection
                title="Academic Search Filters"
                description="Target specific classes to find eligible students."
                defaultOpen={true}
                className="shadow-2xl border-none rounded-[2.5rem] bg-white ring-1 ring-slate-100 overflow-hidden"
            >
                <div className="p-4 bg-slate-50/50 backdrop-blur-md">
                    <FilterForm onSearch={handleSearch} onReset={() => setSearchResults([])} />
                </div>
            </CollapsibleSection>

            {/* Application Grid */}
            {searchResults.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-20 duration-1000">
                    <div className="flex items-center gap-4 px-6 py-4 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] backdrop-blur-md shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-indigo-950 uppercase italic tracking-tighter">New Application Batch</h3>
                            <p className="text-sm font-bold text-indigo-600 opacity-60">Ready to process {searchResults.length} student records.</p>
                        </div>
                    </div>
                    <NdaStudentTcApplicationGrid
                        students={searchResults}
                        onSave={handleSave}
                        isSaving={saveMutation.isPending}
                    />
                </div>
            )}

            {/* Approved Details Table */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white ring-1 ring-slate-100 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                <CardContent className="p-0">
                    <NdaStudentTcDetailsTable
                        data={(initialData as any)?.data?.studenttcapprovedlist || (initialData as any)?.studenttcapprovedlist || []}
                        onViewPdf={handleViewPdf}
                        onViewStatus={handleViewStatus}
                    />
                </CardContent>
            </Card>

            {/* PDF Modal */}
            <NdaStudentTcPdfDialog
                open={isPdfOpen}
                onOpenChange={setIsPdfOpen}
                pdfData={pdfData}
                isLoading={pdfMutation.isPending}
            />

            {/* Approval Status Modal */}
            <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden animate-in zoom-in-95">
                    <DialogHeader className="p-8 bg-slate-900 text-white relative">
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Staff Approval Status</DialogTitle>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="top-8 right-8 absolute text-white/50 hover:text-white rounded-full">
                                <X className="h-6 w-6" />
                            </Button>
                        </DialogClose>
                    </DialogHeader>
                    <div className="p-8 bg-slate-50">
                        {statusMutation.isPending ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Querying Workflow Sync...</p>
                            </div>
                        ) : statusData.length > 0 ? (
                            <div className="space-y-4">
                                {statusData.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group transition-all hover:scale-[1.02] hover:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white">
                                                {i + 1}
                                            </div>
                                            <span className="font-bold text-slate-700">{s.empname}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.ASCAP_Status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {s.ASCAP_Status}
                                            </span>
                                            {s.ASCAP_Status === 'Approved' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 opacity-30">
                                <FileText className="h-12 w-12 mx-auto mb-2" />
                                <p className="font-bold">No approval workflow detected for this student.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
