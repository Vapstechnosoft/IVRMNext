'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTable } from '@/components/ui/data-table';
import { IClassWorkMarksList, classWorkMarksListSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { fetchClassWorkStudents, saveClassWorkMarks } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { useFormContext } from '@/components/ui/form/form-provider';
import { ColumnDef } from '@tanstack/react-table';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, RefreshCw, Save, X, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { verifyGridColumns } from './columns';
import { cn } from '@/lib/utils';

interface MarksEntryFormProps {
    initialResults: any[];
    topics: any[];
}

export default function MarksEntryForm({ initialResults, topics }: MarksEntryFormProps) {
    const { selectedRow, openDetailsView, closeDetailsView } = useFormContext<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<IClassWorkMarksList>({
        resolver: zodResolver(classWorkMarksListSchema),
        mode: 'onChange',
        defaultValues: {
            icW_Id: 0,
            students: []
        }
    });

    const { fields } = useFieldArray({
        control,
        name: 'students'
    });

    const loadStudents = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await fetchClassWorkStudents(id);
            if (response.success && response.data?.studentList) {
                const students = response.data.studentList.map((s: any) => ({
                    amst_Id: s.amsT_Id,
                    studentName: s.studentName,
                    rollNo: s.rollNo?.toString(),
                    admNo: s.admNo,
                    icwupl_Id: s.icwupl_Id,
                    icwupl_Marks: s.icwupl_Marks?.toString() || '',
                    icwupl_StaffRemarks: s.icwupl_StaffRemarks || '',
                    icwupl_StaffUpload: s.icwupl_StaffUpload || '',
                    icwupl_FileName: s.icwupl_FileName || '',
                    checked: false,
                    studentUploads: s.studentUploads || []
                }));
                
                reset({
                    icW_Id: id,
                    students: students
                });
            } else {
                toast.error(response.message || 'Failed to load students');
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    // React to global selection changes
    useEffect(() => {
        if (selectedRow?.icW_Id || selectedRow?.ICW_Id) {
            loadStudents(selectedRow.icW_Id || selectedRow.ICW_Id);
        }
    }, [selectedRow]);

    const onSubmit: SubmitHandler<IClassWorkMarksList> = async (data) => {
        try {
            setIsSubmitting(true);
            const checkedStudents = data.students.filter(s => s.checked);

            if (checkedStudents.length === 0) {
                toast.warning('Please select at least one student to save.');
                return;
            }

            const payload = {
                ICW_Id: data.icW_Id,
                classwork_marks_list: checkedStudents.map(s => ({
                    AMST_Id: s.amst_Id,
                    ICWUPL_Marks: s.icwupl_Marks,
                    ICWUPL_StaffRemarks: s.icwupl_StaffRemarks,
                    ICWUPL_StaffUpload: s.icwupl_StaffUpload,
                    ICWUPL_FileName: s.icwupl_FileName,
                    ICWUPL_Id: s.icwupl_Id
                }))
            };

            const result = await saveClassWorkMarks(payload);
            if (result.success) {
                toast.success(result.message || 'Marks saved successfully');
                handleClose();
            } else {
                toast.error(result.message || 'Failed to save marks');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save marks');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectRecord = (record: any) => {
        openDetailsView(record);
    };

    const handleReset = () => {
        if (selectedRow?.icW_Id || selectedRow?.ICW_Id) {
            loadStudents(selectedRow.icW_Id || selectedRow.ICW_Id);
            toast.info('Form reset to original values');
        }
    };

    const handleClose = () => {
        closeDetailsView();
        reset({ icW_Id: 0, students: [] });
    };

    if (!selectedRow) {
        return (
            <div className='space-y-4'>
                <div className='flex items-center justify-between bg-slate-100 p-2 rounded-t-md border-x border-t'>
                    <h3 className='text-xs font-black uppercase text-slate-600 px-2'>Search Results</h3>
                    <span className='text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm border uppercase'>
                        Matches: {initialResults.length}
                    </span>
                </div>
                <DataTable<any, any>
                    columns={verifyGridColumns.map((col: any) => {
                        if (col.id === 'actions') {
                            return {
                                ...col,
                                cell: ({ row }: any) => (
                                    <div className='flex justify-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => handleSelectRecord(row.original)}
                                            className='text-blue-600 hover:bg-blue-50'
                                            title='Enter Marks'
                                        >
                                            <Database className='h-4 w-4' />
                                        </Button>
                                    </div>
                                )
                            };
                        }
                        return col;
                    }) as any} 
                    data={initialResults} 
                    totalItems={initialResults.length}
                />
            </div>
        );
    }

    return (
        <div className='flex w-full flex-col gap-4 rounded-md border bg-white p-4 shadow-sm animate-in fade-in duration-500'>
            <div className='flex items-center justify-between border-b pb-4 bg-slate-50/50 p-2 rounded-t-md'>
                <div>
                    <h2 className='text-lg font-black uppercase text-blue-800'>Student Mark Verification</h2>
                    <div className='flex gap-4 mt-1'>
                        <p className='text-[10px] font-bold text-slate-500 uppercase'>
                            Topic: <span className='text-slate-700'>{selectedRow.icW_Topic || selectedRow.ICW_Topic}</span>
                        </p>
                        <p className='text-[10px] font-bold text-slate-500 uppercase'>
                            Subject: <span className='text-slate-700'>{selectedRow.ismS_SubjectName || selectedRow.ISMS_SubjectName}</span>
                        </p>
                    </div>
                </div>
                <Button variant='ghost' size='icon' onClick={handleClose} className='hover:bg-red-50 text-red-500'>
                    <X className='h-5 w-5' />
                </Button>
            </div>

            {isLoading ? (
                <div className='flex h-40 flex-col items-center justify-center text-muted-foreground gap-2 font-bold uppercase text-xs text-center'>
                    <RefreshCw className='h-6 w-6 animate-spin text-blue-600' />
                    LOADING STUDENT DETAILS<br/>PLEASE WAIT...
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                    <div className='rounded-md border overflow-hidden shadow-sm'>
                        <Table>
                            <TableHeader className='bg-slate-800'>
                                <TableRow>
                                    <TableHead className='w-[60px] text-white font-black text-[10px] text-center uppercase tracking-tighter'>SELECT</TableHead>
                                    <TableHead className='text-white font-black text-[10px] uppercase'>STUDENT NAME</TableHead>
                                    <TableHead className='text-white font-black text-[10px] uppercase'>ADM NO</TableHead>
                                    <TableHead className='text-white font-black text-[10px] uppercase'>ROLL NO</TableHead>
                                    <TableHead className='text-white font-black text-[10px] text-center uppercase'>STUDENT UPLOAD</TableHead>
                                    <TableHead className='text-white font-black text-[10px] w-[120px] uppercase'>ENTER MARKS</TableHead>
                                    <TableHead className='text-white font-black text-[10px] uppercase'>STAFF REMARKS</TableHead>
                                    <TableHead className='text-white font-black text-[10px] uppercase'>STAFF UPLOAD</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className='text-center py-10 text-slate-400 font-bold'>NO STUDENTS FOUND</TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map((field, index) => {
                                        const isChecked = watch(`students.${index}.checked`);
                                        return (
                                            <TableRow key={field.id} className={cn(isChecked ? 'bg-blue-50/50' : '')}>
                                                <TableCell className='text-center'>
                                                    <Controller
                                                        name={`students.${index}.checked`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                type='checkbox'
                                                                checked={field.value}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                                className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm'
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className='text-[11px] font-bold text-slate-700 uppercase'>{watch(`students.${index}.studentName`)}</TableCell>
                                                <TableCell className='text-[11px] font-medium text-slate-500'>{watch(`students.${index}.admNo`)}</TableCell>
                                                <TableCell className='text-[11px] font-medium text-slate-500 text-center'>{watch(`students.${index}.rollNo`)}</TableCell>
                                                <TableCell>
                                                    <div className='flex flex-wrap gap-1 justify-center'>
                                                        {watch(`students.${index}.studentUploads`)?.map((upload: any, uIdx: number) => (
                                                            <Button
                                                                key={upload.icwupl_Id || uIdx}
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-[10px] font-black border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all"
                                                                onClick={() => {
                                                                    if (upload.icwupl_Attachment) {
                                                                        window.open(upload.icwupl_Attachment, '_blank');
                                                                    } else {
                                                                        toast.error('No attachment link available.');
                                                                    }
                                                                }}
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                FILE {uIdx + 1}
                                                            </Button>
                                                        ))}
                                                        {(!watch(`students.${index}.studentUploads`) || watch(`students.${index}.studentUploads`)?.length === 0) && (
                                                            <span className="text-[10px] text-slate-300 italic font-medium">None</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='group flex flex-col gap-1'>
                                                        <input
                                                            type="text"
                                                            {...register(`students.${index}.icwupl_Marks`)}
                                                            placeholder="0.00"
                                                            className='h-8 w-full rounded border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-center text-blue-800 shadow-sm focus:border-blue-500 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-300'
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='group flex flex-col gap-1'>
                                                        <textarea
                                                            {...register(`students.${index}.icwupl_StaffRemarks`)}
                                                            placeholder="Enter remarks..."
                                                            rows={1}
                                                            className='min-h-[32px] w-full rounded border-slate-200 bg-white px-2 py-1 text-[11px] shadow-sm focus:border-blue-500 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-300 font-medium'
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            {...register(`students.${index}.icwupl_StaffUpload`)}
                                                            placeholder="External Link / URL"
                                                            className='h-8 flex-1 rounded border-slate-200 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-blue-500 focus:outline-none transition-all disabled:bg-slate-50 font-medium'
                                                            disabled={!isChecked}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-20"
                                                            disabled={!isChecked || !watch(`students.${index}.icwupl_StaffUpload`)}
                                                            onClick={() => {
                                                                const url = watch(`students.${index}.icwupl_StaffUpload`);
                                                                if (url) window.open(url, '_blank');
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='flex items-center gap-4 border-t pt-4 bg-slate-50/70 p-4 rounded-b-md border-x border-b'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='bg-emerald-600 text-white hover:bg-emerald-700 min-w-[150px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all'
                            isLoading={isSubmitting}
                            loadingText='SAVING...'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE MARKS
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className='border-blue-200 text-blue-600 hover:bg-blue-100 min-w-[130px] font-black uppercase tracking-widest active:scale-95 transition-all bg-white font-bold'>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            RESET FORM
                        </Button>
                        
                        <div className='ml-auto'>
                             <span className='text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase'>
                                Total Students: {fields.length}
                             </span>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}