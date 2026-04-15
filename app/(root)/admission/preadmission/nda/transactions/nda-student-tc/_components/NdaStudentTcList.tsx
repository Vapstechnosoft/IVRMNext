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
import { Save, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export function NdaStudentTcList({ students, onSave, isSaving }: NdaStudentTcListProps) {
  const [studentList, setStudentList] = useState<any[]>(
    students.map(s => ({
      ...s,
      selected: false,
      ASTC_Remarks: '',
      ASTC_TCApplicationDate: null,
      ASTC_TCDate: null,
    }))
  );
  const [allRemarks, setAllRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
            ASTC_Remarks: selected ? s.ASTC_Remarks : null, // Clear remarks on deselect as per legacy
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
        ASTC_Remarks: checked ? s.ASTC_Remarks : null, // Clear remarks if deselected all
      }))
    );
  };

  const handleRemarkChange = (id: number, remark: string) => {
    setStudentList((prev) =>
      prev.map((s) => (s.AMST_Id === id ? { ...s, ASTC_Remarks: remark === 'none' ? null : remark } : s))
    );
  };

  const applyAllRemarks = (remark: string) => {
    setAllRemarks(remark === 'none' ? '' : remark);
    setStudentList((prev) =>
      prev.map((s) => {
        if (s.selected) {
          return { ...s, ASTC_Remarks: remark === 'none' ? null : remark };
        }
        return s;
      })
    );
  };

  const handleSave = () => {
    const selected = studentList.filter((s) => s.selected);
    if (selected.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const missingRemarks = selected.filter((s) => !s.ASTC_Remarks || s.ASTC_Remarks === '');
    if (missingRemarks.length > 0) {
      toast.error('Please select remarks for all selected students');
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 shadow-sm">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-bold text-indigo-900 mb-2 block">Search Students</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
            <Input
              placeholder="Search by name or adm no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-indigo-100 focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-sm font-bold text-red-600 mb-2 block">Remarks for All Selected</label>
          <Select 
            value={allRemarks} 
            onValueChange={applyAllRemarks} 
            disabled={!isAnySelected}
          >
            <SelectTrigger className="h-12 rounded-2xl bg-white border-indigo-100 focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="-- Select --" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-indigo-100 shadow-xl overflow-hidden">
              <SelectItem value="none" disabled className="text-gray-400 py-3">Select Remark</SelectItem>
              {REMARKS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt} className="focus:bg-indigo-50 focus:text-indigo-700 font-medium py-3">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <TableRow className="border-b border-gray-100 hover:bg-transparent h-16">
                <TableHead className="w-16 text-center font-black text-gray-700">SL.NO</TableHead>
                <TableHead className="w-16 text-center">
                  <div className="flex justify-center items-center">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={(checked) => handleToggleAll(!!checked)}
                      className="border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-md h-5 w-5"
                    />
                  </div>
                </TableHead>
                <TableHead className="font-black text-gray-700">Student Name</TableHead>
                <TableHead className="font-black text-gray-700">Adm No.</TableHead>
                <TableHead className="font-black text-gray-700">Class</TableHead>
                <TableHead className="font-black text-gray-700">Section</TableHead>
                <TableHead className="w-64 font-black text-gray-700">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, idx) => (
                <TableRow 
                  key={student.AMST_Id} 
                  className={cn(
                    "h-20 border-b border-gray-50 transition-all duration-300",
                    student.selected ? "bg-indigo-50/30" : "hover:bg-gray-50/50"
                  )}
                >
                  <TableCell className="text-center font-medium text-gray-500 italic">{idx + 1}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                      <Checkbox 
                        checked={student.selected} 
                        onCheckedChange={() => handleToggle(student.AMST_Id)} 
                        className="border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-md h-5 w-5"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{student.StudentName}</TableCell>
                  <TableCell className="font-black text-indigo-600 tracking-wider">{student.AMST_AdmNo}</TableCell>
                  <TableCell className="font-medium text-slate-600">{student.ASMCL_ClassName}</TableCell>
                  <TableCell className="font-medium text-slate-600">{student.ASMC_SectionName}</TableCell>
                  <TableCell>
                    <Select 
                      value={student.ASTC_Remarks} 
                      onValueChange={(val) => handleRemarkChange(student.AMST_Id, val)}
                      disabled={!student.selected}
                    >
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl transition-all",
                        student.selected ? "bg-white border-indigo-200 focus:ring-2 focus:ring-indigo-500" : "bg-gray-100 border-transparent text-gray-400"
                      )}>
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-indigo-100 shadow-xl overflow-hidden">
                        {REMARKS_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt} className="focus:bg-indigo-50 focus:text-indigo-700 font-medium py-3">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <Button
          onClick={handleSave}
          disabled={isSaving || !isAnySelected}
          className="bg-green-600 hover:bg-green-700 text-white font-black py-4 px-16 rounded-full shadow-2xl shadow-green-200 transform hover:scale-105 active:scale-95 transition-all h-14 text-lg"
        >
          {isSaving ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <Save className="mr-3 h-6 w-6" />
          )}
          SEND REQUEST
        </Button>
      </div>
    </div>
  );
}
