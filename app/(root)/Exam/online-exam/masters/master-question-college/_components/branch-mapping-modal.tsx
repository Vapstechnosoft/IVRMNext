'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterQuestionCollege } from '@/hooks/exam/online-exam/useMasters';
import { saveBranchQuestionMapping } from '@/server/exam/online-exam/masters/master-question-college';
import type { IBranchDropdown, IMasterQuestionCollegeList } from '@/types/exam/online-exam/masters';
import { Check, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BranchMappingModalProps {
    question: IMasterQuestionCollegeList | null;
    branches: IBranchDropdown[];
    open: boolean;
    onClose: () => void;
}

export default function BranchMappingModal({ question, branches = [], open, onClose }: BranchMappingModalProps) {
    const { refetchAll } = useMasterQuestionCollege();
    const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleBranch = (branchId: number) => {
        setSelectedBranchIds((prev) => (prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]));
    };

    const handleSelectAll = () => {
        if (selectedBranchIds.length === branches.length) {
            setSelectedBranchIds([]);
        } else {
            setSelectedBranchIds(branches.map((b) => b.amB_Id));
        }
    };

    const handleSave = async () => {
        if (!question) return;

        if (selectedBranchIds.length === 0) {
            toast.error('Please select at least one branch to map');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                LMSMCQ_Id: question.lmsmcQ_Id,
                branchList: selectedBranchIds.map((id) => ({
                    AMB_Id: id,
                    AMCO_Id: question.amcO_Id,
                    AMSE_Id: question.amsE_Id
                }))
            };

            const response = await saveBranchQuestionMapping(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success('Branch mapping saved successfully!');
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
                    <DialogTitle className='font-bold text-lg'>Map Question to Branches</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Select applicable degree branches for this college question
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md bg-muted/40 p-3 text-xs'>
                    <span className='font-semibold text-foreground'>Question: </span>
                    <span className='text-foreground'>{question?.lmsmcQ_Question}</span>
                </div>

                <div className='flex items-center justify-between border-b py-2'>
                    <span className='font-semibold text-xs'>Available Branches</span>
                    <Button type='button' variant='ghost' size='sm' onClick={handleSelectAll} className='h-7 gap-1.5 text-xs'>
                        {selectedBranchIds.length === branches.length ? (
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
                    {branches.length === 0 ? (
                        <p className='py-4 text-center text-muted-foreground text-xs'>No branches available</p>
                    ) : (
                        branches.map((br) => {
                            const isChecked = selectedBranchIds.includes(br.amB_Id);
                            return (
                                <div
                                    key={br.amB_Id}
                                    onClick={() => handleToggleBranch(br.amB_Id)}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 text-xs transition-all ${
                                        isChecked
                                            ? 'border-primary/60 bg-primary/10 font-semibold text-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                    }`}>
                                    <span>{br.amB_BranchName}</span>
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
