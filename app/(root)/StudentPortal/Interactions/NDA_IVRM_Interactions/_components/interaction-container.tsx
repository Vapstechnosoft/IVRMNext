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

export function InteractionContainer({ initialData }: InteractionContainerProps) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [interactionsData, setInteractionsData] = useState(initialData);
    const [feedbackData, setFeedbackData] = useState<{ questions: IFeedbackQuestion[]; options: IFeedbackOption[] } | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // In StudentPortal, we explicitly force the role to Student.
    const roleFlg = 'Student';
    const isStudent = true;

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
                    const mappedQuestions = response.data.feedbackquestion.map(q => ({
                        ...q,
                        feedbackoptiondata: (response.data as any).feedbackoption.filter((o: any) => o.fmqE_Id === q.fmqE_Id)
                    }));
                    setFeedbackData({
                        questions: mappedQuestions,
                        options: (response.data as any).feedbackoption
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
        <Card className="overflow-hidden border shadow-md rounded-none bg-white">
            <div className="bg-[#1e40af] px-4 py-2 flex items-center justify-between">
                <h2 className="text-white text-[11px] font-black tracking-widest uppercase">Interactions</h2>
                <div className="h-4 w-4 bg-white/20 rounded-sm" />
            </div>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <div className="p-4 relative min-h-[500px]">
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
                    userhrmE_Id={initialData.userhrmE_Id ?? 0} 
                />
            )}
        </Card>
    );
}

export default InteractionContainer;
