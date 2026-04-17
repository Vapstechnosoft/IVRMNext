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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Save, X, CheckCircle2, XCircle, Search, User, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface NdaStaffPhotoListProps {
  staff: any[];
  onSave: (selectedStaff: any[]) => void;
  isSaving: boolean;
  onCancel: () => void;
}

export function NdaStaffPhotoList({
  staff: initialStaff,
  onSave,
  isSaving,
  onCancel,
}: NdaStaffPhotoListProps) {
  const [staffList, setStaffList] = useState(
    initialStaff.map((s) => ({
      ...s,
      selected: false,
      ASTUREQ_ConformFlg: s.ASTUREQ_ConformFlg?.toString() || '1',
    }))
  );
  const [searchValue, setSearchValue] = useState('');

  const filteredStaff = staffList.filter(
    (s) =>
      s.StudentName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      s.ASTUREQ_AdmNo?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const toggleAll = (checked: boolean) => {
    setStaffList(staffList.map((s) => ({ ...s, selected: checked })));
  };

  const toggleStaff = (id: number, checked: boolean) => {
    setStaffList(
      staffList.map((s) => (s.ASTUREQ_Id === id ? { ...s, selected: checked } : s))
    );
  };

  const updateStatus = (id: number, value: string) => {
    setStaffList(
      staffList.map((s) => (s.ASTUREQ_Id === id ? { ...s, ASTUREQ_ConformFlg: value } : s))
    );
  };

  const handleSave = () => {
    const selected = staffList.filter((s) => s.selected);
    onSave(selected);
  };

  const allSelected = staffList.length > 0 && staffList.every((s) => s.selected);

  const getStatusStyles = (value: string) => {
    if (value === '1') return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20';
    if (value === '0') return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20';
    return '';
  };

  return (
    <div className="space-y-8">
      {/* List Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <Briefcase className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight"> STAFF PHOTO APPROVALS</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                Found {filteredStaff.length} staff records
              </p>
           </div>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search employee or ID..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm group-hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="rounded-[2rem] border-none shadow-2xl bg-white/40 backdrop-blur-md overflow-hidden ring-1 ring-slate-200/50">
        <Table>
          <TableHeader className="bg-slate-100/50">
            <TableRow className="border-slate-200/60 hover:bg-transparent">
              <TableHead className="w-14 text-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
              </TableHead>
              <TableHead className="w-16 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">SL.NO</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Employee Details</TableHead>
              <TableHead className="text-center font-bold text-slate-500 uppercase text-[10px] tracking-widest">Employee Photo</TableHead>
              <TableHead className="text-center font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((item, index) => (
              <TableRow key={item.ASTUREQ_Id} className="border-slate-100 transition-colors hover:bg-white/60 group">
                <TableCell className="text-center">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => toggleStaff(item.ASTUREQ_Id, !!checked)}
                    className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                </TableCell>
                <TableCell className="text-center font-medium text-slate-400">{index + 1}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-black text-slate-800 tracking-tight leading-none">{item.StudentName}</p>
                    <Badge variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-600 rounded-lg py-0.5 font-bold tracking-tight text-[10px]">
                      {item.ASTUREQ_AdmNo}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="p-4 flex justify-center">
                   <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-500">
                    {item.ASTUREQ_StudentPhoto ? (
                      <img src={item.ASTUREQ_StudentPhoto} alt={item.StudentName} className="w-full h-full object-cover transform hover:scale-125 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                         <User className="w-16 h-16 opacity-50" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Select
                    disabled={!item.selected}
                    value={item.ASTUREQ_ConformFlg}
                    onValueChange={(val) => updateStatus(item.ASTUREQ_Id, val)}
                  >
                    <SelectTrigger className={`h-12 w-48 mx-auto rounded-xl text-xs font-black tracking-tight transition-all duration-300 ${getStatusStyles(item.ASTUREQ_ConformFlg)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl overflow-hidden font-bold">
                      <SelectItem value="1" className="focus:bg-emerald-50 focus:text-emerald-700 py-3">
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            APPROVED
                         </div>
                      </SelectItem>
                      <SelectItem value="0" className="focus:bg-rose-50 focus:text-rose-700 py-3">
                         <div className="flex items-center gap-3">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            REJECTED
                         </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-6 pt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving || staffList.filter((s) => s.selected).length === 0}
          className="h-16 px-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-tighter shadow-2xl shadow-indigo-200 transform hover:scale-105 active:scale-95 transition-all text-lg"
        >
          {isSaving ? (
            <Loader2 className="mr-4 h-6 w-6 animate-spin" />
          ) : (
            <Save className="mr-4 h-6 w-6" />
          )}
          APPROVE RECORDS
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="h-16 px-16 rounded-[2rem] border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black tracking-tighter transform hover:scale-105 active:scale-95 transition-all text-lg bg-white"
        >
          <X className="mr-4 h-6 w-6" />
          CANCEL
        </Button>
      </div>
    </div>
  );
}

function Loader2(props: any) {
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
      className={`lucide lucide-loader-2 ${props.className}`}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}
