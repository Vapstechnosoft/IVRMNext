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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, RotateCcw, Loader2, Users, Briefcase } from 'lucide-react';
import {
  ndaPhotoFilterSchema,
  type NdaPhotoFilterFields,
} from '@/schemas/admission/preadmission/masters/nda-student-photo-approval';
import { useEffect } from 'react';

interface NdaStudentPhotoSearchProps {
  academicList: any[];
  classList: any[];
  sectionList: any[];
  onSubmit: (data: any) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function NdaStudentPhotoSearch({
  academicList,
  classList,
  sectionList,
  onSubmit,
  onReset,
  isLoading,
}: NdaStudentPhotoSearchProps) {
  const form = useForm<NdaPhotoFilterFields>({
    resolver: zodResolver(ndaPhotoFilterSchema),
    defaultValues: {
      type: 'Student',
      academic_year: '',
      classname: '',
      sectionname: '',
    },
  });

  const { watch, setValue, reset } = form;
  const selectionType = watch('type');

  // Set default academic year if list exists
  useEffect(() => {
    if (academicList?.length > 0 && !form.getValues('academic_year')) {
      const selectedYear = academicList.find(y => y.Selected === true) || academicList[0];
      setValue('academic_year', selectedYear.asmaY_Id.toString());
    }
  }, [academicList, setValue, form]);

  const handleFormReset = () => {
    reset({
      type: 'Student',
      academic_year: academicList.find(y => y.Selected === true)?.asmaY_Id.toString() || academicList[0]?.asmaY_Id.toString() || '',
      classname: '',
      sectionname: '',
    });
    onReset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Type Selection */}
        <div className="flex justify-center pb-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    className="flex p-2 bg-slate-100/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-200"
                  >
                    <FormItem className="flex items-center space-x-0 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Student" className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 font-bold tracking-tight ${
                          field.value === 'Student'
                            ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Users className={`w-5 h-5 ${field.value === 'Student' ? 'animate-pulse' : ''}`} />
                        STUDENT
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-0 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Staff" className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 font-bold tracking-tight ${
                          field.value === 'Staff'
                            ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Briefcase className={`w-5 h-5 ${field.value === 'Staff' ? 'animate-pulse' : ''}`} />
                        STAFF
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Filters - Only for Student */}
        {selectionType === 'Student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Academic Year</FormLabel>
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
                  <FormLabel className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {classList?.map((cls) => (
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
                  <FormLabel className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Section</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-700">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {sectionList?.map((section) => (
                        <SelectItem key={section.asmS_Id} value={section.asmS_Id.toString()} className="focus:bg-indigo-50 focus:text-indigo-700 font-bold py-3 px-4 rounded-xl mx-1 my-1">
                          {section.asmC_SectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-6 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-tighter shadow-xl shadow-indigo-200 transform hover:scale-105 active:scale-95 transition-all text-base"
          >
            {isLoading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Search className="mr-3 h-5 w-5" />
            )}
            {selectionType === 'Student' ? 'FETCH STUDENTS' : 'FETCH STAFF'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleFormReset}
            className="h-14 px-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black tracking-tighter transform hover:scale-105 active:scale-95 transition-all text-base bg-white"
          >
            <RotateCcw className="mr-3 h-5 w-5" />
            RESET
          </Button>
        </div>
      </form>
    </Form>
  );
}
