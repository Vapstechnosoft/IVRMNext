'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import { saveClassQuestionMapping } from '@/server/exam/online-exam/masters/master-question';
import type { IClassDropdown, IMasterQuestionList } from '@/types/exam/online-exam/masters';
import { Check, CheckSquare, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ClassMappingModalProps {
    question: IMasterQuestionList | null;
    classes: IClassDropdown[];
    open: boolean;
    onClose: () => void;
}

export default function ClassMappingModal({ question, classes = [], open, onClose }: ClassMappingModalProps) {
    const { refetchAll } = useMasterQuestion();
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (question?.classList && question.classList.length > 0) {
            setSelectedClassIds(question.classList.map((c) => c.asmcL_Id));
        } else {
            setSelectedClassIds([]);
        }
    }, [question]);

    const handleToggleClass = (classId: number) => {
        setSelectedClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
    };

    const handleSelectAll = () => {
        if (selectedClassIds.length === classes.length) {
            setSelectedClassIds([]);
        } else {
            setSelectedClassIds(classes.map((c) => c.asmcL_Id));
        }
    };

    const handleSave = async () => {
        if (!question) return;

        if (selectedClassIds.length === 0) {
            toast.error('Please select at least one class to map');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                LMSMOEQ_Id: question.lmsmoeQ_Id,
                classList: selectedClassIds.map((id) => ({
                    ASMCL_Id: id
                }))
            };

            const response = await saveClassQuestionMapping(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success('Class question mapping saved successfully!');
                refetchAll();
                onClose();
            } else {
                toast.error(response?.message || 'Failed to save mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[85vh] max-w-md flex-col'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-lg'>Map Question to Classes</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Select all applicable classes for this question
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md bg-muted/40 p-3 text-xs'>
                    <span className='font-semibold text-foreground'>Question: </span>
                    <span className='text-foreground'>{question?.lmsmoeQ_Question}</span>
                </div>

                <div className='flex items-center justify-between border-b py-2'>
                    <span className='font-semibold text-xs'>Available Classes</span>
                    <Button type='button' variant='ghost' size='sm' onClick={handleSelectAll} className='h-7 gap-1.5 text-xs'>
                        {selectedClassIds.length === classes.length ? (
                            <>
                                <Square className='h-3.5 w-3.5' /> Unselect All
                            </>
                        ) : (
                            <>
                                <CheckSquare className='h-3.5 w-3.5' /> Select All
                            </>
                        )}
                    </Button>
                </div>

                <div className='max-h-60 flex-1 space-y-2 overflow-y-auto py-2'>
                    {classes.length === 0 ? (
                        <p className='py-4 text-center text-muted-foreground text-xs'>No classes available</p>
                    ) : (
                        classes.map((cls) => {
                            const isChecked = selectedClassIds.includes(cls.asmcL_Id);
                            return (
                                <div
                                    key={cls.asmcL_Id}
                                    onClick={() => handleToggleClass(cls.asmcL_Id)}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 text-xs transition-all ${
                                        isChecked
                                            ? 'border-primary/60 bg-primary/10 font-semibold text-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                    }`}>
                                    <span>{cls.asmcL_ClassName}</span>
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                                            isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                                        }`}>
                                        {isChecked && <Check className='h-3 w-3 stroke-[3]' />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter className='border-t pt-3'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSave} disabled={isSaving} className='min-w-28'>
                        {isSaving ? 'Saving...' : 'Save Mapping'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
