'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { saveFeedback } from '@/server/alumni/alumni-student-birthday';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questions: any[];
}

export default function FeedbackDialog({ open, onOpenChange, questions }: FeedbackDialogProps) {
    const [responses, setResponses] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (questions?.length > 0) {
            setResponses(questions.map(q => ({
                FMQE_Id: q.fmqE_Id,
                FMTY_Id: q.fmtY_Id,
                fmoP_Id: 0,
                fsttR_FeedBack: '',
                fmqE_FeedbackQuestions: q.fmqE_FeedbackQuestions,
                fmtY_FeedbackTypeName: q.fmtY_FeedbackTypeName,
                feedbackoptiondata: q.feedbackoptiondata
            })));
        }
    }, [questions]);

    const handleOptionChange = (qIndex: number, optionId: number) => {
        const newResponses = [...responses];
        newResponses[qIndex].fmoP_Id = optionId;
        setResponses(newResponses);
    };

    const handleRemarkChange = (qIndex: number, remark: string) => {
        const newResponses = [...responses];
        newResponses[qIndex].fsttR_FeedBack = remark;
        setResponses(newResponses);
    };

    const handleSubmit = async () => {
        // Validation
        const incomplete = responses.some(r => r.fmoP_Id === 0 || !r.fsttR_FeedBack);
        if (incomplete) {
            toast.error('Please answer all questions and provide remarks');
            return;
        }

        setSubmitting(true);
        try {
            const payload = responses.map(r => ({
                name: r.fmoP_Id,
                FMOP_FeedbackOptions: r.feedbackoptiondata.find((o: any) => o.fmoP_Id === r.fmoP_Id)?.fmoP_FeedbackOptions,
                FMOP_OptionsValue: r.feedbackoptiondata.find((o: any) => o.fmoP_Id === r.fmoP_Id)?.fmoP_OptionsValue,
                FMTY_Id: r.FMTY_Id,
                FMQE_Id: r.FMQE_Id,
                FMQE_FeedbackQuestions: r.fmqE_FeedbackQuestions,
                FMTY_FeedbackTypeName: r.fmtY_FeedbackTypeName,
                FSTTR_FeedBack: r.fsttR_FeedBack
            }));

            const res = await saveFeedback({ savemodulefeedback: payload });
            if (res.returnval === true) {
                toast.success('Feedback submitted successfully');
                onOpenChange(false);
            } else {
                toast.error('Failed to save feedback');
            }
        } catch (error) {
            toast.error('An error occurred while saving feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (!questions || questions.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[32px] border-none shadow-2xl'>
                <DialogHeader className="p-8 bg-primary text-primary-foreground">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Module Feedback</DialogTitle>
                    <DialogDescription className="text-primary-foreground/80 font-medium">
                        Your feedback helps us improve. Please answer the following questions.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-8">
                    <div className='space-y-12 pb-8'>
                        {responses.map((resp, idx) => (
                            <div key={resp.FMQE_Id} className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500' style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="space-y-3">
                                    <h3 className='font-bold text-lg text-slate-800 flex gap-3'>
                                        <span className="text-primary/40 font-black">{idx + 1}.</span>
                                        {resp.fmqE_FeedbackQuestions}
                                    </h3>
                                    
                                    <RadioGroup
                                        value={resp.fmoP_Id.toString()}
                                        onValueChange={(val) => handleOptionChange(idx, Number(val))}
                                        className='flex flex-wrap gap-4 pt-2'>
                                        {resp.feedbackoptiondata?.map((opt: any) => (
                                            <div key={opt.fmoP_Id} className='flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer'>
                                                <RadioGroupItem value={opt.fmoP_Id.toString()} id={`q-${idx}-opt-${opt.fmoP_Id}`} />
                                                <label 
                                                    htmlFor={`q-${idx}-opt-${opt.fmoP_Id}`} 
                                                    className='text-sm font-semibold text-slate-600 cursor-pointer select-none'
                                                >
                                                    {opt.fmoP_FeedbackOptions}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Remarks</label>
                                    <Textarea 
                                        placeholder="Enter your detailed feedback here..."
                                        value={resp.fsttR_FeedBack}
                                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                                        className="min-h-[100px] rounded-2xl border-slate-200 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                                {idx < responses.length - 1 && <Separator className="opacity-50" />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-8 bg-slate-50 border-t flex items-center justify-center sm:justify-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)} 
                        className="rounded-xl font-bold h-12 px-8 hover:bg-slate-200 text-slate-500"
                    >
                        SKIP FOR NOW
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="rounded-xl font-bold h-12 px-12 shadow-xl shadow-primary/20 animate-pulse-slow"
                    >
                        {submitting ? 'SAVING...' : 'SAVE FEEDBACK'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
