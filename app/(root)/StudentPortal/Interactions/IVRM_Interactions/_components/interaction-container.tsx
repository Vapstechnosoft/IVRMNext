'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { InboxTab } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/inbox-tab';
import { ComposeTab } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/compose-tab';
import { FeedbackModal } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/feedback-modal';
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

    const roleFlg = interactionsData.roletype?.[0]?.ivrmrT_Role || 'Staff';
    const isStudent = roleFlg === 'Student';

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
        <Card className="overflow-hidden border-none bg-background/50 shadow-xl backdrop-blur-sm">
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <div className="border-b bg-muted/30 px-6 pt-6">
                        <TabsList className="h-12 w-full justify-start gap-2 bg-transparent p-0">
                            <TabsTrigger
                                value="inbox"
                                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                            >
                                <Inbox className="mr-2 h-4 w-4" />
                                Inbox
                            </TabsTrigger>

                            {!isStudent ? (
                                <>
                                    <TabsTrigger
                                        value="group"
                                        className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Group Interaction
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="individual"
                                        className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Individual Interaction
                                    </TabsTrigger>
                                </>
                            ) : (
                                <TabsTrigger
                                    value="individual"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Compose
                                </TabsTrigger>
                            )}
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
