'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, RotateCcw, Loader2, Users } from 'lucide-react';
import {
  ndaIdCardFilterSchema,
  type NdaIdCardFilterFields,
} from '@/schemas/admission/preadmission/reports/nda-student-id-card-report';
import { useState, useEffect } from 'react';
import {
  useIdCardClasses,
  useIdCardSections,
  useIdCardStudents,
} from '@/hooks/admission/preadmission/useStudentIdCardReportNda';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface StudentIdCardSearchProps {
  academicList: any[];
  onSubmit: (data: any, selectedStudents: any[]) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function StudentIdCardSearch({
  academicList,
  onSubmit,
  onReset,
  isLoading,
}: StudentIdCardSearchProps) {
  const [classList, setClassList] = useState<any[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const classMutation = useIdCardClasses();
  const sectionMutation = useIdCardSections();
  const studentMutation = useIdCardStudents();

  const form = useForm<NdaIdCardFilterFields>({
    resolver: zodResolver(ndaIdCardFilterSchema),
    defaultValues: {
      academic_year: '',
      classname: '',
      sectionname: '',
      house: '',
    },
  });

  const { watch, setValue } = form;
  const selectedYear = watch('academic_year');
  const selectedClass = watch('classname');
  const selectedSection = watch('sectionname');

  // Load Classes when Year changes
  useEffect(() => {
    async function fetchClasses() {
      if (selectedYear) {
        try {
          const res = (await classMutation.mutateAsync({ ASMAY_Id: Number(selectedYear) })) as any;
          setClassList(res?.getClassList || []);
          setValue('classname', '');
          setValue('sectionname', '');
          setSectionList([]);
          setStudentList([]);
        } catch (error) {
          toast.error('Failed to load classes');
        }
      }
    }
    fetchClasses();
  }, [selectedYear, setValue]);

  // Load Sections when Class changes
  useEffect(() => {
    async function fetchSections() {
      if (selectedYear && selectedClass) {
        try {
          const res = (await sectionMutation.mutateAsync({
            ASMAY_Id: Number(selectedYear),
            ASMCL_Id: Number(selectedClass),
          })) as any;
          setSectionList(res?.getSectionList || []);
          setValue('sectionname', '');
          setStudentList([]);
        } catch (error) {
          toast.error('Failed to load sections');
        }
      }
    }
    fetchSections();
  }, [selectedYear, selectedClass, setValue]);

  // Load Students when Section changes
  useEffect(() => {
    async function fetchStudents() {
      if (selectedYear && selectedClass && selectedSection) {
        try {
          const res = (await studentMutation.mutateAsync({
            ASMAY_Id: Number(selectedYear),
            ASMCL_Id: Number(selectedClass),
            ASMS_Id: Number(selectedSection),
          })) as any;
          const students = res?.getStudentList || [];
          setStudentList(students.map((s: any) => ({ ...s, selected: true })));
        } catch (error) {
          toast.error('Failed to load students');
        }
      }
    }
    fetchStudents();
  }, [selectedYear, selectedClass, selectedSection]);

  const toggleAllStudents = (checked: boolean) => {
    setStudentList(studentList.map((s) => ({ ...s, selected: checked })));
  };

  const toggleStudent = (id: number, checked: boolean) => {
    setStudentList(
      studentList.map((s) => (s.amsT_Id === id ? { ...s, selected: checked } : s))
    );
  };

  const filteredStudents = studentList.filter((s) =>
    s.studentName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleFormSubmit = (data: NdaIdCardFilterFields) => {
    const selected = studentList.filter((s) => s.selected);
    if (selected.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    onSubmit(data, selected);
  };

  const handleFormReset = () => {
    form.reset();
    setClassList([]);
    setSectionList([]);
    setStudentList([]);
    onReset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Filters Column */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Academic Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {academicList?.map((year) => (
                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className="focus:bg-indigo-50 focus:text-indigo-700 font-bold py-3 px-4 rounded-xl mx-1 my-1">
                          {year.asmaY_Year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={classList.length === 0}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder={classMutation.isPending ? "Loading..." : "Select Class"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {classList.map((cls) => (
                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()} className="focus:bg-indigo-50 focus:text-indigo-700 font-bold py-3 px-4 rounded-xl mx-1 my-1">
                          {cls.asmcL_ClassName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sectionname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Section</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={sectionList.length === 0}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder={sectionMutation.isPending ? "Loading..." : "Select Section"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {sectionList.map((sec) => (
                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()} className="focus:bg-indigo-50 focus:text-indigo-700 font-bold py-3 px-4 rounded-xl mx-1 my-1">
                          {sec.asmC_SectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="house"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">House Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder="Select House" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                        <SelectItem value="WHITE" className="focus:bg-slate-50 py-3 font-bold">WHITE</SelectItem>
                        <SelectItem value="YELLOW" className="focus:bg-yellow-50 focus:text-yellow-700 py-3 font-bold">JULIE (YELLOW)</SelectItem>
                        <SelectItem value="BLUE" className="focus:bg-blue-50 focus:text-blue-700 py-3 font-bold">PROVIDENCE (BLUE)</SelectItem>
                        <SelectItem value="RED" className="focus:bg-red-50 focus:text-red-700 py-3 font-bold">ELTING (RED)</SelectItem>
                        <SelectItem value="GREEN" className="focus:bg-emerald-50 focus:text-emerald-700 py-3 font-bold">LISETTE (GREEN)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Student Picker Column */}
          <div className="bg-slate-50/50 rounded-[2rem] p-8 space-y-4 ring-1 ring-slate-200 shadow-inner">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Users className="w-5 h-5" />
                   </div>
                   <h3 className="font-black text-slate-800 tracking-tight">STUDENT SELECTOR</h3>
                </div>
                <div className="flex items-center gap-2">
                   <Checkbox
                     id="all-students"
                     checked={studentList.length > 0 && studentList.every(s => s.selected)}
                     onCheckedChange={toggleAllStudents}
                     className="rounded-md border-slate-300"
                   />
                   <label htmlFor="all-students" className="text-xs font-black text-slate-500 uppercase tracking-tighter cursor-pointer">
                      Select All
                   </label>
                </div>
             </div>

             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter student name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-slate-200 bg-white/80 focus:bg-white transition-all font-medium"
                />
             </div>

             <div className="h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div
                      key={student.amsT_Id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${
                        student.selected
                          ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      } border`}
                      onClick={() => toggleStudent(student.amsT_Id, !student.selected)}
                    >
                       <span className={`font-bold transition-colors ${student.selected ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {student.studentName}
                       </span>
                       <Checkbox
                         checked={student.selected}
                         onCheckedChange={(checked) => toggleStudent(student.amsT_Id, !!checked)}
                         className="rounded-md"
                       />
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                     <Users className="w-12 h-12 opacity-20" />
                     <p className="font-bold text-xs uppercase tracking-widest text-slate-400">No students found</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 pt-6 translate-y-2">
          <Button
            type="submit"
            disabled={isLoading || studentMutation.isPending}
            className="h-16 px-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-tighter shadow-2xl shadow-indigo-200 transform hover:scale-105 active:scale-95 transition-all text-lg"
          >
            {isLoading ? (
              <Loader2 className="mr-4 h-6 w-6 animate-spin" />
            ) : (
              <Search className="mr-4 h-6 w-6" />
            )}
            GENERATE REPORT
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleFormReset}
            className="h-16 px-16 rounded-[2rem] border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black tracking-tighter transform hover:scale-105 active:scale-95 transition-all text-lg bg-white"
          >
            <RotateCcw className="mr-4 h-6 w-6" />
            RESET
          </Button>
        </div>
      </form>
    </Form>
  );
}
