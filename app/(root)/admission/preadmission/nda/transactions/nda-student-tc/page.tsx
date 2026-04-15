'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, GraduationCap, ClipboardCheck, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
  useNdaStudentTcInitialData,
  useNdaStudentTcSearch,
  useNdaStudentTcSave,
  useNdaStudentTcPdf,
  useNdaStudentTcApprovalStatus,
  ndaStudentTcKeys,
} from '@/hooks/admission/preadmission/useNdaStudentTc';
import { NdaStudentTcSearch } from './_components/NdaStudentTcSearch';
import { NdaStudentTcList } from './_components/NdaStudentTcList';
import { NdaStudentTcSummary } from './_components/NdaStudentTcSummary';
import { NdaStudentTcPrintModal } from './_components/NdaStudentTcPrintModal';
import { NdaStudentTcStatusModal } from './_components/NdaStudentTcStatusModal';
import { useQueryClient } from '@tanstack/react-query';

export default function NdaStudentTcPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Modal states
  const [printModal, setPrintModal] = useState({ isOpen: false, data: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, list: [] });

  // Data fetching
  const { data: initialData, isLoading: isInitialLoading } = useNdaStudentTcInitialData();
  const searchMutation = useNdaStudentTcSearch();
  const saveMutation = useNdaStudentTcSave();
  const pdfMutation = useNdaStudentTcPdf();
  const statusMutation = useNdaStudentTcApprovalStatus();

  const handleSearch = async (formData: any) => {
    try {
      setSearchParams(formData);
      const res = (await searchMutation.mutateAsync({
        ASMAY_Id: Number(formData.academic_year),
        ASMCL_Id: Number(formData.classname),
        ASMS_Id: Number(formData.sectionname),
      })) as any;

      if (res?.ndastudentlistsearch && res.ndastudentlistsearch.length > 0) {
        setSearchResults(res.ndastudentlistsearch);
        setShowResults(true);
        toast.success(`Found ${res.ndastudentlistsearch.length} students`);
      } else {
        setSearchResults([]);
        setShowResults(false);
        toast.error('No students found for this criteria');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch student list');
    }
  };

  const handleSave = async (selectedStudents: any[]) => {
    try {
      const transNumConfig = (initialData as any)?.admTransNumSetting?.find(
        (config: any) => config.imN_Flag === 'tcno'
      );

      const payload = {
        studentTCdata: selectedStudents,
        transnumconfigsettings: transNumConfig,
        tcflagexists: 'tcno',
      };

      const res = await saveMutation.mutateAsync(payload);

      if (res?.returnval) {
        toast.success('TC applications submitted successfully');
        setShowResults(false);
        setSearchResults([]);
        // Refresh summary list
        queryClient.invalidateQueries({ queryKey: ndaStudentTcKeys.all });
      } else {
        toast.error('Failed to submit applications');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error occurred while saving');
    }
  };

  const handleViewPdf = async (student: any) => {
    try {
      setPrintModal({ isOpen: true, data: null });
      const res = (await pdfMutation.mutateAsync({ AMST_Id: student.AMST_Id })) as any;
      
      const tcList = res?.studenttcpdf;
      if (tcList && tcList.length > 0) {
        const tcData = tcList[0] as any;
        // Map to expected fields for NdaTcPrint
        const mappedData = {
           ...tcData,
           lblstdname: tcData.studentname,
           lblfathername: tcData.amsT_FatherName,
           lblmothername: tcData.amsT_MotherName,
           lblreligioncaste: tcData.religion,
           studcaste: tcData.caste,
           lblnationality: tcData.nationality,
           lbldob: tcData.amsT_DOB,
           lbldoa: tcData.amsT_Date,
           lbllastschool: 'N/A',
           lblconduct: tcData.astC_Conduct || 'Good',
           last_date_attended: tcData.tcdatess,
           Last_Class_Studied: tcData.Last_Class_Studied,
           asmC_SectionName: tcData.asmC_SectionName,
           ASTC_Remarks: tcData.astC_Remarks,
           govtno: tcData.govtno,
           AMST_PENNo: tcData.AMST_PENNo,
           tcno: tcData.astC_TCNO,
           admno: tcData.amsT_AdmNo,
           AMST_APAAANO: tcData.AMST_APAAANO,
        };

        setPrintModal({ isOpen: true, data: mappedData });
      } else {
        toast.error('No PDF data found');
        setPrintModal({ isOpen: false, data: null });
      }
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to load TC document');
      setPrintModal({ isOpen: false, data: null });
    }
  };

  const handleViewStatus = async (student: any) => {
    try {
      setStatusModal({ isOpen: true, list: [] });
      const res = (await statusMutation.mutateAsync({ AMST_Id: student.AMST_Id })) as any;
      if (res?.studentapprovedpendingdetails) {
        setStatusModal({ isOpen: true, list: res.studentapprovedpendingdetails as never[] });
      } else {
        toast.error('No status details found');
        setStatusModal({ isOpen: false, list: [] });
      }
    } catch (error) {
      console.error('Status error:', error);
      toast.error('Failed to fetch approval status');
      setStatusModal({ isOpen: false, list: [] });
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setSearchResults([]);
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-indigo-600" />
          <GraduationCap className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">INITIALIZING TC SYSTEM</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-2">Loading academic records & configurations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-100">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <ClipboardCheck className="w-10 h-10" />
            </div>
            <div>
               <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">STUDENT TC APPLY</h1>
               <p className="text-indigo-500 font-bold tracking-widest uppercase text-[10px] mt-1">Transaction Portal • Notre Dame Academy</p>
            </div>
         </div>
      </div>

      {/* Filter Section */}
      <CollapsibleSection
        title="Application Filter"
        description="Select criteria to search students for TC request"
        defaultOpen={true}
        className="rounded-[2.5rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden"
      >
        <div className="p-6">
          <NdaStudentTcSearch
            academicList={(initialData as any)?.academicList || []}
            classList={(initialData as any)?.classlist || []}
            onSubmit={handleSearch}
            onReset={handleReset}
            isLoading={searchMutation.isPending}
          />
        </div>
      </CollapsibleSection>

      {/* Results Section */}
      {showResults && (
        <CollapsibleSection
          title="Student Selection Grid"
          description={`Showing ${searchResults.length} eligible students`}
          defaultOpen={true}
          className="rounded-[2.5rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden"
        >
          <div className="p-6">
            <NdaStudentTcList
              students={searchResults}
              onSave={handleSave}
              isSaving={saveMutation.isPending}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Summary Section */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden">
        <CardContent className="p-10">
           <NdaStudentTcSummary
              summaryList={(initialData as any)?.studenttcapprovedlist || []}
              onViewPdf={handleViewPdf}
              onViewStatus={handleViewStatus}
           />
        </CardContent>
      </Card>

      {/* Modals */}
      <NdaStudentTcPrintModal
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ isOpen: false, data: null })}
        data={printModal.data}
        isLoading={pdfMutation.isPending}
      />

      <NdaStudentTcStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, list: [] })}
        statusList={statusModal.list}
        isLoading={statusMutation.isPending}
      />
      
      <div className="h-10" />
    </div>
  );
}
