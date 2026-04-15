'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { Loader2, CreditCard, Printer, FileDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  useIdCardInitialData,
  useIdCardReport,
} from '@/hooks/admission/preadmission/useStudentIdCardReportNda';
import { StudentIdCardSearch } from './_components/StudentIdCardSearch';
import { StudentIdCardPrint } from './_components/StudentIdCardPrint';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentIdCardReportNdaPage() {
  const [houseColor, setHouseColor] = useState('WHITE');
  const [reportData, setReportData] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Initial data (using pageId = 2 as per legacy code)
  const { data: initialData, isLoading: isInitialLoading } = useIdCardInitialData(2);
  const reportMutation = useIdCardReport();

  const handleSearch = async (formData: any, selectedStudents: any[]) => {
    try {
      setHouseColor(formData.house);
      const payload = {
        ASMAY_Id: Number(formData.academic_year),
        ASMCL_Id: Number(formData.classname),
        ASMS_Id: Number(formData.sectionname),
        StudentTempList: selectedStudents.map((s) => ({
          AMST_Id: s.amsT_Id,
          StudentName: s.studentName,
        })),
      };

      const res = (await reportMutation.mutateAsync(payload)) as any;
      if (res?.cardData && res.cardData.length > 0) {
        setReportData(res.cardData);
        setShowReport(true);
        toast.success(`Generated ID cards for ${res.cardData.length} students`);
      } else {
        setReportData([]);
        setShowReport(false);
        toast.error('No ID card data returned');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to generate report');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleReset = () => {
    setShowReport(false);
    setReportData([]);
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-indigo-600" />
          <CreditCard className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">INITIALIZING ID CARD SYSTEM</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-2">Loading academic records & configurations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-10 space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/30 border border-slate-100 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transform group-hover:rotate-6 transition-transform duration-500">
                <CreditCard className="w-12 h-12" />
            </div>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black text-indigo-950 tracking-tighter uppercase">ID CARD REPORT</h1>
                  <Badge className="bg-indigo-50 text-indigo-600 border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                    Notre Dame
                  </Badge>
               </div>
               <p className="text-indigo-500 font-bold tracking-widest uppercase text-xs mt-2 italic">Precision ID Card Generation & Printing</p>
            </div>
         </div>

         {showReport && (
            <div className="flex items-center gap-4 relative z-10">
               <Button
                 onClick={() => handlePrint()}
                 className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-tight shadow-xl shadow-indigo-100 transform hover:scale-105 active:scale-95 transition-all"
               >
                 <Printer className="mr-3 h-5 w-5" />
                 PRINT CARDS
               </Button>
               <Button
                 variant="outline"
                 className="h-14 px-8 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black tracking-tight transform hover:scale-105 active:scale-95 transition-all bg-white"
               >
                 <FileDown className="mr-3 h-5 w-5" />
                 EXPORT PDF
               </Button>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Filter Section */}
        <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden">
          <CardContent className="p-10">
             <StudentIdCardSearch
                academicList={initialData?.getAcademicYearList || []}
                onSubmit={handleSearch}
                onReset={handleReset}
                isLoading={reportMutation.isPending}
             />
          </CardContent>
        </Card>

        {/* Report Preview Section */}
        {showReport && (
           <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
             <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">PRINT PREVIEW</h2>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Ready to print {reportData.length} records
                </p>
             </div>
             
             <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-900 overflow-hidden p-12 overflow-x-auto min-h-[600px] flex justify-center">
                <div className="bg-white p-1 rounded-sm shadow-2xl origin-top sm:scale-100 scale-75">
                   <StudentIdCardPrint
                     ref={printRef}
                     cardData={reportData}
                     houseColor={houseColor}
                   />
                </div>
             </Card>
           </div>
        )}
      </div>
      
      <div className="h-20" />
    </div>
  );
}
