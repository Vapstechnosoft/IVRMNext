'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Send, Loader2, Sparkles, Star } from 'lucide-react';
import { saveFeedback } from '@/server/staff-portal/interactions';
import type { IFeedbackQuestion, IFeedbackOption } from '@/types/staff-portal/interactions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    const [responses, setResponses] = useState<Record<number, { optionId: number; remarks: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionSelect = (qId: number, oId: number) => {
        setResponses(prev => ({
            ...prev,
            [qId]: { ...prev[qId], optionId: oId }
        }));
    };

    const handleRemarksChange = (qId: number, text: string) => {
        setResponses(prev => ({
            ...prev,
            [qId]: { ...prev[qId], remarks: text }
        }));
    };

    const handleSubmit = async () => {
        const feedbackArray = Object.entries(responses).map(([qId, data]) => {
            const question = questions.find(q => q.fmqE_Id === Number(qId));
            const option = question?.feedbackoptiondata.find(o => o.fmoP_Id === data.optionId);

            return {
                name: data.optionId,
                FMOP_FeedbackOptions: option?.fmoP_FeedbackOptions || "",
                FMOP_OptionsValue: option?.fmoP_OptionsValue || "",
                FMTY_Id: question?.fmtY_Id,
                FMQE_Id: question?.fmqE_Id,
                FMQE_FeedbackQuestions: question?.fmqE_FeedbackQuestions,
                FMQE_FeedbackQRemarks: data.remarks || "",
                FMTY_FeedbackTypeName: question?.fmtY_FeedbackTypeName,
                FSTTR_FeedBack: data.remarks || ""
            };
        });

        if (feedbackArray.length === 0) {
            toast.error('Please answer at least one question before submitting');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await saveFeedback({
                savemodulefeedback: feedbackArray,
                Flag: roleFlg,
                HRME_Id: userhrmE_Id
            });
            if (res.success && res.data?.returnval) {
                toast.success('Your feedback has been submitted. Thank you!');
                onClose();
            } else {
                toast.error(res.message || 'There was an issue saving your feedback.');
            }
        } catch (error) {
            toast.error('A system error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-3xl bg-background/95 backdrop-blur-2xl ring-1 ring-primary/10">
                <DialogHeader className="p-10 border-b bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] relative overflow-hidden">
                    <Sparkles className="absolute -right-8 -top-8 h-32 w-32 text-primary/5 rotate-12" />
                    <Star className="absolute left-1/4 -bottom-4 h-16 w-16 text-primary/5 -rotate-12" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="bg-primary p-4 rounded-2xl text-white shadow-xl shadow-primary/20">
                            <GraduationCap className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-tight">
                                Help Us Improve
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                Your feedback shapes our platform
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-10 py-10">
                    <div className="flex flex-col gap-14 py-4">
                        {questions.map((q, idx) => (
                            <div key={`${q.fmqE_Id || 'q'}-${idx}`} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-black leading-tight flex items-start gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-[12px] text-white font-black shadow-lg shadow-primary/20 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        {q.fmqE_FeedbackQuestions}
                                    </h3>
                                    {q.fmtY_FeedbackTypeName && (
                                        <Badge variant="secondary" className="ml-12 px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-primary/5 text-primary border-none">
                                            {q.fmtY_FeedbackTypeName}
                                        </Badge>
                                    )}
                                </div>

                                <div className="ml-12">
                                    <RadioGroup
                                        className="grid grid-cols-2 gap-4"
                                        onValueChange={(val) => handleOptionSelect(q.fmqE_Id, Number(val))}
                                    >
                                        {q.feedbackoptiondata.map((opt, oIdx) => (
                                            <Label
                                                key={`${opt.fmoP_Id || 'opt'}-${oIdx}`}
                                                className={cn(
                                                    "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all duration-300",
                                                    responses[q.fmqE_Id]?.optionId === opt.fmoP_Id
                                                        ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5 ring-4 ring-primary/5"
                                                        : "border-muted-foreground/10 bg-transparent hover:border-primary/30 hover:bg-muted/50"
                                                )}
                                            >
                                                <RadioGroupItem value={opt.fmoP_Id.toString()} className="h-5 w-5 border-2 text-primary" />
                                                <span className="text-sm font-black tracking-tight">{opt.fmoP_FeedbackOptions}</span>
                                            </Label>
                                        ))}
                                    </RadioGroup>

                                    <div className="mt-8 space-y-3">
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-70 italic">Additional Commentary</Label>
                                        <Textarea
                                            placeholder="We'd love to hear more details..."
                                            className="min-h-[100px] resize-none bg-muted/20 border-2 rounded-2xl px-5 py-4 font-medium focus-visible:ring-primary/20 placeholder:opacity-40"
                                            onBlur={(e) => handleRemarksChange(q.fmqE_Id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-10 border-t bg-muted/30 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.03)]">
                    <div className="flex w-full items-center justify-between gap-8">
                        <p className="text-xs text-muted-foreground font-medium italic opacity-60 leading-relaxed max-w-[200px]">
                            Your honest feedback helps us provide a better experience.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-muted-foreground hover:text-foreground h-14 px-8">
                                Maybe Later
                            </Button>
                            <Button
                                className="min-w-[180px] h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Submit Feedback
                                        <Send className="ml-3 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
