'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Camera, UserSquare2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
  useNdaPhotoInitialData,
  useNdaPhotoApprovalList,
  useNdaPhotoSave,
} from '@/hooks/admission/preadmission/useNdaStudentPhotoApproval';
import { NdaStudentPhotoSearch } from './_components/NdaStudentPhotoSearch';
import { NdaStudentPhotoList } from './_components/NdaStudentPhotoList';
import { NdaStaffPhotoList } from './_components/NdaStaffPhotoList';

export default function NdaStudentPhotoApprovalPage() {
  const [selectionType, setSelectionType] = useState<'Student' | 'Staff'>('Student');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Data fetching
  const { data: initialData, isLoading: isInitialLoading } = useNdaPhotoInitialData(selectionType);
  const listMutation = useNdaPhotoApprovalList();
  const saveMutation = useNdaPhotoSave();

  // Sync initial results if returned by Getdata
  useEffect(() => {
    if (initialData?.studentList?.length > 0) {
      setResults(initialData.studentList);
      setShowResults(true);
    }
  }, [initialData]);

  const handleSearch = async (formData: any) => {
    try {
      setSelectionType(formData.type);
      const payload = {
        dup: formData.type,
        ASMAY_Id: formData.academic_year ? Number(formData.academic_year) : undefined,
        ASMCL_Id: formData.classname ? Number(formData.classname) : undefined,
        ASMS_Id: formData.sectionname ? Number(formData.sectionname) : undefined,
      };

      const res = (await listMutation.mutateAsync(payload)) as any;
      
      const records = Array.isArray(res) ? res : (res?.studentList || res?.ndA_Studentphotodata || res?.data || []);
      if (records.length > 0) {
        setResults(records);
        setShowResults(true);
        toast.success(`Fetched ${records.length} ${formData.type} records`);
      } else {
        setResults([]);
        setShowResults(false);
        toast.error(`No records found for the selected criteria`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch records');
    }
  };

  const handleSave = async (selectedRecords: any[]) => {
    try {
      // Map records to the exact field names and structure required by the latest API payload
      const mappedRecords = selectedRecords.map((r: any) => ({
        astureQ_Id: r.ASTUREQ_Id,
        amsT_Id: r.AMST_Id,
        astureQ_ConformFlg: Number(r.ASTUREQ_ConformFlg || 0),
        astureQ_ConformFlgM: Number(r.ASTUREQ_ConformFlgM || 0),
        astureQ_ConformFlgF: Number(r.ASTUREQ_ConformFlgF || 0),
        astureQ_ConformFlgG: Number(r.ASTUREQ_ConformFlgG || 0),
        studentName: r.StudentName,
        astureQ_AdmNo: r.ASTUREQ_AdmNo,
        astureQ_StudentPhoto: r.ASTUREQ_StudentPhoto,
        astureQ_FatherPhoto: r.ASTUREQ_FatherPhoto,
        astureQ_MotherPhoto: r.ASTUREQ_MotherPhoto,
        astureQ_GuardianPhoto: r.ASTUREQ_GuardianPhoto,
        astureQ_PickupOnePhoto: r.ASTUREQ_PickupOnePhoto,
        astureQ_PickupTwoPhoto: r.ASTUREQ_PickupTwoPhoto,
        astureQ_ConformFlgPickupOne: Number(r.ASTUREQ_ConformFlgPickupOne || 0),
        astureQ_ConformFlgPickupTwo: Number(r.ASTUREQ_ConformFlgPickupTwo || 0),
      }));

      const payload = {
        selectedImageslist: mappedRecords,
        dup: '',
      };

      const res = (await saveMutation.mutateAsync(payload)) as any;

      if (res?.success) {
        toast.success(res?.message || 'Approval status updated successfully');
        setShowResults(false);
      } else {
        toast.error(res?.message || 'Failed to update approval status');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error occurred while saving');
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setResults([]);
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-indigo-600" />
          <Camera className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">INITIALIZING PHOTO PORTAL</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-2">Loading configurations & assets</p>
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
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transform group-hover:rotate-6 transition-transform duration-500">
                <Camera className="w-12 h-12" />
            </div>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black text-indigo-950 tracking-tighter">PHOTO APPROVAL</h1>
                  <Badge className="bg-indigo-50 text-indigo-600 border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                    v2.0
                  </Badge>
               </div>
               <div className="flex items-center gap-2 mt-2">
                 <p className="text-indigo-500 font-bold tracking-widest uppercase text-xs">Notre Dame Academy</p>
                 <ChevronRight className="w-3 h-3 text-slate-300" />
                 <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Master Module</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Filter Section */}
        <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden">
          <CardContent className="p-10">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                   <UserSquare2 className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">SELECTION CRITERIA</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Configure filters to fetch profile images</p>
                </div>
             </div>
             <NdaStudentPhotoSearch
                academicList={initialData?.academicYear || []}
                classList={initialData?.classlist || []}
                sectionList={initialData?.sectionList || []}
                onSubmit={handleSearch}
                onReset={handleReset}
                isLoading={listMutation.isPending}
             />
          </CardContent>
        </Card>

        {/* Results Section */}
        {showResults && (
           <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
             <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden">
                <CardContent className="p-10">
                   {selectionType === 'Student' ? (
                     <NdaStudentPhotoList
                        key={`student-${results.length}-${new Date().getTime()}`}
                        students={results}
                        onSave={handleSave}
                        isSaving={saveMutation.isPending}
                        onCancel={handleReset}
                     />
                   ) : (
                     <NdaStaffPhotoList
                        key={`staff-${results.length}-${new Date().getTime()}`}
                        staff={results}
                        onSave={handleSave}
                        isSaving={saveMutation.isPending}
                        onCancel={handleReset}
                     />
                   )}
                </CardContent>
             </Card>
           </div>
        )}
      </div>
      
      <div className="h-20" />
    </div>
  );
}
