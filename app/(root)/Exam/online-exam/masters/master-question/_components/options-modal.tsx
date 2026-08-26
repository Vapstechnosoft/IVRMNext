'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterQuestion, useQuestionOptions } from '@/hooks/exam/online-exam/useMasters';
import { saveQuestionOptions } from '@/server/exam/online-exam/masters/master-question';
import type { IMasterQuestionList, IQuestionOption } from '@/types/exam/online-exam/masters';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface QuestionOptionsModalProps {
    question: IMasterQuestionList | null;
    open: boolean;
    onClose: () => void;
}

export default function QuestionOptionsModal({ question, open, onClose }: QuestionOptionsModalProps) {
    const { refetchAll } = useMasterQuestion();
    const { data: initialOptions, isLoading: isOptionsLoading } = useQuestionOptions(question?.lmsmoeQ_Id ?? null);

    const [options, setOptions] = useState<IQuestionOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialOptions && Array.isArray(initialOptions) && initialOptions.length > 0) {
            setOptions(initialOptions);
        } else if (question?.questionOptions && question.questionOptions.length > 0) {
            setOptions(question.questionOptions);
        } else {
            // Default with 4 blank options
            setOptions([
                { lmsmoeqoA_Option: '', lmsmoeqoA_AnswerFlag: true, lmsmoeqoA_Marks: 1, lmsmoeqoA_OptionOrder: 1 },
                { lmsmoeqoA_Option: '', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 2 },
                { lmsmoeqoA_Option: '', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 3 },
                { lmsmoeqoA_Option: '', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 4 }
            ]);
        }
    }, [initialOptions, question]);

    const handleAddOption = () => {
        setOptions((prev) => [
            ...prev,
            {
                lmsmoeqoA_Option: '',
                lmsmoeqoA_AnswerFlag: false,
                lmsmoeqoA_Marks: 0,
                lmsmoeqoA_OptionOrder: prev.length + 1
            }
        ]);
    };

    const handleRemoveOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOptionTextChange = (index: number, text: string) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, lmsmoeqoA_Option: text } : opt)));
    };

    const handleAnswerFlagChange = (index: number) => {
        setOptions((prev) =>
            prev.map((opt, i) => ({
                ...opt,
                lmsmoeqoA_AnswerFlag: i === index
            }))
        );
    };

    const handleMarksChange = (index: number, marks: number) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, lmsmoeqoA_Marks: marks } : opt)));
    };

    const handleSave = async () => {
        if (!question) return;

        // Validation
        const validOptions = options.filter((o) => o.lmsmoeqoA_Option.trim() !== '');
        if (validOptions.length < 2) {
            toast.error('Please enter at least 2 options for this question.');
            return;
        }

        const hasCorrect = validOptions.some((o) => o.lmsmoeqoA_AnswerFlag);
        if (!hasCorrect) {
            toast.error('Please mark at least one option as the Correct Answer.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                LMSMOEQ_Id: question.lmsmoeQ_Id,
                optiondetails: validOptions.map((o, idx) => ({
                    LMSMOEQOA_Id: o.lmsmoeqoA_Id || 0,
                    LMSMOEQOA_Option: o.lmsmoeqoA_Option.trim(),
                    LMSMOEQOA_AnswerFlag: o.lmsmoeqoA_AnswerFlag,
                    LMSMOEQOA_Marks: Number(o.lmsmoeqoA_Marks || (o.lmsmoeqoA_AnswerFlag ? question.lmsmoeQ_Marks : 0)),
                    LMSMOEQOA_OptionOrder: idx + 1
                }))
            };

            const response = await saveQuestionOptions(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success('Question options saved successfully!');
                refetchAll();
                onClose();
            } else {
                toast.error(response?.message || 'Failed to save options');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[85vh] max-w-2xl flex-col'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-lg'>Manage Question Options</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Configure multiple-choice answers, correct option, and marks
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md bg-muted/40 p-3 text-xs'>
                    <span className='font-semibold text-foreground'>Question: </span>
                    <span className='text-foreground'>{question?.lmsmoeQ_Question}</span>
                    <div className='mt-1 text-muted-foreground'>
                        Total Question Marks: <span className='font-semibold text-foreground'>{question?.lmsmoeQ_Marks}</span>
                    </div>
                </div>

                <div className='flex-1 space-y-3 overflow-y-auto py-2'>
                    {isOptionsLoading ? (
                        <div className='py-6 text-center text-muted-foreground text-sm'>Loading options...</div>
                    ) : (
                        options.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                                    opt.lmsmoeqoA_AnswerFlag ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'
                                }`}>
                                <span className='w-7 text-center font-bold text-muted-foreground text-sm'>
                                    {String.fromCharCode(65 + idx)}.
                                </span>

                                <div className='flex-1'>
                                    <InputText
                                        value={opt.lmsmoeqoA_Option}
                                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                                        className='h-9'
                                    />
                                </div>

                                <div className='w-20'>
                                    <input
                                        type='number'
                                        value={opt.lmsmoeqoA_Marks || 0}
                                        onChange={(e) => handleMarksChange(idx, Number(e.target.value))}
                                        placeholder='Marks'
                                        min={0}
                                        className='flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    />
                                </div>

                                <label className='flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-2 py-1.5 font-semibold text-xs hover:bg-muted'>
                                    <input
                                        type='radio'
                                        name='correctAnswer'
                                        checked={opt.lmsmoeqoA_AnswerFlag}
                                        onChange={() => handleAnswerFlagChange(idx)}
                                        className='h-4 w-4 text-emerald-600'
                                    />
                                    Correct
                                </label>

                                {options.length > 2 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => handleRemoveOption(idx)}
                                        className='h-8 w-8 p-0 text-destructive'>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}

                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleAddOption}
                        className='w-full gap-1 border-dashed text-xs'>
                        <Plus className='h-3.5 w-3.5' /> Add Another Option
                    </Button>
                </div>

                <DialogFooter className='border-t pt-3'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSave} disabled={isSaving} className='min-w-28'>
                        {isSaving ? 'Saving...' : 'Save Options'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
