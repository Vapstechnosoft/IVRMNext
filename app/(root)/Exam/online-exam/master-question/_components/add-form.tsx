'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterQuestion, useSaveMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import { masterQuestionSchema } from '@/schemas/exam/online-exam/masters';
import type { IComplexityDropdown, ISubjectDropdown } from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Beaker, Languages, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterQuestionSchema>;

interface AddMasterQuestionFormProps {
    subjects?: ISubjectDropdown[];
    complexities?: IComplexityDropdown[];
    classes?: any[];
    topics?: any[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function AddMasterQuestionForm({ subjects = [], complexities = [], classes = [], topics = [], onSuccess, onCancel }: AddMasterQuestionFormProps) {
    const { refetch } = useMasterQuestion(undefined, { enabled: false });
    const saveMutation = useSaveMasterQuestion();
    const [fileList, setFileList] = useState<{ fileName: string; filePath: string; fileType: string }[]>([]);
    const [previewFile, setPreviewFile] = useState<{ fileName: string; filePath: string } | null>(null);
    const [classSearch, setClassSearch] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterQuestionSchema),
        defaultValues: {
            lmsmoeQ_Marks: 1,
            options: [],
            classIds: [],
            isTextType: true,
            isMathChemType: false,
            isStructuralType: false,
            subjectiveFlg: false,
            matchTheFollowingFlg: false
        },
        mode: 'onChange'
    });

    const isSubjective = watch('subjectiveFlg');
    const isMatchFollowing = watch('matchTheFollowingFlg');
    const classIds = watch('classIds') || [];
    const selectedSubjectId = watch('ismS_Id');

    const filteredClasses = classes.filter((c: any) => {
        const name = c.asmcL_ClassName ?? c.className ?? c.name ?? '';
        return name.toLowerCase().includes(classSearch.toLowerCase());
    });

    const topicList = Array.isArray(topics) ? topics : (topics as any)?.$values || [];
    const filteredTopics = topicList.filter((t: any) => {
        if (!selectedSubjectId) return true;
        const subId = Number(t.ismS_Id ?? t.isms_Id ?? t.ISMS_Id ?? 0);
        return subId === 0 || subId === Number(selectedSubjectId);
    });

    const displayTopics = filteredTopics.length > 0 ? filteredTopics : topicList;

    const handleClassToggle = (id: number) => {
        if (classIds.includes(id)) {
            setValue('classIds', classIds.filter((cid) => cid !== id), { shouldValidate: true });
        } else {
            setValue('classIds', [...classIds, id], { shouldValidate: true });
        }
    };

    const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setFileList((prev) => [
                ...prev,
                {
                    fileName: file.name,
                    filePath: objectUrl,
                    fileType: file.name.split('.').pop() || 'doc'
                }
            ]);
            toast.success(`File "${file.name}" attached successfully`);
        }
    };

    const handleViewFile = (file: { fileName: string; filePath: string }) => {
        if (!file.filePath) {
            toast.error('File URL is not available');
            return;
        }
        window.open(file.filePath, '_blank');
    };

    const handlePreviewFile = (file: { fileName: string; filePath: string }) => {
        if (!file.filePath) {
            toast.error('File URL is not available');
            return;
        }
        setPreviewFile(file);
    };

    const handleRemoveFile = (index: number) => {
        setFileList((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                ISMS_Id: Number(data.ismS_Id),
                LPMOEQ_Question: data.lmsmoeQ_Question.trim(),
                LPMOEQ_QuestionDesc: data.lmsmoeQ_QuestionDesc?.trim() || '',
                LPMOEQ_Marks: Number(data.lmsmoeQ_Marks),
                LPMCOMP_Id: data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : 1,
                
                // Fields mapped from new schema
                QuestionType: data.isTextType ? 'Text' : data.isMathChemType ? 'Math/Chem' : 'Structural',
                LPMOEEXQNS_SubjectiveFlg: data.subjectiveFlg,
                LPMOEEXQNS_MatchTheFollowingFlg: data.matchTheFollowingFlg,
                LPMOEEXQNS_NoOfOptions: data.lmsmoeQ_NoOfOptions,
                LPMOEEXQNS_NoOfRows: data.noOfRows,
                LPMOEEXQNS_NoOfColumns: data.noOfColumns,
                classIds: data.classIds,
                
                questionFiles: fileList,
                questionOptions: []
            };

            const response = await saveMutation.mutateAsync(payload);

            if (response?.success !== false && !response?.error) {
                toast.success('Question added successfully!');
                reset();
                setFileList([]);
                if (onSuccess) onSuccess();
                refetch();
            } else {
                toast.error(response?.message || 'Failed to add question');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to add question');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='rounded border bg-white shadow-sm text-sm overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between border-b px-4 py-2 bg-primary/5'>
                <h2 className='font-bold text-primary uppercase tracking-wide text-xs'>Master Question</h2>
                <div className='flex gap-2'>
                    <Button type='button' className='bg-primary hover:bg-primary/90 h-7 text-xs rounded-full px-3 gap-1.5 shadow-sm text-primary-foreground font-semibold'>
                        <Beaker className='w-3 h-3' /> Chemical Drawing
                    </Button>
                    <Button type='button' className='bg-primary hover:bg-primary/90 h-7 text-xs rounded-full px-3 gap-1.5 shadow-sm text-primary-foreground font-semibold'>
                        <Languages className='w-3 h-3' /> Language Translator
                    </Button>
                </div>
            </div>

            <div className='p-4 space-y-4'>
                {/* Top Section: Class & Subject/Topic */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Class Select Box */}
                    <div className='flex gap-2'>
                        <Label className='font-medium mt-1 whitespace-nowrap text-xs w-28'>
                            Class:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1 border border-gray-300 rounded-sm flex flex-col h-40 overflow-hidden bg-background'>
                            <div className='p-1 border-b border-gray-300 bg-muted/20'>
                                <input 
                                    type='text' 
                                    placeholder='search here...' 
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground text-foreground bg-background'
                                />
                            </div>
                            <div className='flex-1 overflow-y-auto p-1'>
                                 {filteredClasses.map((c: any, index: number) => {
                                     const id = c.asmcL_Id ?? c.id ?? index;
                                     const name = c.asmcL_ClassName ?? c.className ?? c.name;
                                     const isChecked = classIds.includes(id);
                                     return (
                                         <div key={`cls-${id}-${index}`} className='flex items-center gap-2 p-1 hover:bg-primary/10 cursor-pointer text-xs rounded-xs' onClick={() => handleClassToggle(id)}>
                                             <input type="checkbox" checked={isChecked} onChange={() => {}} className='h-3 w-3 rounded-sm border-gray-300 text-primary focus:ring-primary' />
                                             <span className='text-foreground'>{name}</span>
                                         </div>
                                     );
                                 })}
                            </div>
                        </div>
                    </div>

                    {/* Subject & Topic Dropdowns */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <Label htmlFor='ismS_Id' className='font-medium w-24 text-xs'>
                                Subject:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1'>
                                <Controller
                                    name='ismS_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? field.value.toString() : ''}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger id='ismS_Id' className='h-8 text-xs border-gray-300 bg-background'>
                                                <SelectValue placeholder='Select Subject' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(Array.isArray(subjects) ? subjects : (subjects as any)?.$values || [])?.map((sub: any, index: number) => {
                                                    const id = sub.ismS_Id ?? sub.isms_Id ?? sub.ISMS_Id ?? sub.id ?? index;
                                                    const name = sub.ismS_SubjectName ?? sub.isms_SubjectName ?? sub.ISMS_SubjectName ?? sub.subjectName ?? sub.name;
                                                    return (
                                                        <SelectItem key={`sub-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ismS_Id && <p className='text-destructive text-[10px] mt-0.5'>{errors.ismS_Id.message}</p>}
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Label htmlFor='topic_Id' className='font-medium w-24 text-xs'>
                                Topic:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1'>
                                <Controller
                                    name='topic_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? field.value.toString() : ''}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger id='topic_Id' className='h-8 text-xs border-gray-300 bg-background'>
                                                <SelectValue placeholder='Select Topic' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {displayTopics?.map((t: any, index: number) => {
                                                    const id = t.topic_Id ?? t.lpmT_Id ?? t.LPMT_Id ?? t.id ?? index;
                                                    const name = t.topic_Name ?? t.lpmT_TopicName ?? t.LPMT_TopicName ?? t.name;
                                                    return (
                                                        <SelectItem key={`top-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Type Checkboxes */}
                <div className='flex items-start gap-2 pt-2'>
                    <Label className='font-medium w-28 text-xs pt-1'>Question Type</Label>
                    <div className='flex flex-col gap-1.5 text-xs text-gray-700'>
                        <label className='flex items-center gap-2'>
                            <input type='checkbox' {...register('isTextType')} className='h-3.5 w-3.5 rounded-sm border-gray-300' /> Text
                        </label>
                        <label className='flex items-center gap-2'>
                            <input type='checkbox' {...register('isMathChemType')} className='h-3.5 w-3.5 rounded-sm border-gray-300' /> Math/Chem type
                        </label>
                        <label className='flex items-center gap-2'>
                            <input type='checkbox' {...register('isStructuralType')} className='h-3.5 w-3.5 rounded-sm border-gray-300' /> Structural/Chemical Drawing
                        </label>
                    </div>
                </div>

                {/* Question */}
                <div className='flex gap-2 pt-2'>
                    <Label className='font-medium w-28 text-xs pt-2'>
                        Question:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <InputTextarea
                            {...register('lmsmoeQ_Question')}
                            className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-foreground'
                        />
                        {errors.lmsmoeQ_Question && <p className='text-destructive text-[10px] mt-0.5'>{errors.lmsmoeQ_Question.message}</p>}
                    </div>
                </div>

                {/* Bottom Two-Column Layout */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 pt-2'>
                    
                    {/* LEFT COLUMN */}
                    <div className='space-y-4'>
                        {/* Question Description */}
                        <div className='flex gap-2'>
                            <Label className='font-medium w-36 text-xs pt-2 whitespace-nowrap'>Question Description:</Label>
                            <div className='flex-1'>
                                <InputTextarea
                                    {...register('lmsmoeQ_QuestionDesc')}
                                    className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-foreground'
                                />
                            </div>
                        </div>

                        {/* Subjective Type */}
                        <div className='flex items-start gap-2'>
                            <div className='w-36 flex items-center gap-2 pt-1 text-xs font-medium whitespace-nowrap'>
                                <input type='checkbox' id='add_subjectiveFlg' {...register('subjectiveFlg')} className='h-3.5 w-3.5 rounded-sm border-gray-300 text-primary focus:ring-primary cursor-pointer' />
                                <Label htmlFor='add_subjectiveFlg' className='cursor-pointer'>Subjective Type:</Label>
                            </div>
                            <div className='flex-1'>
                                {isSubjective ? (
                                    <InputTextarea
                                        {...register('subjectiveAnswer')}
                                        placeholder='Enter subjective answer / details...'
                                        className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-xs text-foreground'
                                    />
                                ) : (
                                    <div className='bg-muted/30 border border-gray-300 rounded-sm min-h-[70px] p-2 text-xs text-muted-foreground select-none'>
                                        Check Subjective Type to enter answer text
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Match The Following Type */}
                        <div className='flex items-start gap-2'>
                            <div className='w-36 flex items-start gap-2 pt-1 text-xs font-medium'>
                                <input type='checkbox' {...register('matchTheFollowingFlg')} className='h-3.5 w-3.5 mt-0.5 rounded-sm border-gray-300 text-primary focus:ring-primary' />
                                <Label className='leading-tight'>Match The Following <br/> Type :</Label>
                            </div>
                            <div className='flex-1'>
                                {isMatchFollowing ? (
                                    <div className='w-full border border-gray-300 rounded-sm overflow-hidden text-xs text-center'>
                                        <div className='grid grid-cols-2 bg-primary text-primary-foreground font-semibold text-[11px]'>
                                            <div className='py-1.5 border-r border-primary-foreground/20'>No.Of Rows</div>
                                            <div className='py-1.5'>No.Of Columns</div>
                                        </div>
                                        <div className='grid grid-cols-2 p-1.5 gap-2'>
                                            <input type='number' {...register('noOfRows', { valueAsNumber: true })} placeholder='Enter No.Of Rows' className='border border-gray-300 px-2 py-1.5 w-full bg-background focus:outline-none focus:border-primary text-center placeholder:text-[10px]' />
                                            <input type='number' {...register('noOfColumns', { valueAsNumber: true })} placeholder='Enter No.Of Columns' className='border border-gray-300 px-2 py-1.5 w-full bg-background focus:outline-none focus:border-primary text-center placeholder:text-[10px]' />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='w-full border border-gray-300 rounded-sm overflow-hidden text-xs text-center'>
                                        <div className='grid grid-cols-2 bg-primary text-primary-foreground font-semibold text-[11px]'>
                                            <div className='py-1.5 border-r border-primary-foreground/20'>No.Of Rows</div>
                                            <div className='py-1.5'>No.Of Columns</div>
                                        </div>
                                        <div className='grid grid-cols-2 p-1.5 gap-2 opacity-50 pointer-events-none'>
                                            <input type='text' placeholder='Enter No.Of Rows' className='border border-gray-300 px-2 py-1.5 w-full bg-gray-100 text-center placeholder:text-[10px]' disabled />
                                            <input type='text' placeholder='Enter No.Of Columns' className='border border-gray-300 px-2 py-1.5 w-full bg-gray-100 text-center placeholder:text-[10px]' disabled />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className='space-y-4'>
                        {/* Complexities, Options, Marks */}
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>Complexities Type:<span className='text-red-500'>*</span></Label>
                                <div className='flex-1'>
                                    <Controller
                                        name='lmsmoecX_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? field.value.toString() : ''}
                                                onValueChange={(val) => field.onChange(Number(val))}>
                                                <SelectTrigger className='h-8 text-xs border-gray-300 bg-background'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(Array.isArray(complexities) ? complexities : (complexities as any)?.$values || [])?.map((comp: any, index: number) => {
                                                        const id = comp.lmsmoecX_Id ?? comp.lpmcomP_Id ?? comp.lpmcomp_Id ?? comp.LPMCOMP_Id ?? comp.id ?? index;
                                                        const name = comp.lmsmoecX_ComplexityName ?? comp.lpmcomP_ComplexityName ?? comp.lpmcomp_ComplexityName ?? comp.LPMCOMP_ComplexityName ?? comp.name;
                                                        return (
                                                            <SelectItem key={`comp-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>No.Of Options:<span className='text-red-500'>*</span></Label>
                                <input
                                    type='number'
                                    {...register('lmsmoeQ_NoOfOptions', { valueAsNumber: true })}
                                    className='flex-1 border border-gray-300 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-background shadow-xs'
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>No.Of Marks:<span className='text-red-500'>*</span></Label>
                                <input
                                    type='number'
                                    {...register('lmsmoeQ_Marks', { valueAsNumber: true })}
                                    className='flex-1 border border-gray-300 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-background shadow-xs'
                                />
                            </div>
                        </div>

                        {/* File Upload Grid */}
                        <div className='border border-primary/20 rounded-sm overflow-hidden text-xs text-center mt-4'>
                            <div className='grid grid-cols-12 bg-primary text-primary-foreground font-bold py-1.5 text-[11px] uppercase'>
                                <div className='col-span-1 border-r border-primary/30'>Sl.No</div>
                                <div className='col-span-4 border-r border-primary/30'>File</div>
                                <div className='col-span-2 border-r border-primary/30'>View</div>
                                <div className='col-span-4 border-r border-primary/30'>Preview</div>
                                <div className='col-span-1'>Action</div>
                            </div>
                            
                            {fileList.length > 0 ? (
                                fileList.map((file, idx) => (
                                    <div key={idx} className='grid grid-cols-12 border-t border-muted items-center py-1.5'>
                                        <div className='col-span-1 font-medium'>{idx + 1}</div>
                                        <div className='col-span-4 border-x border-muted px-2 text-left truncate text-foreground'>{file.fileName}</div>
                                        <div onClick={() => handleViewFile(file)} className='col-span-2 border-r border-muted text-primary hover:underline cursor-pointer font-medium'>View</div>
                                        <div onClick={() => handlePreviewFile(file)} className='col-span-4 border-r border-muted text-primary hover:underline cursor-pointer font-medium'>Preview</div>
                                        <div className='col-span-1 flex justify-center'>
                                            <Button type='button' variant='ghost' size='sm' onClick={() => handleRemoveFile(idx)} className='h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='grid grid-cols-12 border-t border-muted items-center py-1.5 bg-white'>
                                    <div className='col-span-1 text-gray-500'>1</div>
                                    <div className='col-span-4 border-x border-muted px-2 flex justify-center'>
                                        <label className='cursor-pointer flex items-center justify-center w-full h-6 bg-primary text-primary-foreground rounded-sm font-semibold text-[10px] hover:bg-primary/90 mx-auto shadow-sm'>
                                            Browse
                                            <input type='file' className='hidden' onChange={handleAddFile} />
                                        </label>
                                    </div>
                                    <div className='col-span-2 border-r border-muted'></div>
                                    <div className='col-span-4 border-r border-muted'></div>
                                    <div className='col-span-1 flex justify-center'>
                                        <label className='cursor-pointer flex items-center justify-center h-6 w-6 text-primary font-bold hover:bg-primary/10 rounded-sm'>
                                            +
                                            <input type='file' className='hidden' onChange={handleAddFile} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50/30'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-6 text-xs font-semibold rounded-full shadow-sm uppercase flex items-center gap-1.5'>
                    <Save className='w-3.5 h-3.5' /> <span>SAVE</span>
                </Button>
                <Button
                    type='button'
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className='bg-orange-600 hover:bg-orange-700 text-white h-8 px-6 text-xs font-semibold rounded-full shadow-sm uppercase flex items-center gap-1.5'>
                    <X className='w-3.5 h-3.5' /> <span>CANCEL</span>
                </Button>
            </div>

            {/* File Preview Modal */}
            <FilePreviewModal file={previewFile} open={Boolean(previewFile)} onClose={() => setPreviewFile(null)} />
        </form>
    );
}

function FilePreviewModal({ file, open, onClose }: { file: { fileName: string; filePath: string } | null; open: boolean; onClose: () => void }) {
    if (!file) return null;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || file.filePath);
    const isPdf = /\.(pdf)$/i.test(file.fileName || file.filePath);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(file.fileName || file.filePath);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
                <DialogHeader className='border-b pb-2'>
                    <DialogTitle className='font-bold text-sm text-primary truncate'>
                        File Preview: {file.fileName}
                    </DialogTitle>
                </DialogHeader>
                <div className='flex flex-1 items-center justify-center overflow-hidden rounded border bg-slate-50 p-4 min-h-[300px]'>
                    {isImage ? (
                        <img src={file.filePath} alt={file.fileName} className='max-h-[60vh] max-w-full object-contain rounded shadow-sm' />
                    ) : isPdf ? (
                        <iframe src={file.filePath} title={file.fileName} className='h-[60vh] w-full rounded border' />
                    ) : isVideo ? (
                        <video src={file.filePath} controls className='max-h-[60vh] max-w-full rounded' />
                    ) : (
                        <div className='text-center space-y-3 p-6'>
                            <p className='text-xs text-gray-600 font-medium'>No direct inline preview available for this file type.</p>
                            <Button
                                type='button'
                                onClick={() => window.open(file.filePath, '_blank')}
                                className='bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-4 font-semibold'>
                                Open / Download File
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type='button' variant='outline' size='sm' onClick={onClose} className='h-8 text-xs'>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

