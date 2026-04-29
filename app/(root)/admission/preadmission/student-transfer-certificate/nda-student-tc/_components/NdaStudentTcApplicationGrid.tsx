'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Save, X, Loader2 } from 'lucide-react';

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

interface NdaStudentTcApplicationGridProps {
    students: any[];
    onSave: (selectedStudents: any[]) => void;
    isSaving: boolean;
}

export function NdaStudentTcApplicationGrid({ students: initialStudents, onSave, isSaving }: NdaStudentTcApplicationGridProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allSelected, setAllSelected] = useState(false);
    const [bulkRemark, setBulkRemark] = useState('');

    useEffect(() => {
        setStudents(initialStudents.map(s => ({
            ...s,
            selected: false,
            ASTC_TCApplicationDate: null,
            ASTC_TCDate: null,
            ASTC_Remarks: ''
        })));
    }, [initialStudents]);

    const filteredStudents = students.filter(s => 
        s.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.AMST_AdmNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
        setAllSelected(checked);
        const today = new Date();
        setStudents(prev => prev.map(s => {
            const isMatch = filteredStudents.some(fs => fs.AMST_Id === s.AMST_Id);
            if (isMatch) {
                return {
                    ...s,
                    selected: checked,
                    ASTC_TCApplicationDate: checked ? today : null,
                    ASTC_TCDate: checked ? today : null
                };
            }
            return s;
        }));
    };

    const handleSelectionChange = (studentId: number, checked: boolean) => {
        const today = new Date();
        setStudents(prev => prev.map(s => 
            s.AMST_Id === studentId 
                ? { 
                    ...s, 
                    selected: checked,
                    ASTC_TCApplicationDate: checked ? today : null,
                    ASTC_TCDate: checked ? today : null
                  } 
                : s
        ));
    };

    const handleRemarkChange = (studentId: number, remark: string) => {
        setStudents(prev => prev.map(s => 
            s.AMST_Id === studentId ? { ...s, ASTC_Remarks: remark } : s
        ));
    };

    const applyBulkRemark = (remark: string) => {
        setBulkRemark(remark);
        if (remark) {
            setStudents(prev => prev.map(s => 
                s.selected ? { ...s, ASTC_Remarks: remark } : s
            ));
        }
    };

    const handleSave = () => {
        const selected = students.filter(s => s.selected);
        if (selected.length === 0) return;
        onSave(selected);
    };

    const isAnySelected = students.some(s => s.selected);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                <div className="w-full md:w-1/3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Filter by name or adm no..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white border-slate-200 h-10 rounded-xl"
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest pl-1">Apply Remarks to Selected</label>
                    <Select onValueChange={applyBulkRemark} value={bulkRemark} disabled={!isAnySelected}>
                        <SelectTrigger className="bg-white border-slate-200 h-11 rounded-xl shadow-sm focus:ring-indigo-500/20 disabled:opacity-50">
                            <SelectValue placeholder="-- Select Bulk Remark --" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NO_REMARK">-- Reset --</SelectItem>
                            {REMARKS_OPTIONS.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl ring-1 ring-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-slate-200 hover:bg-slate-50">
                            <TableHead className="w-16 text-center font-bold text-slate-700">SL.</TableHead>
                            <TableHead className="w-16 text-center">
                                <Checkbox 
                                    checked={allSelected} 
                                    onCheckedChange={handleSelectAll} 
                                    className="border-slate-300 data-[state=checked]:bg-indigo-600 shadow-sm"
                                />
                            </TableHead>
                            <TableHead className="font-bold text-slate-700">Student Name</TableHead>
                            <TableHead className="font-bold text-slate-700">Adm No.</TableHead>
                            <TableHead className="font-bold text-slate-700">Class (Section)</TableHead>
                            <TableHead className="font-bold text-slate-700 min-w-[200px]">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((s, index) => (
                                <TableRow key={s.AMST_Id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox 
                                            checked={s.selected} 
                                            onCheckedChange={(checked) => handleSelectionChange(s.AMST_Id, checked as boolean)}
                                            className="border-slate-300 data-[state=checked]:bg-indigo-600 shadow-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-950">{s.StudentName}</TableCell>
                                    <TableCell className="font-medium text-indigo-600">{s.AMST_AdmNo}</TableCell>
                                    <TableCell className="text-slate-600 font-medium">
                                        {s.ASMCL_ClassName} ({s.ASMC_SectionName})
                                    </TableCell>
                                    <TableCell>
                                        <Select 
                                            onValueChange={(val) => handleRemarkChange(s.AMST_Id, val)} 
                                            value={s.ASTC_Remarks || ''}
                                            disabled={!s.selected}
                                        >
                                            <SelectTrigger className="bg-white border-slate-200 h-9 rounded-lg shadow-sm focus:ring-indigo-500/20 disabled:bg-slate-50/50">
                                                <SelectValue placeholder="-- Select --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {REMARKS_OPTIONS.map(r => (
                                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-400 font-medium">
                                    No students found for the current selection.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
                <Button 
                    onClick={handleSave} 
                    disabled={!isAnySelected || isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px] h-12 rounded-full shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all font-black text-lg"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> SEND REQUEST</>}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => setStudents([])} 
                    className="min-w-[140px] h-12 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                    <X className="mr-2 h-5 w-5" /> REJECT ALL
                </Button>
            </div>
        </div>
    );
}
