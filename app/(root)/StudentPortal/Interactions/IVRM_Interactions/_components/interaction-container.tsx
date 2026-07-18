'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { InboxTab } from './inbox-tab';
import { ComposeTab } from './compose-tab';
import { FeedbackModal } from './feedback-modal';
import { loadFeedbackQuestions, getInitialInteractions } from '@/server/staff-portal/interactions';
import type { IInteractionsInitialData, IFeedbackQuestion, IFeedbackOption } from '@/types/staff-portal/interactions';

import { toast } from 'sonner';
import { Loader2, Inbox, Users, User, Send } from 'lucide-react';

interface InteractionContainerProps {
    initialData: IInteractionsInitialData;
}
export const dynamic = 'force-dynamic';
export function InteractionContainer({ initialData }: InteractionContainerProps) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [interactionsData, setInteractionsData] = useState(initialData);
    const [feedbackData, setFeedbackData] = useState<{ questions: IFeedbackQuestion[]; options: IFeedbackOption[] } | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const roleFlg = interactionsData.roletype?.[0]?.ivrmrT_Role || 'Student';
    const isStudent = true; // Force Student Portal logic

    // Refresh inbox data
    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getInitialInteractions();
            if (response.success && response.data) {
                setInteractionsData(response.data);
            }
        } catch (error) {
            console.error('Failed to refresh interactions:', error);
            toast.error('Failed to refresh data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check for feedback on load - matches legacy loaddata -> loadmodulefeedback
    useEffect(() => {
        const checkFeedback = async () => {
            try {
                const response = await loadFeedbackQuestions('Interaction');
                if (response.success && response.data && response.data.feedbackquestion?.length > 0) {
                    const rawQuestions = response.data.feedbackquestion || [];
                    const allOptions = (response.data as any).feedbackoption || [];
                    const uniqueQuestions = rawQuestions.reduce((acc: any[], q: any) => {
                        if (q.fmqE_Id && !acc.some(existing => existing.fmqE_Id === q.fmqE_Id)) {
                            // Deduplicate options for this specific question
                            const questionOptions = allOptions.filter((o: any) => o.fmqE_Id === q.fmqE_Id);
                            const uniqueOptions = questionOptions.reduce((oAcc: any[], oCurr: any) => {
                                if (oCurr.fmoP_Id && !oAcc.some(oExisting => oExisting.fmoP_Id === oCurr.fmoP_Id)) {
                                    oAcc.push(oCurr);
                                }
                                return oAcc;
                            }, []);

                            acc.push({
                                ...q,
                                feedbackoptiondata: uniqueOptions
                            });
                        }
                        return acc;
                    }, []);
                    setFeedbackData({
                        questions: uniqueQuestions,
                        options: allOptions
                    });
                    setShowFeedback(true);
                }
            } catch (error) {
                console.error('Error checking feedback:', error);
            }
        };

        checkFeedback();
    }, []);

    const onTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <Card className="overflow-hidden border shadow-lg rounded-none">
            <div className="bg-white border-b border-orange-400 border-t-2 border-t-orange-400 px-4 py-2 flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1e40af]">
                    INTERACTIONS
                </h2>
                <div className="h-0.5 w-6 bg-slate-200"></div>
            </div>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <div className="bg-slate-50 border-b px-2 py-2">
                        <TabsList className="h-8 justify-start gap-0 bg-transparent p-0 rounded-none border border-slate-200">
                            <TabsTrigger
                                value="inbox"
                                className="h-8 rounded-none border-r border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-wider text-[#1e40af] shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none"
                            >
                                Inbox
                            </TabsTrigger>

                            <TabsTrigger
                                value="individual"
                                className="h-8 rounded-none bg-white px-6 text-[10px] font-black uppercase tracking-wider text-[#1e40af] shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none"
                            >
                                Compose
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 relative min-h-[400px]">
                        {isLoading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}

                        <TabsContent value="inbox" className="mt-0 outline-none">
                            <InboxTab
                                data={interactionsData}
                                onRefresh={refreshData}
                                roleFlg={roleFlg}
                            />
                        </TabsContent>

                        <TabsContent value="group" className="mt-0 outline-none">
                            <ComposeTab
                                data={interactionsData}
                                mode="Group"
                                onCancel={() => setActiveTab('inbox')}
                                onSuccess={() => {
                                    setActiveTab('inbox');
                                    refreshData();
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="individual" className="mt-0 outline-none">
                            <ComposeTab
                                data={interactionsData}
                                mode="Individual"
                                onCancel={() => setActiveTab('inbox')}
                                onSuccess={() => {
                                    setActiveTab('inbox');
                                    refreshData();
                                }}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>

            {showFeedback && feedbackData && (
                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => setShowFeedback(false)}
                    questions={feedbackData.questions}
                    options={feedbackData.options}
                    roleFlg={roleFlg}
                    userhrmE_Id={interactionsData.userhrmE_Id || 0}
                />
            )}
        </Card>
    );
}

export default InteractionContainer;
