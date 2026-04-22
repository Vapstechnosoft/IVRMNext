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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, Search, ChevronLeft, ChevronRight, FileText, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NdaStudentTcSummaryProps {
  summaryList: any[];
  onViewPdf: (student: any) => void;
  onViewStatus: (student: any) => void;
  itemsPerPage?: number;
}

export function NdaStudentTcSummary({
  summaryList,
  onViewPdf,
  onViewStatus,
  itemsPerPage = 10,
}: NdaStudentTcSummaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredList = summaryList.filter(s => {
    const name = (s.StudentName ?? s.studentname ?? '').toLowerCase();
    const admNo = (s.AMST_AdmNo ?? s.amst_admno ?? '').toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || admNo.includes(term);
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
             <FileText className="w-5 h-5"/>
          </div>
          STUDENT TC APPLY DETAILS
        </h3>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-11 rounded-2xl border-slate-200 focus:ring-indigo-500 bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 backdrop-blur-md">
              <TableRow className="h-14 border-b border-slate-100">
                <TableHead className="w-20 text-center font-bold text-slate-600 uppercase text-xs tracking-wider">SL.NO</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Student Name</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Adm No.</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Class</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Section</TableHead>
                <TableHead className="w-32 text-center font-bold text-slate-600 uppercase text-xs tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((student, idx) => (
                  <TableRow key={`${student.AMST_Id ?? student.amst_id}-${startIdx + idx}`} className="h-16 hover:bg-indigo-50/30 transition-colors border-b border-slate-50">
                    <TableCell className="text-center font-medium text-slate-400">
                      {startIdx + idx + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">
                      {student.StudentName ?? student.studentname}
                    </TableCell>
                    <TableCell className="font-black text-indigo-600/80 tracking-wide">
                      {student.AMST_AdmNo ?? student.amst_admno}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {student.ASMCL_ClassName ?? student.asmcl_classname}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {student.ASMC_SectionName ?? student.asmc_sectionname}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                         <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewStatus(student)}
                          title="View Status"
                          className="h-9 w-9 rounded-xl hover:bg-amber-100 hover:text-amber-700 text-slate-400 transition-all shadow-sm"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewPdf(student)}
                          title="View TC PDF"
                          className="h-9 w-9 rounded-xl hover:bg-indigo-600 hover:text-white text-indigo-600 transition-all shadow-sm border border-indigo-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                       
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium italic">
                    {searchTerm ? "No matching records found." : "No TC applications found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-white h-10 px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-10 h-10 rounded-xl transition-all font-bold",
                  currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-white h-10 px-4"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
