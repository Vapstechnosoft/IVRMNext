'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { saveFeedback } from '@/server/staff-portal/interactions';
import type { IFeedbackQuestion, IFeedbackOption } from '@/types/staff-portal/interactions';
import { Loader2, MessageSquareQuote, Save } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: IFeedbackQuestion[];
    options: IFeedbackOption[];
    roleFlg: string;
    userhrmE_Id: number;
}
export const dynamic = 'force-dynamic';
export function FeedbackModal({ isOpen, onClose, questions, options, roleFlg, userhrmE_Id }: FeedbackModalProps) {
    const [responses, setResponses] = useState<Record<number, { optionId: number; remark: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionChange = (questionId: number, optionId: number) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                optionId
            }
        }));
    };

    const handleRemarkChange = (questionId: number, remark: string) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                remark
            }
        }));
    };

    const handleSubmit = async () => {
        // Validation
        const unanswered = questions.filter(q => !responses[q.fmqE_Id]?.optionId);
        if (unanswered.length > 0) {
            toast.error('Please answer all questions before saving.');
            return;
        }

        setIsSubmitting(true);
        try {
            const savemodulefeedback = questions.map(q => {
                const response = responses[q.fmqE_Id];
                return {
                    FMTY_Id: q.fmtY_Id,
                    FMQE_Id: q.fmqE_Id,
                    name: response.optionId.toString(),
                    FSTTR_FeedBack: response.remark || ""
                };
            });

            const result = await saveFeedback({
                savemodulefeedback,
                Flag: roleFlg,
                HRME_Id: userhrmE_Id
            });
            if (result.success) {
                toast.success(result.message || 'Feedback submitted successfully. Thank you!');
                onClose();
            } else {
                toast.error(result.message || 'Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Error saving feedback:', error);
            toast.error('An error occurred while saving feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="bg-primary p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <MessageSquareQuote className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">System Feedback</DialogTitle>
                            <p className="text-primary-foreground/80 text-sm font-medium mt-1">Your feedback helps us improve our interaction system.</p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-8">
                    <div className="space-y-12">
                        {questions.map((question, index) => (
                            <div key={question.fmqE_Id} className="space-y-6 group">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                                        <span className="text-primary/40 mr-2">0{index + 1}.</span>
                                        {question.fmqE_FeedbackQuestions}
                                    </h4>
                                    <div className="h-1 w-12 bg-primary/10 rounded-full group-hover:w-20 transition-all duration-300" />
                                </div>

                                <RadioGroup
                                    className="flex flex-wrap gap-4"
                                    onValueChange={(val) => handleOptionChange(question.fmqE_Id, Number(val))}
                                >
                                    {question.feedbackoptiondata?.map((option) => (
                                        <div key={option.fmoP_Id} className="flex items-center space-x-2">
                                            <Label
                                                htmlFor={`q-${question.fmqE_Id}-o-${option.fmoP_Id}`}
                                                className="flex cursor-pointer items-center gap-2 rounded-xl border-2 px-6 py-3 transition-all hover:bg-muted font-bold"
                                                style={{
                                                    borderColor: responses[question.fmqE_Id]?.optionId === option.fmoP_Id ? 'hsl(var(--primary))' : 'transparent',
                                                    backgroundColor: responses[question.fmqE_Id]?.optionId === option.fmoP_Id ? 'hsl(var(--primary)/0.05)' : 'hsl(var(--muted)/0.3)'
                                                }}
                                            >
                                                <RadioGroupItem value={option.fmoP_Id.toString()} id={`q-${question.fmqE_Id}-o-${option.fmoP_Id}`} className="sr-only" />
                                                <span className="text-sm">{option.fmoP_FeedbackOptions}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest ml-1">Optional Remark</Label>
                                    <Textarea
                                        placeholder="Tell us more..."
                                        className="min-h-[100px] bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20 text-sm font-medium p-4"
                                        onChange={(e) => handleRemarkChange(question.fmqE_Id, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="bg-muted/30 p-6 flex items-center justify-between">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="font-bold text-muted-foreground uppercase tracking-widest">
                        Remind Me Later
                    </Button>
                    <Button
                        className="min-w-[180px] h-12 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackModal;
