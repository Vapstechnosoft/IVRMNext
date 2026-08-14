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
  const { data: initialData, isLoading: isInitialLoading } = useIdCardInitialData();
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
      const list = res?.data?.studentList || res?.studentList || [];

      if (list && list.length > 0) {
        setReportData(list);
        setShowReport(true);
        toast.success(`Generated ID cards for ${list.length} students`);
      } else {
        setReportData([]);
        setShowReport(false);
        toast.error('No ID card data found for selected criteria');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('An error occurred while generating the report');
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
    <div className="p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Filter Section */}
        <div className="w-full">
          <StudentIdCardSearch
            academicList={initialData?.getAcademicYearList || []}
            initialClassList={initialData?.getClassList || []}
            onSubmit={handleSearch}
            onReset={handleReset}
            onPrint={handlePrint}
            showPrint={showReport}
            isLoading={reportMutation.isPending}
          />
        </div>

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
