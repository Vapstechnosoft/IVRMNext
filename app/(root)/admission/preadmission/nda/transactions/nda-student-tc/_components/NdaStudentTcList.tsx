'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Save,
  Loader2,
  Search,
  FileEdit,
  Settings2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NdaStudentTcListProps {
  students: any[];
  onSave: (selectedStudents: any[]) => void;
  isSaving: boolean;
}

const REMARKS_OPTIONS = [
  "Promoted to Nursery",
  "Promoted to Preparatory",
  "Promoted to Junior",
  "Promoted to Class I",
  "Promoted to Class II",
  "Promoted to Class III",
  "Promoted to Class IV",
  "Promoted to Class V",
  "Promoted to Class VI",
  "Promoted to Class VII",
  "Promoted to Class VIII",
  "Promoted to Class IX",
  "Promoted to Class X",
  "Not Promoted",
  "Other"
];

const CONDUCT_OPTIONS = ["Good", "Very Good", "Excellent", "Satisfactory", "Average"];
const PROMOTION_OPTIONS = ["Yes", "No", "N/A"];

export function NdaStudentTcList({ students, onSave, isSaving }: NdaStudentTcListProps) {
  const [studentList, setStudentList] = useState<any[]>(
    students.map(s => ({
      ...s,
      selected: false,
      astc_Remarks: s.astc_Remarks || '',
      ASTC_TCApplicationDate: null,
      ASTC_TCDate: null,
    }))
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [allRemarks, setAllRemarks] = useState('');

  const handleToggle = (id: number) => {
    setStudentList((prev) =>
      prev.map((s) => {
        if (s.AMST_Id === id) {
          const selected = !s.selected;
          return {
            ...s,
            selected,
            ASTC_TCApplicationDate: selected ? new Date() : null,
            ASTC_TCDate: selected ? new Date() : null,
            astc_Remarks: selected ? s.astc_Remarks : '',
          };
        }
        return s;
      })
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setStudentList((prev) =>
      prev.map((s) => ({
        ...s,
        selected: checked,
        ASTC_TCApplicationDate: checked ? new Date() : null,
        ASTC_TCDate: checked ? new Date() : null,
        astc_Remarks: checked ? s.astc_Remarks : '',
      }))
    );
  };

  const handleApplyRemarksToAll = (val: string) => {
    setAllRemarks(val);
    if (!val) return;
    
    setStudentList(prev => prev.map(s => {
      if (s.selected) {
        return { ...s, astc_Remarks: val };
      }
      return s;
    }));
  };

  const handleIndividualRemarkChange = (id: number, val: string) => {
    setStudentList(prev => prev.map(s => {
      if (s.AMST_Id === id) {
        return { ...s, astc_Remarks: val };
      }
      return s;
    }));
  };

  const openEditModal = (student: any) => {
    setEditingStudent({ ...student });
    setIsModalOpen(true);
  };

  const saveDetails = () => {
    if (!editingStudent) return;
    setStudentList((prev) =>
      prev.map((s) => (s.AMST_Id === editingStudent.AMST_Id ? editingStudent : s))
    );
    setIsModalOpen(false);
    toast.success(`TC details updated for ${editingStudent.StudentName}`);
  };

  const handleSave = () => {
    const selected = studentList.filter((s) => s.selected);
    if (selected.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const missingRemarks = selected.filter((s) => !s.astc_Remarks || s.astc_Remarks === '');
    if (missingRemarks.length > 0) {
      toast.error(`Please fill details for ${missingRemarks.length} selected students (Remarks are mandatory)`);
      return;
    }

    onSave(selected);
  };

  const isAnySelected = studentList.some(s => s.selected);
  const allSelected = studentList.length > 0 && studentList.every(s => s.selected);

  const filteredStudents = studentList.filter(s => 
    s.StudentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.AMST_AdmNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Search & Bulk Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-50/80 p-8 rounded-[2rem] border border-slate-200/60 shadow-inner backdrop-blur-sm">
        <div className="w-full md:w-1/2 space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Search Database</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Filter by name, admission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-2">
            <label className="text-xs font-black text-red-500 uppercase tracking-widest px-1">Remarks for All Selected</label>
            <Select 
                value={allRemarks} 
                onValueChange={handleApplyRemarksToAll}
                disabled={!isAnySelected}
            >
                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all font-bold">
                    <SelectValue placeholder="-- Select --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                    {REMARKS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 h-20">
              <TableRow className="border-b border-slate-100 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400">
                <TableHead className="w-20 text-center">SL.NO</TableHead>
                <TableHead className="w-20 text-center px-0">
                  <div className="flex justify-center items-center h-full">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={(checked) => handleToggleAll(!!checked)}
                      className="h-6 w-6 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                  </div>
                </TableHead>
                <TableHead>Student Identity</TableHead>
                <TableHead>Class & Section</TableHead>
                <TableHead className="w-64">Remarks</TableHead>
                <TableHead className="w-32 text-center">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, idx) => (
                <TableRow 
                  key={student.AMST_Id} 
                  className={cn(
                    "h-24 transition-all duration-300 group border-b border-slate-50",
                    student.selected ? "bg-indigo-50/40" : "hover:bg-slate-50/30"
                  )}
                >
                  <TableCell className="text-center font-bold text-slate-300 font-mono tracking-tighter text-lg">{idx + 1}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                      <Checkbox 
                        checked={student.selected} 
                        onCheckedChange={() => handleToggle(student.AMST_Id)} 
                        className="h-6 w-6 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight text-base leading-tight">
                        {student.StudentName}
                      </span>
                      <span className="text-indigo-500 font-black text-[10px] tracking-wider mt-1 uppercase">
                        ID: {student.AMST_AdmNo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 text-sm whitespace-nowrap">
                         {student.ASMCL_ClassName}
                      </span>
                      <span className="text-slate-400 font-semibold text-xs mt-0.5">
                         {student.ASMC_SectionName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                        value={student.astc_Remarks || ''} 
                        onValueChange={(val) => handleIndividualRemarkChange(student.AMST_Id, val)}
                        disabled={!student.selected}
                    >
                        <SelectTrigger className={cn(
                            "h-11 rounded-xl border-slate-200 bg-white transition-all",
                            !student.astc_Remarks && student.selected && "border-amber-400 ring-2 ring-amber-50"
                        )}>
                            <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {REMARKS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!student.selected}
                      onClick={() => openEditModal(student)}
                      className={cn(
                        "h-11 w-11 rounded-xl transition-all shadow-sm border",
                        student.selected ? "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50" : "text-slate-300 border-transparent"
                      )}
                    >
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center pt-10">
        <Button
          onClick={handleSave}
          disabled={isSaving || !isAnySelected}
          className="bg-indigo-600 hover:bg-slate-900 text-white font-black py-5 px-24 rounded-full shadow-2xl shadow-indigo-200 transform hover:scale-105 active:scale-95 transition-all h-16 text-lg tracking-tight uppercase"
        >
          {isSaving ? (
            <Loader2 className="mr-3 h-7 w-7 animate-spin" />
          ) : (
            <Save className="mr-3 h-7 w-7" />
          )}
          Request
        </Button>
      </div>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-slate-50">
          <DialogHeader className="p-8 bg-white border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100 shadow-sm">
                 <FileEdit className="w-8 h-8"/>
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight uppercase">Extra TC Details</DialogTitle>
                <p className="text-slate-400 font-bold text-xs mt-1 tracking-widest uppercase">Student: {editingStudent?.StudentName} • ID: {editingStudent?.AMST_AdmNo}</p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] p-8">
            {editingStudent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Fields */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                     <span className="w-5 h-px bg-indigo-200"></span> Academic & Records
                   </h4>
                   
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Working Days</label>
                    <Input 
                      type="number"
                      value={editingStudent.astc_WorkingDays}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_WorkingDays: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Attended Days</label>
                    <Input 
                      type="number"
                      value={editingStudent.astc_AttendedDays}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_AttendedDays: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Result Status</label>
                    <Input 
                      placeholder="e.g. Pass, Promoted"
                      value={editingStudent.astc_Result}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_Result: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Result Details</label>
                    <Input 
                      placeholder="e.g. First Division"
                      value={editingStudent.astc_ResultDetails}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_ResultDetails: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Subjects Studied</label>
                    <Input 
                      placeholder="e.g. Math, Science, Eng..."
                      value={editingStudent.astc_SubjectsStudied}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_SubjectsStudied: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Behavioral & Admin Fields */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                     <span className="w-5 h-px bg-amber-200"></span> Behavioral & Administration
                   </h4>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Leaving Reason</label>
                    <Input 
                      placeholder="e.g. Transfer, Higher Studies"
                      value={editingStudent.astc_LeavingReason}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_LeavingReason: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">General Conduct</label>
                    <Select 
                      value={editingStudent.astc_Conduct} 
                      onValueChange={(val) => setEditingStudent({...editingStudent, astc_Conduct: val})}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Select Conduct" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CONDUCT_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Promotion Requested</label>
                    <Select 
                      value={editingStudent.astc_Qual_PromotionFlag} 
                      onValueChange={(val) => setEditingStudent({...editingStudent, astc_Qual_PromotionFlag: val})}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Select Flag" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {PROMOTION_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 ml-1">Scholarship Details</label>
                    <Input 
                      value={editingStudent.astc_Scholarship}
                      onChange={(e) => setEditingStudent({...editingStudent, astc_Scholarship: e.target.value})}
                      className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Extended Details */}
                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Medium of Instruction</label>
                        <Input value={editingStudent.astc_MediumOfINStruction} onChange={(e) => setEditingStudent({...editingStudent, astc_MediumOfINStruction: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Languages Studied</label>
                        <Input value={editingStudent.astc_LanguageStudied} onChange={(e) => setEditingStudent({...editingStudent, astc_LanguageStudied: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Electives</label>
                        <Input value={editingStudent.astc_ElectivesStudied} onChange={(e) => setEditingStudent({...editingStudent, astc_ElectivesStudied: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Medical Exam Status</label>
                        <Input value={editingStudent.astc_MedicallyExam} onChange={(e) => setEditingStudent({...editingStudent, astc_MedicallyExam: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">NCC/Scout Details</label>
                        <Input value={editingStudent.astc_NCCDetails} onChange={(e) => setEditingStudent({...editingStudent, astc_NCCDetails: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Extra Activities</label>
                        <Input value={editingStudent.astc_ExtraActivities} onChange={(e) => setEditingStudent({...editingStudent, astc_ExtraActivities: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Fees Paid (Total)</label>
                        <Input type="number" value={editingStudent.astc_FeePaid} onChange={(e) => setEditingStudent({...editingStudent, astc_FeePaid: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Fee Concession</label>
                        <Input value={editingStudent.astc_FeeConcession} onChange={(e) => setEditingStudent({...editingStudent, astc_FeeConcession: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">Last Exam Details</label>
                        <Input value={editingStudent.astc_LastExamDetails} onChange={(e) => setEditingStudent({...editingStudent, astc_LastExamDetails: e.target.value})} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                 </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3 rounded-b-[2.5rem]">
             <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
              >
                Discard
              </Button>
              <Button
                onClick={saveDetails}
                className="h-12 px-12 rounded-xl bg-indigo-600 text-white hover:bg-slate-900 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Sync Details
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
