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

import { Search, RotateCcw, Loader2, Users, Printer } from 'lucide-react';
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
  initialClassList: any[];
  onSubmit: (data: any, selectedStudents: any[]) => void;
  onReset: () => void;
  onPrint: () => void;
  showPrint: boolean;
  isLoading: boolean;
}

export function StudentIdCardSearch({
  academicList,
  initialClassList,
  onSubmit,
  onReset,
  onPrint,
  showPrint,
  isLoading,
}: StudentIdCardSearchProps) {
  const [classList, setClassList] = useState<any[]>(initialClassList || []);
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
          const records = res?.getClassList || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
          setClassList(records);
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
          const records = res?.getSectionList || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
          setSectionList(records);
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
          const records = res?.getStudentList || res?.studentList || res?.studentlist || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
          setStudentList(records.map((s: any) => ({ ...s, selected: true })));
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
    setClassList(initialClassList || []);
    setSectionList([]);
    setStudentList([]);
    onReset();
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-indigo-700 uppercase">STUDENT ID CARD DETAILS</h2>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Toggle</span>
          <div className="h-0.5 w-3 bg-slate-500" />
        </Button>
      </div>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Filters Column */}
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="academic_year"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-4 space-y-0">
                      <FormLabel className="text-right text-sm font-medium text-slate-700">
                        Academic Year :<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 bg-white border-blue-400/50 text-slate-700 rounded shadow-none focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="--Select Academic Year--" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicList?.map((year, index) => (
                            <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()}>
                              {year.asmaY_Year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="col-start-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classname"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-4 space-y-0">
                      <FormLabel className="text-right text-sm font-medium text-slate-700">
                        Class :<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={classList.length === 0}>
                        <FormControl>
                          <SelectTrigger className="h-9 bg-white border-blue-400/50 text-slate-700 rounded shadow-none focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder={classMutation.isPending ? "Loading..." : "--Select Class--"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classList.map((cls, index) => (
                            <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                              {cls.asmcL_ClassName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="col-start-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sectionname"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-4 space-y-0">
                      <FormLabel className="text-right text-sm font-medium text-slate-700">
                        Section :<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={sectionList.length === 0}>
                        <FormControl>
                          <SelectTrigger className="h-9 bg-white border-blue-400/50 text-slate-700 rounded shadow-none focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder={sectionMutation.isPending ? "Loading..." : "--Select Section--"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectionList.map((sec, index) => (
                            <SelectItem key={`${sec.asmS_Id}-${index}`} value={sec.asmS_Id.toString()}>
                              {sec.asmC_SectionName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="col-start-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="house"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-4 space-y-0">
                      <FormLabel className="text-right text-sm font-medium text-slate-700">
                        HOUSE :<span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 bg-white border-blue-400/50 text-slate-700 rounded shadow-none focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="--Select HOUSE--" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WHITE">WHITE</SelectItem>
                          <SelectItem value="YELLOW">JULIE (YELLOW)</SelectItem>
                          <SelectItem value="BLUE">PROVIDENCE (BLUE)</SelectItem>
                          <SelectItem value="RED">ELTING (RED)</SelectItem>
                          <SelectItem value="GREEN">LISETTE (GREEN)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="col-start-2" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Student Picker Column */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id="all-students"
                    checked={studentList.length > 0 && studentList.every(s => s.selected)}
                    onChange={(e) => toggleAllStudents(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-400 cursor-pointer"
                  />
                  <label htmlFor="all-students" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Student : <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="border border-blue-400/50 rounded flex flex-col h-[180px] bg-white">
                  <div className="p-2 border-b border-blue-100">
                    <Input
                      placeholder="search here..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="h-8 border-slate-300 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {filteredStudents.length > 0 ? (
                      <div className="space-y-1">
                        {filteredStudents.map((student, index) => (
                          <div
                            key={`${student.amsT_Id}-${index}`}
                            className="flex items-start gap-2 py-1 px-1 hover:bg-slate-50 rounded"
                          >
                            <input
                              type="checkbox"
                              id={`student-${student.amsT_Id}`}
                              checked={student.selected}
                              onChange={(e) => toggleStudent(student.amsT_Id, e.target.checked)}
                              className="h-4 w-4 rounded-sm border-slate-400 mt-0.5 cursor-pointer"
                            />
                            <label 
                              htmlFor={`student-${student.amsT_Id}`}
                              className="text-sm text-slate-700 cursor-pointer flex-1 leading-tight"
                            >
                              {student.studentName}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p className="text-xs">No students found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-6 pb-2 border-t border-slate-200 mt-6">
              <Button
                type="submit"
                disabled={isLoading || studentMutation.isPending}
                className="bg-[#3f51b5] hover:bg-[#303f9f] text-white px-8 rounded-sm font-medium shadow-sm transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                REPORT
              </Button>

              <Button
                type="button"
                onClick={handleFormReset}
                className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-8 rounded-sm font-medium shadow-sm transition-colors"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                CANCEL
              </Button>

              {showPrint && (
                <Button
                  type="button"
                  onClick={onPrint}
                  className="bg-[#ff9800] hover:bg-[#f57c00] text-white px-8 rounded-sm font-medium shadow-sm transition-colors"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  PRINT
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
